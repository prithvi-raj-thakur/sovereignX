import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { 
  Paperclip, ArrowRight, FileText, CheckCircle, Database, 
  Terminal, ShieldCheck, FileKey, X, Download, Copy, Check
} from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card";
import { ThinkingOrb } from "@/components/ui/thinking-orbs";
import type { OrbState } from "@/components/ui/thinking-orbs";
import { ChatMessageData, ExecutionStatus, TimelineStep, TimelineStepStatus } from "./types";

// --- CHAT COMPOSER ---
interface ChatComposerProps {
  onExecute: (query: string, files: File[]) => void;
  status: ExecutionStatus;
}

export function ChatComposer({ onExecute, status }: ChatComposerProps) {
  const [query, setQuery] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const isExecuting = status !== "idle" && status !== "completed" && status !== "error";

  const handleExecute = () => {
    if (!query.trim() && files.length === 0) return;
    onExecute(query, files);
    setQuery("");
    setFiles([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleExecute();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-4 px-4 pb-8 sticky bottom-6 z-50">
      
      {/* Floating Animated Command Bar */}
      <div className="relative group">
        
        {/* Animated Glow Backdrop */}
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 rounded-[24px] blur-md opacity-40 group-hover:opacity-70 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
        
        {/* Main Bar */}
        <div className="relative p-2 bg-[#020305]/90 backdrop-blur-xl border border-cyan-500/50 shadow-[inset_0_0_20px_rgba(0,163,255,0.15)] rounded-[20px] flex flex-col">
          
          {/* Attachments */}
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2 px-3 pt-2">
              {files.map((file, i) => (
                <div key={i} className="flex items-center gap-2 bg-[#050A0F] border border-cyan-900/50 shadow-[inset_0_0_10px_rgba(0,163,255,0.1)] rounded-lg px-3 py-1.5">
                  <FileText className="w-3 h-3 text-cyan-400 drop-shadow-[0_0_8px_rgba(0,163,255,0.8)]" />
                  <span className="text-xs text-cyan-100 font-mono truncate max-w-[150px]">{file.name}</span>
                  <button onClick={() => removeFile(i)} className="text-cyan-500/50 hover:text-cyan-300 transition-colors ml-1">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-center gap-3 relative pl-3 pr-2 py-1">
            
            {/* Left Action Icon (Glowing) */}
            <label className="p-2.5 text-cyan-500/60 hover:text-cyan-300 hover:drop-shadow-[0_0_12px_rgba(0,163,255,1)] cursor-pointer transition-all rounded-xl hover:bg-cyan-950/30 group/icon">
              <input type="file" multiple className="hidden" onChange={handleFileChange} disabled={isExecuting} />
              <Paperclip className="w-5 h-5 group-hover/icon:scale-110 transition-transform" />
            </label>
            
            <div className="h-6 w-[1px] bg-cyan-900/50"></div>
            
            {/* Input Field */}
            <textarea 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isExecuting}
              placeholder="Query SovereignX knowledge base or execute workflow..."
              className="flex-1 bg-transparent border-none outline-none resize-none text-base text-gray-100 placeholder-gray-500 min-h-[48px] py-3.5 custom-scrollbar font-sans tracking-wide"
              rows={1}
              style={{ maxHeight: "150px" }}
            />

            {/* Glowing Execute Button */}
            <button 
              onClick={handleExecute}
              disabled={isExecuting || (!query.trim() && files.length === 0)}
              className="bg-transparent hover:bg-cyan-950/40 disabled:opacity-50 text-cyan-400 p-3 rounded-xl flex items-center justify-center transition-all group/btn border border-transparent hover:border-cyan-500/30"
            >
              <div className="relative">
                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform drop-shadow-[0_0_12px_rgba(0,163,255,0.8)]" />
              </div>
            </button>
            
          </div>
        </div>
      </div>
    </div>
  );
}

// --- EXECUTION TIMELINE ---
interface ExecutionTimelineProps {
  status: ExecutionStatus;
}

export function ExecutionTimeline({ status }: ExecutionTimelineProps) {
  const steps: TimelineStep[] = [
    { id: "s1", stepNumber: 1, title: "TASK INTENT CLASSIFIED", status: "pending", description: "Intent: Data extraction. Model: Llama-3-8B-Instruct." },
    { id: "s2", stepNumber: 2, title: "LOCAL MODEL EXECUTION COMPLETE", status: "pending", description: "Inference successful (1.2s)." },
    { id: "s3", stepNumber: 3, title: "RAG CONTEXT RETRIEVAL COMPLETED", status: "pending", description: "24 chunks retrieved from 3 confidential documents." },
    { id: "s4", stepNumber: 4, title: "DELIVERABLES SYNTHESIZED", status: "pending", description: "Artifact generation successful." },
    { id: "s5", stepNumber: 5, title: "WORKFLOW COMPLETED & AIR-GAP VERIFIED", status: "pending", description: "No WAN egress detected during execution." }
  ];

  // Map status to active step
  let activeStepIdx = -1;
  if (status === "classifying") activeStepIdx = 0;
  if (status === "executing") activeStepIdx = 1;
  if (status === "retrieving") activeStepIdx = 2;
  if (status === "synthesizing") activeStepIdx = 3;
  if (status === "completed") activeStepIdx = 4;

  const getStepStatus = (index: number): TimelineStepStatus => {
    if (activeStepIdx === -1) return "pending"; // Before start
    if (index < activeStepIdx) return "completed";
    if (index === activeStepIdx && status !== "completed") return "running";
    if (index === 4 && status === "completed") return "completed"; // Final step
    return "pending";
  };

  // Ensure orb state reflects status
  let orbState: OrbState = "listening";
  let orbText = "Awaiting query...";
  if (status === "classifying") { orbState = "solving"; orbText = "Classifying Intent..."; }
  if (status === "executing") { orbState = "working"; orbText = "Executing Local Model..."; }
  if (status === "retrieving") { orbState = "searching"; orbText = "Searching Sovereign Knowledge..."; }
  if (status === "synthesizing") { orbState = "composing"; orbText = "Synthesizing Deliverables..."; }
  if (status === "completed") { orbState = "shaping"; orbText = "Execution Complete"; }

  if (status === "idle") return null;

  return (
    <div className="w-full max-w-4xl mx-auto my-6 px-4">
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Timeline Progress */}
        <div className="flex-1 space-y-0 relative pl-4 border-l border-[#1E293B]">
          {steps.map((step, i) => {
            const stepStatus = getStepStatus(i);
            const isVisible = stepStatus !== "pending";
            
            return (
              <div 
                key={step.id} 
                className={`relative pb-6 transition-all duration-700 ease-in-out ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 h-0 overflow-hidden pb-0'}`}
              >
                {/* Connector line overlay for active color */}
                {i !== steps.length - 1 && isVisible && (
                  <div className={`absolute left-[-17px] top-4 w-[2px] h-full ${stepStatus === 'completed' ? 'bg-cyan-500' : 'bg-[#1E293B]'}`} />
                )}
                
                {/* Dot */}
                <div className={`absolute left-[-21px] top-1 w-2.5 h-2.5 rounded-full border-2 ${
                  stepStatus === 'completed' ? 'bg-cyan-400 border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,1)]' : 
                  stepStatus === 'running' ? 'bg-[#111] border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.5)] animate-pulse' : 
                  'bg-[#050505] border-[#333]'
                }`} />

                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {i === 0 && <ShieldCheck className={`w-4 h-4 ${stepStatus === 'completed' ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(0,163,255,0.8)]' : stepStatus === 'running' ? 'text-cyan-500/80 animate-pulse' : 'text-gray-600'}`} />}
                    {i === 1 && <Terminal className={`w-4 h-4 ${stepStatus === 'completed' ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(0,163,255,0.8)]' : stepStatus === 'running' ? 'text-cyan-500/80 animate-pulse' : 'text-gray-600'}`} />}
                    {i === 2 && <Database className={`w-4 h-4 ${stepStatus === 'completed' ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(0,163,255,0.8)]' : stepStatus === 'running' ? 'text-cyan-500/80 animate-pulse' : 'text-gray-600'}`} />}
                    {i === 3 && <FileText className={`w-4 h-4 ${stepStatus === 'completed' ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(0,163,255,0.8)]' : stepStatus === 'running' ? 'text-cyan-500/80 animate-pulse' : 'text-gray-600'}`} />}
                    {i === 4 && <Lock className={`w-4 h-4 ${stepStatus === 'completed' ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]' : stepStatus === 'running' ? 'text-emerald-500/80 animate-pulse' : 'text-gray-600'}`} />}
                  </div>
                  <div>
                    <h4 className={`text-xs font-semibold tracking-widest ${stepStatus === 'completed' ? 'text-cyan-100 drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]' : stepStatus === 'running' ? 'text-white' : 'text-gray-500'}`}>
                      STEP {step.stepNumber}: {step.title}
                    </h4>
                    {stepStatus !== 'pending' && (
                      <p className="text-[11px] text-gray-500 font-mono mt-1">{step.description}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Orb Context */}
        <div className="w-full md:w-64 shrink-0 mt-8 md:mt-0">
          <div className="p-4 flex flex-col items-center justify-center gap-4 bg-[#050505]/90 border border-[#222] shadow-[0_10px_30px_rgba(0,0,0,0.8),inset_0_0_15px_rgba(0,163,255,0.05)] rounded-[20px] min-h-[160px] relative overflow-hidden backdrop-blur-xl">
            {/* Soft background glow behind orb */}
            <div className="absolute inset-0 bg-cyan-900/10 blur-[30px] rounded-full pointer-events-none mix-blend-screen"></div>
            
            <div className="[&_canvas]:!size-16 relative z-10">
              <ThinkingOrb state={orbState} size={64} theme="dark" />
            </div>
            <span className="text-[10px] font-mono text-cyan-400 drop-shadow-[0_0_8px_rgba(0,163,255,0.8)] text-center animate-pulse uppercase tracking-widest mt-2 z-10">
              {orbText}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}

// --- CHAT MESSAGE ---
interface ChatMessageProps {
  message: ChatMessageData;
}

const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
  const match = /language-(\w+)/.exec(className || '');
  const [copied, setCopied] = useState(false);
  const codeString = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!inline && match) {
    return (
      <div className="relative group my-4 rounded-lg overflow-hidden border border-[#222]">
        <div className="flex items-center justify-between px-4 py-2 bg-[#111] text-xs text-gray-400 font-mono border-b border-[#222]">
          <span>{match[1]}</span>
          <button onClick={handleCopy} className="hover:text-cyan-400 transition-colors flex items-center gap-1">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <SyntaxHighlighter
          style={vscDarkPlus as any}
          language={match[1]}
          PreTag="div"
          customStyle={{ margin: 0, padding: '1rem', background: '#050505', fontSize: '13px' }}
          {...props}
        >
          {codeString}
        </SyntaxHighlighter>
      </div>
    );
  }
  return (
    <code className="bg-[#111] text-cyan-300 px-1.5 py-0.5 rounded-md text-sm border border-[#222]" {...props}>
      {children}
    </code>
  );
};

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  
  return (
    <div className={`flex w-full max-w-4xl mx-auto px-4 mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] ${isUser ? 'flex flex-col items-end' : 'flex flex-col items-start'}`}>
        
        {/* Metadata */}
        {!isUser && (
          <div className="flex items-center gap-2 mb-2 pl-2">
            <span className="w-5 h-5 rounded-[4px] bg-cyan-950 flex items-center justify-center border border-cyan-500/30 shadow-[0_0_10px_rgba(0,163,255,0.2)]">
              <span className="text-[10px] font-bold text-cyan-400">S</span>
            </span>
            <span className="text-xs font-semibold text-gray-200">SovereignX</span>
            <div className="flex items-center gap-1.5 ml-2">
              <span className="text-[9px] px-1.5 py-0.5 rounded-[4px] bg-[#111] border border-[#333] text-gray-400 uppercase tracking-widest font-mono shadow-[inset_0_0_5px_rgba(255,255,255,0.05)]">LOCAL</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-[4px] bg-[#111] border border-[#333] text-gray-400 uppercase tracking-widest font-mono shadow-[inset_0_0_5px_rgba(255,255,255,0.05)]">RAG</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-[4px] bg-[#002211] border border-[#005522] text-emerald-400 uppercase tracking-widest font-mono shadow-[0_0_8px_rgba(16,185,129,0.3)]">GOVERNED</span>
            </div>
          </div>
        )}

        {/* Bubble */}
        <div className={`p-4 rounded-[16px] text-sm leading-relaxed tracking-wide markdown-body [&>p]:mb-4 [&>p:last-child]:mb-0 [&>ul]:list-disc [&>ul]:ml-5 [&>ol]:list-decimal [&>ol]:ml-5 [&>h1]:text-white [&>h1]:font-bold [&>h1]:text-2xl [&>h1]:mb-3 [&>h2]:text-white [&>h2]:font-bold [&>h2]:text-xl [&>h2]:mb-3 [&>h3]:text-white [&>h3]:font-bold [&>h3]:text-lg [&>h3]:mb-2 [&>h4]:text-white [&>h4]:font-bold [&>h4]:mb-2 ${
          isUser 
          ? 'bg-[#111] text-gray-200 border border-[#222] rounded-tr-sm shadow-[inset_0_2px_10px_rgba(255,255,255,0.02)]' 
          : 'bg-transparent text-gray-300 font-sans border-l-2 border-cyan-500/50 pl-5 ml-2 rounded-l-none'
        }`}>
          {isUser ? (
            message.content
          ) : (
            <ReactMarkdown
              components={{
                code: CodeBlock as any
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {/* Attachments for user */}
        {isUser && message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2 justify-end">
            {message.attachments.map(att => (
              <div key={att.id} className="flex items-center gap-1.5 bg-[#050505] border border-[#222] rounded-lg px-2 py-1 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
                <FileText className="w-3 h-3 text-cyan-500/70 drop-shadow-[0_0_5px_rgba(0,163,255,0.5)]" />
                <span className="text-[10px] text-gray-400 font-mono tracking-tight">{att.name}</span>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

import { Lock, Folder } from "lucide-react";

// --- GOVERNANCE ARTIFACTS PANEL ---
export function ArtifactPanel({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 mb-10 mt-2">
      <div className="border border-[#222] rounded-xl bg-[#050505]/80 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-md">
        <div className="bg-[#111]/90 px-4 py-2 border-b border-[#222] flex items-center gap-2">
          <Folder className="w-4 h-4 text-cyan-500 drop-shadow-[0_0_5px_rgba(0,163,255,0.8)]" />
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest font-mono">Audit Deliverables & Governance Artifacts</span>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {([] as any[]).map(artifact => (
            <div key={artifact.id} className="flex flex-col p-3 rounded-lg border border-[#222] bg-[#0A0A0A] hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(0,163,255,0.1)] transition-all group">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-[4px] bg-[#111] flex items-center justify-center font-mono text-[9px] text-cyan-400 border border-[#333]">
                    {artifact.type}
                  </div>
                  <span className="text-xs text-gray-300 font-medium truncate w-32 group-hover:text-cyan-50 transition-colors" title={artifact.filename}>{artifact.filename}</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#222]">
                <span className="text-[9px] text-emerald-500 font-mono flex items-center gap-1 uppercase tracking-wider drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]">
                  <CheckCircle className="w-3 h-3" /> {artifact.provenance}
                </span>
                <button className="text-gray-500 hover:text-cyan-400 hover:drop-shadow-[0_0_8px_rgba(0,163,255,0.8)] flex items-center gap-1 text-[9px] uppercase font-bold tracking-widest transition-all">
                  <Download className="w-3 h-3" /> Save
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
