export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-azure-500/20" />
          <div className="absolute inset-0 rounded-full border-2 border-t-azure-500 animate-spin" />
          <div className="absolute inset-3 rounded-full bg-azure-600/20 animate-pulse" />
        </div>
        <div className="font-display text-xl text-white/60">LearnSphere</div>
      </div>
    </div>
  );
}
