"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";
import { MorphSVGPlugin } from "gsap-trial/MorphSVGPlugin";

// ─── BentoGrid card background = #050a0f ────────────────────────────────────
const CARD_BG = "#050a0f";
const ACCENT  = "#00A3FF";

function CustomShape({ type = 0, className, style }: { type?: number, className?: string, style?: React.CSSProperties }) {
  if (type === 1) {
    return (
      <svg className={className} style={style} viewBox="0 0 110.14 103.06" xmlns="http://www.w3.org/2000/svg">
        <path d="M43.84,63.49c-.21,104.63-105.57-33.06,11.12-17.94-90.57-52.58,81.44-75.03,9.97,18.57,90.78-52.16,24.24,107.99-21.09-.63Z" fill="currentColor" fillRule="evenodd"/>
      </svg>
    )
  }
  if (type === 2) {
    return (
      <svg className={className} style={style} viewBox="0 0 108.89 108.79" xmlns="http://www.w3.org/2000/svg">
        <g>
          <path d="M36.71.07c4.22-.56,10.4,6.25,12.38,9.7,13.34,23.2-8.89,50.07-34.06,41.25C10.84,49.56.43,42.52.01,37.94c-.36-3.92,8-17.04,10.82-20.39C15.74,11.72,29.19,1.07,36.71.07Z" fill="currentColor"/>
          <path d="M70.35.05c4.3-.79,17.03,7.34,20.63,10.32,6.13,5.07,13.18,14.19,16.04,21.62,2.23,5.78,2.92,5.98-1.17,10.82-20.06,23.75-59.1,1.75-47.93-28.68,1.6-4.36,7.66-13.2,12.43-14.08Z" fill="currentColor"/>
          <path d="M79.18,56.22c7.15-.98,13.76-.03,19.99,3.64,3.03,1.79,10.04,7.96,9.71,11.57-.57,6.24-10.71,20.2-15.46,24.66-3.38,3.18-18.98,13.5-23.07,12.65-1.61-.34-7.03-5.52-8.23-7.04-12.87-16.28-3.67-42.65,17.06-45.48Z" fill="currentColor"/>
          <path d="M19.05,56.21c32.23-5.04,46.69,35.68,19.65,52.53-11.96-2.69-23.47-11.35-30.53-21.21-2.32-3.24-8.59-13.68-8.02-17.32.9-5.73,13.43-13.14,18.89-14Z" fill="currentColor"/>
        </g>
      </svg>
    )
  }
  if (type === 3) {
    return (
      <svg className={className} style={style} viewBox="0 0 108.89 108.89" xmlns="http://www.w3.org/2000/svg">
        <path d="M96.54,42.62c-4.9,0-11.1.56-17.25,1.54,5.03-3.65,9.82-7.64,13.28-11.11,10.67-10.66,4.82-12.31.21-16.93-4.62-4.62-6.27-10.46-16.94.2-3.46,3.47-7.46,8.25-11.11,13.29.98-6.15,1.54-12.34,1.54-17.25C66.28-2.72,60.98.23,54.45.23s-11.83-2.96-11.83,12.13c0,4.9.56,11.1,1.54,17.25-3.65-5.04-7.64-9.82-11.1-13.29-10.67-10.66-12.31-4.82-16.93-.2-4.62,4.62-10.46,6.27.2,16.93,3.46,3.47,8.25,7.46,13.28,11.11-6.14-.98-12.34-1.54-17.25-1.54C-2.73,42.62.24,47.91.24,54.45s-2.96,11.83,12.12,11.83c4.9,0,11.11-.56,17.25-1.54-5.03,3.65-9.82,7.64-13.28,11.11-10.66,10.66-4.82,12.31-.2,16.93,4.62,4.62,6.27,10.46,16.93-.21,3.46-3.46,7.46-8.24,11.1-13.28-.98,6.15-1.54,12.34-1.54,17.25,0,15.08,5.3,12.12,11.83,12.12s11.83,2.96,11.83-12.12c0-4.9-.56-11.1-1.54-17.25,3.65,5.04,7.64,9.82,11.11,13.28,10.67,10.67,12.32,4.83,16.94.21,4.61-4.62,10.46-6.27-.21-16.93-3.46-3.47-8.25-7.46-13.28-11.11,6.14.98,12.34,1.54,17.25,1.54,15.08,0,12.12-5.3,12.12-11.83s2.96-11.83-12.12-11.83ZM79.64,55.25c-17.96,2.77-21.62-7.22-24.38,10.73-.14.93-1.48.93-1.62,0-2.76-17.95-6.42-7.96-24.38-10.73-.92-.14-.92-1.47,0-1.62,17.96-2.76,21.62-6.43,24.38-24.37.14-.93,1.48-.93,1.62,0,2.76,17.95,6.43,21.61,24.38,24.37.92.15.92,1.48,0,1.62Z" fill="currentColor"/>
      </svg>
    )
  }
  if (type === 4) {
    return (
      <svg className={className} style={style} viewBox="0 0 108.89 108.36" xmlns="http://www.w3.org/2000/svg">
        <path d="M92.83,54.18c3.32-2.04,6.09-4.12,8.05-6.13,10.68-10.99,10.68-28.82,0-39.81-10.68-10.99-28.01-10.99-38.69,0-2.53,2.61-5.18,6.65-7.74,11.52-2.57-4.87-5.21-8.92-7.74-11.52-10.68-10.99-28.01-10.99-38.69,0-10.68,10.99-10.68,28.82,0,39.81,1.96,2.02,4.73,4.09,8.05,6.13-3.32,2.04-6.09,4.12-8.05,6.13-10.68,10.99-10.68,28.82,0,39.81,10.68,10.99,28.01,10.99,38.69,0,2.53-2.61,5.18-6.65,7.74-11.52,2.57,4.87,5.21,8.91,7.74,11.52,10.68,10.99,28.01,10.99,38.69,0,10.68-10.99,10.68-28.82,0-39.81-1.96-2.02-4.73-4.09-8.05-6.13ZM58.57,58.42l-4.12,23.86-4.12-23.86-23.19-4.24,23.19-4.24,4.12-23.86,4.12,23.86,23.19,4.24-23.19,4.24Z" fill="currentColor"/>
      </svg>
    )
  }
  
  // Default to the original framer star (type 0)
  return (
    <svg className={className} style={style} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M 34.756 1.244 C 31.976 -1.536 25.189 0.502 18 5.778 C 10.811 0.502 4.024 -1.536 1.244 1.244 C -1.536 4.024 0.502 10.811 5.778 18 C 0.502 25.189 -1.536 31.976 1.244 34.756 C 4.024 37.536 10.811 35.498 18 30.222 C 25.189 35.498 31.976 37.536 34.756 34.756 C 37.536 31.976 35.498 25.189 30.222 18 C 35.498 10.811 37.536 4.024 34.756 1.244 Z"
        fill="currentColor"
        transform="translate(2 2)"
      />
    </svg>
  );
}

