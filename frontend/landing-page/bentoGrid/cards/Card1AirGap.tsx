"use client";

import React, { useState, useRef } from "react";
import { Activity, Cpu, WifiOff, ShieldCheck } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ShaderGradientBG from "@/components/ui/shader-gradient-bg";

gsap.registerPlugin(ScrollTrigger);

export default function Card1AirGap() {
  const [isAirGapped, setIsAirGapped] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Animate the inner widgets sequentially when this specific card enters the viewport
    gsap.fromTo(
      ".card1-anim",
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top 85%",
        }
      }
    );
  }, { scope: cardRef });

  return (
    <div ref={cardRef} className="h-full w-full relative overflow-hidden rounded-[24px] border border-white/[0.05] p-6 md:p-8 flex flex-col justify-between group transition-colors duration-500 hover:border-white/[0.1]">
      <ShaderGradientBG />
      
      {/* Title & Description */}
      <div className="relative z-10 mb-8 font-display">
        <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Network Guard</h3>
        <p className="text-[#a1a1aa] text-[14px] leading-relaxed max-w-[280px]">
          100% offline security. Zero cloud API calls. Complete data sovereignty locked to your hardware.
        </p>
      </div>

      {/* Center Micro UI Container */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
        
        {/* Floating Liquid Glass Widget */}
        <div 
          className="card1-anim relative w-full max-w-sm rounded-2xl bg-linear-to-b from-[#1e5dd7]/25 to-[#050a0f]/95 backdrop-blur-2xl border-t-[1.5px] border-t-[#a2c8fd]/90 border-x border-x-[#1e5dd7]/40 border-b-0 shadow-[0_-12px_40px_rgba(30,93,215,0.35)] p-5 flex flex-col gap-5 overflow-hidden"
        >
          {/* Fading bottom overlay */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-[#050a0f] to-transparent pointer-events-none rounded-b-[16px]" />

          {/* Widget Content */}
          <div className="card1-anim flex items-center justify-between font-sans">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg border ${isAirGapped ? 'bg-[#00A3FF]/10 border-[#00A3FF]/20' : 'bg-red-500/10 border-red-500/20'}`}>
                {isAirGapped ? <ShieldCheck size={18} className="text-[#00A3FF]" /> : <WifiOff size={18} className="text-red-400" />}
              </div>
              <div>
                <div className="text-white/90 text-[13px] font-medium tracking-tight">Air-Gap Status</div>
                <div className={`text-[11px] font-semibold tracking-widest ${isAirGapped ? 'text-[#00A3FF]/70' : 'text-red-400/70'}`}>
                  {isAirGapped ? "ENFORCED" : "BREACHED"}
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setIsAirGapped(!isAirGapped)}
              className={`relative w-9 h-[18px] rounded-full transition-colors duration-300 ${isAirGapped ? 'bg-[#00A3FF]' : 'bg-zinc-800'}`}
            >
              <div 
                className="absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white shadow-sm transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]"
                style={{ left: isAirGapped ? "20px" : "2px" }}
              />
            </button>
          </div>

          <div className="card1-anim h-[1px] w-full bg-white/[0.03]" />

          {/* Telemetry Row */}
          <div className="card1-anim flex items-center justify-between font-sans">
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-[#a1a1aa]" />
              <span className="text-[12px] text-[#a1a1aa]">WAN Egress</span>
            </div>
            <span className={`text-[12px] font-medium font-mono ${isAirGapped ? "text-[#00A3FF]/80" : "text-red-400/80"}`}>
              {isAirGapped ? "0.00 kB/s" : "42.15 kB/s"}
            </span>
          </div>

          {/* GPU Bar */}
          <div className="card1-anim font-sans">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Cpu size={14} className="text-[#a1a1aa]" />
                <span className="text-[12px] text-[#a1a1aa]">RTX 2050 / Ollama</span>
              </div>
              <span className="text-[10px] text-[#a1a1aa] font-mono tracking-wide">14.2 GB</span>
            </div>
            <div className="w-full h-[4px] bg-black/50 rounded-full overflow-hidden border border-white/[0.03]">
              <div className={`h-full rounded-full w-[85%] transition-all duration-1000 ${isAirGapped ? 'bg-gradient-to-r from-[#1e5dd7] to-[#00A3FF]' : 'bg-gradient-to-r from-red-600 to-orange-400'}`} />
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
