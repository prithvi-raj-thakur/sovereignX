# SovereignX Design System

## 01. Product Identity

SovereignX is an **Enterprise-grade Agentic AI Workbench for confidential data operating inside controlled infrastructure.**

The visual interface communicates:
- **Privacy & Sovereignty:** Your data never has to leave your environment.
- **Trust & Security:** Auditable execution and local intelligence.
- **Control & Reliability:** Human-in-the-loop oversight and deterministic interfaces.
- **Enterprise Readiness:** Technical sophistication for serious industrial, government, and defense users.

The product feels like **serious infrastructure**, a private AI command center rather than a consumer chatbot.

## 02. Core Design Philosophy

**"Your data never has to leave your environment."**

The experience is:
- **Premium:** Refined typography, exact spacing, and purposeful motion.
- **Technical:** Structured grids, monospaced metadata, and thin borders.
- **Minimal & Dark:** Calm and intelligent without visual noise or excessive neon.
- **Secure:** Clear hierarchical boundaries and semantic status indicators.

**Prohibited Aesthetics:** Generic SaaS, consumer chatbots, crypto dashboards, neon hacker UI, excessive glassmorphism, or colorful gradients.

## 03. Brand Principle

- **SOVEREIGN:** Data remains under organizational control.
- **X:** Execution layer / intelligence layer / agentic workflows.

**Visual Pipeline:**
`DATA` → `LOCAL MODEL` → `AGENTS` → `TOOLS` → `CONTROLLED WORKFLOW` → `AUDITABLE OUTPUT`

## 04. Color System

Based on the existing Tailwind v4 implementation (`globals.css`), SovereignX uses a strict dark-first palette.

**Backgrounds & Surfaces:**
- `Background`: `#030406` (Deep technical black - base canvas)
- `Surface`: `#0A0D14` (Elevated level 1 - standard cards, panels, popovers)
- `Surface Secondary`: `#050A0F` (Distinct surface for sidebars and navigation)
- `Surface Hover`: `#1E293B` (Subtle highlight for interactive surfaces)

**Borders:**
- `Border Default`: `#1E293B` (Slate 800 - structuring grids and cards)
- `Border Subtle`: `#0F172A` (Slate 900)
- `Border Strong`: `#334155` (Slate 700 - focus states, active borders)

**Typography:**
- `Primary Text`: `#F8FAFC` (Slate 50 - headings, primary data)
- `Secondary Text`: `#E2E8F0` (Slate 200 - body copy)
- `Muted Text`: `#94A3B8` (Slate 400 - metadata, disabled states, timestamps)

**Accents & Interaction:**
- `Primary Accent`: `#00A3FF` (Vibrant technical blue - main action, glow, focus)
- `Accent Hover`: `#2563EB` (Blue 600)
- `Accent Muted`: `rgba(0, 163, 255, 0.15)` (Subtle backgrounds for active items)

**Status & Semantic:**
- `Success`: `#10B981` (Emerald 500 - completed workflows, healthy agents)
- `Warning`: `#F59E0B` (Amber 500 - requires approval, awaiting input)
- `Error`: `#EF4444` (Red 500 - failures, disconnected models, security alerts)
- `Info`: `#3B82F6` (Blue 500 - system logs, running states)

*Colors must communicate hierarchy. Never use status colors purely as decoration.*

## 05. Typography System

The typography is technical, premium, and readable.

**Fonts:**
- **Primary:** `Geist Sans` (System fallback: Inter, sans-serif) - used for all UI text, buttons, and standard copy.
- **Display:** `Google Sans` / `Outfit` - used strictly for hero headings on the landing page.
- **Monospace:** `Geist Mono` - used for technical data, paths, identifiers, and logs.

**Scale:**
- **Display (Hero):** `text-6xl` to `text-8xl` (60px-96px), tracking-tight (`-0.02em`), leading `0.92`.
- **H1:** `text-4xl` (36px), font-semibold, tracking-tight (`-0.02em`), leading-tight.
- **H2:** `text-2xl` (24px), font-medium, leading-tight.
- **H3:** `text-lg` (18px), font-medium, leading-snug.
- **Body Large:** `text-base` (16px), text-secondary, leading-relaxed (`1.6`).
- **Body:** `text-sm` (14px), text-muted, leading-normal (`1.5`).
- **Caption / Metadata:** `text-xs` (12px), text-muted, uppercase tracking-wider.
- **Terminal / Code:** `text-xs` (12px), `font-mono`, tracking-widest.

