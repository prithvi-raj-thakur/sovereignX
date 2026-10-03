"use client";

import React, { useState, useRef } from "react";
import { ScanEye, Maximize, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ShaderGradientBG from "@/components/ui/shader-gradient-bg";

gsap.registerPlugin(ScrollTrigger);

export default function Card3Vision() {
  const [isScanning, setIsScanning] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(
      ".card3-anim",
      { opacity: 0, scale: 0.9 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top 85%",
        }
      }
    );
  }, { scope: cardRef });

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 2000);
  };

  return (
    <div ref={cardRef} className="h-full w-full relative overflow-hidden rounded-[24px] border border-white/[0.05] p-6 md:p-8 flex flex-col justify-between group transition-colors duration-500 hover:border-white/[0.1]">
      <ShaderGradientBG />
      
      {/* Title & Description */}
      <div className="relative z-10 mb-8 font-display">
        <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Industrial Vision</h3>
        <p className="text-[#a1a1aa] text-[14px] leading-relaxed max-w-[280px]">
          Process complex P&ID schematics and inspect hardware locally.
        </p>
      </div>

      {/* Center Micro UI Container */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
        
        {/* Floating Liquid Glass Widget */}
        <div 
          className="card3-anim relative w-full max-w-sm rounded-2xl bg-linear-to-b from-[#1e5dd7]/25 to-[#050a0f]/95 backdrop-blur-2xl border-t-[1.5px] border-t-[#a2c8fd]/90 border-x border-x-[#1e5dd7]/40 border-b-0 shadow-[0_-12px_40px_rgba(30,93,215,0.35)] p-4 flex flex-col gap-4 font-sans overflow-hidden"
        >
          {/* Fading bottom overlay */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-[#050a0f] to-transparent pointer-events-none rounded-b-[16px] z-20" />

          {/* Image Preview Container */}
          <div 
            className="card3-anim relative w-full h-32 rounded-xl bg-black/50 border border-white/[0.05] overflow-hidden cursor-crosshair"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Grid background simulating blueprint/inspection */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:10px_10px]" />
            
            {/* Simulated Pipe Graphic */}
            <div className="absolute inset-0 flex items-center justify-center opacity-30">
              <div className="w-full h-8 bg-gradient-to-b from-zinc-600 via-zinc-400 to-zinc-700 transform -rotate-6 shadow-[0_0_20px_rgba(0,163,255,0.1)] border-t border-b border-[#00A3FF]/10" />
            </div>

            {/* Hover Bounding Box */}
            <AnimatePresence>
              {isHovered && !isScanning && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-8 left-1/4 w-28 h-14 border border-[#00A3FF]/80 bg-[#00A3FF]/10 rounded-sm z-10 flex items-start justify-start p-1"
                >
                  <div className="absolute -top-5 -left-[1px] bg-[#00A3FF]/80 backdrop-blur-md text-white text-[9px] font-bold px-1.5 py-[2px] rounded-sm whitespace-nowrap tracking-wide">
                    Corrosion: 0.08"
                  </div>
                  <Maximize size={10} className="text-[#00A3FF] absolute bottom-1 right-1 opacity-50" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scan Line Overlay */}
            {isScanning && (
              <motion.div 
                className="absolute top-0 bottom-0 w-full bg-gradient-to-r from-transparent via-[#00A3FF]/20 to-transparent border-r border-[#00A3FF]/80 z-20"
                initial={{ left: "-100%" }}
                animate={{ left: "100%" }}
                transition={{ duration: 1.5, ease: "linear" }}
              />
            )}
          </div>

          {/* Action Button */}
          <div className="card3-anim flex justify-between items-center">
            <div className="flex items-center gap-1.5 text-[#a1a1aa] text-[12px] font-medium tracking-tight">
              <ScanEye size={14} /> Hover to inspect
            </div>
            <button 
              onClick={handleScan}
              disabled={isScanning}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#00A3FF]/10 border border-[#00A3FF]/20 text-[#00A3FF] text-[12px] font-semibold hover:bg-[#00A3FF]/20 transition-colors disabled:opacity-50 tracking-tight"
            >
              {isScanning ? "Scanning..." : <><Play size={10} /> Simulate Scan</>}
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
