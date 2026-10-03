import React from "react";
import { ShieldAlert, Activity, Cpu, Database, Network, Menu } from "lucide-react";

export function SovereignTopbar({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  return (
    <header className="h-14 border-b border-[#1E293B] bg-[#030406]/80 backdrop-blur-md flex items-center justify-between px-4 z-10 shrink-0">
      
      {/* Left: Context */}
      <div className="flex items-center gap-3">
        <button className="md:hidden text-gray-400 hover:text-white" onClick={onToggleSidebar}>
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-gray-400 text-xs font-mono ml-2">SovereignX / Enterprise AI Workspace</span>
        <div className="h-4 w-[1px] bg-[#333] mx-2"></div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase font-semibold tracking-widest text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)] border border-emerald-500/50 bg-[#000] shadow-[inset_0_0_10px_rgba(52,211,153,0.15)] px-2 py-1 rounded">Air-Gapped</span>
          <span className="text-[10px] uppercase font-semibold tracking-widest text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] border border-cyan-500/50 bg-[#000] shadow-[inset_0_0_10px_rgba(34,211,238,0.15)] px-2 py-1 rounded">Local Inference</span>
          <span className="text-[10px] uppercase font-semibold tracking-widest text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.8)] border border-indigo-500/50 bg-[#000] shadow-[inset_0_0_10px_rgba(129,140,248,0.15)] px-2 py-1 rounded">RAG Active</span>
        </div>
      </div>

      {/* Right: Telemetry (Horizontally scrollable on small screens if needed) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {/* WAN Activity Warning */}
        <div className="flex items-center gap-1.5 bg-red-950/30 border border-red-500/20 px-2 py-1 rounded">
          <ShieldAlert className="w-3 h-3 text-red-400" />
          <span className="text-[10px] font-mono text-red-400 whitespace-nowrap">WAN WARNING</span>
        </div>
        
        {/* WAN Egress */}
        <div className="flex items-center gap-1.5 bg-[#0A0D14] border border-[#1E293B] px-2 py-1 rounded">
          <Network className="w-3 h-3 text-gray-500" />
          <span className="text-[10px] font-mono text-gray-400 whitespace-nowrap">Egress: 6.70 KB/s</span>
        </div>

        {/* SLM Cluster */}
        <div className="flex items-center gap-1.5 bg-[#0A0D14] border border-[#1E293B] px-2 py-1 rounded">
          <Database className="w-3 h-3 text-indigo-400" />
          <span className="text-[10px] font-mono text-gray-400 whitespace-nowrap">3B SLM Cluster</span>
        </div>

        {/* RTX 2050 / VRAM */}
        <div className="flex items-center gap-1.5 bg-[#0A0D14] border border-[#1E293B] px-2 py-1 rounded">
          <Cpu className="w-3 h-3 text-emerald-400" />
          <span className="text-[10px] font-mono text-gray-400 whitespace-nowrap">RTX 2050 (4GB)</span>
        </div>

        {/* Ollama Status */}
        <div className="flex items-center gap-1.5 bg-[#0A0D14] border border-[#1E293B] px-2 py-1 rounded">
          <Activity className="w-3 h-3 text-cyan-400" />
          <span className="text-[10px] font-mono text-gray-400 whitespace-nowrap">Ollama: ONLINE</span>
        </div>
      </div>
      
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </header>
  );
}
