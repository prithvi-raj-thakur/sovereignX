"use client";

import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Card1AirGap from './cards/Card1AirGap';
import Card2Router from './cards/Card2Router';
import Card3Vision from './cards/Card3Vision';
import Card4Sandbox from './cards/Card4Sandbox';
import Card5RAG from './cards/Card5RAG';
import Card6Deliverables from './cards/Card6Deliverables';

gsap.registerPlugin(ScrollTrigger);

export default function BentoGrid() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Staggered reveal animation for all cards
    gsap.fromTo(
      ".bento-card",
      { 
        opacity: 0, 
        y: 60,
      },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%", 
          toggleActions: "play none none reverse",
        }
      }
    );
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative w-full max-w-[1400px] mx-auto px-6 py-24 z-20 font-display">
      
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
      `}} />
      <div className="mb-20 text-center" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif' }}>
        <h2 data-animate="fade-up" className="text-4xl md:text-5xl lg:text-[56px] font-bold leading-[1.15] tracking-tight text-white/90 mb-6">
          Industrial-Grade 
          <span 
            className="inline-block mx-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            style={{ fontFamily: '"Great Vibes", cursive', fontWeight: '400', fontSize: '1.45em', color: '#ffffff' }}
          >
            Architecture
          </span>
        </h2>
        <p data-animate="fade-up" className="text-white/60 max-w-2xl mx-auto text-[17px] leading-relaxed font-medium">
          Secure, air-gapped, and deterministic by design. Our agentic stack operates in zero-trust environments with absolute control.
        </p>
      </div>

      {/* Asymmetrical Masonry Layout using Flex Columns */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Column 1 */}
        <div className="flex flex-col gap-6 w-full lg:w-1/3">
          <div className="bento-card h-[480px]">
            <Card1AirGap />
          </div>
          <div className="bento-card h-[320px]">
            <Card4Sandbox />
          </div>
        </div>

        {/* Column 2 */}
        <div className="flex flex-col gap-6 w-full lg:w-1/3">
          <div className="bento-card h-[360px]">
            <Card2Router />
          </div>
          <div className="bento-card h-[440px]">
            <Card5RAG />
          </div>
        </div>

        {/* Column 3 */}
        <div className="flex flex-col gap-6 w-full lg:w-1/3">
          <div className="bento-card h-[300px]">
            <Card3Vision />
          </div>
          <div className="bento-card h-[500px]">
            <Card6Deliverables />
          </div>
        </div>

      </div>
    </section>
  );
}
