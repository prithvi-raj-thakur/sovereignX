"use client";

import React, { ReactNode, useEffect, useRef, useState } from "react";

interface FooterStickyRevealProps {
    children: ReactNode;
    className?: string;
}

export function FooterStickyReveal({ children, className = "" }: FooterStickyRevealProps) {
    const [footerHeight, setFooterHeight] = useState(0);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!contentRef.current) return;
        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                setFooterHeight(entry.contentRect.height);
            }
        });
        resizeObserver.observe(contentRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    // Until height is measured, render normally without sticky wrapper to prevent jank
    if (footerHeight === 0) {
        return (
            <div ref={contentRef} className={`w-full ${className}`}>
                {children}
            </div>
        );
    }

    return (
        <div
            className="relative w-full"
            style={{ 
                height: footerHeight,
                clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" 
            }}
        >
            <div 
                className="relative w-full"
                style={{ 
                    height: `calc(100vh + ${footerHeight}px)`, 
                    top: "-100vh" 
                }}
            >
                <div 
                    className="w-full sticky"
                    style={{ 
                        height: footerHeight,
                        top: `calc(100vh - ${footerHeight}px)`
                    }}
                >
                    <div ref={contentRef} className={`w-full ${className}`}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
