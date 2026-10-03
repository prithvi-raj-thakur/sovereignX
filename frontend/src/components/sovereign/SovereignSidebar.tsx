import React, { useRef, useEffect, useState, useCallback } from "react";
import { gsap } from "gsap";
import { 
  ScanSearch, FileCheck, Terminal, 
  Search, Folder, Lock, Database, GitBranch,
  ChevronLeft, ChevronRight, LogOut, Settings, Plus, User, FileText, Cpu, Image
} from "lucide-react";
import { MOCK_HISTORY, MOCK_ARTIFACTS } from "./mockWorkspaceData";
import { UserProfileData } from "./types";
import { LiquidButton } from "@/components/ui/liquid-glass-card";
import Avatar from "@/components/ui/avatar";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  user: UserProfileData | null;
  onLogout: () => void;
  onNewExecution: () => void;
}

export function SovereignSidebar({ collapsed, setCollapsed, user, onLogout, onNewExecution }: SidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [documents, setDocuments] = useState<any[]>([]);

  const fetchDocuments = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_AI_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/v1/documents`);
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (err) {
      console.error("Failed to fetch documents", err);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
    
    const handleRefetch = () => fetchDocuments();
    window.addEventListener("refetchKnowledgeBase", handleRefetch);
    return () => window.removeEventListener("refetchKnowledgeBase", handleRefetch);
  }, [fetchDocuments]);

  useEffect(() => {
    if (sidebarRef.current) {
      gsap.to(sidebarRef.current, {
        width: collapsed ? 72 : 320,
        duration: 0.5,
        ease: "power3.inOut"
      });
    }
    if (contentRef.current) {
      gsap.to(contentRef.current, {
        opacity: collapsed ? 0 : 1,
        duration: 0.3,
        delay: collapsed ? 0 : 0.2,
        display: collapsed ? "none" : "block",
        ease: "power2.out"
      });
    }
  }, [collapsed]);

  const toggleSidebar = () => setCollapsed(!collapsed);

  return (
    <div 
      ref={sidebarRef} 
      className={`h-full flex flex-col bg-[#000000] border-r border-[#151515] overflow-hidden relative z-50 shrink-0 absolute md:relative ${collapsed ? 'max-md:hidden' : 'max-md:w-full max-md:absolute max-md:inset-y-0 max-md:left-0'}`}
      style={{ width: 320 }}
    >
      {/* Header - EXPANDED ONLY */}
      <div className="flex items-center justify-between p-4 pb-2 shrink-0" style={{ display: collapsed ? 'none' : 'flex' }}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00E5FF]/20 to-[#111] flex items-center justify-center border border-[#00E5FF]/30 shadow-[0_0_15px_rgba(0,229,255,0.2)] shrink-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-[#00E5FF]/10 to-transparent"></div>
            <ScanSearch className="w-4 h-4 text-[#00E5FF] drop-shadow-[0_0_5px_rgba(0,229,255,0.5)] relative z-10" />
          </div>
          <div className="flex flex-col whitespace-nowrap">
            <span className="font-semibold text-sm text-gray-200 flex items-center gap-2">SovereignX <span className="text-[10px] bg-gradient-to-r from-[#00E5FF]/20 to-transparent border border-[#00E5FF]/30 text-[#00E5FF] px-1.5 py-0.5 rounded-sm shadow-[0_0_8px_rgba(0,229,255,0.2)]">v2</span></span>
          </div>
        </div>
      </div>

      {/* Collapse Toggle */}
      <button 
        onClick={toggleSidebar}
        className="absolute top-4 right-[-12px] md:right-[-12px] max-md:right-4 w-6 h-6 max-md:w-8 max-md:h-8 bg-[#111] border border-[#333] rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors z-50"
        style={{ transform: collapsed ? 'translateX(-12px)' : 'translateX(0)' }}
      >
        {collapsed ? <ChevronRight className="w-3 h-3 max-md:w-4 max-md:h-4" /> : <ChevronLeft className="w-3 h-3 max-md:w-4 max-md:h-4" />}
      </button>

      {/* Collapsed view icons only */}
      <div className="flex-1 flex flex-col py-4 gap-3 items-center w-[72px]" style={{ display: collapsed ? 'flex' : 'none' }}>
        {/* Top Avatar Orb */}
        <div className="mb-2">
          <Avatar size="sm" color="cyan" shape="circle" />
        </div>

        {/* New Chat / Execution Button */}
        <button onClick={onNewExecution} className="w-10 h-10 rounded-[12px] bg-black/60 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] hover:shadow-[inset_0_0_0_1px_rgba(161,161,170,0.4)] hover:bg-[#A1A1AA]/10 flex items-center justify-center transition-all group" title="New Execution">
          <Plus className="w-5 h-5 text-[#A1A1AA] group-hover:text-white" />
        </button>

        <div className="w-6 h-[1px] bg-white/5 my-1" />

        {/* Icons */}
        <button className="w-10 h-10 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-white/5 flex items-center justify-center transition-colors" title="Search">
          <Search className="w-[18px] h-[18px]" />
        </button>
        <a href="/image-gen" className="w-10 h-10 rounded-lg text-[#00E5FF]/70 hover:text-[#00E5FF] hover:bg-[#00E5FF]/10 flex items-center justify-center transition-colors" title="Image Engine">
          <Image className="w-[18px] h-[18px]" />
        </a>
        <button className="w-10 h-10 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-white/5 flex items-center justify-center transition-colors" title="Audit System Architecture">
          <ScanSearch className="w-[18px] h-[18px]" />
        </button>
        <button className="w-10 h-10 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-white/5 flex items-center justify-center transition-colors" title="Extract Compliance">
          <FileCheck className="w-[18px] h-[18px]" />
        </button>
        <button className="w-10 h-10 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-white/5 flex items-center justify-center transition-colors" title="Execute Sandbox">
          <Terminal className="w-[18px] h-[18px]" />
        </button>
        
        <div className="w-6 h-[1px] bg-white/5 my-1" />

        <button className="w-10 h-10 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-white/5 flex items-center justify-center transition-colors" title="Knowledge Base">
          <Database className="w-[18px] h-[18px]" />
        </button>

        <div className="mt-auto flex flex-col gap-3 items-center">
          <button className="w-10 h-10 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-white/5 flex items-center justify-center transition-colors" title="Settings">
             <Settings className="w-[18px] h-[18px]" />
          </button>
          <div className="mb-2">
            <Avatar size="sm" color="white" shape="circle" />
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      <div ref={contentRef} data-lenis-prevent="true" className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar flex flex-col pb-20">
        
        {/* Tabs similar to Framer */}
        <div className="px-4 py-3 border-b border-[#151515]">
          <div className="flex p-1 bg-[#111] rounded-full">
            <button className="flex-1 px-3 py-1.5 bg-gradient-to-r from-[#00E5FF]/20 to-transparent border border-[#00E5FF]/30 text-[#00E5FF] text-xs font-medium rounded-full shadow-[inset_0_0_10px_rgba(0,229,255,0.1)]">Workspace</button>
            <button className="flex-1 px-3 py-1.5 text-gray-500 hover:text-gray-300 text-xs font-medium rounded-full">Data</button>
            <button className="flex-1 px-3 py-1.5 text-gray-500 hover:text-gray-300 text-xs font-medium rounded-full">Rules</button>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button onClick={onNewExecution} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#00E5FF]/20 via-[#00E5FF]/5 to-transparent border-l-[3px] border-[#00E5FF] text-white transition-all hover:from-[#00E5FF]/30 shadow-[inset_0_0_20px_rgba(0,229,255,0.05)]">
              <Plus className="w-4 h-4 text-[#00E5FF]" />
              <span className="text-sm font-medium">New Execution</span>
            </button>
            <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#0A0A0A] border border-[#222] text-gray-400 hover:text-white transition-colors">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                <span className="text-sm">Search</span>
              </div>
              <span className="text-[10px] font-mono bg-[#111] px-1.5 py-0.5 rounded text-gray-500 border border-[#222]">⌘K</span>
            </button>
            <a href="/image-gen" className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#0A0A0A] border border-[#222] text-gray-400 hover:text-white transition-colors">
              <div className="flex items-center gap-2">
                <Image className="w-4 h-4 text-[#00E5FF]/70" />
                <span className="text-sm text-gray-300">Image Engine</span>
              </div>
            </a>
          </div>

          {/* Quick Actions (Collapsible style) */}
          <div>
            <div className="flex items-center gap-2 mb-1 px-2 text-gray-400">
              <ChevronRight className="w-3 h-3" />
              <Folder className="w-3.5 h-3.5" />
              <span className="text-sm font-medium">Workflows</span>
            </div>
            <div className="ml-6 border-l border-[#222] space-y-0.5">
              <button className="w-full flex items-center justify-between px-3 py-1.5 text-gray-400 hover:text-white hover:bg-[#111] transition-colors rounded-r-md group">
                <div className="flex items-center gap-2">
                  <ScanSearch className="w-3.5 h-3.5 text-cyan-500/50 group-hover:text-cyan-400 group-hover:drop-shadow-[0_0_8px_rgba(0,163,255,0.8)]" />
                  <span className="text-sm">Audit System Architecture</span>
                </div>
              </button>
              <button className="w-full flex items-center justify-between px-3 py-1.5 text-gray-400 hover:text-white hover:bg-[#111] transition-colors rounded-r-md group">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-3.5 h-3.5 text-cyan-500/50 group-hover:text-cyan-400 group-hover:drop-shadow-[0_0_8px_rgba(0,163,255,0.8)]" />
                  <span className="text-sm">Extract Compliance</span>
                </div>
              </button>
              <button className="w-full flex items-center justify-between px-3 py-1.5 text-gray-400 hover:text-white hover:bg-[#111] transition-colors rounded-r-md group">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-cyan-500/50 group-hover:text-cyan-400 group-hover:drop-shadow-[0_0_8px_rgba(0,163,255,0.8)]" />
                  <span className="text-sm">Execute Sandbox</span>
                </div>
              </button>
            </div>
          </div>

          {/* Knowledge Base */}
          <div>
            <div className="flex items-center justify-between px-2 text-gray-300 bg-[#111]/50 py-1.5 rounded-md mb-1 cursor-pointer">
              <div className="flex items-center gap-2">
                <ChevronRight className="w-3 h-3 rotate-90" />
                <Database className="w-3.5 h-3.5" />
                <span className="text-sm font-medium">Knowledge Base</span>
              </div>
              <span className="text-xs text-gray-500 font-mono">{documents.length}</span>
            </div>
            <div className="ml-6 border-l border-[#222] space-y-0.5">
              {documents.length === 0 ? (
                <div className="px-3 py-1.5 text-xs text-gray-500 italic">No documents uploaded</div>
              ) : (
                documents.map((doc: any, i: number) => (
                  <div key={doc.filename} className={`group flex flex-col px-3 py-1.5 rounded-r-md cursor-pointer ${i === 0 ? 'bg-gradient-to-r from-[#00E5FF]/10 to-transparent border-l-2 border-[#00E5FF] shadow-[inset_0_0_10px_rgba(0,229,255,0.05)]' : 'hover:bg-[#111] transition-colors'}`}>
                    <div className="flex items-center gap-2">
                      <FileText className={`w-3.5 h-3.5 ${i === 0 ? 'text-[#00E5FF] drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]' : 'text-gray-500 group-hover:text-[#00E5FF]'}`} />
                      <span className={`text-sm truncate ${i === 0 ? 'text-[#00E5FF] font-medium' : 'text-gray-400 group-hover:text-gray-200'}`} title={doc.filename}>{doc.filename}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* History */}
          <div>
            <div className="flex items-center gap-2 mb-1 px-2 text-gray-400">
              <ChevronRight className="w-3 h-3 rotate-90" />
              <Folder className="w-3.5 h-3.5" />
              <span className="text-sm font-medium">History</span>
            </div>
            <div className="ml-6 border-l border-[#222] space-y-3 pt-1">
              {['Today', 'Yesterday', 'Older'].map(group => (
                <div key={group} className="space-y-0.5">
                  <div className="text-[9px] text-gray-600 px-3 uppercase tracking-wider mb-1">{group}</div>
                  {MOCK_HISTORY.filter(h => h.date === group).map(h => (
                    <button key={h.id} className="w-full flex items-center gap-2 text-left px-3 py-1 rounded-r-md text-sm text-gray-400 hover:text-white hover:bg-[#111] transition-colors truncate">
                      <div className="w-1 h-1 bg-gray-600 rounded-full shrink-0"></div>
                      <span className="truncate">{h.title}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Governance */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3 px-3">Governance</h3>
          <div className="space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
              <Lock className="w-4 h-4" />
              <span className="text-sm">Audit Trail</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
              <Folder className="w-4 h-4" />
              <span className="text-sm">Governance Artifacts</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
              <GitBranch className="w-4 h-4" />
              <span className="text-sm">Provenance</span>
            </button>
          </div>
        </div>

        {/* Upgrade Pro Card */}
        <div className="mt-8 px-4 pb-4">
          <div className="relative rounded-2xl bg-gradient-to-b from-[#00E5FF]/10 to-[#000000] border border-[#00E5FF]/20 p-4 overflow-hidden shadow-[0_0_15px_rgba(0,229,255,0.1)]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E5FF]/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="flex items-center justify-between mb-2 relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#00E5FF]/20 flex items-center justify-center">
                  <ScanSearch className="w-3.5 h-3.5 text-[#00E5FF]" />
                </div>
                <span className="text-sm font-semibold text-white">Upgrade Pro!</span>
              </div>
              <button className="text-gray-400 hover:text-white">
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-4 relative z-10">Upgrade to Pro and elevate your experience today</p>
            <div className="flex items-center gap-3 relative z-10">
              <button className="flex-1 bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-black text-xs font-semibold py-2 rounded-lg transition-colors">
                ✨ Upgrade
              </button>
              <button className="text-xs text-gray-400 hover:text-white transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* User Profile / Footer - EXPANDED ONLY */}
      <div style={{ display: collapsed ? 'none' : 'block' }}>
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#000000] via-[#000000]/80 to-transparent z-10 pointer-events-none h-32"></div>
        <div className="absolute bottom-4 left-4 right-4 z-20">
          <div className="relative bg-[#050505]/90 backdrop-blur-xl border border-[#00E5FF]/20 p-2.5 rounded-2xl flex items-center justify-between transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_0_15px_rgba(0,229,255,0.05)] overflow-hidden group hover:border-[#00E5FF]/40 hover:shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_0_20px_rgba(0,229,255,0.1)] w-auto">
            
            {/* Subtle background glow on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#00E5FF]/0 via-[#00E5FF]/5 to-[#00E5FF]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="flex items-center gap-3 relative z-10">
              {/* Avatar with Badge Gradient Ring */}
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-br from-[#00E5FF] to-transparent rounded-full opacity-50 blur-[2px] group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="w-9 h-9 rounded-full bg-[#111] border border-[#222] flex items-center justify-center shrink-0 overflow-hidden relative z-10">
                  <User className="w-4 h-4 text-[#00E5FF]" />
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-[2px] border-[#050505] z-20 shadow-[0_0_5px_rgba(52,211,153,0.5)]"></div>
              </div>
              
              <div className="flex-1 flex flex-col overflow-hidden py-0.5">
                <span className="text-sm text-gray-100 font-semibold truncate tracking-tight">{user?.name || "Jacob Cooper"}</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] bg-gradient-to-r from-[#00E5FF]/20 to-transparent border border-[#00E5FF]/30 text-[#00E5FF] px-1.5 py-[1px] rounded-sm uppercase tracking-wider font-semibold">Pro</span>
                  <span className="text-[10px] text-gray-500 truncate">{user?.email || "jacob.cooper@mail.com"}</span>
                </div>
              </div>
            </div>
            
            <button onClick={onLogout} className="p-2 text-gray-400 hover:text-[#00E5FF] rounded-full hover:bg-[#00E5FF]/10 transition-colors shrink-0 relative z-10 group/btn">
              <Settings className="w-4 h-4 group-hover/btn:rotate-90 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #111;
          border-radius: 4px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: #333;
        }
      `}</style>
    </div>
  );
}
