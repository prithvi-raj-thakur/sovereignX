"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function Timeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const container = containerRef.current;
    const path = pathRef.current;
    const milestones = document.querySelectorAll('.milestone-item');

    if (!path || !container) return;

    let currentLength = path.getTotalLength();
    
    gsap.set(path, {
      strokeDasharray: currentLength,
      strokeDashoffset: currentLength
    });

    milestones.forEach(m => {
      m.addEventListener('click', () => {
        const nodeY = parseFloat(m.getAttribute('data-node-y') || '0');
        const containerTop = container.offsetTop;
        window.scrollTo({
          top: containerTop + nodeY - (window.innerHeight * 0.4),
          behavior: 'smooth'
        });
      });
    });

    ScrollTrigger.addEventListener("refreshInit", () => {
      currentLength = path.getTotalLength();
      gsap.set(path, { strokeDasharray: currentLength });
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "top 75%",
        end: "bottom 85%",
        scrub: true,
        onUpdate: (self) => {
          const drawLength = self.progress * currentLength;
          const currentY = path.getPointAtLength(Math.min(Math.max(drawLength, 0), currentLength)).y;

          milestones.forEach((milestone) => {
            const targetY = parseFloat(milestone.getAttribute('data-node-y') || '0');
            if (currentY >= targetY - 100) {
              milestone.classList.add('active');
            } else {
              milestone.classList.remove('active');
            }
          });
        }
      }
    });

    tl.to(path, {
      strokeDashoffset: 0,
      ease: "none"
    });

    ScrollTrigger.refresh();

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <section className="w-full bg-[#000000] text-neutral-100 antialiased selection:bg-sovering-500/20 selection:text-sovering-400 relative overflow-x-hidden font-sans" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      <style>{`
    .font-editorial-num {
      font-family: "Cormorant Garamond", Georgia, serif;
      font-feature-settings: "lnum" 1, "tnum" 1;
      line-height: 0.8;
      letter-spacing: -0.05em;
    }

    /* SVG Timeline Track Styles */
    .timeline-bg-track {
      stroke: #333333;
      strokeWidth: 1.5;
      fill: none;
      strokeDasharray: 6 10;
      strokeLinecap: round;
      strokeLinejoin: round;
    }
    .timeline-dashed-accents {
      display: none;
    }
    .timeline-active-path {
      stroke: url(#dramaticPathGradient);
      strokeWidth: 2.5;
      fill: none;
      strokeLinecap: round;
      strokeLinejoin: round;
      filter: drop-shadow(0 0 8px rgba(30, 93, 215, 0.4));
      willChange: stroke-dashoffset;
    }

    /* Node & Milestone State Dynamics */
    .milestone-item {
      transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
      opacity: 0.35;
      transform: translateY(24px);
    }
    .milestone-item.active {
      opacity: 1;
      transform: translateY(0);
    }

    .node-outer-halo {
      transition: transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.6s ease, border-color 0.6s ease, box-shadow 0.6s ease;
    }
    .node-inner-core {
      transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.5s ease;
    }

    .milestone-item.active .node-outer-halo {
      transform: scale(1.15);
      background-color: transparent;
      border-color: #00a3ff;
      box-shadow: 0 0 15px rgba(0, 163, 255, 0.3);
    }
    .milestone-item.active .node-inner-core {
      transform: scale(1);
      background-color: #00a3ff;
      border-color: #00a3ff;
      box-shadow: 0 0 10px rgba(0, 163, 255, 0.8);
    }
    
    .milestone-item.active .milestone-num {
      color: #ffffff;
      opacity: 1;
      transform: scale(1.05);
    }

    /* Beacon breathing animations */
    @keyframes blob-breathe {
      0%, 100% { transform: scale(1); opacity: 0.85; }
      50% { transform: scale(1.4); opacity: 0.3; }
    }
    @keyframes micro-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .animate-blob-breathe {
      animation: blob-breathe 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      transform-origin: center;
    }
    .animate-spin-slow {
      animation: micro-spin 18s linear infinite;
      transform-origin: center;
    }

    /* High-fashion typography hover distortion */
    .milestone-item {
      cursor: pointer;
    }
    .milestone-item:hover .milestone-num {
      color: #ffffff;
      opacity: 0.8;
    }
    .milestone-num {
      transition: transform 0.4s ease, color 0.4s ease;
    }
  `}</style>
      <header className="w-full max-w-[1440px] mx-auto px-6 sm:px-12 pt-20 pb-12 flex flex-col md:flex-row md:items-end justify-between border-b border-neutral-800/60 relative z-20">