## 06. Monospace System

Monospace (`Geist Mono`) must complement primary typography and is strictly used for:
- Repository paths (`/var/data/confidential`)
- Model names (`llama-3-8b-instruct`)
- Agent identifiers (`agent_0x4f2`)
- System logs & Terminal output
- Execution IDs (`exec_99a8b`)
- Timestamps (`[14:32:01]`)

## 07. Spacing System

A strict 4px/8px baseline grid:
- `4px` (`gap-1` / `p-1`): Micro spacing (icons to text).
- `8px` (`gap-2` / `p-2`): Tight component spacing (labels to inputs).
- `12px` (`gap-3` / `p-3`): Inner card padding (small).
- `16px` (`gap-4` / `p-4`): Standard UI spacing.
- `24px` (`gap-6` / `p-6`): Medium layout spacing (between form groups, panel padding).
- `32px` (`gap-8` / `p-8`): Section inner spacing.
- `48px` (`gap-12` / `p-12`): Major component separation.
- `64px` (`gap-16` / `p-16`): Landing page layout blocks.
- `96px` to `128px`: Major marketing section spacing.

## 08. Border & Radius System

**Borders:**
Thin, precise, low-noise. Default to `1px solid #1E293B`. Use `border-t`, `border-b` for dividers to avoid heavy card outlines everywhere.

**Border Radius:**
Restrained geometry. No excessive pill shapes.
- `0px`: Full sharp (technical edges, terminal panels)
- `2px` (`rounded-sm`): Micro elements (checkboxes)
- `4px` (`rounded`): Small interactive elements (inputs, tags)
- `6px` (`rounded-md`): Standard buttons, small cards
- `10px` (`rounded-lg` / `0.625rem`): Maximum radius for large elevated panels.

## 09. Layout & Grid System

- **Maximum Width:** `1440px` (Landing) / `100%` (Dashboard with sidebar).
- **Page Gutters:** Mobile `16px`, Tablet `24px`, Desktop `48px`.
- **Desktop Grid:** 12-column CSS grid (`grid-cols-12`). `gap-6`.
- **Dashboard Layout:** Fixed sidebar (`w-64`), flexible main content (`flex-1`).
- **Responsive:** Mobile transforms to 1-column layout. Avoid horizontal overflow.

## 10. Container System

- **Page Container:** `w-full min-h-screen bg-background`.
- **Section Container:** `max-w-[1440px] mx-auto px-6 md:px-12`.
- **Panel (Dashboard Modules):** `bg-[#0A0D14] border border-[#1E293B] rounded-[10px] p-6`.
- **Command Panel:** Minimal styling, sticky top or bottom, high contrast borders.
- **Terminal / Data Panel:** `bg-[#030406]` (darker than surface), sharp corners (`0px`), monospace typography.

## 11. Navigation (Navbar & Sidebar)

**Navbar (Landing):**
- **Height:** 64px (`h-16`).
- **Style:** Minimal, premium, transparent to blurred (`backdrop-blur-md bg-background/50`) on scroll.
- **Active State:** Text changes to `#F8FAFC`, subtle `#00A3FF` indicator.

**Sidebar (Workbench):**
- **Width:** 256px (`w-64`).
- **Background:** `#050A0F`.
- **Sections (if applicable):** Workspaces, Documents, Agents, Models, Workflows, Runs, Audit Logs, Settings.
- **Active State:** `bg-[#1E293B] text-[#00A3FF] border-r-2 border-[#00A3FF]`.

## 12. Workbench & UI Patterns

The core application is a **secure AI operating environment**.

**Document / Data Interface:**
- *Upload:* Premium drag-and-drop. States: `Uploading`, `OCR Processing`, `Indexed`, `Ready`, `Restricted`.
- *Previews:* Never expose sensitive content unnecessarily. Use redaction patterns (`██████`).

**AI Agent System:**
- *UI:* Agent Name (Mono), Role, Model, Status, Current Task.
- *States:* `Idle`, `Initializing`, `Thinking`, `Executing`, `Awaiting Approval`, `Completed`.
- *Motion:* Use subtle pulsing or typing indicators for active execution. No cartoon characters.

**Agentic Workflow Visualization:**
- Use nodes and connectors to represent pipelines (`Planner` → `Research` → `Analysis`).
- Visual language must feel like infrastructure orchestration.

