"use client";

import * as React from "react";
import { FluidBlobs } from "./FluidBlobs";
import { GlowEffect } from "./glow-effect";

export interface BlobCardProps {
    header?: React.ReactNode;
    children?: React.ReactNode;
    headerHeight?: number;
    lightColors?: string[];
    darkColors?: string[];
    glowColors?: string[];
    className?: string;
}

const DEFAULT_LIGHT = ["#B7FF00", "#F4F4F0", "#8B8F88", "#B7FF00"];
const DEFAULT_DARK = ["#B7FF00", "#0D0F0D", "#8B8F88", "#050505"];
const DEFAULT_GLOW = ["#B7FF00", "#8B8F88", "#F4F4F0", "#0D0F0D", "#B7FF00"];

export function BlobCard({
    header,
    children,
    headerHeight = 224,
    lightColors = DEFAULT_LIGHT,
    darkColors = DEFAULT_DARK,
    glowColors = DEFAULT_GLOW,
    className,
}: BlobCardProps) {
    return (
        <div className={`relative w-full ${className || ""}`.trim()}>
            <div className="absolute -inset-[1.5px] rounded-[21.5px] overflow-hidden z-0">
                <GlowEffect
                    colors={glowColors}
                    mode="rotate"
                    blur="strongest"
                    duration={5}
                    scale={1}
                />
            </div>

            <div className="relative z-10 rounded-[20px] overflow-hidden bg-[#0A0A0A] h-full flex flex-col">
                <div
                    className="relative overflow-hidden rounded-t-[20px] shrink-0"
                    style={{ height: headerHeight }}
                >
                    <FluidBlobs
                        lightColors={lightColors}
                        darkColors={darkColors}
                        origins={[
                            { x: 50, y: -55 },
                            { x: 50, y: -25 },
                            { x: 50, y: -25 },
                            { x: 50, y: -25 },
                        ]}
                        margin={60}
                        blur={50}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0A0A0A] pointer-events-none" />
                    {header && <div className="relative z-10 p-8 pb-0">{header}</div>}
                </div>

                {children && <div className="flex-grow flex flex-col">{children}</div>}
            </div>
        </div>
    );
}