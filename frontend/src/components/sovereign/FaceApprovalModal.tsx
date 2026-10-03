import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

interface FaceApprovalModalProps {
  isOpen: boolean;
  onApprove: () => void;
  onCancel: () => void;
  codeSnippet?: string;
}

export default function FaceApprovalModal({ isOpen, onApprove, onCancel, codeSnippet }: FaceApprovalModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  
  const [status, setStatus] = useState<"AWAITING_OPERATOR" | "OPERATOR_PRESENT">("AWAITING_OPERATOR");
  const [stream, setStream] = useState<MediaStream | null>(null);

  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      gsap.fromTo(modalRef.current, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.4, ease: "power3.out" });
    }
  }, [isOpen]);

  useEffect(() => {
    let pollingInterval: any = null;

    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240, facingMode: "user" } });
        setStream(mediaStream);
        streamRef.current = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }

        pollingInterval = setInterval(async () => {
          if (videoRef.current && canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
              ctx.drawImage(videoRef.current, 0, 0, 320, 240);
              const base64Image = canvasRef.current.toDataURL("image/jpeg", 0.7);
              
              try {
                const apiUrl = process.env.NEXT_PUBLIC_AI_API_URL || "http://localhost:8000";
                const res = await fetch(`${apiUrl}/api/v1/auth/verify-face`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ image_base64: base64Image })
                });
                const data = await res.json();
                
                if (data.approved) {
                  setStatus("OPERATOR_PRESENT");
                  clearInterval(pollingInterval);
                  
                  // Visual indicator
                  if (videoRef.current) {
                    gsap.to(videoRef.current, { borderColor: "#10b981", boxShadow: "0 0 20px #10b981", duration: 0.3 });
                  }
                  
                  setTimeout(() => {
                    cleanup();
                    onApprove();
                  }, 1000);
                }
              } catch (err) {
                console.error("Face verification error:", err);
              }
            }
          }
        }, 600);
      } catch (err) {
        console.error("Camera error:", err);
      }
    };

    if (isOpen) {
      setStatus("AWAITING_OPERATOR");
      startCamera();
    }

    const cleanup = () => {
      if (pollingInterval) clearInterval(pollingInterval);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };

    return cleanup;
  }, [isOpen]);

  const handleCancel = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    onCancel();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div ref={modalRef} className="relative w-full max-w-lg p-[1px] rounded-2xl bg-gradient-to-b from-blue-500/30 to-transparent shadow-[0_0_50px_rgba(0,100,255,0.2)]">
        <div className="bg-[#0a0a0f] rounded-2xl p-6 border border-white/5">
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Biometric Authorization Required
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            Awaiting physical operator presence to authorize Secure Enclave execution.
          </p>

          <div className="relative w-full h-[240px] bg-black rounded-lg overflow-hidden border border-white/10 mb-6 flex items-center justify-center">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="absolute inset-0 w-full h-full object-cover transition-colors duration-300 border-[3px] border-transparent rounded-lg box-border"
            />
            {status === "AWAITING_OPERATOR" && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="w-full h-[2px] bg-blue-500/50 shadow-[0_0_10px_#3b82f6] animate-[scan_2s_ease-in-out_infinite]" />
              </div>
            )}
            {status === "OPERATOR_PRESENT" && (
              <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center z-10 pointer-events-none">
                 <span className="px-4 py-2 bg-green-500/20 border border-green-500 text-green-400 font-bold rounded-lg backdrop-blur-md">
                   VERIFIED
                 </span>
              </div>
            )}
            <canvas ref={canvasRef} width="320" height="240" className="hidden" />
          </div>

          {codeSnippet && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Pending Execution Payload</h3>
              <pre className="bg-black/50 p-3 rounded-lg text-xs text-blue-300 font-mono overflow-x-auto border border-white/5 max-h-32">
                {codeSnippet}
              </pre>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button 
              onClick={handleCancel}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors"
            >
              Abort
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(240px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
