"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-border";

export default function CtaSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const buttonRef1 = useRef<HTMLDivElement>(null);
  const buttonRef2 = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (!containerRef.current || !textRef.current) return;

    // Force a single refresh to ensure GSAP calculates heights correctly 
    // after all Next.js hydration and image loading is complete.
    const timeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 500);

    const ctx = gsap.context(() => {
      // 1. Premium Entrance for the entire card (3D effect)
      gsap.fromTo(
        containerRef.current,
        { scale: 0.9, opacity: 0, y: 60, rotationX: 5 },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          rotationX: 0,
          duration: 1.4,
          ease: "expo.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 90%",
          },
        }
      );

      // 2. Parallax on Video removed for performance (scrubbing playing video + mix-blend is very laggy)


      // 3. Dynamic Overlay gradient animation
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0.5 },
        {
          opacity: 1,
          duration: 2,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
            end: "center center",
            scrub: true,
          },
        }
      );

      // 4. Staggered reveal for all text elements (blur removed for performance)
      if (textRef.current) {
        const elements = textRef.current.children;
        gsap.fromTo(
          elements,
          { opacity: 0, y: 40 },
          {
          opacity: 1,
          y: 0,
          duration: 1.2,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 85%",
          },
        }
      );
      }

      // 5. Continuous floating animation for Button 1
      gsap.to(buttonRef1.current, {
        y: -4,
        duration: 2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      // 6. Continuous floating animation for Button 2 (offset)
      gsap.to(buttonRef2.current, {
        y: 4,
        duration: 2.3,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 0.5,
      });

    }, containerRef);

    return () => {
      clearTimeout(timeout);
      ctx.revert();
    };
  }, []);

  return (
    <section className="relative w-full px-4 sm:px-6 py-12 md:py-16 bg-black flex justify-center">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
      `}} />
      <div
        ref={containerRef}
        className="relative w-full max-w-[1200px] rounded-[32px] overflow-hidden min-h-[380px] flex items-center bg-[#050a0f] border border-white/10"
        style={{ perspective: "1000px" }}
      >
        {/* Background Video */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            onEnded={(e) => {
              // Fallback for browsers where the native loop attribute fails
              e.currentTarget.play();
            }}
            className="w-full h-full object-cover opacity-80 mix-blend-screen transform-gpu"
          >
            <source src="/102852-661022019.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Dynamic Gradient Overlay */}
        <div 
          ref={overlayRef}
          className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-transparent pointer-events-none" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none opacity-60" />

        {/* Content */}
        <div ref={textRef} className="relative z-10 flex flex-col items-start px-8 sm:px-12 md:px-16 py-14 w-full max-w-3xl gap-5">
          <h2 
            className="text-4xl md:text-5xl lg:text-[56px] font-bold leading-[1.15] tracking-tight text-white/90"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}
          >
            Ready to Build Something
            <span 
              className="inline-block mx-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
              style={{ fontFamily: '"Great Vibes", cursive', fontWeight: '400', fontSize: '1.45em', color: '#ffffff' }}
            >
              Great?
            </span>
          </h2>
          
          <p 
            className="text-white/80 text-base md:text-lg font-medium max-w-lg leading-relaxed mt-1 drop-shadow-md"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}
          >
            Let's create an autonomous intelligence architecture that sets you apart from the competition.
          </p>

          <div className="flex flex-wrap items-center gap-6 mt-6">
            <div ref={buttonRef1} className="will-change-transform">
              <button className="h-[48px] px-6 rounded-[100px] bg-[#3b82f6] hover:bg-[#2563eb] text-white text-base font-medium transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_32px_rgba(59,130,246,0.6)]">
                Start a Project 
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </button>
            </div>

            <div ref={buttonRef2} className="scale-90 origin-left will-change-transform">
              <LiquidMetalButton label="Schedule a call" viewMode="text" size="md" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
