"use client";

import React, { useState, useRef } from "react";
import { Play, CheckCircle2, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ShaderGradientBG from "@/components/ui/shader-gradient-bg";

gsap.registerPlugin(ScrollTrigger);

export default function Card4Sandbox() {
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [showProof, setShowProof] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Typewriter/stagger effect for terminal code lines
    gsap.fromTo(
      ".code-line",
      { opacity: 0, x: -10 },
      {
        opacity: 1,
        x: 0,
        duration: 0.4,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top 85%",
        }
      }
    );
  }, { scope: cardRef });

  const handleRun = () => {
    setIsRunning(true);
    setOutput(null);
    setTimeout(() => {
      setIsRunning(false);
      setOutput("[SUCCESS] Output: 1420 PSI\nSandbox Isolation: 100% Verified");
    }, 1500);
  };

  return (
    <div ref={cardRef} className="h-full w-full relative overflow-hidden rounded-[24px] border border-white/[0.05] p-6 md:p-8 flex flex-col justify-between group transition-colors duration-500 hover:border-white/[0.1]">
      <ShaderGradientBG />
      
      {/* Title & Description */}
      <div className="relative z-10 mb-8 font-display">
        <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Secure Sandbox</h3>
        <p className="text-[#a1a1aa] text-[14px] leading-relaxed max-w-[280px]">
          Execute generated code deterministically inside an isolated TEE environment.
        </p>
      </div>

      {/* Center Micro UI Container */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
        
        {/* Floating Liquid Glass Widget */}
        <div 
          className="relative w-full max-w-md rounded-2xl bg-linear-to-b from-[#1e5dd7]/25 to-[#050a0f]/95 backdrop-blur-2xl border-t-[1.5px] border-t-[#a2c8fd]/90 border-x border-x-[#1e5dd7]/40 border-b-0 shadow-[0_-12px_40px_rgba(30,93,215,0.35)] p-5 flex flex-col gap-4 font-sans overflow-hidden"
        >
          {/* Fading bottom overlay */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-[#050a0f] to-transparent pointer-events-none rounded-b-[16px]" />

          {/* Terminal Window */}
          <div className="relative rounded-xl bg-[#010204]/50 border border-white/[0.03] overflow-hidden font-mono text-[12px] shadow-[inset_0_4px_20px_rgba(0,0,0,0.3)]">
            {/* Terminal Header */}
            <div className="bg-white/[0.02] px-3 py-2 flex items-center gap-2 border-b border-white/[0.03]">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500/50" />
                <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                <div className="w-2 h-2 rounded-full bg-green-500/50" />
              </div>
              <span className="text-[#a1a1aa]/40 ml-2 text-[10px] font-sans tracking-wide">maop_calc.py</span>
            </div>
            {/* Terminal Body */}
            <div className="p-4 text-[#a1a1aa]">
              <p className="code-line text-[#1e5dd7]/70"># MAOP Pressure Calculation</p>
              <p className="code-line mt-1"><span className="text-[#00A3FF]">def</span> <span className="text-white">calculate_maop</span>(t, s, d):</p>
              <p className="code-line pl-4"><span className="text-[#00A3FF]">return</span> (2 * s * t) / d</p>
              <p className="code-line mt-2"><span className="text-white">print</span>(calculate_maop(<span className="text-[#00A3FF]">0.375</span>, <span className="text-[#00A3FF]">42000</span>, <span className="text-[#00A3FF]">12</span>))</p>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between mt-1">
            <button 
              onClick={() => setShowProof(!showProof)}
              className="text-[11px] font-medium tracking-tight text-[#a1a1aa] hover:text-white flex items-center gap-1 transition-colors"
            >
              Provenance Proof <ChevronDown size={14} className={`transform transition-transform ${showProof ? 'rotate-180' : ''}`} />
            </button>
            <button 
              onClick={handleRun}
              disabled={isRunning || output !== null}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1e5dd7]/10 border border-[#1e5dd7]/20 text-[#00A3FF] text-[12px] font-semibold hover:bg-[#1e5dd7]/20 transition-colors disabled:opacity-50 tracking-tight"
            >
              {isRunning ? "Executing..." : output ? "Executed" : <><Play size={10} /> Run Sandbox</>}
            </button>
          </div>

          {/* Output & Proof area */}
          <AnimatePresence>
            {showProof && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-3 mt-1 rounded-lg bg-white/[0.02] border border-white/5 text-[10px] text-[#a1a1aa]/60 font-mono break-all leading-relaxed">
                  SHA256: 3a2b1c4d...e5f6g7h8
                  <br />Signed: Local Node Auth
                </div>
              </motion.div>
            )}
            {output && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 mt-1 rounded-lg bg-[#00A3FF]/10 border border-[#00A3FF]/20 text-[11px] font-mono text-[#00A3FF] flex items-start gap-2 leading-relaxed"
              >
                <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                <div className="whitespace-pre-line">{output}</div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

    </div>
  );
}
