import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import ShimmerText from "@/components/ui/shimmer-text";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-border";
import { LiquidButton } from "@/components/ui/liquid-glass-card";
import Link from "next/link";

interface HeroSectionProps {
  isMuted: boolean;
  volume: number;
  loaderDone: boolean;
}

export function HeroSection({ isMuted, volume, loaderDone }: HeroSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Sync the React state with the actual video DOM element's muted and volume properties
  // to ensure iOS and Safari respect the autoplay with audio policies properly.
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      videoRef.current.volume = volume;
    }
  }, [isMuted, volume]);

  const contentRef = useRef<HTMLDivElement>(null);

  // Master GSAP animation for page load (orchestrating Navbar and Hero)
  useEffect(() => {
    // Only run the animation once the page loader has finished
    if (!loaderDone) return;

    // Wait a tiny bit for render
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.1 });

      // 1. Navbar Items one by one
      tl.fromTo(".nav-logo", { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, 0)
        .fromTo(".nav-login", { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, 0.15)
        .fromTo(".nav-sound", { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, 0.3)
      
      // 2. Hero Heading 1st Line
        .fromTo(".hero-h1-1", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, 0.6)
      // 3. Hero Heading 2nd Line
        .fromTo(".hero-h1-2", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, 0.8)
      // 4. Sub Heading
        .fromTo(".hero-sub", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, 1.0)
      // 5. CTA Buttons
        .fromTo(".hero-cta-btn", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "back.out(1.5)", stagger: 0.15 }, 1.2);
    });

    return () => ctx.revert();
  }, [loaderDone]);

  return (
    <section className="relative min-h-screen w-full flex flex-col items-center justify-start overflow-hidden bg-black">
      
      {/* Background Video */}
      <video
        ref={videoRef}
        autoPlay
        loop
        playsInline
        muted={isMuted}
        className="absolute inset-0 w-full h-full object-cover z-0"
        poster="/images/hero-poster.jpg"
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260613_180732_a54afbf6-b30d-470e-861f-669871f09f67.mp4"
          type="video/mp4"
        />
      </video>

      {/* Cinematic Gradient Overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/60 via-black/20 to-black/80 mix-blend-multiply pointer-events-none" />

      {/* Hero Content */}
      <div ref={contentRef} className="relative z-20 flex flex-col items-center text-center px-6 md:px-12 w-full max-w-5xl mt-[12vh]">
        
        {/* Eyebrow Pill - Optional, wait user didn't ask for it, I'll fade it with line 1 */}
        <div 
          className="relative inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-black/60 backdrop-blur-xl mb-8 hero-h1-1 opacity-0"
          style={{ 
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            boxShadow: '0 4px 24px -6px rgba(0, 163, 255, 0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 -4px 12px -2px rgba(0, 163, 255, 0.4)'
          }}
        >
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70%] h-[1px] bg-gradient-to-r from-transparent via-[#00A3FF] to-transparent opacity-80" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[40%] h-[3px] bg-[#00A3FF] blur-sm opacity-60" />

          <ShieldCheck size={16} className="text-white/80" />
          
          <motion.span 
            className="text-xs sm:text-sm font-medium tracking-wide bg-[length:200%_100%] bg-gradient-to-r from-white/70 via-white to-white/70 bg-clip-text text-transparent"
            animate={{ backgroundPosition: ["200% center", "-200% center"] }}
            transition={{ duration: 4, ease: "linear", repeat: Infinity }}
          >
            On-Premise • Air-Gapped
          </motion.span>
        </div>

        {/* Main Headline */}
        <h1 
          className="relative z-10 mb-8 max-w-[26rem] text-balance text-center text-[clamp(1.5rem,5vw,2.25rem)] font-semibold leading-[1.15] tracking-tight text-white sm:max-w-none sm:text-[clamp(2.5rem,4vw,4rem)] drop-shadow-2xl"
          style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}
        >
          <span className="block sm:whitespace-nowrap pb-1 hero-h1-1 opacity-0">Intelligence Without Exposure.</span>
          <span className="block bg-gradient-to-b from-white via-zinc-300 to-zinc-500 bg-clip-text text-transparent sm:whitespace-nowrap drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] pb-2 hero-h1-2 opacity-0">
            Execution Without Compromise.
          </span>
        </h1>

        {/* Sub-description */}
        <p 
          className="text-white/60 text-base md:text-lg font-light max-w-3xl mx-auto mb-10 leading-relaxed flex flex-col items-center tracking-wide hero-sub opacity-0"
          style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}
        >
          <span className="block sm:whitespace-nowrap">Autonomous AI for your most confidential work.</span>
          <span className="block sm:whitespace-nowrap">Run agents, models, and workflows entirely within your infrastructure.</span>
        </p>

        {/* Call to Action */}
        <div className="flex flex-col sm:flex-row w-full items-center justify-center gap-6">
          <div className="hero-cta-btn opacity-0">
            <Link href="/docs" target="_blank" rel="noopener noreferrer">
              <LiquidButton 
                liquidVariant="ghost" 
                className="w-[170px] h-[52px] rounded-full bg-black/20 hover:bg-black/40 border border-white/10 text-white/70 hover:text-white transition-colors cursor-pointer text-base font-medium shadow-[0_0_15px_rgba(255,255,255,0.05)] backdrop-blur-md"
              >
                View Docs
              </LiquidButton>
            </Link>
          </div>
          <div className="hero-cta-btn opacity-0">
            <Link href="/auth">
              <LiquidMetalButton label="Get Started" viewMode="text" />
            </Link>
          </div>
        </div>
        
      </div>
      
    </section>
  );
}
