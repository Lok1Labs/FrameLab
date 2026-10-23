import { createHash } from 'crypto'
import { S3Client, PutObjectCommand, DeleteObjectsCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getPrisma } from './db'
import { getR2PublicUrl } from './r2'

// Initialize R2 client (S3-compatible)
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
})

const R2_BUCKET = process.env.R2_BUCKET_NAME || 'stage-assets'

export function normalizeUrl(urlString: string): string {
  try {
    const url = new URL(urlString)

    url.protocol = url.protocol.toLowerCase()
    url.hostname = url.hostname.toLowerCase().replace(/^www\./, '')

    if (url.port === '80' && url.protocol === 'http:') {
      url.port = ''
    }
    if (url.port === '443' && url.protocol === 'https:') {
      url.port = ''
    }

    if (url.pathname !== '/' && url.pathname.endsWith('/')) {
      url.pathname = url.pathname.slice(0, -1)
    }

    url.hash = ''

    if (url.search) {
      const params = new URLSearchParams(url.search)
      const sortedParams = Array.from(params.entries())
        .sort(([a], [b]) => a.localeCompare(b))
      url.search = sortedParams.length > 0
        ? '?' + new URLSearchParams(sortedParams).toString()
        : ''
    }

    return url.toString()
  } catch (error) {
    return urlString
  }
}

export function hashUrl(url: string): string {
  const normalized = normalizeUrl(url)
  return createHash('sha256').update(normalized).digest('hex')
}

// Cache-Control for screenshots (2 days - matches cache expiry)
const SCREENSHOT_CACHE_CONTROL = 'public, max-age=172800, s-maxage=172800'

async function uploadToR2(
  screenshotBase64: string,
  key: string
): Promise<{ key: string; url: string }> {
  try {
    const buffer = Buffer.from(screenshotBase64, 'base64')
    const r2Key = `screenshots/${key}.png`

    await r2Client.send(new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: r2Key,
      Body: buffer,
      ContentType: 'image/png',
      CacheControl: SCREENSHOT_CACHE_CONTROL,
    }))

    const publicUrl = getR2PublicUrl(r2Key)

    return {
      key: r2Key,
      url: publicUrl,
    }
  } catch (error) {
    console.error('Error uploading screenshot to R2:', error)
    throw error
  }
}

async function deleteFromR2(keys: string[]): Promise<void> {
  if (keys.length === 0) return

  try {
    await r2Client.send(new DeleteObjectsCommand({
      Bucket: R2_BUCKET,
      Delete: {
        Objects: keys.map(key => ({ Key: key })),
      },
    }))
  } catch (error) {
    console.error('Error deleting from R2:', error)
  }
}

export async function getCachedScreenshot(
  url: string,
  maxAgeMs: number = 2 * 24 * 60 * 60 * 1000
): Promise<string | null> {
  const prisma = getPrisma()
  if (!prisma) return null

  try {
    const hash = hashUrl(url)

    const cached = await prisma.screenshotCache.findUnique({
      where: { urlHash: hash },
      select: {
        cloudinaryUrl: true, // This field now stores R2 URL
        createdAt: true,
      },
    })

    if (!cached) {
      return null
    }

    const age = Date.now() - cached.createdAt.getTime()
    if (age > maxAgeMs) {
      console.log(`Cache expired for ${url}, invalidating...`)
      await invalidateCache(url)
      return null
    }

    try {
      const response = await fetch(cached.cloudinaryUrl)
      if (!response.ok) {
        await prisma.screenshotCache.delete({
          where: { urlHash: hash },
        })
        return null
      }

      const arrayBuffer = await response.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      return buffer.toString('base64')
    } catch (fetchError) {
      console.error('Error fetching screenshot from R2:', fetchError)
      await prisma.screenshotCache.delete({
        where: { urlHash: hash },
      }).catch(() => {
      })
      return null
    }
  } catch (error) {
    console.error('Error reading cached screenshot from database:', error)
    return null
  }
}

export async function cacheScreenshot(url: string, screenshotBase64: string): Promise<void> {
  const prisma = getPrisma()
  if (!prisma) return

  try {
    const hash = hashUrl(url)
    const normalizedUrl = normalizeUrl(url)

    const existing = await prisma.screenshotCache.findUnique({
      where: { urlHash: hash },
    })

    if (existing) {
      const r2Result = await uploadToR2(screenshotBase64, hash)

      await prisma.screenshotCache.update({
        where: { urlHash: hash },
        data: {
          url: normalizedUrl,
          cloudinaryPublicId: r2Result.key, // Store R2 key
          cloudinaryUrl: r2Result.url, // Store R2 URL
          updatedAt: new Date(),
        },
      })
    } else {
      const r2Result = await uploadToR2(screenshotBase64, hash)

      await prisma.screenshotCache.create({
        data: {
          urlHash: hash,
          url: normalizedUrl,
          cloudinaryPublicId: r2Result.key, // Store R2 key
          cloudinaryUrl: r2Result.url, // Store R2 URL
        },
      })
    }
  } catch (error) {
    console.error('Error caching screenshot:', error)
  }
}

export async function invalidateCache(url: string): Promise<void> {
  const prisma = getPrisma()
  if (!prisma) return

  try {
    const hash = hashUrl(url)

    const entry = await prisma.screenshotCache.findUnique({
      where: { urlHash: hash },
      select: { cloudinaryPublicId: true }, // This stores R2 key
    })

    if (!entry) {
      return
    }

    await deleteFromR2([entry.cloudinaryPublicId])

    await prisma.screenshotCache.delete({
      where: { urlHash: hash },
    })

    console.log(`Cache invalidated for ${url}`)
  } catch (error) {
    console.error('Error invalidating cache:', error)
  }
}

export async function invalidateCacheBatch(urls: string[]): Promise<void> {
  const prisma = getPrisma()
  if (!prisma) return

  const hashes = urls.map(url => hashUrl(url))

  try {
    const entries = await prisma.screenshotCache.findMany({
      where: {
        urlHash: { in: hashes },
      },
      select: { cloudinaryPublicId: true },
    })

    if (entries.length === 0) {
      return
    }

    const keys = entries.map((e: { cloudinaryPublicId: string }) => e.cloudinaryPublicId)
    await deleteFromR2(keys)

    await prisma.screenshotCache.deleteMany({
      where: {
        urlHash: { in: hashes },
      },
    })

    console.log(`Invalidated ${entries.length} cache entries`)
  } catch (error) {
    console.error('Error invalidating cache batch:', error)
  }
}

export async function clearOldCache(maxAgeMs: number = 2 * 24 * 60 * 60 * 1000): Promise<void> {
  const prisma = getPrisma()
  if (!prisma) return

  try {
    const cutoffDate = new Date(Date.now() - maxAgeMs)

    const oldEntries = await prisma.screenshotCache.findMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
      select: {
        id: true,
        cloudinaryPublicId: true,
      },
    })

    if (oldEntries.length === 0) {
      return
    }

    const keys = oldEntries.map((entry: { cloudinaryPublicId: string }) => entry.cloudinaryPublicId)
    await deleteFromR2(keys)

    const result = await prisma.screenshotCache.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    })

    if (result.count > 0) {
      console.log(`Cleared ${result.count} old cache entries`)
    }
  } catch (error) {
    console.error('Error clearing old cache:', error)
  }
}
