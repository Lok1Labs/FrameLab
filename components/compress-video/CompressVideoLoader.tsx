'use client';

import dynamic from 'next/dynamic';

const CompressVideoApp = dynamic(
  () => import('./CompressVideoApp').then((m) => m.CompressVideoApp),
  { ssr: false, loading: () => <CompressVideoSkeleton /> },
);

function CompressVideoSkeleton() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mx-auto h-[400px] w-full max-w-3xl animate-pulse rounded-2xl bg-card ring-1 ring-inset ring-border sm:h-[480px]" />
    </div>
  );
}

export function CompressVideoLoader() {
  return <CompressVideoApp />;
}