<div className="max-w-2xl">
<div className="flex items-center gap-3 mb-3">
<span className="w-2 h-2 rounded-full bg-sovering-600 animate-ping"></span>
<span className="font-cinzel text-[11px] uppercase tracking-[0.35em] text-sovering-500 font-semibold">HackSpire 2026 • Chronology</span>
</div>
<h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white font-normal tracking-tight leading-[0.92]">
        The Horizon <br className="hidden sm:inline"/><span className="italic font-light text-neutral-300">Journey</span>
</h1>
</div>
<div className="mt-8 md:mt-0 flex flex-col md:items-end text-left md:text-right max-w-md">
<span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-1">LATITUDE 44°N — EXPEDITION ARC</span>
<p className="text-white/60 text-base md:text-lg font-light leading-relaxed tracking-wide">
        From opening registries to the live amphitheater showcase. Trace the asymmetric tension of each transformative milestone along the celestial curve.
      </p>
</div>
</header>
<main className="relative w-full max-w-[1440px] mx-auto min-h-[3360px]" data-purpose="editorial-timeline" id="timeline-wrapper" ref={containerRef}>
{/*  ================= SVG OVERLAY: CRAZY EXPRESSIVE BÉZIER CURVE =================  */}
{/*  ViewBox: 1440 x 5600 accurately aligned to canvas coordinate space  */}
<div aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none z-10">
<svg className="w-full h-full overflow-visible" id="timeline-svg" preserveAspectRatio="none" viewBox="0 0 1440 5600" xmlns="http://www.w3.org/2000/svg">
<defs>
<filter height="180%" id="luminous-glow-intense" width="180%" x="-40%" y="-40%">
<feGaussianBlur in="SourceGraphic" result="blur1" stdDeviation="6" />
<feGaussianBlur in="SourceGraphic" result="blur2" stdDeviation="16" />
<feMerge>
<feMergeNode in="blur2" />
<feMergeNode in="blur1" />
<feMergeNode in="SourceGraphic" />
</feMerge>
</filter>
<linearGradient id="dramaticPathGradient" x1="0%" x2="100%" y1="0%" y2="100%">
<stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
<stop offset="30%" stopColor="#a2c8fd" stopOpacity="1" />
<stop offset="60%" stopColor="#1e5dd7" stopOpacity="1" />
<stop offset="100%" stopColor="#050a0f" stopOpacity="1" />
</linearGradient>
{/*  Radial glow for traveler blob  */}
<radialGradient cx="50%" cy="50%" id="beaconGlow" r="50%">
<stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
<stop offset="40%" stopColor="#a2c8fd" stopOpacity="0.8" />
<stop offset="70%" stopColor="#1e5dd7" stopOpacity="0.4" />
<stop offset="100%" stopColor="#050a0f" stopOpacity="0" />
</radialGradient>
</defs>
{/*  Dynamic celestial stardust particles along the void  */}
<g className="hidden md:block" opacity="0.4">
<circle cx="160" cy="540" fill="#a2c8fd" r="1.5" />
<circle cx="280" cy="620" fill="#00a3ff" r="2.5" />
<circle cx="680" cy="850" fill="#1e5dd7" r="1.5" />
<circle cx="1180" cy="1150" fill="#00a3ff" r="2" />
<circle cx="1020" cy="1480" fill="#a2c8fd" r="1" />
<circle cx="520" cy="1980" fill="#00a3ff" r="2" />
<circle cx="110" cy="2320" fill="#1e5dd7" r="1.5" />
<circle cx="340" cy="3050" fill="#a2c8fd" r="2.5" />
<circle cx="680" cy="3580" fill="#00a3ff" r="1" />
<circle cx="980" cy="4100" fill="#00a3ff" r="2" />
<circle cx="740" cy="4650" fill="#1e5dd7" r="1.5" />
<circle cx="380" cy="5200" fill="#a2c8fd" r="2" />
</g>
{/*  Expressive Guide Track (Underlay with daring multi-inflections and hairpin loops)
             Nodes Coordinates:
             N1: (180, 360)
             N2: (1120, 1140)  -> Sweeping cross-canvas leap
             N3: (240, 2480)   -> Giant vertical tension canyon
             N4: (660, 3220)   -> Quick nestled diagonal curl
             N5: (1180, 4120)  -> Dramatic lateral sling to far right
             N6: (460, 5080)   -> Expressive final hairpin curl
         */}