**Model & Local Status:**
- Clearly communicate execution boundaries: `LOCAL INFERENCE RUNNING`, `AIR-GAPPED`, `OLLAMA / GPU`.
- Avoid fake security decoration. Use clear semantic tags.

**Approval / Human-in-the-loop:**
- Workflows that require approval show a `Warning` (Amber) state: `Awaiting Human Input`.
- Dangerous actions require confirmation modals.

**Audit & Terminal Logs:**
- *Format:* `[10:42:03] SYSTEM Workspace initialized`
- *Typography:* `Geist Mono`, `text-xs`.
- *Features:* Auto-scrolling, level filtering (INFO, ERROR, SUCCESS).

**Command Center & Metrics:**
- Prioritize: System status, Active workflows, Agent activity.
- Avoid vanity metrics. Use cards for: Processing time, Active agents, Local inference load.

## 13. Components

**Tables:**
- *Header:* Uppercase, `text-xs`, tracking-wider, `text-[#94A3B8]`. Border bottom only.
- *Row:* `border-b border-[#1E293B]`, `hover:bg-[#1E293B]/50` transition.

**Buttons:**
- *Height:* Standard `40px` (`h-10`).
- *Radius:* `6px` (`rounded-md`).
- *Primary:* `bg-[#00A3FF] text-[#030406]`.
- *Command (Start/Deploy):* `bg-[#1E293B] border border-[#334155] text-[#F8FAFC]`.
- *Destructive:* `bg-[#EF4444] text-white`.

**Forms:**
- *Inputs:* `bg-[#030406] border-[#1E293B] rounded-md h-10`.
- *Focus:* `focus:ring-1 focus:ring-[#00A3FF] border-[#00A3FF]`.
- *Labels:* `text-sm font-medium text-[#E2E8F0]`, above inputs.

**Modals:**
- *Overlay:* `bg-[#030406]/80 backdrop-blur-sm`.
- *Panel:* `bg-[#0A0D14] border border-[#1E293B] rounded-[10px] shadow-2xl`.

**Toasts:**
- Bottom-right. Dark background, colored left border indicating severity (Green/Amber/Red/Blue).

**Empty & Loading States:**
- *Empty:* Informative, centered muted icon, short title, helper text, CTA. No huge illustrations.
- *Loading:* Meaningful progress bars or structural skeletons (`pulsing #1E293B`). Avoid full-page spinners.

## 14. Animation & Motion Philosophy

Motion communicates system state and data movement, never making the app feel like a game.

**Timing:**
- Micro (Buttons/Hover): `150ms`.
- Standard (Modals/Tabs): `300ms`.
- Section Reveal: `600ms`.
- Easing: Smooth ease-out (`cubic-bezier(0.16, 1, 0.3, 1)` or GSAP `power3.out`).

**GSAP Rules:**
- Use `gsap.context()` in React.
- Always clean up `ScrollTrigger` in `useEffect` return.
- Animate `transform` and `opacity` only. Never animate `layout` properties, `box-shadow`, or `filter: blur` continuously.
- Do NOT use `mix-blend-screen` combined with GSAP scroll scrubbing on video elements (causes severe lag).

**Transitions & Scroll:**
- No dramatic page-curtain transitions. Navigation must remain fast.
- Landing page can use horizontal scrolling, masked text reveals, and staggered panels, provided they do not cause scroll jitter.

## 15. Accessibility & Performance

- **A11y:** Keyboard support (`focus-visible`), semantic HTML, contrast compliance. Do not communicate state using color alone (always pair with text/icons).
- **Performance:** Interface must be smooth on mid-range hardware. Avoid excessive blur, massive DOM animations, and layout thrashing.

## 16. Anti-Patterns (Prohibited)

❌ Random colors or rainbow gradients.
❌ Excessive glassmorphism or neon.
❌ Cyberpunk, gaming, or purple AI startup aesthetics.
❌ Pill-shaped everything (stick to 6px-10px radius).
❌ Fake system status or unsupported absolute security claims.
❌ Continuous heavy animations (e.g., blurring, box-shadow pulses on scroll).
❌ Generic "Something went wrong" errors (provide actionable technical context).

## 17. Page Creation Rule

Every future page must follow:
1. Read `/design.md`.
2. Inspect existing components; reuse primitives.
3. Follow design tokens, typography, spacing, and layout.
4. Test accessibility and performance.
5. Do not introduce a new visual pattern casually.

*Treat `/design.md` as a living design contract for SovereignX. It defines how the product should look, move, behave, and scale.*