// ─── Tag definitions ──────────────────────────────────────────────────────────

interface TagDef {
  text: string;
  rotate: number;
  yOffset: number;
  scale: number;
  variant: "blue" | "light" | "glass" | "white";
  size: "sm" | "md" | "lg";
  overlap: boolean;
}

const TAGS: TagDef[] = [
  { text: "Self-Hosted",      rotate: -8,  yOffset: -60, scale: 1, variant: "glass", size: "md", overlap: false },
  { text: "Air-Gapped",       rotate:  6,  yOffset:  55, scale: 1, variant: "blue",  size: "lg", overlap: true  },
  { text: "Open-Weight",      rotate: -5,  yOffset: -70, scale: 1, variant: "white", size: "md", overlap: false },
  { text: "Full Control",     rotate:  7,  yOffset:  65, scale: 1, variant: "blue",  size: "lg", overlap: true  },
  { text: "No Egress",        rotate: -6,  yOffset: -55, scale: 1, variant: "glass", size: "sm", overlap: false },
  { text: "You Approve",      rotate:  4,  yOffset:  50, scale: 1, variant: "white", size: "lg", overlap: true  },
];

// Sizes scale proportionally to the main headline
// sm ~ 35% of headline, md ~ 45%, lg ~ 55%
const SIZE_MAP = {
  sm: { py: "0.28em", px: "0.55em", fs: "clamp(1.4rem,3.5vw,4rem)"  },
  md: { py: "0.26em", px: "0.52em", fs: "clamp(1.8rem,4.5vw,5rem)"  },
  lg: { py: "0.24em", px: "0.50em", fs: "clamp(2.2rem,5.5vw,6rem)"  },
};

