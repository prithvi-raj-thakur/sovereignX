"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import AuthLayout from "./AuthLayout";
import OtpStep from "./OtpStep";
import "./styles.css";

export default function Login() {
  const [step, setStep] = useState("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [direction, setDirection] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
        setError("Email and Password are required");
        return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || 'Login failed');
        }

        if (data.token) {
          localStorage.setItem('token', data.token);
          if (data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
          }
        }
        
        router.push("/dashboard");
    } catch (err: any) {
        setError(err.message || "Something went wrong.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleOtpVerify = async (otp: string) => {
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Invalid OTP');
    }
  };

  const handleChangeEmail = () => {
    setDirection(-1);
    setStep("form");
  };

  const handleSuccessComplete = () => {
    router.push("/");
  };

  const formVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 30 : -30,
      opacity: 0,
      filter: "blur(8px)",
      scale: 0.95
    }),
    center: {
      x: 0,
      opacity: 1,
      filter: "blur(0px)",
      scale: 1
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -30 : 30,
      opacity: 0,
      filter: "blur(8px)",
      scale: 0.95
    })
  };

  return (
    <AuthLayout>
      <section className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden py-safe px-safe xs:px-5">
        <div className="relative z-10 h-[560px] w-[480px] bg-transparent px-12 pt-14 lg:w-[464px] lg:px-10 lg:pt-[54px] md:px-11 xs:h-auto xs:py-8 xs:w-full xs:max-w-sm xs:px-5 border border-white/10 rounded-[20px] xs:rounded-[18px]">
          <div className="absolute inset-0 -z-10 overflow-hidden rounded-[20px] xs:rounded-[18px]">
            <img src="/images/woblo-bg.jpg" className="absolute inset-0 w-full h-full object-cover opacity-80" alt="Background" />
            <div className="absolute inset-0 bg-black/60"></div>
          </div>

          <main className="relative w-full h-full flex items-center justify-center">
            <AnimatePresence custom={direction} mode="wait">
              {step === "form" && (
                <motion.div
                  key="form"
                  custom={direction}
                  variants={formVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full absolute"
                >
                  <h1 className="font-title text-36 font-semibold leading-none tracking-snugger text-white lg:text-32 md:text-28 xs:text-24 text-center">
                    Sign in to SovereignX
                  </h1>
                  
                  <form onSubmit={handleFormSubmit} className="mt-7 flex flex-col lg:mt-6 xs:mt-5 w-full" noValidate>
                    <label className="block text-14 leading-snug tracking-snugger text-grey-60" htmlFor="email">
                        Email
                    </label>
                    <div className="relative mt-0.5 xs:mb-2 w-full">
                        {email !== "" && !error && !isLoading && (
                            <motion.div
                                className="absolute -inset-[1px] rounded-[5px] opacity-100 z-0 overflow-hidden"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <motion.div 
                                    className="absolute -inset-[150%] bg-[conic-gradient(from_0deg,transparent_0%,rgba(209,208,255,1)_20%,transparent_50%)]"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                />
                            </motion.div>
                        )}
                        <input
                            className="remove-autocomplete-styles relative block h-[42px] w-full appearance-none rounded-[4px] border !bg-black px-3 py-[9px] text-15 tracking-snugger text-white placeholder-white/20 outline-none autofill:!text-white md:h-[41px] sm:text-16 z-10 border-white/10 focus:ring-[rgba(209,208,255,0.5)]"
                            id="email"
                            autoComplete="email"
                            placeholder="name@work-email.com"
                            required
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>

                    <label className="mt-4 block text-14 leading-snug tracking-snugger text-grey-60" htmlFor="password">
                        Password
                    </label>
                    <div className="relative mt-0.5 xs:mb-2 w-full">
                        {password !== "" && !error && !isLoading && (
                            <motion.div
                                className="absolute -inset-[1px] rounded-[5px] opacity-100 z-0 overflow-hidden"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <motion.div 
                                    className="absolute -inset-[150%] bg-[conic-gradient(from_0deg,transparent_0%,rgba(209,208,255,1)_20%,transparent_50%)]"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                />
                            </motion.div>
                        )}
                        <input
                            className="remove-autocomplete-styles relative block h-[42px] w-full appearance-none rounded-[4px] border !bg-black px-3 py-[9px] pr-10 text-15 tracking-snugger text-white placeholder-white/20 outline-none autofill:!text-white md:h-[41px] sm:text-16 z-10 border-white/10 focus:ring-[rgba(209,208,255,0.5)]"
                            id="password"
                            placeholder="Enter your password"
                            required
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/40 hover:text-white/80 focus:outline-none z-20"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                            ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                            )}
                        </button>
                    </div>

                    {error && (
                        <div className="text-red-400 text-sm text-center mt-2 animate-in fade-in">
                            {error}
                        </div>
                    )}

                    <div className="mt-[24px] h-11 xs:mt-4 xs:h-10 w-full group relative rounded-full">
                        <button 
                            type="submit" 
                            disabled={!email || !password || isLoading}
                            className={`transition-all duration-300 uppercase font-bold flex items-center justify-center h-11 w-full text-13 text-black -tracking-[0.015em] relative z-10 rounded-full border border-white/60 bg-white px-16 xs:h-10 overflow-hidden shadow-[0_0_15px_rgba(255,255,255,0.3)] ${(!email || !password || isLoading) ? 'opacity-70 cursor-not-allowed' : 'hover:bg-grey-5 group-hover:shadow-[0_0_25px_rgba(255,170,129,0.5)]'}`}
                        >
                            <div
                                className="absolute inset-0 w-[200%] h-full opacity-0 group-hover:opacity-100 transition-all duration-700 ease-in-out -translate-x-[50%] group-hover:translate-x-0 z-0 bg-cover bg-center pointer-events-none mix-blend-multiply"
                                style={{ backgroundImage: 'url(/images/woblo-button.svg)' }}
                            ></div>
                            <span className="whitespace-nowrap text-14 uppercase leading-[42px] relative z-20">
                                {isLoading ? "Sending..." : "Log in"}
                            </span>
                        </button>
                    </div>
                  </form>

                  <div className="relative mt-[22px] flex items-center w-full">
                    <div className="h-px w-full bg-[linear-gradient(90deg,#443D59_0%,#2D2F31_50.9%)]"></div>
                    <span className="px-3.5 text-13 uppercase text-grey-40">Or</span>
                    <div className="h-px w-full bg-[linear-gradient(90deg,_#2D2F31_49.1%,_#2D2F31_100%)]"></div>
                  </div>
                  
                  <div className="mt-[22px] flex justify-center w-full">
                    <a
                        className="transition-colors duration-200 transition-all duration-200 uppercase font-bold flex items-center justify-center h-10 w-full text-12 text-white tracking-snugger rounded bg-grey-5 ring-1 ring-white/10 transition-all duration-200 hover:ring-white/15 gap-x-2 !text-13"
                        href="/api/auth/google"
                    >
                        <img
                            alt="Google Logo"
                            loading="lazy"
                            width="22"
                            height="22"
                            decoding="async"
                            data-nimg="1"
                            src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyMiAyMiI+PHBhdGggZmlsbD0idXJsKCNnb29nbGUtbG9nb19zdmdfX2EpIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xMSA1LjY3MmMxLjEyNyAwIDIuMjI1LjM2IDMuMTMzIDEuMDI4bDIuNzkxLTIuNjA1QTkuMDg1IDkuMDg1IDAgMCAwIDIuOTQ1IDYuNzU3YTkuMDYgOS4wNiAwIDAgMCAwIDguNDg2bDMuMDQ4LTIuNDM4YTUuMyA1LjMgMCAwIDEtLjMyMS0xLjgwNiA1LjMgNS4zIDAgMCAxIC4zMjEtMS44MDVBNS4zMyA1LjMzIDAgMCAxIDExIDUuNjcybTMuMDk4IDkuNjY0YTUuMzI1IDUuMzI1IDAgMCAxLTguMTA1LTIuNTNsLTMuMDQ4IDIuNDM3YTkuMTA1IDkuMTA1IDAgMCAwIDE3LjE2NC00LjI0MnYtLjY4OWEuNjkuNjkgMCAwIDAtLjY4Ny0uNjg3aC04LjA3OHYzLjc4MWg0LjQwNmwtLjAxNS4wM2E1LjMgNS4zIDAgMCAxLTEuNjQzIDEuODk0eiIgY2xpcC1ydWxlPSJldmVub2RkIi8+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnb29nbGUtbG9nb19zdmdfX2EiIHgxPSIxMSIgeDI9IjExIiB5MT0iMS44OTEiIHkyPSIyMC4xMSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPjxzdG9wIHN0b3AtY29sb3I9IiNmZmYiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNmZmYiIHN0b3Atb3BhY2l0eT0iLjYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48L3N2Zz4="
                            style={{ color: "transparent" }}
                        />
                        <span className="font-medium !normal-case">
                            Sign in with Google
                        </span>
                    </a>
                  </div>
                </motion.div>
              )}
              
              {step === "otp" && (
                <motion.div
                  key="otp"
                  custom={direction}
                  variants={formVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full absolute"
                >
                  <OtpStep 
                    email={email} 
                    onVerify={handleOtpVerify} 
                    onChangeEmail={handleChangeEmail}
                    onSuccessComplete={handleSuccessComplete}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </main>
          
          <div className="pointer-events-none" aria-hidden="true">
            <div className="absolute left-1/2 top-1/2 -z-20 aspect-square w-[1920px] max-w-none -translate-x-1/2 -translate-y-1/2 transform lg:w-[1880px] md:w-[1620px] sm:w-[1280px]">
              <video
                className="absolute inset-0 w-full h-full"
                width="1920"
                height="1920"
                autoPlay
                loop
                playsInline
                style={{ opacity: "1" }}
              >
                <source
                  src="/videos/pages/auth/bg.mp4?updated=20240620146606"
                  type="video/mp4"
                />
                <source
                  src="/videos/pages/auth/bg.webm?updated=20240620146606"
                  type="video/webm"
                />
              </video>
            </div>
            <img
              alt=""
              loading="lazy"
              width="1403"
              height="1000"
              decoding="async"
              data-nimg="1"
              className="absolute left-[28%] top-1/2 -z-20 max-w-none -translate-x-1/2 -translate-y-1/2 transform bg-blend-lighten blur-[4px] xs:left-20 xs:scale-90"
              src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAxNDAzIDEwMDAiPjxnIGZpbHRlcj0idXJsKCNiZy1jb2xvcl9zdmdfX2EpIiBvcGFjaXR5PSIuNzIiIHN0eWxlPSJtaXgtYmxlbmQtbW9kZTpwbHVzLWxpZ2h0ZXIiPjxlbGxpcHNlIGN4PSI5NzcuNSIgY3k9IjIyMC41IiBmaWxsPSIjQzM5NEZGIiByeD0iMzEuNSIgcnk9Ijc2LjUiIHRyYW5zZm9ybT0icm90YXRlKC05MCA5NzcuNSAyMjAuNSkiLz48L2c+PGcgZmlsdGVyPSJ1cmwoI2JnLWNvbG9yX3N2Z19fYikiIG9wYWNpdHk9Ii40MiIgc3R5bGU9Im1peC1ibGVuZC1tb2RlOnBsdXMtbGlnaHRlciI+PGVsbGlwc2UgY3g9IjU5NyIgY3k9IjYwMS41IiBmaWxsPSIjQzM5NEZGIiByeD0iNTciIHJ5PSIxMDMuNSIgdHJhbnNmb3JtPSJyb3RhdGUoMTgwIDU5NyA2MDEuNSkiLz48L2c+PGcgZmlsdGVyPSJ1cmwoI2JnLWNvbG9yX3N2Z19fYykiIG9wYWNpdHk9Ii4zIiBzdHlsZT0ibWl4LWJsZW5kLW1vZGU6cGx1cy1saWdodGVyIj48ZWxsaXBzZSBjeD0iNzU1LjE5NiIgY3k9IjQyMC44MiIgZmlsbD0iIzI3NEVEOSIgcng9IjcyLjA0NiIgcnk9IjQ4Mi4zNSIgdHJhbnNmb3JtPSJyb3RhdGUoNDkuNzQ0IDc1NS4xOTYgNDIwLjgyKSIvPjwvZz48ZyBmaWx0ZXI9InVybCgjYmctY29sb3Jfc3ZnX19kKSIgb3BhY2l0eT0iLjEiIHN0eWxlPSJtaXgtYmxlbmQtbW9kZTpwbHVzLWxpZ2h0ZXIiPjxlbGxpcHNlIGN4PSI0OTAuNTMzIiBjeT0iNzI1LjE1NyIgZmlsbD0iIzY1ODdGRiIgcng9IjEwOS44MDYiIHJ5PSIxNjMuODU5IiB0cmFuc2Zvcm09InJvdGF0ZSg1MS4yOSA0OTAuNTMzIDcyNS4xNTcpIi8+PC9gPjxnIGZpbHRlcj0idXJsKCNiZy1jb2xvcl9zdmdfX2UpIiBvcGFjaXR5PSIuMjMiIHN0eWxlPSJtaXgtYmxlbmQtbW9kZTpwbHVzLWxpZ2h0ZXIiPjxlbGxpcHNlIGN4PSIxMDc3LjczIiBjeT0iMjM4LjkzNiIgZmlsbD0idXJsKCNiZy1jb2xvcl9zdmdfX2YpIiByeD0iMTk1LjkyNyIgcnk9IjI1OS4xMjQiIHRyYW5zZm9ybT0icm90YXRlKDUxLjI5IDEwNzcuNzMgMjM4LjkzNikiLz48L2c+PGRlZnM+PGZpbHRlciBpZD0iYmctY29sb3Jfc3ZnX19hIiB3aWR0aD0iMzMzIiBoZWlnaHQ9IjI0MyIgeD0iODExIiB5PSI5OSIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIiBmaWx0ZXJVbml0cz0idXNlclNwYWNlT25Vc2UiPjxmZUZsb29kIGZsb29kLW9wYWNpdHk9IjAiIHJlc3VsdD0iQmFja2dyb3VuZEltYWdlRml4Ii8+PGZlQmxlbmQgaW49IlNvdXJjZUdyYXBoaWMiIGluMj0iQmFja2dyb3VuZEltYWdlRml4IiByZXN1bHQ9InNoYXBlIi8+PGZlR2F1c3NpYW5CbHVyIHJlc3VsdD0iZWZmZWN0MV9mb3JlZ3JvdW5kQmx1cl81NjgxXzI2ODAiIHN0ZERldmlhdGlvbj0iNDUiLz48L2ZpbHRlcj48ZmlsdGVy idD0iYmgtY29sb3Jfc3ZnX19lIiB3aWR0aD0iNTcyLjkyNiIgaGVpZ2h0PSI1NDUuNTc0IiB4PSI3OTEuMjY2IiB5PSItMzMuODUyIiBjb2xvci1pbnRlcnBvbGF0aW9uLWZpbHRlcnM9InNSR0IiIGZpbHRlclVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGZlRmxvb2QgZmxvb2Qtb3BhY2l0eT0iMCIgcmVzdWx0PSJCYWNrZ3JvdW5kSW1hZ2VGaXgiLz48ZmVCbGVuZCBpbj0iU291cmNlR3JhcGhpYyIgaW4yPSJCYWNrZ3JvdW5kSW1hZ2VGaXgiIHJlc3VsdD0ic2hhcGUiLz48ZmVHYXVzc2lhbkJsdXIgcmVzdWx0PSJlZmZlY3QxX2ZvcmVncm91bmRCbHVyXzU2ODFfMjY4MCIgc3RkRGV2aWF0aW9uPSIyNSIvPjwvZmlsdGVyPjxyYWRpYWxHcmFkaWVudCBpZD0iYmctY29sb3Jfc3ZnX19mIiBjeD0iMCIgY3k9IjAiIHI9IjEiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoMTk1LjkyNyAwIDAgMjU5LjEyNCAxMDc3LjczIDIzOC45MzYpIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agc3RvcC1jb2xvcj0iIzYzN0JGQSIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI0FBMDgxRkYiIHN0b3Atb3BhY2l0eT0iMCIvPjwvcmFkaWFsR3JhZGllbnQ+PC9kZWZzPjwvc3ZnPg=="
              style={{ color: "transparent" }}
            />
            <div className="absolute inset-0 -z-10 overflow-hidden rounded-[20px] shadow-[0px_4px_25px_rgba(11,13,16,0.8)] [transform:translateZ(0)] xs:rounded-[18px]">
              <img
                height="479"
                decoding="async"
                data-nimg="1"
                className="absolute left-[0.5px] top-0 max-w-none xs:left-0 xs:w-full xs:max-w-sm"
                src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCA0ODAgNDc5Ij48ZyBjbGlwLXBhdGg9InVybCgjZm9ybS1ib3JkZXJfc3ZnX19hKSI+PHBhdGggc3Ryb2tlPSJ1cmwoI2Zvcm0tYm9yZGVyX3N2Z19fYikiIGQ9Ik00NTkuOTk5IDEuNUg0NjBjNS4yMzEgMCAxMC4xMSAyLjU2OCAxMy42OTEgNi4xOTZDNDc3LjI3OSAxMS4zMjkgNDc5LjUgMTUuOTYgNDc5LjUgMjB2NDM5YzAgNC4wNDYtMi4yMjcgOC45MzEtNS44MiAxMi44MTYtMy41ODggMy44ODEtOC40NjQgNi42ODQtMTMuNjggNi42ODRIMjBjLTUuMjE2IDAtMTAuMDkyLTIuODAzLTEzLjY4LTYuNjg0QzIuNzI3IDQ2Ny45MzEuNSA0NjMuMDQ2LjUgNDU5VjIwYzAtNC4wNDYgMi4yMjctOC45MyA1LjgyLTEyLjgxNkM5LjkwOCAzLjMwNCAxNC43ODQuNSAyMCAuNXoiLz48cGF0aCBzdHJva2U9InVybCgjZm9ybS1ib3JkZXJfc3ZnX19jKSIgZD0iTTQ2NCAwSDIwLjU0QzkuNzUgMCAxIDYuODI0IDEgMTUuMjM5djQ0OC41MjVjMCA4LjQxNiA4Ljc0OSAxNS4yMzggMTkuNTQgMTUuMjM4SDQ2MS40NmMxMC43OTIgMCAxOS41NDEtNi44MjIgMTkuNTQxLTE1LjIzOFYxNS4yMzhjMC04LjQxNS03LjUtMTguMjM2LTE3LTE1LjIzN1oiLz48L2c+PGRlZnM+PHJhZGlhbEdyYWRpZW50IGlkPSJmb3JtLWJvcmRlcl9zdmdfX2IiIGN4PSIwIiBjeT0iMCIgcj0iMSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgwIDE4Ny45MjcgLTI0MS4wMDIgMCA0ODAuNTAxIC42MDkpIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agb2Zmc2V0PSIuMTY1IiBzdG9wLWNvbG9yPSIjRURFNEY2Ii8+PHN0b3Agb2Zmc2V0PSIuNTEiIHN0b3AtY29sb3I9IiM2MDUyRTAiLz48c3RvcCBvZmZzZXQ9Ii43MTUiIHN0b3AtY29sb3I9IiMyNTQ5QkYiIHN0b3Atb3BhY2l0eT0iLjUiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMyNTQ5QkYiIHN0b3Atb3BhY2l0eT0iMCIvPjwvcmFkaWFsR3JhZGllbnQ+PHJhZGlhbEdyYWRpZW50IGlkPSJmb3JtLWJvcmRlcl9zdmdfX2MiIGN4PSIwIiBjeT0iMCIgcj0iMSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgwIDEwNSAtMTM0LjY1NCAwIDEgMzYwKSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPjxzdG9wIHN0b3AtY29sb3I9IiNBMzgxRDIiIHN0b3Atb3BhY2l0eT0iLjkiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNBMzgxRDIiIHN0b3Atb3BhY2l0eT0iMCIvPjwvcmFkaWFsR3JhZGllbnQ+PGNsaXBQYXRoIGlkPSJmb3JtLWJvcmRlcl9zdmdfX2EiPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0wIDBoNDgwdjQ3OUgweiIvPjwvY2xpcFBhdGg+PC9kZWZzPjwvc3ZnPg=="
                style={{ color: "transparent" }}
              />
            </div>
          </div>
        </div>
        
        <div className="relative z-10 mt-4 flex items-center gap-x-1 text-14 leading-snug tracking-snugger">
          <span className="text-white opacity-40">Don't have an account?</span>
          <a className="text-grey-90 hover:text-white" href="/signup">
            Sign up
          </a>
        </div>
        
        <div className="relative z-10 mt-6 flex items-center gap-x-3 text-13 leading-snug tracking-snugger">
          <a
            className="transition-colors duration-200 text-white opacity-40 transition-opacity duration-200 hover:opacity-80"
            href="/legal/terms"
          >
            Terms of Use
          </a>
          <span className="block h-3 w-px bg-grey-30"></span>
          <a
            className="transition-colors duration-200 text-white opacity-40 transition-opacity duration-200 hover:opacity-80"
            href="/legal/privacy"
          >
            Privacy policy
          </a>
        </div>
      </section>
    </AuthLayout>
  );
}
