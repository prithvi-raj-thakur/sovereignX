"use client";

import React, { useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function SlowManifestoReveal({ children }: { children: string }) {
    const sectionRef = useRef<HTMLElement>(null);
    const textRef = useRef<HTMLParagraphElement>(null);

    const words = useMemo(() => {
        return children.split(/(\s+)/).map((word, i) => {
            if (word.match(/^\s+$/)) return word;
            return (
                <span 
                    key={i} 
                    className="inline-block opacity-0 translate-y-[80px] blur-[10px] word"
                >
                    {word}
                </span>
            );
        });
    }, [children]);

    useGSAP(() => {
        const wordElements = textRef.current?.querySelectorAll('.word');
        if (!wordElements || !sectionRef.current) return;

        gsap.to(wordElements, {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            stagger: 0.1,
            ease: 'power1.out',
            scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 1, // 1 second of smoothing for a very premium feel
            }
        });
    }, { scope: sectionRef });

    return (
        <section ref={sectionRef} className="relative w-full h-[400vh] bg-transparent z-10">
            {/* 
              Using sticky positioning instead of GSAP pin-spacer avoids mutating the DOM tree 
              and ensures layout integrity for components rendered below this section.
            */}
            <div className="sticky top-0 w-full h-screen flex items-center justify-center px-6 md:px-12 overflow-hidden pointer-events-none">
                <p 
                    ref={textRef} 
                    className="text-[clamp(1.25rem,2.5vw,3rem)] leading-[1.4] text-center max-w-[950px] text-white/80 tracking-normal font-normal pointer-events-auto"
                    style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif' }}
                >
                    {words}
                </p>
            </div>
        </section>
    );
}
