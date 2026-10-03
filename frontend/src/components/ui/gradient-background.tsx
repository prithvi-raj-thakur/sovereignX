"use client"

import { GrainGradient } from "@paper-design/shaders-react"

export function GradientBackground() {
    return (
        <div className="absolute inset-0 -z-10">
            <GrainGradient
                style={{ height: "100%", width: "100%" }}
                colorBack="hsl(0, 0%, 0%)"
                softness={0.76}
                intensity={0.45}
                noise={0}
                shape="corners"
                offsetX={0}
                offsetY={0}
                scale={1}
                rotation={0}
                speed={1}
                // Colors matched exactly from the SovereignX footer card (#5b9ffb, #1e5dd7, #1448be)
                colors={["hsla(214, 87%, 75%, 1.00)", "hsl(220, 75%, 48%)", "hsl(222, 81%, 41%)"]}
            />
        </div>
    )
}
