"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface OtpStepProps {
    email: string;
    onVerify: (otp: string) => Promise<void>;
    onChangeEmail: () => void;
    onSuccessComplete?: () => void;
}

export default function OtpStep({ email, onVerify, onChangeEmail, onSuccessComplete }: OtpStepProps) {
    const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [countdown, setCountdown] = useState(30);
    const [isSuccessAnim, setIsSuccessAnim] = useState(false);
    const [isErrorAnim, setIsErrorAnim] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (countdown > 0 && !isSuccessAnim) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown, isSuccessAnim]);

    const handleChange = (index: number, value: string) => {
        if (!/^[0-9]*$/.test(value)) return;
        
        setError("");
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        if (newOtp.every(digit => digit !== "")) {
            handleVerify(newOtp.join(""));
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text/plain").replace(/[^0-9]/g, "").slice(0, 6);
        if (!pastedData) return;
        
        const newOtp = [...otp];
        for (let i = 0; i < pastedData.length; i++) {
            newOtp[i] = pastedData[i];
        }
        setOtp(newOtp);
        
        if (pastedData.length < 6) {
            inputRefs.current[pastedData.length]?.focus();
        } else {
            inputRefs.current[5]?.focus();
            handleVerify(newOtp.join(""));
        }
    };

    const handleVerify = async (otpString: string) => {
        setIsLoading(true);
        try {
            await onVerify(otpString);
            setIsSuccessAnim(true);
            
            if (onSuccessComplete) {
                setTimeout(() => {
                    onSuccessComplete();
                }, 3000); 
            }
        } catch (err: any) {
            setIsErrorAnim(true);
            setError(err.message || "Invalid code. Please try again.");
            setIsLoading(false);
        }
    };

    const handleTryAgain = () => {
        setIsErrorAnim(false);
        setOtp(Array(6).fill(""));
        setError("");
        setTimeout(() => {
            inputRefs.current[0]?.focus();
        }, 300);
    };

    const handleResend = async () => {
        if (countdown === 0) {
            try {
                const res = await fetch('/api/auth/send-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                if (!res.ok) throw new Error("Couldn't resend the code. Please try again.");
                setCountdown(30);
                setError("");
            } catch (err: any) {
                setError(err.message || "Couldn't resend the code. Please try again.");
            }
        }
    };

    return (
        <div className="flex flex-col items-center w-full min-h-[300px]">
            {/* Header Area */}
            <div className="relative w-full h-[80px] mb-6 flex justify-center text-center">
                <AnimatePresence mode="wait">
                    {!isSuccessAnim ? (
                        <motion.div 
                            key="otp-text"
                            initial={{ opacity: 1 }}
                            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="absolute inset-0 flex flex-col items-center"
                        >
                            <h1 className="mt-2 font-title text-32 font-semibold leading-none tracking-snugger text-white lg:text-32 md:text-28 xs:mt-3 xs:text-24">
                                Verify your email
                            </h1>
                            <p className="text-white opacity-40 text-14 mt-3 max-w-[260px] leading-relaxed">
                                We've sent a 6-digit code to <br/>
                                <span className="text-white opacity-100 font-medium">{email}</span>
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success-text"
                            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            transition={{ delay: 1.8, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            className="absolute inset-0 flex flex-col items-center justify-center mt-2"
                        >
                            <h1 className="mt-2 font-title text-32 font-semibold leading-none tracking-snugger text-white lg:text-32 md:text-28 xs:mt-3 xs:text-24">
                                Verified successfully
                            </h1>
                            <p className="text-white opacity-40 text-14 mt-3">Your email has been verified.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Main Interaction Area */}
            <div className="relative w-full flex items-center justify-center h-[72px] mt-4">
                {/* OTP Inputs */}
                <motion.div 
                    className="flex gap-2 sm:gap-2.5 w-full justify-center relative z-10"
                    animate={
                        isSuccessAnim ? { rotate: 360, scale: [1, 1, 1, 0] } 
                        : isErrorAnim ? { rotate: -360, scale: [1, 1, 1, 0] }
                        : error ? { x: [-5, 5, -5, 5, 0] } : {}
                    }
                    transition={
                        isSuccessAnim || isErrorAnim ? { 
                            rotate: { duration: 1.0, ease: "easeInOut" },
                            scale: { duration: 1.1, times: [0, 0.7, 0.9, 1], ease: "backIn" }
                        } 
                        : { duration: 0.4 }
                    }
                >
                    {otp.map((digit, index) => {
                        // Calculate offset from center so they can collapse perfectly
                        const startX = (index - 2.5) * 54; 

                        return (
                            <div key={index} className="relative w-11 h-14 sm:w-[46px] sm:h-[58px] flex items-center justify-center">
                                {/* Moving/Animated Border Glow using a spinning gradient */}
                                {!isSuccessAnim && digit !== "" && !error && (
                                    <motion.div
                                        className="absolute -inset-[1px] rounded-[10px] opacity-100 z-0 overflow-hidden"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        <motion.div 
                                            className="absolute -inset-[50%] bg-[conic-gradient(from_0deg,transparent_0%,rgba(209,208,255,1)_30%,transparent_50%)]"
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                        />
                                    </motion.div>
                                )}

                                <motion.input
                                    ref={(el) => { inputRefs.current[index] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={handlePaste}
                                    disabled={isLoading || isSuccessAnim}
                                    autoFocus={index === 0}
                                    animate={isSuccessAnim ? {
                                        x: -startX, // All inputs move to the exact center
                                        borderColor: "#FFAA81",
                                        borderRadius: "50%",
                                        backgroundColor: "#FFAA81", // peach glow for success
                                        color: "transparent",
                                        boxShadow: "0 0 20px rgba(255,170,129,0.8)",
                                    } : isErrorAnim ? {
                                        x: -startX,
                                        borderColor: "#ef4444",
                                        borderRadius: "50%",
                                        backgroundColor: "#ef4444",
                                        color: "transparent",
                                        boxShadow: "0 0 20px rgba(239,68,68,0.8)",
                                    } : {
                                        x: 0,
                                        borderColor: error ? "rgba(239,68,68,0.8)" : digit !== "" ? "rgba(209,208,255,0.8)" : "rgba(255,255,255,0.3)",
                                        borderRadius: "8px",
                                        backgroundColor: "#000000",
                                        color: error ? "#f87171" : digit !== "" ? "#ffffff" : "#ffffff",
                                    }}
                                    transition={(isSuccessAnim || isErrorAnim) ? {
                                        x: { duration: 0.8, ease: "backIn" }, // Collapse over 0.8s
                                        borderRadius: { duration: 0.3 },
                                        backgroundColor: { duration: 0.3, delay: 0.5 },
                                    } : {
                                        duration: 0.2
                                    }}
                                    className={`absolute inset-0 w-full h-full text-center text-xl font-medium font-mono border outline-none transition-all z-10
                                        ${error ? 'text-red-400 focus:border-red-500 focus:ring-[rgba(239,68,68,0.5)]' 
                                        : 'focus:border-transparent focus:ring-2 focus:ring-[rgba(209,208,255,0.5)]'}
                                        ${(isSuccessAnim || isErrorAnim) ? 'pointer-events-none' : ''}
                                    `}
                                />
                            </div>
                        );
                    })}
                </motion.div>
                
                {/* Success Indicator (Peach Tick) */}
                <AnimatePresence>
                    {isSuccessAnim && (
                        <motion.div 
                            className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 1.0, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        >
                            {/* Peach glow background */}
                            <motion.div
                                className="absolute w-[140px] h-[140px] bg-[#FFAA81]/15 rounded-full blur-[28px]"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 1.1, duration: 0.6, ease: "easeOut" }}
                            />
                            
                            {/* Rounded Square */}
                            <motion.div 
                                className="w-[64px] h-[64px] bg-[#000000] rounded-[20px] flex items-center justify-center relative shadow-xl z-10"
                                initial={{ borderColor: "rgba(255, 170, 129, 0)", borderWidth: 2 }}
                                animate={{ 
                                    borderColor: "rgba(255, 170, 129, 1)",
                                    boxShadow: "0 0 24px rgba(255,170,129,0.25), inset 0 0 12px rgba(255,170,129,0.1)"
                                }}
                                transition={{ delay: 1.1, duration: 0.4, ease: "easeInOut" }}
                            >
                                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                                    <motion.path
                                        d="M6 12.5L10 16.5L18 7.5"
                                        stroke="#FFFFFF"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        animate={{ pathLength: 1, opacity: 1 }}
                                        transition={{ delay: 1.3, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                    />
                                </svg>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Error Indicator (Red Cross) */}
                <AnimatePresence>
                    {isErrorAnim && (
                        <motion.div 
                            className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0, transition: { delay: 0, duration: 0.2 } }}
                            transition={{ delay: 1.0, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        >
                            {/* Red glow background */}
                            <motion.div
                                className="absolute w-[140px] h-[140px] bg-red-500/15 rounded-full blur-[28px]"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ delay: 1.1, duration: 0.6, ease: "easeOut" }}
                            />
                            
                            {/* Rounded Square */}
                            <motion.div 
                                className="w-[64px] h-[64px] bg-[#000000] rounded-[20px] flex items-center justify-center relative shadow-xl z-10"
                                initial={{ borderColor: "rgba(239, 68, 68, 0)", borderWidth: 2 }}
                                animate={{ 
                                    borderColor: "rgba(239, 68, 68, 1)",
                                    boxShadow: "0 0 24px rgba(239,68,68,0.25), inset 0 0 12px rgba(239,68,68,0.1)"
                                }}
                                exit={{ opacity: 0, scale: 0 }}
                                transition={{ delay: 1.1, duration: 0.4, ease: "easeInOut" }}
                            >
                                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                                    <motion.path
                                        d="M16 8L8 16M8 8L16 16"
                                        stroke="#FFFFFF"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        animate={{ pathLength: 1, opacity: 1 }}
                                        transition={{ delay: 1.3, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                    />
                                </svg>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom Actions Area */}
            <div className="relative w-full h-[70px] mt-8 flex justify-center">
                <AnimatePresence mode="wait">
                    {!isSuccessAnim && !isErrorAnim && (
                        <motion.div 
                            key="normal-actions"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="absolute inset-0 flex flex-col items-center gap-4 w-full text-13"
                        >
                            <div className="flex justify-center items-center text-white opacity-60 gap-1.5">
                                <span>Didn't receive the code?</span>
                                <button 
                                    onClick={handleResend}
                                    disabled={countdown > 0 || isLoading}
                                    className={`font-semibold transition-colors ${countdown === 0 ? 'text-[#D1D0FF] hover:text-white opacity-100 cursor-pointer' : 'cursor-not-allowed'}`}
                                >
                                    {countdown > 0 ? `Resend in ${countdown}s` : 'Resend'}
                                </button>
                            </div>
                            
                            <button 
                                onClick={onChangeEmail}
                                disabled={isLoading}
                                className="text-white opacity-40 hover:opacity-100 transition-opacity font-medium mt-1"
                            >
                                Change email address
                            </button>
                        </motion.div>
                    )}
                    {isErrorAnim && (
                        <motion.div 
                            key="error-actions"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                            transition={{ delay: 1.5, duration: 0.4, ease: "easeOut" }}
                            className="absolute inset-0 flex flex-col items-center gap-4 w-full text-13"
                        >
                            <p className="text-red-400 font-medium">{error}</p>
                            <div className="flex justify-center items-center gap-3">
                                <button 
                                    onClick={handleTryAgain}
                                    className="bg-red-500 text-white rounded-[4px] font-bold px-5 py-2 hover:bg-red-400 transition-all uppercase"
                                >
                                    Try again
                                </button>
                                <button 
                                    onClick={onChangeEmail}
                                    className="text-white opacity-80 border border-white/20 rounded-[4px] font-bold px-5 py-2 hover:bg-white/10 hover:opacity-100 transition-all uppercase"
                                >
                                    Back
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
