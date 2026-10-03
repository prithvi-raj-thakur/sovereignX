"use client";

import React, { useState, useEffect, useRef } from "react";
import { CheckCircle2, Zap, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { BlobCard } from "@/components/ui/blob-card";
import SpecularButton from "@/components/ui/border-glow-button";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const APPLE_FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const BLUE_LIGHT = ["#1E5DD7", "#0F2E6B", "#1E5DD7", "#0A1F47"];
const BLUE_DARK = ["#1E5DD7", "#0F2E6B", "#1E5DD7", "#050F23"];
const BLUE_GLOW = ["#1E5DD7", "#0A1F47", "#1E5DD7", "#050F23", "#1E5DD7"];

export default function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Header Animation
      gsap.fromTo(
        ".pricing-header-el",
        { y: 30, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.8, 
          stagger: 0.1, 
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
          }
        }
      );

      // Cards Staggered Reveal
      gsap.fromTo(
        cardsRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%",
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const communityFeatures = [
    "Standard security",
    "5 active workflows",
    "Email support",
    "Basic usage analytics",
    "Basic triggers",
    "App integrations"
  ];

  const teamFeatures = [
    "Unlimited workflows",
    "Multi-step workflows",
    "Real-time data sync",
    "Advanced AI actions",
    "Email & chat support",
    "Dedicated support manager",
    "Time tracking and analytics",
    "Analytics & reports"
  ];

  const enterpriseFeatures = [
    "Unlimited workflows",
    "Unlimited task runs",
    "Custom workflow builder",
    "Custom integrations support",
    "Dedicated account manager",
    "Analytics & reports"
  ];

  return (
    <section 
      ref={sectionRef} 
      className="relative w-full bg-black text-white py-24 flex flex-col items-center justify-center px-4 overflow-hidden" 
      style={{ fontFamily: APPLE_FONT }}
    >
      {/* Background ambient glow - extremely subtle left and right */}
      <div className="absolute top-1/3 -left-[20%] w-[50%] h-[500px] bg-[#1E3A8A] blur-[150px] opacity-20 pointer-events-none" />
      <div className="absolute top-1/3 -right-[20%] w-[50%] h-[500px] bg-[#1E3A8A] blur-[150px] opacity-20 pointer-events-none" />
      
      {/* Header */}
      <div className="text-center mb-16 z-10 relative flex flex-col items-center">
        {/* Pricing Pill */}
        <div 
          className="pricing-header-el relative inline-flex items-center gap-2 px-6 py-2 rounded-full bg-black/60 backdrop-blur-xl mb-8 overflow-hidden opacity-0"
          style={{ 
            boxShadow: '0 4px 24px -6px rgba(0, 163, 255, 0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 -4px 12px -2px rgba(0, 163, 255, 0.4)'
          }}
        >
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70%] h-[1px] bg-gradient-to-r from-transparent via-[#00A3FF] to-transparent opacity-80 pointer-events-none" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[40%] h-[3px] bg-[#00A3FF] blur-sm opacity-60 pointer-events-none" />
          
          <Tag size={14} className="text-[#00A3FF] relative z-10" />
          <span className="text-xs font-semibold tracking-widest uppercase text-white/90 relative z-10">Pricing</span>
        </div>
        
        <style dangerouslySetInnerHTML={{__html: `
          @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
        `}} />
        <h2 
          className="pricing-header-el text-4xl md:text-5xl lg:text-[56px] font-bold leading-[1.15] tracking-tight text-white/90 mb-8 opacity-0"
          style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}
        >
          Choose the right plan for your
          <span 
            className="inline-block mx-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            style={{ fontFamily: '"Great Vibes", cursive', fontWeight: '400', fontSize: '1.45em', color: '#ffffff' }}
          >
            growth
          </span>
        </h2>
        
        {/* Toggle */}
        <div 
          className="pricing-header-el relative inline-flex items-center p-1.5 rounded-full bg-black/60 backdrop-blur-xl shadow-lg opacity-0 overflow-hidden"
          style={{ 
            boxShadow: '0 4px 24px -6px rgba(0, 163, 255, 0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 -4px 12px -2px rgba(0, 163, 255, 0.4)'
          }}
        >
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70%] h-[1px] bg-gradient-to-r from-transparent via-[#00A3FF] to-transparent opacity-80 pointer-events-none" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[40%] h-[3px] bg-[#00A3FF] blur-sm opacity-60 pointer-events-none" />
          
          <button 
            onClick={() => setIsYearly(false)}
            className={cn(
              "px-6 py-2 rounded-full text-[13px] font-medium transition-all duration-300 relative z-10",
              !isYearly ? "bg-[#00A3FF] text-white shadow-[0_0_15px_rgba(0,163,255,0.4)]" : "text-white/60 hover:text-white"
            )}
          >
            Monthly
          </button>
          <button 
            onClick={() => setIsYearly(true)}
            className={cn(
              "px-6 py-2 rounded-full text-[13px] font-medium transition-all duration-300 relative z-10",
              isYearly ? "bg-[#00A3FF] text-white shadow-[0_0_15px_rgba(0,163,255,0.4)]" : "text-white/60 hover:text-white"
            )}
          >
            Yearly
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="w-full max-w-[1100px] grid grid-cols-1 md:grid-cols-3 gap-8 items-start z-10 relative">
        
        {/* Starter Card */}
        <div className="h-full opacity-0" ref={(el) => { cardsRef.current[0] = el; }}>
          <BlobCard
            headerHeight={140}
            lightColors={BLUE_LIGHT}
            darkColors={BLUE_DARK}
            glowColors={BLUE_GLOW}
            className="h-full flex flex-col"
            header={
              <div className="text-center pt-2">
                <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-1" style={{ fontFamily: APPLE_FONT }}>Starter</h3>
                <span className="text-[10px] text-[#00A3FF] font-bold tracking-[0.25em] uppercase mb-2 block">Small Teams</span>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-white" style={{ fontFamily: APPLE_FONT }}>Free</span>
                  <span className="text-[10px] text-white/50 tracking-widest uppercase">/ forever</span>
                </div>
              </div>
            }
          >
            <div className="p-6 md:p-8 flex flex-col flex-grow bg-black/40 backdrop-blur-md rounded-b-[20px]">
              <p className="text-white/60 text-[13px] mb-6 text-center" style={{ fontFamily: APPLE_FONT }}>
                For small teams and startups.
              </p>
              
              <ul className="space-y-3.5 mb-8 flex-grow">
                {communityFeatures.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#00A3FF] shrink-0 mt-0.5" />
                    <span className="text-white/80 text-[13px]" style={{ fontFamily: APPLE_FONT }}>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-auto flex justify-center">
                <SpecularButton 
                  autoAnimate 
                  lineColor="#00A3FF" 
                  baseColor="#071324" 
                  intensity={0.6}
                  className="w-full"
                >
                  <span className="font-semibold text-xs tracking-widest uppercase">Get Started</span>
                </SpecularButton>
              </div>
            </div>
          </BlobCard>
        </div>

        {/* Pro Card */}
        <div className="md:-translate-y-4 relative h-full opacity-0" ref={(el) => { cardsRef.current[1] = el; }}>
          {/* Highlight Tag */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 bg-[#00A3FF] text-white px-4 py-1.5 text-[10px] font-bold tracking-[0.25em] uppercase shadow-[0_0_15px_rgba(0,163,255,0.5)] rounded-full flex items-center gap-1.5">
            <Zap size={12} fill="currentColor" /> MOST POPULAR
          </div>
          
          <BlobCard
            headerHeight={140}
            lightColors={BLUE_LIGHT}
            darkColors={BLUE_DARK}
            glowColors={BLUE_GLOW}
            className="h-full flex flex-col relative"
            header={
              <div className="text-center pt-4">
                <h3 className="text-2xl font-bold text-white uppercase tracking-wider mb-1" style={{ fontFamily: APPLE_FONT }}>Pro</h3>
                <span className="text-[10px] text-[#00A3FF] font-bold tracking-[0.25em] uppercase mb-2 block">Team License</span>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-white" style={{ fontFamily: APPLE_FONT }}>
                    ${isYearly ? "39" : "49"}
                  </span>
                  <span className="text-[10px] text-white/50 tracking-widest uppercase">/ mo</span>
                </div>
                {isYearly && <div className="text-[9px] text-[#00A3FF]/70 tracking-widest uppercase mt-1">Billed annually</div>}
              </div>
            }
          >
            <div className="p-6 md:p-8 flex flex-col flex-grow bg-black/40 backdrop-blur-md rounded-b-[20px]">
              <p className="text-white/90 text-[13px] mb-6 text-center" style={{ fontFamily: APPLE_FONT }}>
                Built for teams automating daily.
              </p>
              
              <ul className="space-y-3.5 mb-8 flex-grow">
                {teamFeatures.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#00A3FF] shrink-0 mt-0.5" />
                    <span className="text-white/90 text-[13px]" style={{ fontFamily: APPLE_FONT }}>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-auto flex justify-center">
                <SpecularButton 
                  autoAnimate 
                  lineColor="#ffffff" 
                  baseColor="#005B99" 
                  intensity={1.2}
                  className="w-full"
                >
                  <span className="font-bold text-xs tracking-widest uppercase">Start Free Trial</span>
                </SpecularButton>
              </div>
            </div>
          </BlobCard>
        </div>

        {/* Enterprise Card */}
        <div className="h-full opacity-0" ref={(el) => { cardsRef.current[2] = el; }}>
          <BlobCard
            headerHeight={140}
            lightColors={BLUE_LIGHT}
            darkColors={BLUE_DARK}
            glowColors={BLUE_GLOW}
            className="h-full flex flex-col"
            header={
              <div className="text-center pt-2">
                <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-1" style={{ fontFamily: APPLE_FONT }}>Enterprise</h3>
                <span className="text-[10px] text-[#00A3FF] font-bold tracking-[0.25em] uppercase mb-2 block">Custom Scale</span>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-white" style={{ fontFamily: APPLE_FONT }}>
                    ${isYearly ? "89" : "99"}
                  </span>
                  <span className="text-[10px] text-white/50 tracking-widest uppercase">/ mo</span>
                </div>
              </div>
            }
          >
            <div className="p-6 md:p-8 flex flex-col flex-grow bg-black/40 backdrop-blur-md rounded-b-[20px]">
              <p className="text-white/60 text-[13px] mb-6 text-center" style={{ fontFamily: APPLE_FONT }}>
                For advanced business needs.
              </p>
              
              <ul className="space-y-3.5 mb-8 flex-grow">
                {enterpriseFeatures.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#00A3FF] shrink-0 mt-0.5" />
                    <span className="text-white/80 text-[13px]" style={{ fontFamily: APPLE_FONT }}>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-auto flex justify-center">
                <SpecularButton 
                  autoAnimate 
                  lineColor="#00A3FF" 
                  baseColor="#071324" 
                  intensity={0.6}
                  className="w-full"
                >
                  <span className="font-semibold text-xs tracking-widest uppercase">Contact Sales</span>
                </SpecularButton>
              </div>
            </div>
          </BlobCard>
        </div>

      </div>
    </section>
  );
}
