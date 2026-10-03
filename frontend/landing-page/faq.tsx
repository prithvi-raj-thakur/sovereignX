"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const FAQ_DATA = [
  {
    num: "01",
    question: "WHAT IS SOVEREIGNX?",
    answer: "SovereignX is an air-gapped, on-premise agentic AI workbench designed to let organizations build, deploy, and operate AI agents entirely within their own infrastructure."
  },
  {
    num: "02",
    question: "CAN SOVEREIGNX WORK WITHOUT AN INTERNET CONNECTION?",
    answer: "Yes. SovereignX is designed for air-gapped environments, allowing AI workflows and agents to operate without sending sensitive data to external cloud services."
  },
  {
    num: "03",
    question: "HOW DOES SOVEREIGNX PROTECT SENSITIVE DATA?",
    answer: "Data stays within your controlled infrastructure. SovereignX is built around on-premise deployment, isolated environments, controlled access, and secure AI workflows."
  },
  {
    num: "04",
    question: "WHAT MAKES SOVEREIGNX DIFFERENT FROM CLOUD-BASED AI PLATFORMS?",
    answer: "SovereignX gives organizations infrastructure-level control over their AI stack. Models, agents, workflows, and sensitive data can remain inside the organization instead of depending entirely on external AI infrastructure."
  },
  {
    num: "05",
    question: "DOES SOVEREIGNX SUPPORT HUMAN-IN-THE-LOOP WORKFLOWS?",
    answer: "Yes. SovereignX can introduce human approval and intervention at critical stages, allowing people to review, validate, modify, or approve agent actions before they are executed."
  },
  {
    num: "06",
    question: "WHO IS SOVEREIGNX BUILT FOR?",
    answer: "SovereignX is designed for organizations that need controlled, private, and reliable agentic AI—especially environments where data sovereignty, security, compliance, and offline operation are important."
  }
];

const FaqCard = ({ item }: { item: any }) => {
    const [isFlipped, setIsFlipped] = useState(false);
  
    return (
      <div 
        className="faq-card group h-[400px] lg:h-[480px] w-full max-w-[340px] shrink-0 [perspective:1200px] cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div 
            className={`relative h-full w-full rounded-[32px] transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] [transform-style:preserve-3d] shadow-2xl ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
        >
            {/* CSS GRADIENT BACKGROUND - Replaces heavy WebGL to fix scroll lag */}
            <div 
                className="absolute inset-0 rounded-[32px] overflow-hidden z-0"
                style={{
                    background: 'radial-gradient(circle at 100% 100%, rgba(30, 93, 215, 0.4) 0%, rgba(0, 0, 0, 1) 60%)'
                }}
            />

            {/* FRONT OF CARD */}
            <div className="absolute inset-0 h-full w-full rounded-[32px] overflow-hidden [backface-visibility:hidden] p-8 lg:p-10 flex flex-col justify-between border border-white/20 bg-black/10 z-10">
                <div className="flex justify-between items-start">
                    <span className="text-[13px] font-mono tracking-[0.2em] text-white/90 font-bold drop-shadow-md">
                        /{item.num}
                    </span>
                    <button 
                        className="w-10 h-10 rounded-full border border-white/40 flex items-center justify-center text-white transition-colors group-hover:bg-white/20"
                    >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7 1V13M1 7H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </button>
                </div>
                
                <h3 className="text-[1.4rem] lg:text-[1.6rem] font-bold uppercase tracking-tight leading-[1.1] text-white drop-shadow-lg">
                    {item.question}
                </h3>
            </div>

            {/* BACK OF CARD (ANSWER) */}
            <div className="absolute inset-0 h-full w-full rounded-[32px] overflow-hidden [backface-visibility:hidden] [transform:rotateY(180deg)] p-8 lg:p-10 flex flex-col border border-white/20 bg-black/40 backdrop-blur-md z-10">
                <div className="flex justify-between items-start mb-6">
                    <span className="text-[13px] font-mono tracking-[0.2em] text-white/70 font-bold">
                        /{item.num} ANSWER
                    </span>
                    <button 
                        className="w-10 h-10 rounded-full border border-white/40 flex items-center justify-center text-white transition-colors hover:bg-white/20"
                    >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </button>
                </div>

                <div className="flex-1 flex flex-col justify-center">
                    <p className="text-white font-medium leading-[1.6] text-[15px] lg:text-[16px] drop-shadow-md">
                        {item.answer}
                    </p>
                </div>
            </div>
        </div>
      </div>
    );
};

export default function FaqSection() {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);
        
        const mm = gsap.matchMedia();
        
        mm.add("(prefers-reduced-motion: no-preference)", () => {
            const cards = gsap.utils.toArray<HTMLElement>(".faq-card");
            
            // Header animation
            gsap.fromTo(
                ".faq-header-content",
                { opacity: 0, y: 30 },
                {
                    opacity: 1, 
                    y: 0,
                    duration: 1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 80%",
                        toggleActions: "play reverse play reverse"
                    }
                }
            );

            // Card cascade animation (Top row from left, bottom row from right)
            gsap.fromTo(
                cards,
                { 
                    opacity: 0, 
                    x: (index) => index < 3 ? -150 : 150,
                    y: 0
                },
                {
                    opacity: 1,
                    x: 0,
                    y: 0,
                    duration: 1.8,
                    stagger: 0.15,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: ".faq-grid",
                        start: "top 85%",
                        toggleActions: "play reverse play reverse"
                    }
                }
            );
        });

        return () => mm.revert();
    }, []);

    return (
        <section 
            ref={sectionRef} 
            className="relative w-full min-h-screen py-32 px-4 lg:px-8 flex flex-col items-center justify-center font-sf bg-transparent overflow-hidden"
        >
            <div className="w-full mx-auto relative z-10 flex flex-col items-center max-w-[1300px]">
                {/* Header */}
                <header className="faq-header-content w-full flex flex-col lg:flex-row lg:items-end justify-between mb-16 lg:mb-24 gap-8">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-semibold">
                                SOVEREIGNX — FAQ
                            </span>
                            <div className="w-12 h-[1px] bg-white/20" />
                        </div>
                        <style dangerouslySetInnerHTML={{__html: `
                          @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
                        `}} />
                        <h2 
                          className="text-4xl md:text-5xl lg:text-[56px] font-bold leading-[1.15] tracking-tight text-white/90"
                          style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}
                        >
                            Built for AI that stays under your 
                            <span 
                              className="inline-block mx-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                              style={{ fontFamily: '"Great Vibes", cursive', fontWeight: '400', fontSize: '1.45em', color: '#ffffff' }}
                            >
                              control.
                            </span>
                        </h2>
                    </div>
                    <p className="text-lg text-white/50 max-w-sm lg:pb-2">
                        Everything you need to know about deploying intelligent agents inside your own infrastructure.
                    </p>
                </header>

                {/* Staggered Grid Layout */}
                <div className="faq-grid w-full flex flex-col gap-6 lg:gap-10">
                    {/* ROW 1 - Aligned Left */}
                    <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-6 lg:gap-8 w-full">
                        {FAQ_DATA.slice(0, 3).map((item) => (
                            <FaqCard key={item.num} item={item} />
                        ))}
                    </div>

                    {/* ROW 2 - Aligned Right */}
                    <div className="flex flex-col md:flex-row items-center justify-center md:justify-end gap-6 lg:gap-8 w-full">
                        {FAQ_DATA.slice(3, 6).map((item) => (
                            <FaqCard key={item.num} item={item} />
                        ))}
                    </div>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{__html: `
                .font-sf {
                    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif;
                }
            `}} />
        </section>
    );
}
