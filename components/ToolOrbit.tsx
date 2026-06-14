"use client";

import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { Bot, Calculator, CloudSun, DatabaseZap, Search, Waypoints } from "lucide-react";

const orbitTools = [
  { label: "Calculator", detail: "mathjs", icon: Calculator, angle: 270 },
  { label: "Weather", detail: "Open-Meteo", icon: CloudSun, angle: 342 },
  { label: "Web Search", detail: "Tavily-ready", icon: Search, angle: 54 },
  { label: "Gemini", detail: "Function calls", icon: Bot, angle: 126 },
  { label: "Agent API", detail: "Server route", icon: DatabaseZap, angle: 198 }
];

export default function ToolOrbit() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-normal text-successGreen">Connected tools</p>
          <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">One AI brain, multiple tool paths</h2>
          <p className="mt-3 text-base leading-7 text-slate-300">
            ToolMind AI stays centered on the question, then reaches for the right capability at the right moment.
          </p>
        </div>

        <div className="hidden min-h-[540px] items-center justify-center lg:flex">
          <div className="tool-orbit-stage">
            <div className="tool-orbit-halo" />
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.45 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="tool-orbit-core"
            >
              <Waypoints className="h-8 w-8 text-electricBlue" />
              <span>ToolMind AI</span>
              <small>Agent core</small>
            </motion.div>

            <div className="tool-orbit-track">
              {orbitTools.map((tool) => {
                const Icon = tool.icon;
                const style = {
                  "--orbit-angle": `${tool.angle}deg`
                } as CSSProperties;

                return (
                  <div key={tool.label} className="tool-orbit-card" style={style}>
                    <div className="tool-orbit-card-inner">
                      <Icon className="h-5 w-5 text-electricBlue" />
                      <span>{tool.label}</span>
                      <small>{tool.detail}</small>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:hidden">
          {orbitTools.map((tool, index) => {
            const Icon = tool.icon;

            return (
              <motion.article
                key={tool.label}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
                className="glass-panel rounded-lg p-4"
              >
                <Icon className="h-5 w-5 text-electricBlue" />
                <h3 className="mt-4 text-base font-semibold text-white">{tool.label}</h3>
                <p className="mt-2 text-sm text-slate-400">{tool.detail}</p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
