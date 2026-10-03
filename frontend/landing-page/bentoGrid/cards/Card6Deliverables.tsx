"use client";

import React, { useState, useRef } from "react";
import { FileText, FileSpreadsheet, FileIcon, PenTool, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ShaderGradientBG from "@/components/ui/shader-gradient-bg";

gsap.registerPlugin(ScrollTrigger);

export default function Card6Deliverables() {
  const [isSigned, setIsSigned] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(
      ".card6-file",
      { opacity: 0, scale: 0.8 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        stagger: 0.1,
        ease: "back.out(1.5)",
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top 85%",
        }
      }
    );
    gsap.fromTo(
      ".card6-action",
      { opacity: 0, y: 15 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        delay: 0.3,
        ease: "power2.out",
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top 85%",
        }
      }
    );
  }, { scope: cardRef });

  const handleSign = () => {
    setIsSigning(true);
    setTimeout(() => {
      setIsSigning(false);
      setIsSigned(true);
    }, 1500);
  };

  return (
    <div ref={cardRef} className="h-full w-full relative overflow-hidden rounded-[24px] border border-white/[0.05] p-6 md:p-8 flex flex-col justify-between group transition-colors duration-500 hover:border-white/[0.1]">
      <ShaderGradientBG />
      
      {/* Title & Description */}
      <div className="relative z-10 mb-8 font-display">
        <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Audit Governance</h3>
        <p className="text-[#a1a1aa] text-[14px] leading-relaxed max-w-[280px]">
          Automated synthesis of verified reports with Human-in-the-Loop workflows.
        </p>
      </div>

      {/* Center Micro UI Container */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
        
        {/* Floating Liquid Glass Widget */}
        <div 
          className="relative w-full max-w-sm rounded-2xl bg-linear-to-b from-[#1e5dd7]/25 to-[#050a0f]/95 backdrop-blur-2xl border-t-[1.5px] border-t-[#a2c8fd]/90 border-x border-x-[#1e5dd7]/40 border-b-0 shadow-[0_-12px_40px_rgba(30,93,215,0.35)] p-5 flex flex-col gap-5 font-sans overflow-hidden"
        >
          {/* Fading bottom overlay */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-[#050a0f] to-transparent pointer-events-none rounded-b-[16px] z-10" />

          {/* Deliverables Row */}
          <div className="flex gap-3">
            {[
              { icon: FileText, label: ".docx" },
              { icon: FileSpreadsheet, label: ".xlsx" },
              { icon: FileIcon, label: ".pdf" }
            ].map((file, i) => (
              <div 
                key={i}
                className="card6-file flex flex-col items-center gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.03] flex-1 transition-transform hover:-translate-y-1 cursor-pointer hover:bg-white/[0.04]"
              >
                <file.icon size={16} className="text-[#00A3FF]" />
                <span className="text-[10px] text-[#a1a1aa] font-mono tracking-wide">{file.label}</span>
              </div>
            ))}
          </div>

          <div className="w-[1px] h-3 bg-white/[0.05] mx-auto" />

          {/* HITL Action Area */}
          <div className="card6-action relative p-4 rounded-xl border border-white/[0.03] bg-[#010204]/50 shadow-[inset_0_4px_20px_rgba(0,0,0,0.3)] overflow-hidden">
            <AnimatePresence mode="wait">
              {!isSigned ? (
                <motion.div 
                  key="unsigned"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col items-center gap-3 text-center"
                >
                  <p className="text-[11px] text-[#a1a1aa] font-medium tracking-tight">Pending Final Review (HITL)</p>
                  <button 
                    onClick={handleSign}
                    disabled={isSigning}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-[#1e5dd7]/10 border border-[#1e5dd7]/20 text-[#00A3FF] text-[13px] font-semibold hover:bg-[#1e5dd7]/20 transition-colors disabled:opacity-50 tracking-tight"
                  >
                    {isSigning ? (
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 border-2 border-[#00A3FF] border-t-transparent rounded-full animate-spin" />
                        Verifying Keys...
                      </span>
                    ) : (
                      <><PenTool size={12} /> Approve & Sign</>
                    )}
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  key="signed"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center gap-2 h-[68px] text-center"
                >
                  <div className="w-8 h-8 rounded-full bg-[#00A3FF]/10 flex items-center justify-center border border-[#00A3FF]/20 relative">
                    <CheckCircle2 size={14} className="text-[#00A3FF] relative z-10" />
                    <div className="absolute inset-0 bg-[#00A3FF]/20 rounded-full blur-md" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[#00A3FF] font-bold uppercase tracking-wider">
                      Digitally Signed
                    </span>
                    <span className="text-[9px] text-[#a1a1aa]/60 font-mono">
                      Compliance Verified
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>

    </div>
  );
}