// Premium editorial variants
const VARIANT_MAP: Record<TagDef["variant"], React.CSSProperties> = {
  // SovereignX gradient fill — white top, icy cyan, deep blue
  blue: {
    background: "linear-gradient(135deg, #a2c8fd 0%, #1e5dd7 55%, #0a1a4a 100%)",
    border: "none",
    color: "#ffffff",
    borderRadius: 6,
    boxShadow: "0 12px 48px rgba(30,93,215,0.45), 0 4px 16px rgba(0,0,0,0.6)",
    fontWeight: 800,
    letterSpacing: "-0.02em",
  },
  // Solid off-white / warm white — dark text, strong contrast, editorial
  white: {
    background: "#f0f0ee",
    border: "none",
    color: "#05080f",
    borderRadius: 6,
    boxShadow: "0 12px 48px rgba(240,240,238,0.08), 0 4px 16px rgba(0,0,0,0.5)",
    fontWeight: 800,
    letterSpacing: "-0.02em",
  },
  light: {
    background: "#f0f0ee",
    border: "none",
    color: "#05080f",
    borderRadius: 6,
    boxShadow: "0 12px 48px rgba(240,240,238,0.08), 0 4px 16px rgba(0,0,0,0.5)",
    fontWeight: 800,
    letterSpacing: "-0.02em",
  },
  // Dark glass — sophisticated, not bold, sits subtly
  glass: {
    background: "rgba(255,255,255,0.055)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "rgba(255,255,255,0.6)",
    borderRadius: 6,
    boxShadow: "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)",
    fontWeight: 700,
    letterSpacing: "-0.02em",
  },
};

// ─── Sentence layout ──────────────────────────────────────────────────────────

type WordEntry = { kind: "word"; text: string; dim?: boolean };
type TagEntry  = { kind: "tag";  tagIndex: number };
type ShapeEntry = { kind: "shape"; shapeType: number; color?: string; size?: number };
type Entry = WordEntry | TagEntry | ShapeEntry;

const ENTRIES: Entry[] = [
  { kind: "word", text: "Sovereign" },
  { kind: "shape", shapeType: 1, color: "#1e5dd7", size: 1.2 },
  { kind: "tag",  tagIndex: 0 },          // On-Premise  — above, no overlap
  { kind: "word", text: "and" },
  { kind: "shape", shapeType: 4, color: "#00A3FF" },
  { kind: "word", text: "local." },
  { kind: "shape", shapeType: 2, color: "rgba(255,255,255,0.4)" },
  { kind: "tag",  tagIndex: 4 },          // No Cloud    — above
  { kind: "word", text: "Zero" },
  { kind: "shape", shapeType: 3, color: "rgba(255,255,255,0.7)", size: 1.1 },
  { kind: "word", text: "external" },
  { kind: "tag",  tagIndex: 1 },          // Air-Gapped  — below, overlaps
  { kind: "word", text: "dependency." },
  { kind: "shape", shapeType: 0, color: "#a2c8fd" },
  { kind: "tag",  tagIndex: 2 },          // Open-Weight — above
  { kind: "word", text: "Human" },
  { kind: "shape", shapeType: 4, color: "rgba(255,255,255,0.3)" },
  { kind: "word", text: "in" },
  { kind: "word", text: "the" },
  { kind: "tag",  tagIndex: 5 },          // Human-in-the-Loop — below, overlaps
  { kind: "shape", shapeType: 1, color: "#1e5dd7" },
  { kind: "word", text: "loop." },
  { kind: "shape", shapeType: 3, color: "#a2c8fd", size: 1.2 },
  { kind: "tag",  tagIndex: 3 },          // Full Control — below, overlaps (bright)
  { kind: "word", text: "Intelligence" },
  { kind: "shape", shapeType: 2, color: "rgba(255,255,255,0.6)" },
  { kind: "word", text: "stays" },
  { kind: "word", text: "yours." },
  { kind: "shape", shapeType: 0, color: "#1e5dd7", size: 1.5 },
];

