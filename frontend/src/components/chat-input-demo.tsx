"use client";

import React from "react";
import { BorderBeam } from "@/components/ui/border-beam";
import { AtSign, ChevronDown, ArrowUp } from "lucide-react";

const CHIP: React.CSSProperties = {
  borderRadius: 36,
  background: "rgba(255,255,255,0.04)",
  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.02), inset 0 1px 0 0 rgba(255,255,255,0.04)",
};

function ChatInput() {
  return (
    <div
      className="flex flex-col relative overflow-hidden font-sans"
      style={{
        width: 348,
        maxWidth: "100%",
        borderRadius: 20,
        background: "#0A0D14",
        boxShadow: "inset 0 0 0 1px #1E293B, inset 0 0 50px 0 rgba(0,163,255,0.02)",
        height: 122,
      }}
    >
      <div className="flex flex-col h-full p-[7px] pb-[8px]">
        <div
          className="inline-flex items-center w-fit h-6 px-1 ml-[1px]"
          style={CHIP}
        >
          <AtSign size={16} color="#94A3B8" />
        </div>
        <div className="text-[13px] leading-[16px] text-[#E2E8F0] pt-4 px-1">
          Build anything...
        </div>
        <div className="flex items-center gap-2 mt-auto">
          <div
            className="inline-flex items-center gap-1 h-6 px-[6px] pl-2 text-xs leading-[14px] text-[#E2E8F0] ml-[1px]"
            style={CHIP}
          >
            Agent
            <ChevronDown size={14} color="#94A3B8" />
          </div>
          <div
            className="inline-flex items-center gap-1 h-6 px-[6px] pl-2 text-xs leading-[14px] text-[#E2E8F0]"
            style={CHIP}
          >
            Auto
            <ChevronDown size={14} color="#94A3B8" />
          </div>
          <div
            className="flex items-center justify-center w-7 h-7 ml-auto px-2"
            style={{ ...CHIP, background: "#00A3FF" }}
          >
            <ArrowUp size={16} color="#030406" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatInputDemo() {
  return (
    <div
      className="flex items-center justify-center w-[600px] max-w-full min-h-[360px] mx-auto rounded-[24px]"
      style={{
        background: "#030406",
      }}
    >
      <BorderBeam size="md" colorVariant="colorful">
        <ChatInput />
      </BorderBeam>
    </div>
  );
}
