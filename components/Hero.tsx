"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowDown,
  ArrowRight,
  Bot,
  Calculator,
  CloudSun,
  GitBranch,
  Mouse,
  Search,
  Sparkles
} from "lucide-react";

import PortalBackground from "@/components/PortalBackground";

const heroWords = ["Think.", "Choose.", "Use Tools."];

const floatingTools = [
  { label: "Calculator", detail: "₹396 in 18 * 22", icon: Calculator, className: "left-0 top-12" },
  { label: "Weather", detail: "Open-Meteo live", icon: CloudSun, className: "right-0 top-20" },
  { label: "Web Search", detail: "Tavily-ready", icon: Search, className: "bottom-16 left-6" },
  { label: "Gemini Ready", detail: "Function calls", icon: Bot, className: "bottom-8 right-6" }
];

export default function Hero() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;

    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.from(".hero-word", {
        y: 54,
        autoAlpha: 0,
        filter: "blur(12px)",
        duration: 0.9,
        stagger: 0.12,
        ease: "power3.out"
      });

      gsap.from(".hero-float-card", {
        y: 32,
        autoAlpha: 0,
        scale: 0.92,
        duration: 0.75,
        stagger: 0.08,
        delay: 0.35,
        ease: "power3.out"
      });

      gsap.to(".hero-parallax", {
        yPercent: -14,
        scale: 0.96,
        autoAlpha: 0.72,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="relative isolate min-h-[92vh] overflow-hidden px-4 pb-12 pt-10 sm:px-6 lg:px-8">
      <PortalBackground intensity="strong" />

      <div className="mx-auto grid w-full max-w-7xl gap-10 lg:min-h-[78vh] lg:grid-cols-[1fr_0.86fr] lg:items-center">
        <div className="hero-parallax relative z-10">
          <div className="hero-word mb-5 inline-flex items-center gap-2 rounded-lg border border-electricBlue/25 bg-electricBlue/10 px-3 py-2 text-xs font-semibold uppercase tracking-normal text-sky-100 shadow-glow">
            <Sparkles className="h-4 w-4 text-electricBlue" />
            TOOL-USING AI AGENT
          </div>

          <h1 className="hero-word text-5xl font-semibold leading-none tracking-normal text-white sm:text-7xl lg:text-8xl">
            ToolMind AI
          </h1>

          <div className="mt-6 space-y-1 text-5xl font-semibold leading-none text-white sm:text-7xl lg:text-8xl">
            {heroWords.map((word) => (
              <div key={word} className="hero-word overflow-hidden">
                <span className="inline-block bg-gradient-to-r from-white via-sky-100 to-purple-100 bg-clip-text text-transparent">
                  {word}
                </span>
              </div>
            ))}
          </div>

          <p className="hero-word mt-7 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
            An agentic AI assistant that turns questions into tool calls, calculations, weather checks, web search, and clear answers.
          </p>

          <div className="hero-word mt-8 flex flex-wrap gap-3">
            <a
              href="#demo"
              className="inline-flex items-center gap-2 rounded-lg bg-electricBlue px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
            >
              Try the Agent
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#story"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-neonPurple/60 hover:bg-neonPurple/15"
            >
              See the Flow
            </a>
            <a
              href="https://github.com/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/10"
            >
              <GitBranch className="h-4 w-4" />
              GitHub
            </a>
          </div>
        </div>

        <div className="hero-parallax relative mx-auto flex min-h-[430px] w-full max-w-xl items-center justify-center sm:min-h-[560px]">
          <div className="hero-portal-shell">
            <div className="hero-portal-ring" />
            <div className="hero-portal-ring hero-portal-ring-inner" />
            <div className="hero-portal-core">
              <Sparkles className="h-10 w-10 text-electricBlue" />
              <span>Agent Loop</span>
              <small>Question to tool trace</small>
            </div>
            <span className="orbit-dot orbit-dot-a" />
            <span className="orbit-dot orbit-dot-b" />
            <span className="orbit-dot orbit-dot-c" />
          </div>

          {floatingTools.map((tool, index) => {
            const Icon = tool.icon;

            return (
              <motion.div
                key={tool.label}
                animate={{ y: [0, index % 2 === 0 ? -12 : 12, 0] }}
                transition={{ duration: 4.5 + index * 0.4, repeat: Infinity, ease: "easeInOut" }}
                className={`hero-float-card absolute ${tool.className} rounded-lg border border-white/10 bg-slate-950/70 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-electricBlue/25 bg-electricBlue/10 text-electricBlue">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{tool.label}</p>
                    <p className="mt-1 text-xs text-slate-400">{tool.detail}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="absolute bottom-5 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs font-medium uppercase tracking-normal text-slate-400 sm:flex">
        <span>Scroll to explore</span>
        <span className="flex h-10 w-6 items-start justify-center rounded-full border border-white/15 bg-white/[0.045] p-1">
          <Mouse className="h-4 w-4 animate-bounce text-electricBlue" />
        </span>
        <ArrowDown className="h-4 w-4 animate-bounce text-slate-500" />
      </div>
    </section>
  );
}
