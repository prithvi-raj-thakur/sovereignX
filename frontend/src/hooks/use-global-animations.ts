"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function useGlobalAnimations() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      
      // 1. Fade Up (Staggered Batch)
      ScrollTrigger.batch("[data-animate='fade-up']", {
        interval: 0.1, 
        batchMax: 10,
        start: "top 85%",
        onEnter: (batch) => gsap.fromTo(batch, 
          { opacity: 0, y: 50 }, 
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out", overwrite: true }
        ),
        onLeave: (batch) => gsap.to(batch, { opacity: 0, y: -20, duration: 0.4, overwrite: true }),
        onEnterBack: (batch) => gsap.fromTo(batch, 
          { opacity: 0, y: -50 }, 
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out", overwrite: true }
        ),
        onLeaveBack: (batch) => gsap.to(batch, { opacity: 0, y: 50, duration: 0.4, overwrite: true })
      });

      // 2. Fade In (Staggered Batch)
      ScrollTrigger.batch("[data-animate='fade-in']", {
        interval: 0.1, 
        start: "top 85%",
        onEnter: (batch) => gsap.fromTo(batch, 
          { opacity: 0 }, 
          { opacity: 1, duration: 1, stagger: 0.1, ease: "power2.out", overwrite: true }
        ),
        onLeave: (batch) => gsap.to(batch, { opacity: 0, duration: 0.5, overwrite: true }),
        onEnterBack: (batch) => gsap.fromTo(batch, 
          { opacity: 0 }, 
          { opacity: 1, duration: 1, stagger: 0.1, ease: "power2.out", overwrite: true }
        ),
        onLeaveBack: (batch) => gsap.to(batch, { opacity: 0, duration: 0.5, overwrite: true })
      });

      // 3. Scale In (Staggered Batch)
      ScrollTrigger.batch("[data-animate='scale-in']", {
        interval: 0.1,
        start: "top 85%",
        onEnter: (batch) => gsap.fromTo(batch, 
          { opacity: 0, scale: 0.9 }, 
          { opacity: 1, scale: 1, duration: 0.8, stagger: 0.1, ease: "back.out(1.5)", overwrite: true }
        ),
        onLeave: (batch) => gsap.to(batch, { opacity: 0, scale: 1.05, duration: 0.4, overwrite: true }),
        onEnterBack: (batch) => gsap.fromTo(batch, 
          { opacity: 0, scale: 1.05 }, 
          { opacity: 1, scale: 1, duration: 0.8, stagger: 0.1, ease: "back.out(1.5)", overwrite: true }
        ),
        onLeaveBack: (batch) => gsap.to(batch, { opacity: 0, scale: 0.9, duration: 0.4, overwrite: true })
      });

      // 4. Slide Left (Cinematic Entrance)
      ScrollTrigger.batch("[data-animate='slide-left']", {
        interval: 0.1,
        start: "top 85%",
        onEnter: (batch) => gsap.fromTo(batch, 
          { opacity: 0, x: -60 }, 
          { opacity: 1, x: 0, duration: 1, stagger: 0.1, ease: "power4.out", overwrite: true }
        ),
        onLeave: (batch) => gsap.to(batch, { opacity: 0, x: -20, duration: 0.4, overwrite: true }),
        onEnterBack: (batch) => gsap.fromTo(batch, 
          { opacity: 0, x: -60 }, 
          { opacity: 1, x: 0, duration: 1, stagger: 0.1, ease: "power4.out", overwrite: true }
        ),
        onLeaveBack: (batch) => gsap.to(batch, { opacity: 0, x: -60, duration: 0.4, overwrite: true })
      });

      // 5. Slide Right (Cinematic Entrance)
      ScrollTrigger.batch("[data-animate='slide-right']", {
        interval: 0.1,
        start: "top 85%",
        onEnter: (batch) => gsap.fromTo(batch, 
          { opacity: 0, x: 60 }, 
          { opacity: 1, x: 0, duration: 1, stagger: 0.1, ease: "power4.out", overwrite: true }
        ),
        onLeave: (batch) => gsap.to(batch, { opacity: 0, x: 20, duration: 0.4, overwrite: true }),
        onEnterBack: (batch) => gsap.fromTo(batch, 
          { opacity: 0, x: 60 }, 
          { opacity: 1, x: 0, duration: 1, stagger: 0.1, ease: "power4.out", overwrite: true }
        ),
        onLeaveBack: (batch) => gsap.to(batch, { opacity: 0, x: 60, duration: 0.4, overwrite: true })
      });

    });

    return () => ctx.revert();
  }, []);
}
