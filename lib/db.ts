import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let prismaClient: PrismaClient | undefined

export function getPrisma(): PrismaClient | null {
  if (!process.env.DATABASE_URL) return null

  if (!prismaClient) {
    prismaClient = globalForPrisma.prisma ?? new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })
    if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaClient
  }

  return prismaClient
}

