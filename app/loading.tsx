export default function Loading() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <div className="h-32 animate-pulse rounded-lg border border-white/10 bg-white/[0.06]" />
      <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="h-[520px] animate-pulse rounded-lg border border-white/10 bg-white/[0.055]" />
        <div className="space-y-4">
          <div className="h-16 animate-pulse rounded-lg border border-white/10 bg-white/[0.055]" />
          <div className="h-28 animate-pulse rounded-lg border border-white/10 bg-white/[0.055]" />
          <div className="h-28 animate-pulse rounded-lg border border-white/10 bg-white/[0.055]" />
          <div className="h-28 animate-pulse rounded-lg border border-white/10 bg-white/[0.055]" />
        </div>
      </div>
    </main>
  );
}
