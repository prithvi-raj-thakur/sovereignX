"use client";

import React, { useState, useEffect, useRef } from "react";
import { Navbar } from "../../../landing-page/Navbar";
import FooterNav from "../../../landing-page/footer-nav";
import FooterWatermark from "../../../landing-page/footer-watermark";
import { FooterStickyReveal } from "@/components/ui/footer-sticky-reveal";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-border";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useGlobalAnimations } from "@/hooks/use-global-animations";

const DOCS_NAV_ITEMS = [
  { heading: "Overview", href: "#overview" },
  { heading: "Architecture", href: "#architecture" },
  { heading: "Agents", href: "#agentic-workflows" },
  { heading: "Security", href: "#security-model" },
  { heading: "Workflows", href: "#agentic-workflows" },
  { heading: "Deployment", href: "#deployment" },
];

const SECTIONS = [
  {
    id: "overview",
    number: "01",
    title: "Overview",
    heading: "AI Built Around Data Sovereignty",
    content: (
      <>
        <p className="text-white/80 text-base leading-relaxed mb-4">
          SovereignX is an agentic AI workbench designed for organizations that cannot move sensitive information into public AI services.
        </p>
        <p className="text-white/80 text-base leading-relaxed mb-4">
          Instead of sending confidential documents, engineering data, operational knowledge, or internal workflows to external cloud models, SovereignX keeps intelligence inside the organization's controlled environment.
        </p>
        <p className="text-white/80 text-base leading-relaxed">
          It combines local AI models, retrieval, multimodal understanding, autonomous agents, secure execution, verification, and governance into a single workspace.
        </p>
      </>
    )
  },
  {
    id: "why-sovereignx",
    number: "02",
    title: "Why SovereignX",
    heading: "From AI Access To AI Execution",
    content: (
      <>
        <p className="text-white/80 text-base leading-relaxed mb-6">
          Traditional AI interfaces primarily provide a conversation layer. SovereignX is designed around the complete work cycle.
        </p>
        <p className="text-white/80 text-base leading-relaxed mb-8">
          An agent can understand a request, retrieve relevant organizational knowledge, reason over evidence, use approved tools, execute controlled tasks, verify its output, and produce a usable deliverable.
        </p>
        
        {/* Visual Workflow */}
        <div className="flex flex-col gap-2 p-6 rounded-2xl bg-black/40 border border-white/5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)] relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00A3FF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          {["INPUT", "UNDERSTAND", "RETRIEVE", "PLAN", "EXECUTE", "VERIFY", "DELIVER"].map((step, i, arr) => (
            <React.Fragment key={step}>
              <div className="text-sm font-mono tracking-widest text-[#00A3FF] py-2 relative z-10 flex items-center gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00A3FF] shadow-[0_0_8px_rgba(0,163,255,0.8)]" />
                {step}
              </div>
              {i < arr.length - 1 && (
                <div className="w-px h-6 bg-gradient-to-b from-[#00A3FF]/50 to-transparent ml-[3px] my-1" />
              )}
            </React.Fragment>
          ))}
        </div>
      </>
    )
  },
  {
    id: "architecture",
    number: "03",
    title: "Core Architecture",
    heading: "An Intelligence Layer Inside Your Infrastructure",
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2 font-sans tracking-tight">LOCAL MODELS</h3>
          <p className="text-white/70 text-sm leading-relaxed">Open-weight models deployed within the organization's infrastructure.</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white mb-2 font-sans tracking-tight">MULTIMODAL ENGINE</h3>
          <p className="text-white/70 text-sm leading-relaxed">Processes documents, scans, images, diagrams, P&IDs, and other enterprise information.</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white mb-2 font-sans tracking-tight">KNOWLEDGE LAYER</h3>
          <p className="text-white/70 text-sm leading-relaxed">Retrieval-augmented generation over private organizational knowledge.</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white mb-2 font-sans tracking-tight">AGENT ORCHESTRATION</h3>
          <p className="text-white/70 text-sm leading-relaxed">Coordinates multi-step tasks and specialized agents.</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white mb-2 font-sans tracking-tight">TOOL EXECUTION</h3>
          <p className="text-white/70 text-sm leading-relaxed">Allows agents to use approved tools and controlled execution environments.</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white mb-2 font-sans tracking-tight">VERIFICATION</h3>
          <p className="text-white/70 text-sm leading-relaxed">Checks outputs against evidence and workflow requirements.</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white mb-2 font-sans tracking-tight">GOVERNANCE</h3>
          <p className="text-white/70 text-sm leading-relaxed">Maintains approvals, audit trails, execution history, and accountability.</p>
        </div>
      </div>
    )
  },
  {
    id: "agentic-workflows",
    number: "04",
    title: "Agentic Workflows",
    heading: "Agents That Do More Than Answer",
    content: (
      <>
        <p className="text-white/80 text-base leading-relaxed mb-4">
          SovereignX is designed around task completion rather than simple question answering.
        </p>
        <p className="text-white/80 text-base leading-relaxed mb-8">
          Agents can break complex requests into steps, retrieve information, invoke tools, execute approved operations, inspect results, and produce structured outputs.
        </p>
        <div className="p-6 rounded-2xl bg-black/40 border border-white/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <h4 className="text-xs font-mono text-emerald-400 mb-4 tracking-widest uppercase">Example Workflow</h4>
          <p className="text-white/90 italic mb-6">"Analyze this inspection report and prepare a compliance summary."</p>
          <div className="flex flex-col gap-2 relative z-10 text-sm text-white/60 font-mono">
            {["DOCUMENT UNDERSTANDING", "KNOWLEDGE RETRIEVAL", "AGENT PLANNING", "EVIDENCE ANALYSIS", "VERIFICATION", "COMPLIANCE DELIVERABLE"].map((step, i, arr) => (
              <React.Fragment key={step}>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-500/80">↓</span> {step}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </>
    )
  },
  {
    id: "multimodal-intelligence",
    number: "05",
    title: "Multimodal Intelligence",
    heading: "Understand The Documents Your Enterprise Actually Uses",
    content: (
      <>
        <p className="text-white/80 text-base leading-relaxed mb-6">
          Enterprise knowledge is rarely stored as clean text. SovereignX combines document processing and multimodal AI to extract useful information from the formats teams already depend on.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {["PDFs", "Scanned documents", "Images", "Tables", "Engineering diagrams", "P&IDs", "Handwritten information", "Structured enterprise files", "Text-based knowledge"].map(item => (
            <div key={item} className="p-3 rounded-lg bg-white/5 border border-white/5 text-sm text-white/70 flex items-center justify-center text-center hover:bg-white/10 transition-colors">
              {item}
            </div>
          ))}
        </div>
      </>
    )
  },
  {
    id: "local-knowledge-rag",
    number: "06",
    title: "Local Knowledge & RAG",
    heading: "Your Knowledge Base. Your Retrieval Layer.",
    content: (
      <>
        <p className="text-white/80 text-base leading-relaxed mb-8">
          SovereignX can build retrieval workflows around private organizational knowledge so agents can ground their responses in internal evidence instead of relying only on general model knowledge.
        </p>
        <div className="flex flex-wrap gap-2 text-xs font-mono text-[#00A3FF]/80">
          {["DOCUMENT INGESTION", "CHUNKING", "EMBEDDINGS", "VECTOR STORAGE", "RETRIEVAL", "CONTEXT", "GROUNDED RESPONSE"].map((step, i, arr) => (
            <React.Fragment key={step}>
              <div className="px-3 py-1.5 rounded-full border border-[#00A3FF]/20 bg-[#00A3FF]/5">{step}</div>
              {i < arr.length - 1 && <span className="flex items-center">→</span>}
            </React.Fragment>
          ))}
        </div>
      </>
    )
  },
  {
    id: "secure-execution",
    number: "07",
    title: "Secure Execution",
    heading: "Reasoning Is Only The Beginning",
    content: (
      <>
        <p className="text-white/80 text-base leading-relaxed mb-4">
          Agents become useful when they can safely interact with tools and controlled execution environments.
        </p>
        <p className="text-white/80 text-base leading-relaxed mb-6">
          SovereignX is designed around constrained execution so sensitive workflows can be performed inside the organization's infrastructure.
        </p>
        <ul className="list-disc pl-5 space-y-2 text-white/70 marker:text-[#00A3FF]">
          <li>Sandboxed execution</li>
          <li>Approved tools</li>
          <li>Permission boundaries</li>
          <li>Controlled environments</li>
          <li>Execution logs</li>
          <li>Human approval where required</li>
        </ul>
      </>
    )
  },
  {
    id: "verification-governance",
    number: "08",
    title: "Verification & Governance",
    heading: "Every Important Action Should Be Traceable",
    content: (
      <>
        <p className="text-white/80 text-base leading-relaxed mb-6">
          SovereignX is designed to make agentic workflows observable and accountable.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {["Execution history", "Evidence references", "Agent actions", "Tool calls", "Approval checkpoints", "Generated artifacts", "Verification results", "Audit records"].map(item => (
            <div key={item} className="flex items-center gap-2 text-sm text-white/70">
              <div className="w-1 h-1 rounded-full bg-emerald-500" />
              {item}
            </div>
          ))}
        </div>
      </>
    )
  },
  {
    id: "auditability",
    number: "09",
    title: "Auditability",
    heading: "From Black-Box Automation To Observable Workflows",
    content: (
      <>
        <p className="text-white/80 text-base leading-relaxed mb-8">
          Every significant workflow can produce an inspectable trail showing what the system received, what information it used, which actions were performed, and what output was generated.
        </p>
        <div className="flex flex-col gap-1 p-6 rounded-2xl bg-black/40 border border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00A3FF]/5 to-transparent opacity-50" />
          {["REQUEST", "RETRIEVAL", "AGENT ACTION", "TOOL EXECUTION", "VERIFICATION", "DELIVERABLE"].map((step, i, arr) => (
            <React.Fragment key={step}>
              <div className="text-xs font-mono text-white/80 py-1 flex items-center gap-3">
                <span className="text-[#00A3FF]">→</span> {step}
              </div>
            </React.Fragment>
          ))}
        </div>
      </>
    )
  },
  {
    id: "deployment",
    number: "10",
    title: "Deployment",
    heading: "Designed For Controlled Environments",
    content: (
      <>
        <p className="text-white/80 text-base leading-relaxed mb-8">
          SovereignX is intended for deployment within infrastructure controlled by the organization, including environments where sensitive workloads require restricted connectivity or air-gapped operation.
        </p>
        <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
          {["USER", "SOVEREIGNX WORKBENCH", "AGENT ORCHESTRATION", "LOCAL MODELS", "PRIVATE KNOWLEDGE", "CONTROLLED TOOLS", "SECURE INFRASTRUCTURE"].map((layer, i, arr) => (
            <React.Fragment key={layer}>
              <div className="w-full max-w-sm text-center py-2 rounded border border-white/10 bg-black/40 text-xs font-mono text-white/60 tracking-widest">
                {layer}
              </div>
              {i < arr.length - 1 && <div className="text-white/20">↓</div>}
            </React.Fragment>
          ))}
        </div>
      </>
    )
  },
  {
    id: "security-model",
    number: "11",
    title: "Security Model",
    heading: "Security By Architecture",
    content: (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {[
          "Data locality", "Access control", "Model isolation", "Tool permissions", 
          "Sandboxed execution", "Audit logs", "Human approval", "Controlled network boundaries"
        ].map(item => (
          <div key={item} className="flex flex-col gap-2 p-4 rounded-xl border border-white/5 bg-black/20 hover:bg-black/40 transition-colors">
            <h4 className="text-sm font-semibold text-white/90">{item}</h4>
            <div className="w-6 h-0.5 bg-[#00A3FF]/50 rounded-full" />
          </div>
        ))}
      </div>
    )
  }
];

export default function DocsPage() {
  useGlobalAnimations();
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = SECTIONS.map(s => document.getElementById(s.id));
      const scrollPosition = window.scrollY + 200; // Offset for header

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const el = sectionElements[i];
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(SECTIONS[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top: y, behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <main className="min-h-screen bg-black">
      <Navbar navItems={DOCS_NAV_ITEMS} />

      {/* Docs Hero */}
      <section className="relative pt-[20vh] pb-[10vh] px-6 md:px-12 w-full flex flex-col items-center text-center bg-black">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#00A3FF]/10 via-black to-black opacity-30 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto">
          <div className="relative inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-black/60 backdrop-blur-xl mb-8 border border-[#00A3FF]/30 shadow-[0_0_20px_rgba(0,163,255,0.15)]">
            <ShieldCheck size={16} className="text-[#00A3FF]" />
            <span className="text-xs sm:text-sm font-mono tracking-widest text-white/90">
              SOVEREIGNX DOCUMENTATION
            </span>
          </div>

          <h1 className="mb-6 text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.1] tracking-tight text-white drop-shadow-2xl">
            Build With Intelligence That Stays Yours.
          </h1>

          <p className="text-white/60 text-base md:text-lg font-light max-w-3xl leading-relaxed">
            Explore the architecture, capabilities, security model, and deployment workflow behind SovereignX — an on-premise agentic AI workbench built for confidential enterprise environments.
          </p>
        </div>
      </section>

      {/* Docs Content */}
      <section className="relative w-full max-w-[1400px] mx-auto px-6 md:px-12 pb-32 flex flex-col lg:flex-row gap-12 items-start">
        
        {/* Mobile Dropdown Nav */}
        <div className="lg:hidden w-full sticky top-24 z-40 bg-black/90 backdrop-blur-md p-4 rounded-xl border border-white/10 mb-8">
          <button 
            className="w-full flex items-center justify-between text-white/80 font-mono text-sm uppercase tracking-widest"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span>{SECTIONS.find(s => s.id === activeSection)?.title || "Navigation"}</span>
            <span className="text-[#00A3FF]">{isMobileMenuOpen ? "↑" : "↓"}</span>
          </button>
          
          {isMobileMenuOpen && (
            <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-4 max-h-[50vh] overflow-y-auto">
              {SECTIONS.map(section => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`text-left px-3 py-2 rounded-lg text-sm font-sans transition-colors ${
                    activeSection === section.id 
                      ? "bg-[#00A3FF]/10 text-[#00A3FF] border border-[#00A3FF]/20" 
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className="font-mono text-xs opacity-50 mr-3">{section.number}</span>
                  {section.title}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Sidebar Nav */}
        <div className="hidden lg:flex w-[300px] shrink-0 flex-col gap-2 sticky top-32 max-h-[calc(100vh-160px)] overflow-y-auto pr-4 scrollbar-hide">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`group flex items-center text-left py-2.5 px-4 rounded-xl transition-all duration-300 ${
                activeSection === section.id 
                  ? "bg-white/5 border border-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.03)]" 
                  : "text-white/40 hover:text-white/80 hover:bg-white/[0.02]"
              }`}
            >
              <span className={`font-mono text-xs mr-4 transition-colors ${activeSection === section.id ? "text-[#00A3FF]" : "text-white/20 group-hover:text-white/40"}`}>
                {section.number}
              </span>
              <span className="font-sans text-sm tracking-wide">{section.title}</span>
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 w-full max-w-4xl flex flex-col gap-32">
          {SECTIONS.map((section) => (
            <motion.div 
              key={section.id}
              id={section.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="scroll-mt-32"
            >
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-mono text-[#00A3FF] bg-[#00A3FF]/10 px-2 py-1 rounded-md border border-[#00A3FF]/20">
                  {section.number}
                </span>
                <span className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
              </div>
              <h2 className="text-[clamp(1.5rem,3vw,2.25rem)] font-semibold text-white mb-8 tracking-tight leading-[1.2]">
                {section.heading}
              </h2>
              <div className="prose prose-invert max-w-none">
                {section.content}
              </div>
            </motion.div>
          ))}

          {/* Bottom CTA */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-16 p-10 rounded-3xl bg-black/60 border border-white/10 backdrop-blur-xl flex flex-col items-center text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#00A3FF]/10 to-transparent opacity-50 pointer-events-none" />
            <h2 className="text-3xl font-semibold text-white mb-4 relative z-10">Ready To Build With Sovereign Intelligence?</h2>
            <p className="text-white/60 text-lg mb-8 max-w-2xl relative z-10">
              Bring autonomous AI into the environment where your most important data already lives.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 relative z-10">
              <Link href="/auth">
                <LiquidMetalButton label="Get Started" viewMode="text" />
              </Link>
              <Link href="/">
                <button className="h-[52px] px-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors font-medium">
                  Back to SovereignX
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <FooterNav />
      <FooterStickyReveal>
        <FooterWatermark />
      </FooterStickyReveal>
    </main>
  );
}
