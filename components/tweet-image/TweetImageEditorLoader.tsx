'use client';

import dynamic from 'next/dynamic';

const TweetImageEditor = dynamic(
  () => import('./TweetImageEditor').then((m) => m.TweetImageEditor),
  { ssr: false, loading: () => <TweetImageEditorSkeleton /> },
);

function TweetImageEditorSkeleton() {
  return (
    <div className="flex min-h-dvh flex-col bg-[#181818]">
      <div className="h-[50px] shrink-0 border-b border-white/[0.06]" />
      <div className="flex min-h-[calc(100dvh-50px)] flex-1 flex-col items-center justify-center gap-6 px-6 pb-32 pt-10">
        <div className="h-12 w-[560px] max-w-full animate-pulse rounded-xl bg-white/[0.04]" />
        <div className="h-[380px] w-[726px] max-w-full animate-pulse rounded-xl bg-white/[0.04]" />
      </div>
    </div>
  );
}

export function TweetImageEditorLoader() {
  return <TweetImageEditor />;
}
