"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const steps = [
  {
    num: "01",
    title: "Discover",
    desc: "Map your data and workflows to build a secure AI foundation.",
  },
  {
    num: "02",
    title: "Deploy",
    desc: "Bring AI on-premise, keeping confidential data within your infrastructure.",
  },
  {
    num: "03",
    title: "Air-Gap",
    desc: "Isolate critical AI workloads from external networks and cloud exposure.",
  },
  {
    num: "04",
    title: "Govern",
    desc: "Control access, policies, and activity with complete auditability.",
  },
  {
    num: "05",
    title: "Human-in-Loop",
    desc: "Keep people in control of critical outputs, decisions, and approvals.",
  },
  {
    num: "06",
    title: "Scale",
    desc: "Expand secure AI across your organization without losing control.",
  },
];

export default function MethodologySection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (!containerRef.current) return;

    // Force a single refresh to ensure GSAP calculates heights correctly 
    // after all dynamic components mount, fixing the scroll-to-footer bug.
    const timeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 500);

    const ctx = gsap.context(() => {
      // Animate the heading fading in and up
      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: 40, filter: 'blur(8px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
          },
        }
      );

      // Animate grid items dynamically (timeline for each item)
      const items = gridRef.current?.querySelectorAll('.grid-item-animate');
      if (items) {
        Array.from(items).forEach((item) => {
          const num = item.querySelector('.step-num');
          const content = item.querySelector('.step-content');
          
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: item,
              start: "top 85%",
              toggleActions: "play none none reverse"
            }
          });

          // Animate the card container
          tl.fromTo(
            item,
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
          )
          // Animate the massive number coming from the left with a 3D tilt
          .fromTo(
            num,
            { x: -40, opacity: 0, rotationY: 25, filter: 'blur(10px)' },
            { x: 0, opacity: 1, rotationY: 0, filter: 'blur(0px)', duration: 1.2, ease: "back.out(1.6)" },
            "-=0.6"
          )
          // Animate the text content coming from the right
          .fromTo(
            content,
            { x: 30, opacity: 0 },
            { x: 0, opacity: 1, duration: 1, ease: "power3.out" },
            "-=1.0"
          );
        });
      }
      
      // Also animate the glowing lines slowly fading in
      const lines = gridRef.current?.querySelector('.glowing-lines');
      if (lines) {
        gsap.fromTo(
          lines,
          { opacity: 0, scaleY: 0 },
          {
            opacity: 1,
            scaleY: 1,
            transformOrigin: "top",
            duration: 2,
            ease: "sine.inOut",
            scrollTrigger: {
              trigger: gridRef.current,
              start: "top 75%",
            },
          }
        );
      }
    }, containerRef);

    return () => {
      clearTimeout(timeout);
      ctx.revert();
    };
  }, []);

  return (
    <section 
      ref={containerRef}
      className="relative w-full bg-[#030508] text-white flex flex-col items-center px-4 sm:px-8 md:px-16 py-24 md:py-32 min-h-screen border-t border-white/5 overflow-hidden"
      style={{ perspective: "1000px" }}
    >
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
      `}} />
      
      {/* Top Heading */}
      <div ref={headingRef} className="w-full max-w-[1200px] text-center mb-16 md:mb-24 relative z-20">
        <h2 
          className="text-4xl md:text-5xl lg:text-[56px] font-bold leading-[1.15] tracking-tight text-white/90"
          style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}
        >
          A sovereign approach to AI that ensures 
          <span 
            className="inline-block mx-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            style={{ fontFamily: '"Great Vibes", cursive', fontWeight: '400', fontSize: '1.45em', color: '#ffffff' }}
          >
            confidential
          </span>
          data stays confidential.
        </h2>
      </div>

      {/* Grid below heading */}
      <div className="w-full max-w-none px-0 md:px-8 relative z-10">
        <div ref={gridRef} className="relative grid grid-cols-1 md:grid-cols-2">
          
          {/* ---- GLOWING LINE GRADIENTS (Desktop) ---- */}
          <div className="glowing-lines hidden md:block absolute inset-0 pointer-events-none z-0">
            {/* Vertical Line down the middle */}
            <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-gradient-to-b from-transparent via-[#1e5dd7] to-transparent opacity-60" />
            
            {/* Horizontal Line 1 (between row 1 & 2) */}
            <div className="absolute top-[33.333%] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#1e5dd7] to-transparent opacity-60" />
            
            {/* Horizontal Line 2 (between row 2 & 3) */}
            <div className="absolute top-[66.666%] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#1e5dd7] to-transparent opacity-60" />
            
            {/* Glowing Intersections */}
            <div className="absolute top-[33.333%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120px] h-[120px] bg-[#1e5dd7] blur-[45px] opacity-40 rounded-full mix-blend-screen" />
            <div className="absolute top-[66.666%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120px] h-[120px] bg-[#1e5dd7] blur-[45px] opacity-40 rounded-full mix-blend-screen" />
          </div>

          {/* ---- GLOWING LINE GRADIENTS (Mobile) ---- */}
          <div className="glowing-lines md:hidden absolute inset-0 pointer-events-none z-0">
            {[1, 2, 3, 4, 5].map((i) => (
              <div 
                key={i} 
                className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#1e5dd7] to-transparent opacity-60" 
                style={{ top: `${(i / 6) * 100}%` }} 
              />
            ))}
          </div>

          {/* Grid Cells */}
          {steps.map((step, idx) => (
            <div 
              key={idx} 
              className="relative p-10 md:p-14 min-h-[300px] flex flex-col sm:flex-row items-center sm:items-start justify-start gap-8 sm:gap-14 overflow-hidden group grid-item-animate"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Cinematic Number */}
              <div 
                className="step-num text-[120px] sm:text-[160px] md:text-[200px] font-black leading-[0.8] tracking-[-0.06em] select-none pointer-events-none transition-transform duration-1000 group-hover:scale-105 shrink-0 z-0"
                style={{ 
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                  // The gradient goes from a bright icy blue, to deep royal blue, 
                  // and then fades to transparent to blend seamlessly with the background and glowing lines.
                  background: 'linear-gradient(180deg, #60a5fa 0%, #1d4ed8 45%, rgba(29, 78, 216, 0) 85%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  opacity: 0.95,
                  filter: 'drop-shadow(0px 4px 24px rgba(29, 78, 216, 0.25))'
                }}
              >
                {step.num}
              </div>

              <div className="step-content relative z-10 flex flex-col gap-3 pt-2 sm:pt-6">
                <h3 
                  className="text-2xl md:text-3xl font-bold text-white tracking-tight"
                  style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}
                >
                  {step.title}
                </h3>
                <p 
                  className="text-white/50 text-base md:text-lg leading-relaxed max-w-[360px] font-medium"
                  style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}
                >
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
