"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Brain, CheckCircle2, DatabaseZap, MessageSquareText, Sparkles } from "lucide-react";

import PortalBackground from "@/components/PortalBackground";

const storySteps = [
  {
    kicker: "Words become actions.",
    title: "Words become actions.",
    body: "A question enters the agent surface as plain language, not a rigid workflow.",
    icon: MessageSquareText
  },
  {
    kicker: "Read",
    title: "The agent reads your question.",
    body: "It identifies whether the request needs calculation, weather, search, or a combined path.",
    icon: Brain
  },
  {
    kicker: "Choose",
    title: "It chooses the right tool.",
    body: "Tool selection stays transparent, so every decision is visible in the timeline.",
    icon: DatabaseZap
  },
  {
    kicker: "Execute",
    title: "Tools return live results.",
    body: "The backend calls mathjs, Open-Meteo, Tavily, or Gemini-backed routing without exposing keys.",
    icon: CheckCircle2
  },
  {
    kicker: "Synthesize",
    title: "The final answer becomes clear.",
    body: "Tool outputs are combined into a concise answer with timings and a trace you can inspect.",
    icon: Sparkles
  }
];

export default function ScrollStory() {
  const rootRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".story-card");

      gsap.from(cards, {
        y: 56,
        autoAlpha: 0,
        filter: "blur(12px)",
        stagger: 0.12,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top 72%"
        }
      });

      gsap.to(progressRef.current, {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top center",
          end: "bottom center",
          scrub: true
        }
      });

      cards.forEach((card, index) => {
        ScrollTrigger.create({
          trigger: card,
          start: "top center",
          end: "bottom center",
          onEnter: () => setActiveIndex(index),
          onEnterBack: () => setActiveIndex(index)
        });
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  const activeStep = storySteps[activeIndex] ?? storySteps[0];

  return (
    <section id="story" ref={rootRef} className="relative overflow-hidden py-20 sm:py-24 lg:py-32">
      <PortalBackground withPortal={false} className="opacity-50" />
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="lg:sticky lg:top-24 lg:h-[70vh]">
          <p className="text-sm font-semibold uppercase tracking-normal text-electricBlue">Agentic loop</p>
          <motion.h2
            key={activeStep.title}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mt-4 max-w-xl text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl"
          >
            {activeStep.title}
          </motion.h2>
          <motion.p
            key={activeStep.body}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="mt-5 max-w-lg text-base leading-7 text-slate-300 sm:text-lg"
          >
            {activeStep.body}
          </motion.p>
          <div className="mt-8 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.055] px-3 py-2 text-xs font-semibold uppercase tracking-normal text-slate-300">
            <span className="h-2 w-2 rounded-full bg-successGreen shadow-[0_0_18px_rgba(16,185,129,0.8)]" />
            Step {activeIndex + 1} of {storySteps.length}
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-4 top-0 h-full w-px bg-white/10 sm:left-6">
            <div
              ref={progressRef}
              className="h-full origin-top scale-y-0 bg-gradient-to-b from-electricBlue via-neonPurple to-successGreen shadow-[0_0_28px_rgba(56,189,248,0.45)]"
            />
          </div>

          <div className="space-y-5 pl-12 sm:pl-16">
            {storySteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === activeIndex;

              return (
                <article
                  key={step.title}
                  className="story-card relative rounded-lg border border-white/10 bg-slate-950/65 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl transition hover:-translate-y-1 hover:border-electricBlue/40"
                >
                  <span className="absolute -left-[49px] top-6 flex h-8 w-8 items-center justify-center rounded-lg border border-electricBlue/30 bg-slate-950 text-electricBlue shadow-glow sm:-left-[57px]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-lg border border-white/10 bg-white/[0.055] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-normal text-slate-400">
                      {step.kicker}
                    </span>
                    {isActive ? (
                      <span className="rounded-lg border border-successGreen/25 bg-successGreen/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-normal text-emerald-100">
                        Active
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-4 text-2xl font-semibold text-white">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{step.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
