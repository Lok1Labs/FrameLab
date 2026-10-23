'use client';

import dynamic from 'next/dynamic';

const RemoveBackgroundApp = dynamic(
  () => import('./RemoveBackgroundApp').then((m) => m.RemoveBackgroundApp),
  { ssr: false, loading: () => <RemoveBackgroundSkeleton /> },
);

function RemoveBackgroundSkeleton() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mx-auto h-[400px] w-full max-w-3xl animate-pulse rounded-2xl bg-card ring-1 ring-inset ring-border sm:h-[480px]" />
    </div>
  );
}

export function RemoveBackgroundLoader() {
  return <RemoveBackgroundApp />;
}
