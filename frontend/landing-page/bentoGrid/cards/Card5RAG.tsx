"use client";

import React, { useState, useRef } from "react";
import { Search, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ShaderGradientBG from "@/components/ui/shader-gradient-bg";

gsap.registerPlugin(ScrollTrigger);

const queries = [
  { id: "pump", tag: "#PUMP-201-NS", result: "MAOP limit for PUMP-201-NS is 1420 PSI.", score: "0.94", doc: "Pump_Manual_v2.pdf" },
  { id: "sop", tag: "#SOP-Safety", result: "Must wear Class A hazard suit when inspecting valves.", score: "0.89", doc: "Safety_Guidelines.docx" },
  { id: "pipe", tag: "#Pipe-Thickness", result: "Standard pipe thickness for high-pressure is 0.375 inches.", score: "0.91", doc: "Specs_2025.xlsx" },
];

export default function Card5RAG() {
  const [activeQuery, setActiveQuery] = useState(queries[0]);
  const [isSearching, setIsSearching] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(
      ".card5-anim",
      { opacity: 0, y: 15 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top 85%",
        }
      }
    );
  }, { scope: cardRef });

  const handleQueryClick = (q: typeof queries[0]) => {
    if (q.id === activeQuery.id) return;
    setIsSearching(true);
    setTimeout(() => {
      setActiveQuery(q);
      setIsSearching(false);
    }, 600);
  };

  return (
    <div ref={cardRef} className="h-full w-full relative overflow-hidden rounded-[24px] border border-white/[0.05] p-6 md:p-8 flex flex-col justify-between group transition-colors duration-500 hover:border-white/[0.1]">
      <ShaderGradientBG />
      
      {/* Title & Description */}
      <div className="relative z-10 mb-8 font-display">
        <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Local RAG Knowledge</h3>
        <p className="text-[#a1a1aa] text-[14px] leading-relaxed max-w-[280px]">
          Private vector retrieval across internal engineering manuals, SOPs, and documents.
        </p>
      </div>

      {/* Center Micro UI Container */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
        
        {/* Floating Liquid Glass Widget */}
        <div 
          className="relative w-full max-w-sm rounded-2xl bg-linear-to-b from-[#1e5dd7]/25 to-[#050a0f]/95 backdrop-blur-2xl border-t-[1.5px] border-t-[#a2c8fd]/90 border-x border-x-[#1e5dd7]/40 border-b-0 shadow-[0_-12px_40px_rgba(30,93,215,0.35)] p-5 flex flex-col gap-4 font-sans overflow-hidden"
        >
          {/* Fading bottom overlay */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-[#050a0f] to-transparent pointer-events-none rounded-b-[16px] z-10" />

          {/* Query Bar */}
          <div className="card5-anim flex items-center gap-3 p-2 rounded-xl bg-white/[0.02] border border-white/[0.03]">
            <Search size={14} className="text-[#a1a1aa]/60 ml-2 shrink-0" />
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
              {queries.map((q) => (
                <button
                  key={q.id}
                  onClick={() => handleQueryClick(q)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap tracking-wide transition-colors ${
                    activeQuery.id === q.id 
                      ? "bg-[#00A3FF]/10 border border-[#00A3FF]/20 text-[#00A3FF]" 
                      : "bg-white/[0.02] border border-transparent text-[#a1a1aa] hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  {q.tag}
                </button>
              ))}
            </div>
          </div>

          {/* Results Area */}
          <div className="card5-anim relative h-[100px] rounded-xl bg-[#010204]/50 border border-white/[0.03] overflow-hidden p-4 shadow-[inset_0_4px_20px_rgba(0,0,0,0.3)]">
            <AnimatePresence mode="wait">
              {isSearching ? (
                <motion.div 
                  key="searching"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="w-4 h-4 border-2 border-[#00A3FF] border-t-transparent rounded-full animate-spin" />
                </motion.div>
              ) : (
                <motion.div
                  key={activeQuery.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex flex-col h-full justify-between"
                >
                  <p className="text-[13px] text-white/80 leading-relaxed font-serif italic">"{activeQuery.result}"</p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-1.5 text-[10px] text-[#a1a1aa]/80 font-mono tracking-wide">
                      <FileText size={10} className="text-[#1e5dd7]" />
                      {activeQuery.doc}
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-[2px] rounded-full bg-[#1e5dd7]/10 border border-[#1e5dd7]/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00A3FF] animate-pulse" />
                      <span className="text-[9px] text-[#00A3FF] font-mono tracking-wide">Score: {activeQuery.score}</span>
                    </div>
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
