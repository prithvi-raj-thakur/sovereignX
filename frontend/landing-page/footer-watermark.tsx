"use client";

import React from "react";

export default function FooterWatermark() {
  return (
    <div className="footer-watermark-container relative flex flex-col items-center">
      {/* Intense Glowing Backdrop */}
      <div className="watermark-glow"></div>

      <div className="footer-watermark" aria-hidden="true">
        <div className="watermark-text">
          SovereignX
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap');
        
        .footer-watermark-container {
          background: #000000;
          padding-top: 40px;
          padding-bottom: 0px; /* Flush to bottom */
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end; /* Align elements to the bottom */
          width: 100%;
          position: relative;
          min-height: 400px;
          overflow: hidden;
        }

        .watermark-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 80vw;
          height: 300px;
          background: radial-gradient(ellipse at center, rgba(30, 93, 215, 0.45) 0%, rgba(0, 163, 255, 0.15) 40%, transparent 70%);
          filter: blur(60px);
          z-index: 0;
          pointer-events: none;
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .footer-watermark-container:hover .watermark-glow {
          background: radial-gradient(ellipse at center, rgba(30, 93, 215, 0.7) 0%, rgba(0, 163, 255, 0.3) 40%, transparent 70%);
          width: 90vw;
          filter: blur(70px);
        }

        /* WATERMARK */
        .footer-watermark {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: flex-end; /* Hug the bottom */
          position: relative;
          z-index: 1;
        }

        .watermark-text {
          font-family: 'DM Sans', sans-serif;
          font-weight: 800;
          font-size: 19vw; /* Truly massive, edge-to-edge width */
          line-height: 1.1; /* Restored to prevent background-clip from truncating the 'i' and 'g' */
          letter-spacing: -0.05em; /* Tighter kerning for massive scale */
          background: linear-gradient(180deg, #ffffff 0%, #a2c8fd 25%, #1e5dd7 65%, #050a0f 100%);
          -webkit-background-clip: text;
          color: transparent;
          opacity: 0.9;
          user-select: auto;
          cursor: default;
          white-space: nowrap;
          position: relative;
          z-index: 2;
          transform: scaleY(1.1);
          transform-origin: bottom center; /* Ensure it scales from the bottom up on hover */
          width: 100%;
          text-align: center;
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          filter: drop-shadow(0 0 0px transparent);
          margin-bottom: -2vw; /* Shifted up just enough to make the 'g' perfectly visible with a minimal gap */
        }

        .footer-watermark-container:hover .watermark-text {
          letter-spacing: -0.03em;
          transform: scaleY(1.1);
          filter: drop-shadow(0 0 20px rgba(0, 163, 255, 0.3));
          opacity: 1;
        }

        /* Adds a sharp inner shadow effect to the text edge */
        .watermark-text::after {
          content: 'SovereignX';
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.8) 100%);
          -webkit-background-clip: text;
          color: transparent;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
