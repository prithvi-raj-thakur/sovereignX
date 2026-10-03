"use client";

import React, { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState(false);

  const handleSubscribe = () => {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(true);
      return;
    }
    setError(false);
    setSubscribed(true);
  };

  return (
    <footer className="footer-container">
      {/* Footer Wrapper */}
      <div className="footer-wrapper">
        
        {/* LEFT CARD */}
        <div className="footer-left">
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="absolute inset-0 h-full w-full object-cover pointer-events-none"
          >
            <source
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260503_104800_bc43ae09-f494-43e3-97d7-2f8c1692cfd7.mp4"
              type="video/mp4"
            />
          </video>
          
          <div className="footer-logo">
            <div className="footer-logo-mark">SX</div>
            <span className="footer-logo-text">SoveringX</span>
          </div>

          <div className="footer-left-content">
            <div className="footer-tagline-container">
              Secure intelligence,<br />
              <span>without leaving your environment.</span>
            </div>

            <div className="footer-social-row">
              <span className="stay-secure">Stay secure.</span>
              <div className="social-icons">
                <a href="#" aria-label="X" className="social-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a href="#" aria-label="LinkedIn" className="social-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="#" aria-label="GitHub" className="social-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
                <a href="#" aria-label="Discord" className="social-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT CARD */}
        <div className="footer-right">
          <div className="footer-lucky-graphic">
            <span className="lucky-text">SX</span>
            <div className="airgap-label">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="airgap-arrow">
                <path d="M9 21c4.4-4 8-8 8-12"/>
                <path d="M17 9v-4h-4"/>
              </svg>
              <span>Built for the air gap.</span>
            </div>
          </div>

          <div className="footer-right-top">
            <nav className="footer-nav-cols">
              <div className="nav-col">
                <h3>Platform</h3>
                <a href="#">Workbench</a>
                <a href="#">Agentic AI</a>
                <a href="#">Security</a>
                <a href="#">Deployment</a>
                <a href="#">Documentation</a>
              </div>
              <div className="nav-col">
                <h3>Company</h3>
                <a href="#">About</a>
                <a href="#">Blog</a>
                <a href="#">Contact</a>
                <a href="#">Privacy Policy</a>
                <a href="#">Terms & Conditions</a>
              </div>
            </nav>
          </div>

          <div className="footer-bottom">
            <div className="copyright">
              © 2026 SoveringX. All rights reserved.
            </div>

            <div className="footer-cta-mini">
              <div className="cta-text">
                AI stays where your data lives.<br />
                <strong>Build without leaving the perimeter.</strong>
              </div>

              <div className="footer-subscribe-wrapper">
                <div className="footer-subscribe-row">
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSubscribe();
                    }}
                    aria-label="Email address for newsletter"
                  />
                  <button onClick={handleSubscribe}>
                    {subscribed ? "Subscribed \u2713" : "Subscribe"}
                  </button>
                </div>
                {error && <div className="subscribe-error">Enter a valid email address.</div>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-watermark" aria-hidden="true">
        <div className="watermark-text">
          SoveringX
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@500;600;700&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap');
        
        .footer-container {
          font-family: 'DM Sans', sans-serif;
          width: 100%;
          background: transparent;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-top: 48px;
          padding-bottom: 24px;
          position: relative;
          overflow: hidden;
        }

        .footer-wrapper {
          display: grid;
          grid-template-columns: minmax(400px, 30%) 1fr;
          gap: 24px;
          max-width: 1550px;
          width: 100%;
          margin: 0 auto;
          padding: 0 40px;
          position: relative;
          z-index: 10;
        }

        /* LEFT CARD */
        .footer-left {
          min-height: 340px;
          border-radius: 28px;
          padding: 32px;
          overflow: hidden;
          background: #101827;
          box-shadow: 0 12px 40px rgba(20, 72, 200, 0.25);
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
          z-index: 2;
        }

        .footer-logo-mark {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(255,255,255,0.15);
          border: 1.5px solid rgba(255,255,255,0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .footer-logo-text {
          font-size: 22px;
          font-weight: 700;
          color: white;
          letter-spacing: -0.02em;
        }

        .footer-left-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .footer-tagline-container {
          font-size: 19px;
          font-weight: 400;
          color: white;
          line-height: 1.45;
        }

        .footer-tagline-container span {
          color: rgba(255,255,255,0.65);
        }

        .footer-social-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stay-secure {
          font-family: 'Caveat', cursive;
          font-size: 17px;
          font-weight: 600;
          color: rgba(255,255,255,0.9);
          transform: rotate(-3deg);
        }

        .social-icons {
          display: flex;
          gap: 8px;
        }

        .social-icon {
          width: 36px;
          height: 36px;
          border-radius: 9px;
          background: #0e1014;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          transition: all 0.25s ease;
        }

        .social-icon:hover {
          background: #000000;
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(0,0,0,0.35), 0 2px 6px rgba(0,0,0,0.2);
        }

        /* RIGHT CARD */
        .footer-right {
          background: #0a0a0c;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 28px;
          padding: 40px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.4);
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .footer-lucky-graphic {
          position: absolute;
          top: -36px;
          right: 40px;
          width: 96px;
          height: 96px;
          border-radius: 22px;
          transform: rotate(-10deg);
          background: linear-gradient(135deg, #5b9ffb 0%, #1e5dd7 55%, #1448be 100%);
          box-shadow: inset 3px 3px 8px rgba(255,255,255,0.35), inset -3px -3px 12px rgba(0,0,0,0.18), 8px 14px 28px rgba(20,72,200,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .lucky-text {
          color: white;
          font-size: 30px;
          font-weight: 700;
          transform: rotate(10deg);
        }

        .airgap-label {
          position: absolute;
          top: 100%;
          right: -55px; 
          display: flex;
          align-items: flex-start;
          gap: 6px;
          transform: rotate(10deg);
          margin-top: 16px;
          white-space: nowrap;
        }

        .airgap-label span {
          font-family: 'Caveat', cursive;
          font-size: 20px;
          font-weight: 600;
          color: #9ca3af;
        }

        .airgap-arrow {
          color: #9ca3af;
          width: 22px;
          height: 22px;
          margin-top: -8px;
          transform: rotate(40deg) scaleX(-1);
        }

        .footer-nav-cols {
          display: flex;
          gap: 72px;
        }

        .nav-col h3 {
          font-family: 'Caveat', cursive;
          font-size: 24px;
          font-weight: 600;
          font-style: italic;
          color: #9ca3af;
          margin-bottom: 20px;
          margin-top: 0;
        }

        .nav-col {
          display: flex;
          flex-direction: column;
        }

        .nav-col a {
          font-size: 14px;
          font-weight: 600;
          color: #9ca3af;
          margin-bottom: 14px;
          transition: color 0.2s ease;
          text-decoration: none;
        }

        .nav-col a:hover {
          color: #ffffff;
        }

        .footer-bottom {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-top: 48px;
        }

        .copyright {
          font-size: 12.5px;
          font-weight: 500;
          color: #9ca3af;
          margin-bottom: 6px;
        }

        .footer-cta-mini {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          text-align: right;
          gap: 16px;
        }

        .cta-text {
          font-size: 15px;
          font-weight: 400;
          color: #9ca3af;
          line-height: 1.4;
        }

        .cta-text strong {
          font-size: 19px;
          font-weight: 700;
          color: #ffffff;
        }

        .footer-subscribe-wrapper {
          position: relative;
        }

        .footer-subscribe-row {
          display: flex;
          align-items: center;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 5px;
          width: 310px;
        }

        .footer-subscribe-row input {
          flex: 1;
          padding: 11px 14px;
          font-size: 13.5px;
          border: none;
          outline: none;
          background: transparent;
          color: white;
          width: 100%;
        }
        
        .footer-subscribe-row input::placeholder {
          color: rgba(255,255,255,0.3);
        }

        .footer-subscribe-row button {
          background: #ffffff;
          color: #000000;
          font-size: 13.5px;
          font-weight: 600;
          border-radius: 8px;
          padding: 11px 22px;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 6px 20px rgba(255,255,255,0.1), 0 2px 8px rgba(255,255,255,0.05);
          white-space: nowrap;
        }

        .footer-subscribe-row button:hover {
          background: #e5e7eb;
          transform: translateY(-1px);
        }

        .subscribe-error {
          font-size: 12px;
          color: #ef4444;
          margin-top: 6px;
          position: absolute;
          bottom: -20px;
          right: 0;
        }

        /* WATERMARK */
        .footer-watermark {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: -20px;
          position: relative;
          z-index: 1;
          overflow: hidden;
        }

        .watermark-text {
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          font-size: 20vw;
          line-height: 1;
          letter-spacing: -0.04em;
          background: linear-gradient(-45deg, #00A3FF, #0a0a0c, #1e5dd7, #000000);
          background-size: 300% 300%;
          animation: shaderGradient 12s ease infinite;
          -webkit-background-clip: text;
          color: transparent;
          opacity: 0.15;
          user-select: none;
          white-space: nowrap;
          text-transform: capitalize;
        }

        @keyframes shaderGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* RESPONSIVE */
        @media (max-width: 860px) {
          .footer-wrapper {
            grid-template-columns: 1fr;
          }
          .footer-bottom {
            align-items: flex-start;
          }
          .footer-cta-mini {
            align-items: flex-start;
            text-align: left;
          }
          .subscribe-error {
            right: auto;
            left: 0;
          }
        }

        @media (max-width: 560px) {
          .footer-right {
            padding: 24px;
          }
          .footer-nav-cols {
            gap: 40px;
          }
          .footer-bottom {
            flex-direction: column;
            align-items: flex-start;
            gap: 24px;
          }
          .footer-subscribe-row {
            width: 100%;
          }
          .footer-lucky-graphic {
            right: 12px;
            top: -28px;
            width: 72px;
            height: 72px;
          }
          .lucky-text {
            font-size: 23px;
          }
          .airgap-label {
            right: 15px;
            margin-top: 8px;
          }
          .airgap-label span {
            font-size: 16px;
          }
          .airgap-arrow {
            width: 16px;
            height: 16px;
            margin-top: -6px;
          }
        }
      `}</style>
    </footer>
  );
}
