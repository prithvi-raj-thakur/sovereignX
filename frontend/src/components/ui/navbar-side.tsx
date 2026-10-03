"use client";
import React, { useState, useRef, useEffect } from "react";

import { motion, useMotionValue, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { FaLinkedin, FaGithub, FaDribbble, FaFigma } from "react-icons/fa";

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
    initial: { x: "calc(100% + 100px)" },
    enter: { x: "0", transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] as const } },
    exit: {
        x: "calc(100% + 100px)",
        transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] as const },
    },
};

const defaultNavItems: iNavItem[] = [
    {
        heading: "About",
        href: "#about",
        subheading: "The scroll reveal para",
    },
    {
        heading: "Architecture",
        href: "#architecture",
        subheading: "Bento grid",
    },
    {
        heading: "Approach",
        href: "#approach",
        subheading: "The 6 points",
    },
    {
        heading: "FAQs",
        href: "#faqs",
        subheading: "Common questions",
    },
    {
        heading: "Pricing",
        href: "#pricing",
        subheading: "Our plans",
    },
];

const CustomFooter: React.FC = () => {
    return (
        <div className="flex w-full text-sm justify-between text-white/60 px-10 md:px-24 py-8">
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                <FaLinkedin size={24} />
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                <FaGithub size={24} />
            </a>
            <a href="https://dribbble.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                <FaDribbble size={24} />
            </a>
            <a href="https://www.figma.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                <FaFigma size={24} />
            </a>
        </div>
    );
};

const NavLink: React.FC<iNavLinkProps> = ({
    heading,
    href,
    setIsActive,
    index,
}) => {
    const ref = useRef<HTMLAnchorElement | null>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const handleMouseMove = (
        e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    ) => {
        const rect = ref.current!.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        x.set(mouseX / rect.width - 0.5);
        y.set(mouseY / rect.height - 0.5);
    };

    const handleClick = () => {
        return setIsActive(false);
    };

    const isExternalLink = href.startsWith("http");
    const linkProps = isExternalLink
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {};

    return (
        <motion.div
            onClick={handleClick}
            initial="initial"
            whileHover="whileHover"
            className="group relative flex items-center justify-between border-b border-white/10 py-4 transition-colors duration-500 md:py-8 uppercase"
            {...linkProps}
        >
            <Link ref={ref} onMouseMove={handleMouseMove} href={href}>
                <div className="relative flex items-start">
                    <span className="text-white/60 group-hover:text-white transition-colors duration-500 text-3xl md:text-4xl font-thin mr-4">
                        0{index}.
                    </span>
                    <div className="flex flex-row gap-2">
                        <motion.span
                            variants={{
                                initial: { x: 0 },
                                whileHover: { x: -16 },
                            }}
                            transition={{
                                type: "spring",
                                staggerChildren: 0.075,
                                delayChildren: 0.25,
                            }}
                            className="relative z-10 block text-4xl md:text-5xl font-extralight text-white/60 group-hover:text-white transition-colors duration-500 tracking-tight"
                        >
                            {heading.split("").map((letter, i) => {
                                return (
                                    <motion.span
                                        key={i}
                                        variants={{
                                            initial: { x: 0 },
                                            whileHover: { x: 16 },
                                        }}
                                        transition={{ type: "spring" }}
                                        className="inline-block"
                                    >
                                        {letter}
                                    </motion.span>
                                );
                            })}
                        </motion.span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

const Curve: React.FC = () => {
    const [windowHeight, setWindowHeight] = useState(0);

    useEffect(() => {
        setWindowHeight(window.innerHeight);
        const handleResize = () => setWindowHeight(window.innerHeight);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const initialPath = `M100 0 L200 0 L200 ${windowHeight} L100 ${windowHeight} Q-100 ${windowHeight / 2} 100 0`;
    const targetPath = `M100 0 L200 0 L200 ${windowHeight} L100 ${windowHeight} Q100 ${windowHeight / 2} 100 0`;

    const curve = {
        initial: { d: initialPath },
        enter: {
            d: targetPath,
            transition: { duration: 1, ease: [0.76, 0, 0.24, 1] as const },
        },
        exit: {
            d: initialPath,
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] as const },
        },
    };

    if (windowHeight === 0) return null;

    return (
        <svg
            className="absolute top-0 -left-[99px] w-[100px] stroke-none h-full"
            style={{ fill: "#0A0D14" }}
        >
            <motion.path
                variants={curve}
                initial="initial"
                animate="enter"
                exit="exit"
            />
        </svg>
    );
};

const CurvedNavbar: React.FC<
    iCurvedNavbarProps & { footer?: React.ReactNode }
> = ({ setIsActive, navItems, footer }) => {
    return (
        <motion.div
            variants={MENU_SLIDE_ANIMATION}
            initial="initial"
            animate="enter"
            exit="exit"
            className="h-[100dvh] w-screen max-w-screen-sm fixed right-0 top-0 z-40 bg-[#0A0D14]"
        >
            <div className="h-full pt-20 flex flex-col justify-between">
                <div className="flex flex-col text-5xl gap-3 mt-0 px-10 md:px-24">
                    <div className="text-white/60 border-b border-white/10 uppercase text-sm mb-4 pb-4">
                        <p>Navigation</p>
                    </div>
                    <section className="bg-transparent mt-0">
                        <div className="mx-auto max-w-7xl">
                            {navItems.map((item, index) => {
                                return (
                                    <NavLink
                                        key={item.href}
                                        {...item}
                                        setIsActive={setIsActive}
                                        index={index + 1}
                                    />
                                );
                            })}
                        </div>
                    </section>
                </div>
                {footer}
            </div>
            <Curve />
        </motion.div>
    );
};

const Header: React.FC<iHeaderProps> = ({
    navItems = defaultNavItems,
    footer = <CustomFooter />,
}) => {
    const [isActive, setIsActive] = useState(false);
    const openAudioRef = useRef<HTMLAudioElement | null>(null);
    const closeAudioRef = useRef<HTMLAudioElement | null>(null);

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
            <div className="relative">
                <div
                    onClick={handleClick}
                    className="fixed right-4 top-4 md:right-8 md:top-8 z-50 w-16 h-16 rounded-full flex items-center justify-center cursor-pointer bg-[#0A0D14]/80 backdrop-blur-md border border-white/10 hover:bg-[#0A0D14] transition-all"
                >
                    <div className="relative w-8 h-5 flex flex-col justify-between items-center">
                        <span
                            className={`block h-[2px] w-8 bg-white/80 transition-transform duration-300 origin-center ${isActive ? "rotate-45 translate-y-[9px]" : ""}`}
                        ></span>
                        <span
                            className={`block h-[2px] w-8 bg-white/80 transition-opacity duration-300 ${isActive ? "opacity-0" : ""}`}
                        ></span>
                        <span
                            className={`block h-[2px] w-8 bg-white/80 transition-transform duration-300 origin-center ${isActive ? "-rotate-45 -translate-y-[9px]" : ""}`}
                        ></span>
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {isActive && (
                    <CurvedNavbar
                        setIsActive={setIsActive}
                        navItems={navItems}
                        footer={footer}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default Header;
