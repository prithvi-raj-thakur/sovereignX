"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full bg-[#050507] overflow-hidden flex flex-col items-center justify-center font-sans">
      {/* Background Animated Glows - Matching the image's deep blue/purple hues */}
      
      {/* Video Background matching Huly design */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline 
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-[0.85] mix-blend-screen"
      >
        <source src="/bg-auth.webm" type="video/webm" />
        <source src="/bg-auth.mp4" type="video/mp4" />
      </video>

      {/* Top Left Header (Home link) */}
      <div className="absolute top-6 left-6 z-20">
        <a href="/" className="flex items-center text-[13px] font-medium text-slate-400 hover:text-white transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Home
        </a>
      </div>

      <div className="relative z-10 w-full px-6 flex flex-col items-center justify-center min-h-[calc(100vh-2rem)]">
        {children}
      </div>
    </div>
  );
}