<path className="timeline-bg-track" d="
          M 180 80
          C 180 200, 180 280, 180 360
          C 180 580, 340 760, 680 820
          C 960 870, 1180 940, 1120 1140
          C 1060 1340, 780 1520, 890 1780
          C 980 1990, 780 2200, 480 2280
          C 280 2330, 210 2400, 240 2480
          C 270 2580, 390 2660, 340 2790
          C 290 2930, 420 3060, 660 3220
          C 960 3420, 1280 3660, 1240 3920
          C 1220 4030, 1200 4070, 1180 4120
          C 1120 4280, 840 4420, 940 4640
          C 1020 4820, 740 4940, 460 5080
          C 220 5200, 360 5420, 520 5540
        " />
{/*  Intricate dashed orbital accent paths weaving and crossing  */}
<path className="timeline-dashed-accents" d="
          M 180 360
          C 180 580, 340 760, 680 820
          C 960 870, 1180 940, 1120 1140
          C 1060 1340, 780 1520, 890 1780
          C 980 1990, 780 2200, 480 2280
          C 280 2330, 210 2400, 240 2480
          C 270 2580, 390 2660, 340 2790
          C 290 2930, 420 3060, 660 3220
          C 960 3420, 1280 3660, 1240 3920
          C 1220 4030, 1200 4070, 1180 4120
          C 1120 4280, 840 4420, 940 4640
          C 1020 4820, 740 4940, 460 5080
        " />
{/*  Dramatic Active Path (Animated dynamically with scroll interpolation)  */}
<path className="timeline-active-path" d="
          M 180 80
          C 180 200, 180 280, 180 360
          C 180 580, 340 760, 680 820
          C 960 870, 1180 940, 1120 1140
          C 1060 1340, 780 1520, 890 1780
          C 980 1990, 780 2200, 480 2280
          C 280 2330, 210 2400, 240 2480
          C 270 2580, 390 2660, 340 2790
          C 290 2930, 420 3060, 660 3220
          C 960 3420, 1280 3660, 1240 3920
          C 1220 4030, 1200 4070, 1180 4120
          C 1120 4280, 840 4420, 940 4640
          C 1020 4820, 740 4940, 460 5080
          C 220 5200, 360 5420, 520 5540
        " filter="url(#luminous-glow-intense)" id="timeline-main-path" ref={pathRef} />
{/*  Expressive Multi-Ring Celestial Traveler Orb / Liquid Beacon  */}
<g id="traveler-blob" style={{ transform: 'translate(180px, 80px)', willChange: 'transform' }}>
{/*  Micro constellation coordinate ring  */}
<g className="animate-spin-slow">
<circle cx="0" cy="0" fill="none" opacity="0.45" r="38" stroke="#1e5dd7" strokeDasharray="3 6" strokeWidth="1" />
<circle cx="38" cy="0" fill="#a2c8fd" r="2.5" />
<circle cx="-38" cy="0" fill="#00a3ff" r="1.5" />
</g>
{/*  Expanding pulsating aura halo  */}
<circle className="animate-blob-breathe" fill="url(#beaconGlow)" r="32" />
{/*  Secondary glowing ring  */}
<circle fill="#00a3ff" filter="drop-shadow(0 0 10px #7c3aed)" opacity="0.75" r="16" />
{/*  White-hot liquid core  */}
<circle fill="#ffffff" filter="drop-shadow(0 0 6px #ffffff)" r="7.5" />
{/*  Trailing micro sparks  */}
<circle cx="-14" cy="-12" fill="#00a3ff" opacity="0.7" r="1.8" />
<circle cx="16" cy="14" fill="#a2c8fd" opacity="0.6" r="1.4" />
</g>
</svg>
</div>
{/*  ================= ASYMMETRICAL & UNCONVENTIONAL MILESTONES =================  */}
<div className="relative z-20 w-full" data-purpose="milestones-flow">
{/*  ================= MILESTONE 01: Top Left / Origin point =================  */}
{/*  Node coord: (180, 360) -> Top 320px, Left ~12.5%  */}
<article className="milestone-item absolute top-[186px] left-[5%] sm:left-[8%] md:left-[12.5%] max-w-lg flex items-start group" data-node-y="216" data-purpose="milestone-entry" id="milestone-1">
{/*  Concentric Node on Path  */}
<div className="relative flex-shrink-0 mr-5 sm:mr-8 mt-4">
<div className="node-outer-halo relative flex items-center justify-center w-10 h-10 rounded-full bg-sovering-600/10 border border-sovering-400/50 shadow-sm backdrop-blur-[2px]">
<span className="node-inner-core w-4 h-4 rounded-full border-2 border-white bg-sovering-600 shadow-sm"></span>
</div>
<span className="absolute -bottom-5 left-1/2 -translate-x-1/2 font-mono text-[9px] text-neutral-400 tracking-wider">01/N</span>
</div>
{/*  Content Presentation  */}
<div className="flex items-start gap-4 sm:gap-6">
<span className="milestone-num font-editorial-num text-8xl md:text-9xl text-neutral-300/90 select-none">1</span>
<div className="pt-1 flex flex-col">
<span className="font-cinzel text-[11px] uppercase tracking-[0.25em] text-neutral-400 font-semibold mb-1">Genesis Chamber</span>
<h2 className="font-serif text-3xl sm:text-4xl text-sovering-500 font-normal tracking-tight leading-[1.05]">
              Registration Opens
            </h2>
<time className="font-semibold text-white/50 text-xs tracking-widest uppercase mt-2.5 flex items-center gap-2" dateTime="2026-08-17">
<span className="w-1.5 h-1.5 rounded-full bg-sovering-400"></span>
              17 August 2026
            </time>
<p className="text-neutral-600 text-sm max-w-sm mt-3.5 leading-relaxed font-normal">
              The gates of HackSpire unlock. Assemble your cohort, chart unfamiliar domains, and register your alliance for a sprint engineered around rare craft.
            </p>
</div>
</div>
</article>
{/*  ================= MILESTONE 02: Far Right Swung Sweep =================  */}
{/*  Tucked close vertically beneath 01 after a dramatic lateral leap across the canvas  */}
{/*  Node coord: (1120, 1140) -> Top 1090px, Left ~77.8% (or aligned to right)  */}
<article className="milestone-item absolute top-[648px] right-[4%] sm:right-[6%] md:right-[9%] max-w-lg flex flex-row-reverse sm:flex-row items-start group text-right sm:text-left" data-node-y="684" data-purpose="milestone-entry" id="milestone-2">
{/*  Concentric Node on Path  */}
<div className="relative flex-shrink-0 ml-5 sm:ml-0 sm:mr-8 mt-4">
<div className="node-outer-halo relative flex items-center justify-center w-10 h-10 rounded-full bg-sovering-600/10 border border-sovering-400/50 shadow-sm backdrop-blur-[2px]">
<span className="node-inner-core w-4 h-4 rounded-full border-2 border-white bg-sovering-600 shadow-sm"></span>
</div>
<span className="absolute -bottom-5 left-1/2 -translate-x-1/2 font-mono text-[9px] text-neutral-400 tracking-wider">02/E</span>
</div>
{/*  Content Presentation  */}
<div className="flex items-start gap-4 sm:gap-6 flex-row-reverse sm:flex-row">
<span className="milestone-num font-editorial-num text-8xl md:text-9xl text-neutral-300/90 select-none">2</span>
<div className="pt-1 flex flex-col">
<span className="font-cinzel text-[11px] uppercase tracking-[0.25em] text-neutral-400 font-semibold mb-1">Proposal Crucible</span>
<h2 className="font-serif text-3xl sm:text-4xl text-sovering-500 font-normal tracking-tight leading-[1.05]">
              Idea Submission
            </h2>
<time className="font-semibold text-white/50 text-xs tracking-widest uppercase mt-2.5 flex items-center gap-2 justify-end sm:justify-start" dateTime="2026-09-03/2026-09-15">
<span className="w-1.5 h-1.5 rounded-full bg-sovering-400"></span>
              03–15 September 2026
            </time>
<p className="text-neutral-600 text-sm max-w-sm mt-3.5 leading-relaxed font-normal">
              Portal submission is uncompromisingly mandatory. Keep theses sharp, bold, and free of filler: declare your architectural trajectory.
            </p>
</div>
</div>
</article>
{/*  ================= MILESTONE 03: Massive Canyon of Whitespace Drop =================  */}
{/*  Giant 1340px vertical gorge to stage 03, floating far down mid-left  */}
{/*  Node coord: (240, 2480) -> Top 2420px, Left ~16.6%  */}
<article className="milestone-item absolute top-[1452px] left-[6%] sm:left-[10%] md:left-[16%] max-w-xl flex items-start group" data-node-y="1488" data-purpose="milestone-entry" id="milestone-3">
{/*  Concentric Node on Path  */}
<div className="relative flex-shrink-0 mr-5 sm:mr-8 mt-4">
<div className="node-outer-halo relative flex items-center justify-center w-10 h-10 rounded-full bg-sovering-600/10 border border-sovering-400/50 shadow-sm backdrop-blur-[2px]">
<span className="node-inner-core w-4 h-4 rounded-full border-2 border-white bg-sovering-600 shadow-sm"></span>
</div>
<span className="absolute -bottom-5 left-1/2 -translate-x-1/2 font-mono text-[9px] text-neutral-400 tracking-wider">03/S</span>
</div>
{/*  Content Presentation  */}
<div className="flex items-start gap-4 sm:gap-7">
<span className="milestone-num font-editorial-num text-8xl md:text-[10rem] text-neutral-300/90 select-none">3</span>
<div className="pt-2 flex flex-col">
<span className="font-cinzel text-[11px] uppercase tracking-[0.25em] text-neutral-400 font-semibold mb-1">Curation Verdict</span>
<h2 className="font-serif text-3xl sm:text-5xl text-sovering-500 font-normal tracking-tight leading-[1.02]">
              Shortlist <br className="hidden sm:inline"/>Announcement
            </h2>
<time className="font-semibold text-white/50 text-xs tracking-widest uppercase mt-3 flex items-center gap-2" dateTime="2026-09-28">
<span className="w-1.5 h-1.5 rounded-full bg-sovering-400"></span>
              28 September 2026
            </time>
<p className="text-neutral-600 text-sm max-w-sm mt-3.5 leading-relaxed font-normal">
              Evaluators isolate the visionary builders advancing into the prototype lab. Explicit rubric dossiers and telemetry are transferred directly to finalists.
            </p>
</div>
</div>
</article>
{/*  ================= MILESTONE 04: Tight Nestled Steep Diagonal =================  */}
{/*  Nestled tightly below 03 (only ~740px drop) floating toward center right  */}
{/*  Node coord: (660, 3220) -> Top 3160px, Left ~45.8%  */}
<article className="milestone-item absolute top-[1896px] left-[32%] sm:left-[40%] md:left-[46%] max-w-lg flex items-start group" data-node-y="1932" data-purpose="milestone-entry" id="milestone-4">
{/*  Concentric Node on Path  */}
<div className="relative flex-shrink-0 mr-5 sm:mr-8 mt-4">
<div className="node-outer-halo relative flex items-center justify-center w-10 h-10 rounded-full bg-sovering-600/10 border border-sovering-400/50 shadow-sm backdrop-blur-[2px]">
<span className="node-inner-core w-4 h-4 rounded-full border-2 border-white bg-sovering-600 shadow-sm"></span>
</div>
<span className="absolute -bottom-5 left-1/2 -translate-x-1/2 font-mono text-[9px] text-neutral-400 tracking-wider">04/M</span>
</div>
{/*  Content Presentation  */}
<div className="flex items-start gap-4 sm:gap-6">
<span className="milestone-num font-editorial-num text-8xl md:text-9xl text-neutral-300/90 select-none">4</span>
<div className="pt-1 flex flex-col">
<span className="font-cinzel text-[11px] uppercase tracking-[0.25em] text-neutral-400 font-semibold mb-1">Foundry Sprint</span>
<h2 className="font-serif text-3xl sm:text-4xl text-sovering-500 font-normal tracking-tight leading-[1.05]">
              Prototype &amp; Mentorship
            </h2>
<time className="font-semibold text-white/50 text-xs tracking-widest uppercase mt-2.5 flex items-center gap-2" dateTime="2026-10-05/2026-10-18">
<span className="w-1.5 h-1.5 rounded-full bg-sovering-400"></span>
              05–18 October 2026
            </time>
<p className="text-neutral-600 text-sm max-w-sm mt-3.5 leading-relaxed font-normal">
              Fourteen high-velocity days of code architecture audits, low-latency reviews, and bespoke weekly 1:1 sessions with industry luminaries.
            </p>
</div>
</div>
</article>
{/*  ================= MILESTONE 05: Deep Lateral Swing Far Right =================  */}
{/*  Wide sweeping detour out to the far right margin  */}
{/*  Node coord: (1180, 4120) -> Top 4060px, Right ~6%  */}
<article className="milestone-item absolute top-[2436px] right-[4%] sm:right-[7%] md:right-[10%] max-w-xl flex flex-row-reverse sm:flex-row items-start group text-right sm:text-left" data-node-y="2472" data-purpose="milestone-entry" id="milestone-5">
{/*  Concentric Node on Path  */}
<div className="relative flex-shrink-0 ml-5 sm:ml-0 sm:mr-8 mt-4">
<div className="node-outer-halo relative flex items-center justify-center w-10 h-10 rounded-full bg-sovering-600/10 border border-sovering-400/50 shadow-sm backdrop-blur-[2px]">
<span className="node-inner-core w-4 h-4 rounded-full border-2 border-white bg-sovering-600 shadow-sm"></span>
</div>
<span className="absolute -bottom-5 left-1/2 -translate-x-1/2 font-mono text-[9px] text-neutral-400 tracking-wider">05/J</span>
</div>
{/*  Content Presentation  */}
<div className="flex items-start gap-4 sm:gap-6 flex-row-reverse sm:flex-row">
<span className="milestone-num font-editorial-num text-8xl md:text-9xl text-neutral-300/90 select-none">5</span>
<div className="pt-1 flex flex-col">
<span className="font-cinzel text-[11px] uppercase tracking-[0.25em] text-neutral-400 font-semibold mb-1">Inquisition Audit</span>
<h2 className="font-serif text-3xl sm:text-4xl text-sovering-500 font-normal tracking-tight leading-[1.05]">
              Final Evaluation
            </h2>
<time className="font-semibold text-white/50 text-xs tracking-widest uppercase mt-2.5 flex items-center gap-2 justify-end sm:justify-start" dateTime="2026-10-25">
<span className="w-1.5 h-1.5 rounded-full bg-sovering-400"></span>
              25 October 2026
            </time>
<p className="text-neutral-600 text-sm max-w-sm mt-3.5 leading-relaxed font-normal">
              In-depth code repository stress tests, systems resilience benchmarks, and product viability scrutiny led by our international jury panel.
            </p>
</div>
</div>
</article>
{/*  ================= MILESTONE 06: Grand Climax Hairpin Center-Left =================  */}
{/*  Settling into the final stage with dramatic weight  */}
{/*  Node coord: (460, 5080) -> Top 5020px, Left ~32%  */}
<article className="milestone-item absolute top-[3012px] left-[10%] sm:left-[22%] md:left-[32%] max-w-xl flex items-start group pb-24" data-node-y="3048" data-purpose="milestone-entry" id="milestone-6">
{/*  Concentric Node on Path  */}
<div className="relative flex-shrink-0 mr-5 sm:mr-8 mt-5">
<div className="node-outer-halo relative flex items-center justify-center w-12 h-12 rounded-full bg-sovering-600/15 border-2 border-sovering-500/80 shadow-md backdrop-blur-[2px]">
<span className="node-inner-core w-5 h-5 rounded-full border-2 border-white bg-sovering-600 shadow-inner"></span>
</div>
<span className="absolute -bottom-5 left-1/2 -translate-x-1/2 font-mono text-[9px] text-sovering-500 font-bold tracking-wider">FINAL</span>
</div>
{/*  Content Presentation  */}
<div className="flex items-start gap-4 sm:gap-7">
<span className="milestone-num font-editorial-num text-8xl md:text-[10.5rem] text-neutral-100 select-none font-medium">6</span>
<div className="pt-2 flex flex-col">
<span className="font-cinzel text-[12px] uppercase tracking-[0.3em] text-sovering-500 font-bold mb-1">The Climax Zenith</span>
<h2 className="font-serif text-3xl sm:text-5xl md:text-6xl text-sovering-500 font-normal tracking-tight leading-[0.98]">
              Grand Finale &amp; Demo Day
            </h2>
<time className="font-semibold text-neutral-600 text-xs sm:text-sm tracking-widest uppercase mt-3 flex items-center gap-2" dateTime="2026-11-02">
<span className="w-2 h-2 rounded-full bg-sovering-600 animate-pulse"></span>
              02 November 2026
            </time>
<p className="text-neutral-600 text-sm sm:text-base max-w-md mt-4 leading-relaxed font-normal">
              36 hours of live auditorium keynotes, venture partner demo stages, and the crowning ceremony honoring engineering feats that defy ordinary limits.
            </p>
</div>
</div>
</article>
</div>
{/*  END: MilestonesContainer  */}
</main>
    </section>
  );
}
