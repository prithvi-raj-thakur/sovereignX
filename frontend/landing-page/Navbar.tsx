"use client";

import React, { useState } from "react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Volume2, VolumeX, User } from "lucide-react";
import { NavbarHams } from "./navbar-hams";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-border";
import { LiquidGlassCard, LiquidButton } from "@/components/ui/liquid-glass-card";

interface NavbarProps {
  isMuted?: boolean;
  toggleMute?: () => void;
  volume?: number;
  onVolumeChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  navItems?: any[];
}

export function Navbar({ isMuted = true, toggleMute = () => {}, volume = 0, onVolumeChange = () => {}, navItems }: NavbarProps) {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [showVolumeControl, setShowVolumeControl] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest <= 50) {
      setHidden(false);
    } else if (latest > previous && latest > 150) {
      setHidden(true);
    } else if (latest < previous) {
      setHidden(false);
    }
  });

  return (
    <motion.nav
      variants={{
        visible: { y: 0, opacity: 1 },
        hidden: { y: "-100%", opacity: 0 },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="fixed top-0 w-full z-[100] flex items-center justify-between px-6 md:px-10 py-4 md:py-6 bg-transparent pointer-events-auto"
    >
      {/* Left: Logo Only with Rounder Corners */}
      <div className="flex items-center nav-logo opacity-0">
        <div className="relative overflow-hidden rounded-[1.5rem] bg-black/20 shadow-[0_0_20px_rgba(0,163,255,0.3)] border border-white/10 p-1">
          <Image
            src="/logo.svg"
            alt="Logo"
            width={48}
            height={48}
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center space-x-6 md:space-x-10">
        
        {/* LOGIN BUTTON: LiquidMetal animated circle icon with text */}
        <div className="hidden sm:block relative z-[101] nav-login opacity-0">
          <LiquidMetalButton size="sm" viewMode="text" label="Login" icon={<User size={16} />} onClick={() => window.location.href = '/auth'} />
        </div>

        {/* SOUND CONTROLS: Button + Volume Slider Card */}
        <div 
          className="relative z-[101] nav-sound opacity-0"
          onMouseEnter={() => setShowVolumeControl(true)}
          onMouseLeave={() => setShowVolumeControl(false)}
        >
          <LiquidButton
            onClick={toggleMute}
            className="h-12 w-12 rounded-full bg-black/20 hover:bg-black/40 border border-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
            size="icon"
            variant="ghost"
            aria-label={isMuted ? "Unmute sound" : "Mute sound"}
          >
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </LiquidButton>

          <AnimatePresence>
            {showVolumeControl && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute top-full right-0 pt-6 origin-top-right"
              >
                <LiquidGlassCard glassSize="sm" className="w-[280px] bg-black/70 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-2xl flex flex-col p-4 backdrop-blur-2xl">
                  
                  {/* Track Info */}
                  <div className="flex items-center gap-3.5 mb-5">
                    {/* Album Art */}
                    <div className="relative w-12 h-12 rounded-[6px] bg-gradient-to-br from-[#00A3FF]/20 to-black/80 border border-white/10 flex-shrink-0 flex items-center justify-center shadow-inner overflow-hidden">
                      <div className="absolute inset-0 bg-[#00A3FF]/20 blur-xl animate-pulse" />
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="relative z-10">
                        <circle cx="12" cy="12" r="10"></circle>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </div>
                    
                    {/* Titles */}
                    <div className="flex flex-col flex-grow min-w-0">
                      <span className="text-white text-[14px] font-semibold truncate tracking-tight mb-0.5">
                        SovereignX Anthem
                      </span>
                      <span className="text-white/50 text-[12px] truncate font-medium">
                        Original Soundtrack
                      </span>
                    </div>

                    {/* Play/Pause (Mute Toggle) */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMute();
                      }}
                      className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-white text-black hover:scale-105 active:scale-95 transition-transform shadow-md ml-1"
                    >
                      {isMuted ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5"><path d="M8 5v14l11-7z"/></svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                      )}
                    </button>
                  </div>

                  {/* Volume Slider */}
                  <div className="flex items-center gap-3 w-full group py-1 relative">
                    <VolumeX size={12} className="text-white/40 flex-shrink-0" />
                    
                    <div className="relative flex-grow h-6 flex items-center">
                      {/* Visual Background Track */}
                      <div className="absolute left-0 right-0 h-1.5 bg-white/20 rounded-full pointer-events-none" />
                      
                      {/* Active Fill */}
                      <div 
                        className="absolute left-0 h-1.5 bg-white rounded-full pointer-events-none group-hover:bg-[#1db954] transition-colors duration-200" 
                        style={{ width: `${volume * 100}%` }}
                      />
                      
                      {/* Invisible Native Input for interaction with HUGE hit area */}
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={onVolumeChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                    </div>

                    <Volume2 size={12} className="text-white/40 flex-shrink-0" />
                  </div>

                </LiquidGlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* MENU */}
        <NavbarHams navItems={navItems} />
      </div>
    </motion.nav>
  );
}
