import Link from "next/link";

export function BackedBy() {
  return (
    <section className="py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-6">
        <p className="text-sm text-muted-foreground">
          Backed by the Vercel Open Source Program
        </p>
        <div className="flex items-center justify-center gap-8">
          <Link
            href="https://vercel.com/oss"
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-60 hover:opacity-100 transition-opacity"
          >
            <svg
              viewBox="0 0 256 222"
              className="h-5 w-auto text-foreground"
              fill="currentColor"
              aria-label="Vercel logo"
            >
              <path d="M128 0L256 221.705H0L128 0Z" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
