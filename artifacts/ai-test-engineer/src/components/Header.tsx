import { Menu, Zap } from "lucide-react";

export default function Header() {
  return (
    <header className="h-16 flex-shrink-0 bg-background/80 backdrop-blur-md border-b border-white/5 flex items-center px-6 justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button className="md:hidden text-white/60 hover:text-white">
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex flex-col">
          <h1 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
            Mission Control
            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-white/10 text-white/70 border border-white/10">
              v2.4
            </span>
          </h1>
          <p className="text-xs text-white/40 font-mono tracking-wider flex items-center gap-1">
            <Zap className="w-3 h-3 text-yellow-500" /> Powered by AI
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-mono font-medium text-emerald-400">AI Ready</span>
        </div>
      </div>
    </header>
  );
}