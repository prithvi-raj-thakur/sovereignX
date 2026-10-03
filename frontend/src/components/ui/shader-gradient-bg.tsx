"use client";

import React from "react";
import { motion } from "framer-motion";

export default function ShaderGradientBG() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-gradient-to-b from-[#10131A] to-[#0A0C10] pointer-events-none rounded-[24px]">
      
      {/* 
        Subtle Inspiration-style Background 
        Clean, very dark blue-tinted black, with a faint glow at the bottom.
      */}

      {/* Extremely faint top highlight gradient */}
      <div 
        className="absolute top-0 left-0 right-0 h-[250px] opacity-[0.3]"
        style={{
          background: "radial-gradient(100% 100% at 50% 0%, rgba(255, 255, 255, 0.08) 0%, transparent 100%)",
        }}
      />
      
      {/* Subtle bottom blue/cyan glow, very faint to match the inspiration's soft lighting */}
      <motion.div
        animate={{
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70%] h-[150px]"
        style={{
          background: "radial-gradient(100% 50% at 50% 100%, rgba(0, 163, 255, 0.2) 0%, transparent 100%)",
          filter: "blur(40px)",
        }}
      />

      {/* 
        Premium Noise Overlay for texture - essential for that clean dark mode look
      */}
      <div className="absolute inset-0 opacity-[0.035] z-30 mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      {/* Inner border highlight for depth */}
      <div className="absolute inset-0 z-40 rounded-[24px]" style={{
        boxShadow: "inset 0 1px 1px rgba(255,255,255,0.1), inset 0 0 0 1px rgba(255,255,255,0.03)"
      }} />
    </div>
  );
}
