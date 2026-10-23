// Modified for FrameLab branding and maintainer contacts.
export type TweetTheme = 'light' | 'dark';

export function parseTweetId(input: string): string | null {
  const trimmed = input.trim();
  if (/^\d+$/.test(trimmed)) return trimmed;
  const match = trimmed.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
  return match?.[1] ?? null;
}

function proxyUrl(url: string): string {
  return `/api/image-proxy?url=${encodeURIComponent(url)}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

interface TweetUser {
  name: string;
  screen_name: string;
  profile_image_url_https: string;
  verified: boolean;
  is_blue_verified: boolean;
}

interface TweetPhoto {
  url: string;
  width: number;
  height: number;
}

interface TweetMediaDetail {
  media_url_https: string;
  type: string;
}

interface TweetEntity {
  urls?: { url: string; display_url: string; expanded_url: string }[];
  hashtags?: { text: string }[];
  user_mentions?: { screen_name: string }[];
}

export interface TweetData {
  text: string;
  user: TweetUser;
  created_at: string;
  favorite_count: number;
  conversation_count?: number;
  photos?: TweetPhoto[];
  mediaDetails?: TweetMediaDetail[];
  entities?: TweetEntity;
  quoted_tweet?: TweetData;
}

function processText(tweet: TweetData): string {
  let text = tweet.text;
  if (tweet.entities?.urls) {
    for (const url of tweet.entities.urls) {
      text = text.replace(url.url, url.display_url);
    }
  }
  text = text.replace(/\s*https:\/\/t\.co\/\w+\s*$/, '');
  return text.trim();
}

function XLogo({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill={color}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function VerifiedBadge() {
  return (
    <svg viewBox="0 0 22 22" width="16" height="16" style={{ flexShrink: 0 }}>
      <path
        fill="#1d9bf0"
        d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.69-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.636.433 1.221.878 1.69.47.446 1.055.752 1.69.883.635.13 1.294.083 1.902-.143.272.587.702 1.087 1.24 1.443s1.167.551 1.813.568c.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.222 1.26.27 1.894.141.634-.131 1.219-.437 1.69-.882.445-.47.749-1.055.878-1.691.13-.634.075-1.293-.148-1.9.586-.272 1.084-.702 1.438-1.241.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"
      />
    </svg>
  );
}

function HeartIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill={color}>
      <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z" />
    </svg>
  );
}

function ReplyIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill={color}>
      <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z" />
    </svg>
  );
}
export const TWEET_WIDTH = 598;

export function TweetCard({ tweet, theme }: { tweet: TweetData; theme: TweetTheme }) {
  const isDark = theme === 'dark';

  const colors = isDark
    ? { bg: '#000000', text: '#e7e9ea', secondary: '#71767b', border: '#2f3336' }
    : { bg: '#ffffff', text: '#0f1419', secondary: '#536471', border: '#cfd9de' };

  const avatarSource = tweet.user.profile_image_url_https;
  const avatarUrl = avatarSource.startsWith('/')
    ? avatarSource
    : proxyUrl(avatarSource.replace('_normal', '_200x200'));
  const displayText = processText(tweet);
  const date = formatDate(tweet.created_at);

  const photos: string[] = [];
  if (tweet.photos) {
    for (const p of tweet.photos) photos.push(p.url);
  } else if (tweet.mediaDetails) {
    for (const m of tweet.mediaDetails) {
      if (m.type === 'photo') photos.push(m.media_url_https);
    }
  }
  return (
    <div
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        padding: '20px 24px',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <img
          src={avatarUrl}
          alt=""
          width={40}
          height={40}
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            flexShrink: 0,
            objectFit: 'cover',
          }}
          crossOrigin="anonymous"
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span
              data-no-translate
              style={{
                fontWeight: 700,
                fontSize: 15,
                lineHeight: 1.25,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {tweet.user.name}
            </span>
            {(tweet.user.is_blue_verified || tweet.user.verified) && <VerifiedBadge />}
          </div>
          <div data-no-translate style={{ color: colors.secondary, fontSize: 14, lineHeight: 1.25 }}>
            @{tweet.user.screen_name}
          </div>
        </div>
        <div style={{ flexShrink: 0 }}>
          <XLogo color={colors.text} />
        </div>
      </div>

      <div
        data-no-translate
        style={{
          fontSize: 17,
          lineHeight: 1.5,
          marginTop: 12,
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          letterSpacing: '-0.01em',
        }}
      >
        {displayText}
      </div>

      {photos.length > 0 && (
        <div
          style={{
            marginTop: 12,
            display: 'grid',
            gridTemplateColumns: photos.length > 1 ? '1fr 1fr' : '1fr',
            gap: 2,
            borderRadius: 16,
            overflow: 'hidden',
            border: `1px solid ${colors.border}`,
          }}
        >
          {photos.slice(0, 4).map((url, i) => (
            <img
              key={i}
              src={proxyUrl(url)}
              alt=""
              style={{
                width: '100%',
                height: photos.length === 1 ? 'auto' : 200,
                maxHeight: photos.length === 1 ? 300 : undefined,
                objectFit: 'cover',
                display: 'block',
              }}
              crossOrigin="anonymous"
            />
          ))}
        </div>
      )}

      <div
        style={{
          marginTop: 12,
          paddingTop: 12,
          borderTop: `1px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          color: colors.secondary,
          fontSize: 13,
        }}
      >
        <span>{date}</span>
        {(tweet.conversation_count ?? 0) > 0 && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <ReplyIcon color={colors.secondary} />
            {formatNumber(tweet.conversation_count!)}
          </span>
        )}
        {tweet.favorite_count > 0 && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <HeartIcon color={colors.secondary} />
            {formatNumber(tweet.favorite_count)}
          </span>
        )}
      </div>
    </div>
  );
}

export const SAMPLE_TWEET: TweetData = {
  text: 'Paste a link to any post on X and it turns into a clean image like this one. Pick light or dark, add a background, and export a PNG ready for slides, docs, or a thread.',
  user: {
    name: 'FrameLab',
    screen_name: 'Lok1Labs',
    profile_image_url_https: '/logo-mark.png',
    verified: false,
    is_blue_verified: true,
  },
  created_at: '2026-09-24T09:00:00.000Z',
  favorite_count: 1284,
  conversation_count: 96,
};
