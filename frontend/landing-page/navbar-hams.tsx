"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { FaLinkedin, FaGithub, FaDribbble, FaFigma } from "react-icons/fa";
import { LiquidButton } from "@/components/ui/liquid-glass-card";

interface iNavItem {
    heading: string;
    href: string;
    subheading?: string;
    imgSrc?: string;
}

interface iNavLinkProps extends iNavItem {
    setIsActive: (isActive: boolean) => void;
    index: number;
}

interface iCurvedNavbarProps {
    setIsActive: (isActive: boolean) => void;
    navItems: iNavItem[];
}

interface iHeaderProps {
    navItems?: iNavItem[];
    footer?: React.ReactNode;
}

const MENU_SLIDE_ANIMATION = {
    initial: { x: "100%" },
    enter: { x: "0%", transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
    exit: { x: "100%", transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const defaultNavItems: iNavItem[] = [
    { heading: "About", href: "#about", subheading: "The scroll reveal para" },
    { heading: "Architecture", href: "#architecture", subheading: "Bento grid" },
    { heading: "Approach", href: "#approach", subheading: "The 6 points" },
    { heading: "FAQs", href: "#faqs", subheading: "Common questions" },
    { heading: "Pricing", href: "#pricing", subheading: "Our plans" },
];

const CustomFooter: React.FC = () => {
    return (
        <div className="flex w-full justify-between text-white/50 px-10 md:px-16 py-10 mt-auto">
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors hover:scale-110 duration-300">
                <FaLinkedin size={24} />
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors hover:scale-110 duration-300">
                <FaGithub size={24} />
            </a>
            <a href="https://dribbble.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors hover:scale-110 duration-300">
                <FaDribbble size={24} />
            </a>
            <a href="https://www.figma.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors hover:scale-110 duration-300">
                <FaFigma size={24} />
            </a>
        </div>
    );
};

const NavLink: React.FC<iNavLinkProps> = ({ heading, href, setIsActive, index }) => {
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        setIsActive(false);
        if (href.startsWith("#")) {
            e.preventDefault();
            const targetId = href.substring(1);
            const element = document.getElementById(targetId);
            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }
    };

    const isExternalLink = href.startsWith("http");
    const linkProps = isExternalLink ? { target: "_blank", rel: "noopener noreferrer" } : {};

    return (
        <motion.div
            initial="initial"
            whileHover="whileHover"
            className="group relative flex items-center justify-between border-b border-white/10 py-5 transition-colors duration-500 md:py-6"
        >
            <Link href={href} onClick={handleClick} className="w-full" {...linkProps}>
                <div className="relative flex items-center">
                    <span className="text-white/40 group-hover:text-white transition-colors duration-500 text-lg md:text-xl font-medium font-sans mr-6 w-8">
                        0{index}
                    </span>
                    <div className="flex flex-row gap-2">
                        <motion.span
                            variants={{ initial: { x: 0 }, whileHover: { x: 10 } }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="relative z-10 block text-3xl md:text-4xl font-semibold font-sans text-white/80 group-hover:text-white transition-colors duration-500 tracking-tight"
                        >
                            {heading}
                        </motion.span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

const CurvedNavbar: React.FC<iCurvedNavbarProps & { footer?: React.ReactNode }> = ({ setIsActive, navItems, footer }) => {
    return (
        <motion.div
            variants={MENU_SLIDE_ANIMATION}
            initial="initial"
            animate="enter"
            exit="exit"
            className="h-[100dvh] w-[90vw] md:w-[450px] fixed right-0 top-0 z-[995] bg-black/50 backdrop-blur-3xl border-l border-white/10 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] overflow-y-auto overflow-x-hidden"
        >
            <div className="min-h-full pt-28 flex flex-col relative z-10">
                <div className="flex flex-col gap-3 px-10 md:px-16 flex-grow">
                    <div className="text-white/50 border-b border-white/20 uppercase text-xs font-semibold tracking-[0.2em] mb-4 pb-4 font-sans">
                        <p>Navigation</p>
                    </div>
                    <section className="bg-transparent mt-0 w-full">
                        <div className="mx-auto w-full">
                            {navItems.map((item, index) => (
                                <NavLink key={item.href} {...item} setIsActive={setIsActive} index={index + 1} />
                            ))}
                        </div>
                    </section>
                </div>
                {footer}
            </div>
        </motion.div>
    );
};

export function NavbarHams({ navItems = defaultNavItems, footer = <CustomFooter /> }: iHeaderProps) {
    const [isActive, setIsActive] = useState(false);
    const openAudioRef = useRef<HTMLAudioElement | null>(null);
    const closeAudioRef = useRef<HTMLAudioElement | null>(null);

    // Prevent scrolling when menu is open
    useEffect(() => {
        if (isActive) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; }
    }, [isActive]);

    const handleClick = () => {
        if (isActive) {
            closeAudioRef.current?.play().catch(() => {});
        } else {
            openAudioRef.current?.play().catch(() => {});
        }
        setIsActive(!isActive);
    };

    return (
        <>
            <LiquidButton
                onClick={handleClick}
                className="relative z-[1000] h-12 w-12 rounded-full bg-black/20 hover:bg-black/40 border border-white/10 transition-colors cursor-pointer"
                size="icon"
                variant="ghost"
                aria-label="Toggle menu"
            >
                <div className="relative w-5 h-[14px] flex flex-col justify-between items-center">
                    <span className={`block h-[1.5px] w-5 rounded-full bg-white transition-all duration-300 origin-center ${isActive ? "rotate-45 translate-y-[6.25px]" : ""}`}></span>
                    <span className={`block h-[1.5px] w-5 rounded-full bg-white transition-all duration-300 ${isActive ? "opacity-0" : ""}`}></span>
                    <span className={`block h-[1.5px] w-5 rounded-full bg-white transition-all duration-300 origin-center ${isActive ? "-rotate-45 -translate-y-[6.25px]" : ""}`}></span>
                </div>
            </LiquidButton>

            <AnimatePresence mode="wait">
                {isActive && (
                    <motion.div
                        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
                        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        transition={{ duration: 0.4 }}
                        onClick={handleClick}
                        className="fixed inset-0 w-screen h-screen z-[990] bg-black/30"
                    />
                )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
                {isActive && <CurvedNavbar setIsActive={setIsActive} navItems={navItems} footer={footer} />}
            </AnimatePresence>
        </>
    );
}
