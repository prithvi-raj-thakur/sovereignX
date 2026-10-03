"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const SF =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif';

interface PageLoaderProps {
  onDone: () => void;
}

export default function PageLoader({ onDone }: PageLoaderProps) {
  const curtainRef  = useRef<HTMLDivElement>(null);
  const pctRef      = useRef<HTMLParagraphElement>(null);
  const lineRef     = useRef<HTMLDivElement>(null);
  const dotRef      = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const curtain  = curtainRef.current;
    const pct      = pctRef.current;
    const line     = lineRef.current;
    const dot      = dotRef.current;
    const wordmark = wordmarkRef.current;
    if (!curtain || !pct || !line || !dot || !wordmark) return;

    const progress = { value: 0 };
    const tl = gsap.timeline();

    // ── 1. Count up 0 → 100 ───────────────────────────────────────────────
    tl.to(progress, {
      value: 100,
      duration: 1.8,
      ease: "power2.inOut",
      onUpdate() {
        const v = Math.round(progress.value);
        line.style.width = `${progress.value.toFixed(1)}%`;
        dot.style.left   = `${progress.value.toFixed(1)}%`;
        pct.textContent  = `${v}%`;
      },
    });

    // ── 2. Brief hold ─────────────────────────────────────────────────────
    tl.to({}, { duration: 0.28 });

    // ── 3. GSAP exit stage — elements leave ───────────────────────────────
    tl.to(line, { scaleX: 0, transformOrigin: "center", duration: 0.35, ease: "power3.in" }, "exit");
    tl.to(dot,  { opacity: 0, duration: 0.2,  ease: "power2.in" }, "exit");
    tl.to(pct,  { yPercent: -130, opacity: 0, duration: 0.5, ease: "power3.in" }, "exit+=0.04");
    tl.to(wordmark, { opacity: 0, y: -8, duration: 0.3, ease: "power2.in" }, "exit+=0.08");

    // ── 4. Curtain wipes UP — bottom → top reveal ─────────────────────────
    // The curtain slides off-screen upward, revealing the page beneath
    tl.to(curtain, {
      yPercent: -100,
      duration: 0.9,
      ease: "power4.inOut",
      onComplete: onDone,
    }, "exit+=0.4");

    return () => { tl.kill(); };
  }, [onDone]);

  return (
    <div
      ref={curtainRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#030406",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.5rem",
        fontFamily: SF,
        willChange: "transform",
      }}
    >
      {/* Wordmark */}
      <p
        ref={wordmarkRef}
        style={{
          fontSize: "0.68rem",
          letterSpacing: "0.32em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.28)",
          fontWeight: 600,
          userSelect: "none",
        }}
      >
        SovereignX
      </p>

      {/* Percentage — white/60, decent size */}
      <p
        ref={pctRef}
        style={{
          fontSize: "clamp(2.8rem, 6vw, 5rem)",
          fontWeight: 700,
          letterSpacing: "-0.03em",
          lineHeight: 1,
          color: "rgba(255,255,255,0.6)",
          userSelect: "none",
        }}
      >
        0%
      </p>

      {/* Progress line */}
      <div
        style={{
          width: "clamp(180px, 26vw, 300px)",
          height: 1,
          background: "rgba(255,255,255,0.07)",
          position: "relative",
          overflow: "visible",
        }}
      >
        <div
          ref={lineRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            width: "0%",
            background: "linear-gradient(90deg, #1e5dd7 0%, #00A3FF 60%, #a2c8fd 100%)",
          }}
        />
        <div
          ref={dotRef}
          style={{
            position: "absolute",
            top: "50%",
            left: "0%",
            transform: "translate(-50%, -50%)",
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: "#a2c8fd",
            boxShadow: "0 0 8px 3px rgba(162,200,253,0.8)",
          }}
        />
      </div>
    </div>
  );
}