// ─── Word component — clean kerning ───────────────────────────

function WordSpan({ text, dim = false }: { text: string; dim?: boolean }) {
  const color = dim ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.72)";
  return (
    <>
      <span className="split-word" style={{ color, display: "inline-block", willChange: "transform, opacity" }}>
        {text}
      </span>
      {/* Space between words */}
      <span style={{ display: "inline-block", width: "0.22em" }} aria-hidden="true" />
    </>
  );
}

// ─── Tag component ────────────────────────────────────────────────────────────

function TagEl({ def }: { def: TagDef }) {
  const size    = SIZE_MAP[def.size];
  const variant = VARIANT_MAP[def.variant];

  return (
    <span
      className="tag-el"
      data-init-rotate={def.rotate}
      data-init-scale={def.scale}
      data-overlap={def.overlap ? "1" : "0"}
      style={{
        ...variant,
        display: "inline-block",
        flexShrink: 0,
        padding: `${size.py} ${size.px}`,
        fontSize: size.fs,
        lineHeight: 1,
        whiteSpace: "nowrap",
        verticalAlign: "middle",
        transform: `translateY(${def.yOffset}px) rotate(${def.rotate}deg) scale(${def.scale})`,
        transformOrigin: "center center",
        willChange: "transform, opacity",
        position: "relative",
        zIndex: def.overlap ? 2 : 0,
        marginLeft: def.overlap ? "-0.06em" : "0.14em",
        marginRight: def.overlap ? "-0.06em" : "0.14em",
      }}
      aria-hidden="true"
    >
      {def.text}
    </span>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function HorizontalScroll() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef   = useRef<HTMLDivElement>(null);

  const SF = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, TextPlugin, MorphSVGPlugin);
    const wrapper = wrapperRef.current;
    const track   = trackRef.current;
    if (!wrapper || !track) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {

      // ── 1. Master horizontal translate ────────────────────────────────────
      const getX = () => -(track.scrollWidth - window.innerWidth);
      
      const mainTl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapper,
          start: "top top",
          end: () => `+=${track.scrollWidth - window.innerWidth}`,
          pin: true,
          anticipatePin: 1,
          scrub: 1.2,
          invalidateOnRefresh: true,
        },
      });
      
      // Move the track horizontally
      mainTl.to(track, { x: getX, ease: "none" }, 0);

      // ── 1.5. Track Entry Tilt (scroll-reveal style) ──────────
      gsap.fromTo(
        track,
        { rotate: 3, transformOrigin: "0% 50%" },
        {
          rotate: 0,
          ease: "power3.out",
          duration: 1.5,
          scrollTrigger: {
            trigger: wrapper,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // ── 2. Words — Opacity, Blur, & Slide Reveal ──────────
      const words = Array.from(track.querySelectorAll<HTMLElement>(".split-word"));
      gsap.fromTo(
        words,
        { opacity: 0.1, filter: "blur(6px)", y: 100 },
        {
          opacity: 1,
          filter: "blur(0px)",
          y: 0,
          ease: "power3.out",
          stagger: 0.05,
          duration: 1.2,
          scrollTrigger: {
            trigger: wrapper,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // ── 3. Tags — spring in tilted, scrub to straight on horizontal scroll ──
      const tags = Array.from(track.querySelectorAll<HTMLElement>(".tag-el"));

      tags.forEach((tag, i) => {
        const initR     = parseFloat(tag.dataset.initRotate ?? "0");
        const initS     = parseFloat(tag.dataset.initScale  ?? "1");
        const isOverlap = tag.dataset.overlap === "1";

        // Phase 1 — entry: pop in from extreme tilt, land at resting angle
        gsap.fromTo(
          tag,
          { opacity: 0, scale: 0.7, rotate: initR * 2.8, y: isOverlap ? 70 : -70 },
          {
            opacity: 1,
            scale: initS,
            rotate: initR,
            y: 0,
            ease: "back.out(1.6)",
            duration: 1.2,
            delay: i * 0.08,
            scrollTrigger: {
              trigger: wrapper,
              start: "top 82%",
              end: "top 20%",
              toggleActions: "play none none reverse",
            },
          }
        );

        // Phase 2 — scrub: rotate from initR → 0 as horizontal scroll advances.
        const pctStart = 0.05 + i * 0.10;
        const pctEnd   = pctStart + 0.35;

        gsap.to(tag, {
          rotate: 0,
          ease: "power2.inOut",
          overwrite: "auto",
          scrollTrigger: {
            trigger: wrapper,
            start: () => `top+=${(track.scrollWidth - window.innerWidth) * pctStart} top`,
            end:   () => `top+=${(track.scrollWidth - window.innerWidth) * pctEnd} top`,
            scrub: 1.5,
            invalidateOnRefresh: true,
          },
        });
      });

      // ── 3.5. Stars — spin and morph continuously on scroll, buttery smooth ───────────
      const morphPaths = [
        "M 34.756 1.244 C 31.976 -1.536 25.189 0.502 18 5.778 C 10.811 0.502 4.024 -1.536 1.244 1.244 C -1.536 4.024 0.502 10.811 5.778 18 C 0.502 25.189 -1.536 31.976 1.244 34.756 C 4.024 37.536 10.811 35.498 18 30.222 C 25.189 35.498 31.976 37.536 34.756 34.756 C 37.536 31.976 35.498 25.189 30.222 18 C 35.498 10.811 37.536 4.024 34.756 1.244 Z",
        "M43.84,63.49c-.21,104.63-105.57-33.06,11.12-17.94-90.57-52.58,81.44-75.03,9.97,18.57,90.78-52.16,24.24,107.99-21.09-.63Z",
        "M96.54,42.62c-4.9,0-11.1.56-17.25,1.54,5.03-3.65,9.82-7.64,13.28-11.11,10.67-10.66,4.82-12.31.21-16.93-4.62-4.62-6.27-10.46-16.94.2-3.46,3.47-7.46,8.25-11.11,13.29.98-6.15,1.54-12.34,1.54-17.25C66.28-2.72,60.98.23,54.45.23s-11.83-2.96-11.83,12.13c0,4.9.56,11.1,1.54,17.25-3.65-5.04-7.64-9.82-11.1-13.29-10.67-10.66-12.31-4.82-16.93-.2-4.62,4.62-10.46,6.27.2,16.93,3.46,3.47,8.25,7.46,13.28,11.11-6.14-.98-12.34-1.54-17.25-1.54C-2.73,42.62.24,47.91.24,54.45s-2.96,11.83,12.12,11.83c4.9,0,11.11-.56,17.25-1.54-5.03,3.65-9.82,7.64-13.28,11.11-10.66,10.66-4.82,12.31-.2,16.93,4.62,4.62,6.27,10.46,16.93-.21,3.46-3.46,7.46-8.24,11.1-13.28-.98,6.15-1.54,12.34-1.54,17.25,0,15.08,5.3,12.12,11.83,12.12s11.83,2.96,11.83-12.12c0-4.9-.56-11.1-1.54-17.25,3.65,5.04,7.64,9.82,11.11,13.28,10.67,10.67,12.32,4.83,16.94.21,4.61-4.62,10.46-6.27-.21-16.93-3.46-3.47-8.25-7.46-13.28-11.11,6.14.98,12.34,1.54,17.25,1.54,15.08,0,12.12-5.3,12.12-11.83s2.96-11.83-12.12-11.83ZM79.64,55.25c-17.96,2.77-21.62-7.22-24.38,10.73-.14.93-1.48.93-1.62,0-2.76-17.95-6.42-7.96-24.38-10.73-.92-.14-.92-1.47,0-1.62,17.96-2.76,21.62-6.43,24.38-24.37.14-.93,1.48-.93,1.62,0,2.76,17.95,6.43,21.61,24.38,24.37.92.15.92,1.48,0,1.62Z",
        "M92.83,54.18c3.32-2.04,6.09-4.12,8.05-6.13,10.68-10.99,10.68-28.82,0-39.81-10.68-10.99-28.01-10.99-38.69,0-2.53,2.61-5.18,6.65-7.74,11.52-2.57-4.87-5.21-8.92-7.74-11.52-10.68-10.99-28.01-10.99-38.69,0-10.68,10.99-10.68,28.82,0,39.81,1.96,2.02,4.73,4.09,8.05,6.13-3.32,2.04-6.09,4.12-8.05,6.13-10.68,10.99-10.68,28.82,0,39.81,10.68,10.99,28.01,10.99,38.69,0,2.53-2.61,5.18-6.65,7.74-11.52,2.57,4.87,5.21,8.91,7.74,11.52,10.68,10.99,28.01,10.99,38.69,0,10.68-10.99,10.68-28.82,0-39.81-1.96-2.02-4.73-4.09-8.05-6.13ZM58.57,58.42l-4.12,23.86-4.12-23.86-23.19-4.24,23.19-4.24,4.12-23.86,4.12,23.86,23.19,4.24-23.19,4.24Z"
      ];

      const stars = Array.from(track.querySelectorAll<HTMLElement>(".star-el"));
      stars.forEach((star, i) => {
        // Alternate spin direction
        const direction = i % 2 === 0 ? 1 : -1;
        
        // Explicitly set the initial state so GSAP knows how to handle the transform
        gsap.set(star, { rotation: 0, transformOrigin: "50% 50%" });
        
        // Attach rotation directly to the master timeline using 'rotation'
        mainTl.to(
          star,
          { 
            rotation: 900 * direction, 
            ease: "none" 
          },
          0 // start at the very beginning of the master timeline
        );
        
        // Attach MorphSVG animation to the internal <path> of each shape
        const targetPath = star.querySelector("path");
        if (targetPath) {
          const shape1 = morphPaths[(i + 1) % 4];
          const shape2 = morphPaths[(i + 2) % 4];
          const shape3 = morphPaths[(i + 3) % 4];
          let finalShape = morphPaths[i % 4]; // Back to original

          // If this is the last star, force it to morph into a perfect circle at the end!
          if (i === stars.length - 1) {
            // A perfect circle centered inside a 40x40 viewBox so it scales uniformly from the exact center
            finalShape = "M 0,20 a 20,20 0 1,0 40,0 a 20,20 0 1,0 -40,0";
          }

          // Chain the morphs precisely over the duration (1) of the master scrub timeline
          mainTl
            .to(targetPath, { morphSVG: shape1, duration: 0.25, ease: "power1.inOut" }, 0)
            .to(targetPath, { morphSVG: shape2, duration: 0.25, ease: "power1.inOut" }, 0.25)
            .to(targetPath, { morphSVG: shape3, duration: 0.25, ease: "power1.inOut" }, 0.5)
            .to(targetPath, { morphSVG: finalShape, duration: 0.25, ease: "power1.inOut" }, 0.75);
        }
      });
      
      // ── 3.6. Cinematic Finale — Last star scales up massively at the end ──
      if (stars.length > 0) {
        const lastStar = stars[stars.length - 1];
        mainTl.to(
          lastStar,
          { 
            scale: 150, // Increase scale to ensure it fully covers ultra-wide screens
            color: CARD_BG, // Shift to the deep dark background color so it acts as a true transition!
            opacity: 1, 
            ease: "power3.in" 
          },
          0.75 // Start scaling up exactly as it morphs into the circle
        );
      }
      
      // ── 3.7. Cinematic Text Reveal ──
      const finaleText = wrapper.querySelector<HTMLElement>(".finale-text");
      const finaleWords = Array.from(wrapper.querySelectorAll<HTMLElement>(".finale-word"));
      if (finaleText && finaleWords.length) {
        // Make the container visible right as the words start rising
        mainTl.to(finaleText, { opacity: 1, duration: 0.01 }, 0.88);
        
        // Words rise up from the mask
        gsap.set(finaleWords, { yPercent: 110 });
        mainTl.to(
          finaleWords,
          {
            yPercent: 0,
            stagger: 0.05,
            ease: "power3.out",
            duration: 0.15
          },
          0.88
        );
      }

      // ── 4. Eyebrow / coord text-replace (typewriter) ───────────────────
      const eyebrows = Array.from(wrapper.querySelectorAll<HTMLElement>(".eyebrow-text"));
      eyebrows.forEach((el, i) => {
        const originalText = el.innerText;
        // clear it out initially
        el.innerText = "";
        
        gsap.to(el, {
          duration: 1.2,
          delay: i * 0.2,
          text: {
            value: originalText,
            delimiter: "", // type character by character
          },
          ease: "none",
          scrollTrigger: {
            trigger: wrapper,
            start: "top 60%",
            toggleActions: "play none none none"
          }
        });
      });
      
      // Also fade in the line accents next to the eyebrows
      const lines = Array.from(wrapper.querySelectorAll<HTMLElement>(".eyebrow-line"));
      gsap.fromTo(lines, { scaleX: 0 }, {
        scaleX: 1, transformOrigin: "left center", duration: 1, ease: "power3.out", stagger: 0.2,
        scrollTrigger: { trigger: wrapper, start: "top 60%" }
      });

      // ── 5. Baseline rule — scoped to wrapper ──────────────────────────────
      const baselineRule = wrapper.querySelector<HTMLElement>(".baseline-rule");
      if (baselineRule) {
        gsap.fromTo(
          baselineRule,
          { scaleX: 0, transformOrigin: "left center" },
          {
            scaleX: 1, ease: "power3.out", duration: 1.6,
            scrollTrigger: {
              trigger: wrapper, start: "top 85%", end: "top 45%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // ── 6. Grid slow parallax — scoped to wrapper ─────────────────────────
      const bgGrid = wrapper.querySelector<HTMLElement>(".bg-grid");
      if (bgGrid) {
        gsap.to(bgGrid, {
          x: () => -(track.scrollWidth - window.innerWidth) * 0.06,
          ease: "none",
          scrollTrigger: {
            trigger: wrapper,
            start: "top top",
            end: () => `+=${track.scrollWidth - window.innerWidth}`,
            scrub: 3, invalidateOnRefresh: true,
          },
        });
      }

    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={wrapperRef}
      className="relative w-full overflow-hidden"
      style={{ height: "100vh", background: "#030406", fontFamily: SF }}
      aria-label="SovereignX architecture journey"
    >
      {/* Grid */}
      <div
        className="bg-grid pointer-events-none absolute inset-0 z-0"
        style={{ opacity: 0.032 }}
        aria-hidden="true"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-full" style={{ width: "200%" }}>
          <defs>
            <pattern id="hsg" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#fff" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hsg)" />
        </svg>
      </div>

      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute"
        style={{
          top: "50%", left: "28%",
          transform: "translate(-50%,-50%)",
          width: "70vw", height: "80vh",
          background: "radial-gradient(ellipse, rgba(0,163,255,0.05) 0%, transparent 65%)",
        }}
        aria-hidden="true"
      />

      {/* Eyebrow */}
      <div className="absolute top-[7vh] left-[8vw] flex items-center gap-4 z-20" aria-hidden="true">
        <div className="eyebrow-line" style={{ width: 28, height: 1, background: "rgba(0,163,255,0.6)" }} />
        <span className="eyebrow-text" style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(0,163,255,0.7)", fontWeight: 600 }}>
          SovereignX / Architecture
        </span>
      </div>

      {/* Coordinate */}
      <div className="eyebrow-text pointer-events-none absolute bottom-8 left-[8vw]"
        style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.22em", color: "rgba(255,255,255,0.15)" }}
        aria-hidden="true">
        37°46′N  122°25′W
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 right-[8vw] flex items-center gap-2.5 pointer-events-none" aria-hidden="true">
        <div className="eyebrow-line" style={{ width: 24, height: 1, background: "rgba(255,255,255,0.3)" }} />
        <div className="eyebrow-line" style={{ width: 10, height: 1, background: "rgba(255,255,255,0.15)" }} />
        <span className="eyebrow-text" style={{ fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>
          scroll
        </span>
      </div>

      {/* Baseline rail */}
      <div
        className="baseline-rule pointer-events-none absolute z-1"
        style={{
          bottom: "calc(50vh - 5.2rem)",
          left: "8vw", right: "8vw", height: 1,
          background: "linear-gradient(90deg, rgba(0,163,255,0.25), rgba(255,255,255,0.07) 40%, rgba(255,255,255,0.04) 70%, transparent)",
        }}
        aria-hidden="true"
      />

      {/* ── Horizontal track ── */}
      <div
        ref={trackRef}
        className="absolute top-0 left-0 h-full flex items-center will-change-transform transform-gpu"
        style={{ width: "max-content", paddingLeft: "8vw" }}
      >
        {/* THE SINGLE LINE */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "baseline",
            flexWrap: "nowrap",
            fontSize: "clamp(3.8rem, 9vw, 10.5rem)",
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: "-0.025em",  // handles word spacing, no per-word mx needed
            whiteSpace: "nowrap",
            userSelect: "none",
          }}
        >
          {ENTRIES.map((entry, i) => {
            if (entry.kind === "word") {
              return <WordSpan key={i} text={entry.text} dim={entry.dim} />;
            }
            if (entry.kind === "shape") {
              return (
                <span
                  key={i}
                  className="star-el"
                  style={{
                    display: "inline-block",
                    padding: "0 0.25em",
                    verticalAlign: "middle",
                    color: entry.color || "rgba(255,255,255,0.8)",
                  }}
                >
                  <CustomShape
                    type={entry.shapeType}
                    style={{
                      width: `${(entry.size || 1) * 0.7}em`,
                      height: `${(entry.size || 1) * 0.7}em`,
                    }}
                  />
                </span>
              );
            }
            return <TagEl key={i} def={TAGS[entry.tagIndex]} />;
          })}
        </div>
        {/* End spacer — guarantees last tag scrolls fully into center view */}
        <div style={{ display: "inline-block", minWidth: "50vw", flexShrink: 0 }} aria-hidden="true" />
      </div>

      {/* ── Finale Text ── */}
      <div 
        className="finale-text pointer-events-none absolute inset-0 flex flex-col items-center justify-center z-50 opacity-0"
        aria-hidden="true"
      >
        <div style={{ overflow: "hidden" }}>
          <div className="finale-word" style={{ fontFamily: SF, fontSize: "clamp(3.5rem, 8vw, 8rem)", fontWeight: 800, letterSpacing: "-0.04em", color: "rgba(255, 255, 255, 0.6)", lineHeight: 0.9 }}>
            Absolute
          </div>
        </div>
        <div style={{ overflow: "hidden", paddingBottom: "0.2em", marginBottom: "-0.2em" }}>
          <div className="finale-word" style={{ fontFamily: SF, fontSize: "clamp(3.5rem, 8vw, 8rem)", fontWeight: 800, letterSpacing: "-0.04em", color: "rgba(255, 255, 255, 0.6)", lineHeight: 0.9 }}>
            Sovereignty.
          </div>
        </div>
      </div>
    </section>
  );
}
