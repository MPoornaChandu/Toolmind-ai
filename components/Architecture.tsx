"use client";

import { motion } from "framer-motion";
import { ArrowRight, Bot, Calculator, CloudSun, DatabaseZap, MessageSquareText, Search, ShieldCheck } from "lucide-react";

const flow = [
  { label: "User Input", caption: "User asks", icon: MessageSquareText },
  { label: "Agent API", caption: "Agent plans", icon: Bot },
  { label: "Tool Router", caption: "Tools execute", icon: DatabaseZap },
  { label: "Tools", caption: "Calculator, weather, search", icon: Calculator },
  { label: "Final Answer", caption: "Answer returns", icon: ShieldCheck }
];

const toolPills = [
  { label: "Calculator", icon: Calculator },
  { label: "Weather", icon: CloudSun },
  { label: "Web Search", icon: Search }
];

export default function Architecture() {
  return (
    <section id="architecture" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-normal text-electricBlue">Architecture</p>
        <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Prompt to answer, traced end to end</h2>
        <p className="mt-3 text-base leading-7 text-slate-300">
          ToolMind AI keeps tool execution on the server, records every step, and returns a timeline that makes agent decisions inspectable.
        </p>
      </div>

      <div className="relative overflow-hidden rounded-lg border border-white/10 bg-slate-950/65 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6">
        <div className="subtle-grid absolute inset-0 opacity-25" />
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0.45 }}
          transition={{ duration: 1.1, ease: "easeInOut" }}
          className="absolute left-8 right-8 top-[138px] hidden h-px origin-left bg-gradient-to-r from-electricBlue via-neonPurple to-successGreen shadow-[0_0_24px_rgba(56,189,248,0.45)] lg:block"
        />

        <div className="relative grid gap-4 lg:grid-cols-5">
          {flow.map((item, index) => {
            const Icon = item.icon;
            const isToolNode = item.label === "Tools";

            return (
              <motion.article
                key={item.label}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.45 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="relative rounded-lg border border-white/10 bg-white/[0.055] p-4 transition hover:-translate-y-1 hover:border-electricBlue/40 hover:shadow-glow"
              >
                <div
                  className={`mb-4 flex h-11 w-11 items-center justify-center rounded-lg border ${
                    isToolNode
                      ? "border-neonPurple/35 bg-neonPurple/10 text-purple-100 shadow-purpleGlow"
                      : "border-electricBlue/25 bg-electricBlue/10 text-electricBlue"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-normal text-slate-500">{item.caption}</p>
                <h3 className="mt-2 text-base font-semibold text-white">{item.label}</h3>
                {index < flow.length - 1 ? (
                  <ArrowRight className="absolute -right-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-slate-500 lg:block" />
                ) : null}
              </motion.article>
            );
          })}
        </div>

        <div className="relative mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.45 }}
            className="rounded-lg border border-white/10 bg-white/[0.045] p-4"
          >
            <p className="text-sm font-semibold text-white">Tool branch</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {toolPills.map((tool) => {
                const Icon = tool.icon;
                return (
                  <span
                    key={tool.label}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-slate-950/55 px-3 py-2 text-sm text-slate-300"
                  >
                    <Icon className="h-4 w-4 text-electricBlue" />
                    {tool.label}
                  </span>
                );
              })}
            </div>
          </motion.div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "The agent decides what tool is needed.",
              "The backend executes tools safely.",
              "The final answer is generated using tool results.",
              "Timeline shows every step transparently."
            ].map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="rounded-lg border border-white/10 bg-white/[0.045] p-4 text-sm leading-6 text-slate-300"
              >
                {item}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
