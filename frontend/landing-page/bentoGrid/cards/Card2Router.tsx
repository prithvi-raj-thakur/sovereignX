"use client";

import React, { useState, useRef, useEffect } from "react";
import { Route, Eye, Terminal, FileText, Bot, CheckCircle2 } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ShaderGradientBG from "@/components/ui/shader-gradient-bg";

gsap.registerPlugin(ScrollTrigger);
type TaskType = "vision" | "code" | "rag";

export default function Card2Router() {
  const [activeTask, setActiveTask] = useState<TaskType>("vision");
  const cardRef = useRef<HTMLDivElement>(null);
  const flowRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Initial reveal
    gsap.fromTo(
      ".card2-anim",
      { opacity: 0, scale: 0.95 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: "back.out(1.5)",
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top 85%",
        }
      }
    );
  }, { scope: cardRef });

  useEffect(() => {
    // Animate the flow line when task changes
    if (flowRef.current) {
      gsap.fromTo(
        flowRef.current,
        { scaleY: 0, opacity: 0, transformOrigin: "top" },
        { scaleY: 1, opacity: 1, duration: 0.4, ease: "power2.out" }
      );
    }
  }, [activeTask]);

  const tasks = [
    { id: "vision", label: "Vision Check", icon: Eye, model: "qwen2.5-vl", color: "text-[#00A3FF]", bg: "bg-[#00A3FF]", glow: "rgba(0, 163, 255, 0.1)" },
    { id: "code", label: "Code Run", icon: Terminal, model: "qwen-coder", color: "text-[#1e5dd7]", bg: "bg-[#1e5dd7]", glow: "rgba(30, 93, 215, 0.1)" },
    { id: "rag", label: "Doc Search", icon: FileText, model: "llama3.2", color: "text-[#a2c8fd]", bg: "bg-[#a2c8fd]", glow: "rgba(162, 200, 253, 0.1)" },
  ] as const;

  const activeData = tasks.find(t => t.id === activeTask)!;

  return (
    <div ref={cardRef} className="h-full w-full relative overflow-hidden rounded-[24px] border border-white/[0.05] p-6 md:p-8 flex flex-col justify-between group transition-colors duration-500 hover:border-white/[0.1]">
      <ShaderGradientBG />

      {/* Title & Description */}
      <div className="relative z-10 mb-8 font-display">
        <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Intent Router</h3>
        <p className="text-[#a1a1aa] text-[14px] leading-relaxed max-w-[280px]">
          Dynamic classification routes user intents to the most capable model automatically.
        </p>
      </div>

      {/* Center Micro UI Container */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
        
        {/* Floating Liquid Glass Widget */}
        <div 
          className="card2-anim relative w-full max-w-sm rounded-2xl bg-linear-to-b from-[#1e5dd7]/25 to-[#050a0f]/95 backdrop-blur-2xl border-t-[1.5px] border-t-[#a2c8fd]/90 border-x border-x-[#1e5dd7]/40 border-b-0 shadow-[0_-12px_40px_rgba(30,93,215,0.35)] p-5 flex flex-col gap-3 font-sans overflow-hidden"
        >
          {/* Fading bottom overlay */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-[#050a0f] to-transparent pointer-events-none rounded-b-[16px]" />

          {/* Trigger Block */}
          <div className="card2-anim flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.03]">
            <div className="flex items-center gap-3 text-white/90 text-[13px] font-medium tracking-tight">
              <Route size={14} className="text-[#a1a1aa]" /> Workflow Trigger
            </div>
            <CheckCircle2 size={14} className="text-[#00A3FF]" />
          </div>

          <div className="w-[1px] h-3 bg-white/[0.05] mx-auto" />

          {/* Task Selectors / Steps */}
          <div className="card2-anim flex flex-col gap-2 relative">
            <div ref={flowRef} className="absolute left-[22px] top-4 bottom-4 w-[1px] bg-[#00A3FF]/40 -z-10" />
            {tasks.map((task) => {
              const Icon = task.icon;
              const isActive = activeTask === task.id;
              return (
                <button
                  key={task.id}
                  onClick={() => setActiveTask(task.id)}
                  className={`flex items-center gap-3 p-2.5 rounded-xl transition-all duration-300 ${
                    isActive 
                      ? "bg-[#00A3FF]/10 border border-[#00A3FF]/20" 
                      : "bg-transparent border border-transparent hover:bg-white/[0.02]"
                  }`}
                >
                  <Icon size={14} className={isActive ? task.color : "text-[#a1a1aa]"} />
                  <span className={`text-[13px] font-medium tracking-tight ${isActive ? 'text-white' : 'text-[#a1a1aa]'}`}>{task.label}</span>
                </button>
              );
            })}
          </div>

          <div className="w-[1px] h-3 bg-white/[0.05] mx-auto" />

          {/* Result Model Block */}
          <div className="card2-anim flex items-center justify-center p-3 rounded-xl bg-white/[0.02] border border-white/[0.03] relative overflow-hidden">
            <div className="flex items-center gap-3 relative z-10">
              <Bot size={14} className={activeData.color} />
              <span className="text-[11px] font-medium tracking-wider text-[#a1a1aa] uppercase">
                Routed: {activeData.model}
              </span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
