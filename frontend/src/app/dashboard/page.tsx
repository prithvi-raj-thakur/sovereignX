"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { SovereignWorkspace } from "@/components/sovereign/SovereignWorkspace";
import { UserProfileData } from "@/components/sovereign/types";
import Avatar from "@/components/ui/avatar";
import { gsap } from "gsap";

interface UserProfile {
  id: number;
  email: string;
  name: string;
  avatar_url?: string;
  is_verified?: boolean;
  created_at?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  
  const [authResolved, setAuthResolved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showWorkspace, setShowWorkspace] = useState(false);

  const loaderRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          const localUser = localStorage.getItem("user");
          const token = localStorage.getItem("token");
          if (localUser && token) {
            setUser(JSON.parse(localUser));
          } else {
            router.push("/auth");
          }
        }
      } catch (err) {
        console.error("Auth check error:", err);
        const localUser = localStorage.getItem("user");
        if (localUser) {
          setUser(JSON.parse(localUser));
        } else {
          router.push("/auth");
        }
      } finally {
        setAuthResolved(true);
      }
    }
    checkAuth();
  }, [router]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          // Completely unmount the loader once the fade is finished
          setLoading(false);
        }
      });
      
      tl.to({ val: 0 }, {
        val: 100,
        duration: 2.4,
        ease: "power2.inOut",
        onUpdate: function() {
          if (progressRef.current) {
            progressRef.current.innerText = Math.round(this.targets()[0].val) + "%";
          }
        },
        onComplete: () => {
          // Trigger the workspace mount so its GSAP starts exactly as the loader starts fading!
          setShowWorkspace(true);
        }
      })
      .to(loaderRef.current, {
        opacity: 0,
        scale: 1.05,
        filter: "blur(10px)",
        duration: 0.8, // Slightly longer fade to beautifully cross-fade with the staggered entrance
        ease: "power2.inOut"
      }, "+=0.1"); // tiny pause at 100%
    });
    return () => ctx.revert();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/auth");
  };

  const workspaceUser: UserProfileData | null = user ? {
    name: user.name || "Authenticated User",
    email: user.email,
    status: user.is_verified ? "Verified" : "Authenticated",
  } : null;

  return (
    <>
      {/* The actual workspace (Mounts behind the loader at 100% to start its animations) */}
      {(showWorkspace && authResolved) && (
        <SovereignWorkspace 
          user={workspaceUser} 
          onLogout={handleLogout} 
        />
      )}

      {/* The Loader Overlay */}
      {loading && (
        <div ref={loaderRef} className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#050507] z-50 pointer-events-none">
          <div className="w-full h-full flex flex-col items-center justify-center relative pointer-events-auto">
            <div className="flex flex-col items-center gap-10">
              <div className="relative w-20 h-20 mx-auto flex justify-center items-center">
                <div className="absolute inset-0 rounded-full blur-2xl animate-pulse" style={{ background: "rgba(0,163,255,0.15)" }} />
                <div className="relative z-10">
                  <Avatar size="lg" color="cyan" shape="squircle" />
                </div>
              </div>
              
              <div className="relative overflow-hidden px-5 py-2 rounded-full flex items-center justify-center bg-black/60 backdrop-blur-xl shadow-[0_8px_32px_-8px_rgba(255,255,255,0.08),inset_0_0_0_1px_rgba(255,255,255,0.08),inset_0_-4px_20px_-4px_rgba(255,255,255,0.12)] text-white/50">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70%] h-[1px] bg-gradient-to-r from-transparent via-[#A1A1AA] to-transparent opacity-60 pointer-events-none" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[40%] h-[3px] bg-[#A1A1AA] blur-sm opacity-30 pointer-events-none" />
                <span className="relative z-10 tracking-widest uppercase text-[11px] font-mono text-[#A1A1AA]">Securing Workspace...</span>
              </div>
            </div>
            
            {/* Big Bottom-Right Counter */}
            <span 
              ref={progressRef} 
              className="absolute bottom-8 right-12 text-[64px] font-light text-white/60 tabular-nums tracking-tight" 
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}
            >
              0%
            </span>
          </div>
        </div>
      )}
    </>
  );
}
