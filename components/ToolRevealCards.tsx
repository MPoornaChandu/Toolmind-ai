"use client";

import { motion } from "framer-motion";
import { Calculator, CloudSun, Search } from "lucide-react";

const cards = [
  {
    title: "Calculator",
    description: "Safe numeric reasoning for costs, percentages, and formulas.",
    prompt: "Calculate taxi cost for 18 km at ₹22/km.",
    result: "₹396",
    icon: Calculator
  },
  {
    title: "Weather",
    description: "Live weather checks with graceful Open-Meteo fallback data.",
    prompt: "Should I carry an umbrella in Hyderabad?",
    result: "Checks live Open-Meteo weather.",
    icon: CloudSun
  },
  {
    title: "Web Search",
    description: "Current web lookup through Tavily when the API key exists.",
    prompt: "Search latest AI internship opportunities.",
    result: "Uses Tavily when API key exists.",
    icon: Search
  }
];

export default function ToolRevealCards() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-normal text-neonPurple">Prompt reveals</p>
        <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Hover into the tool examples</h2>
        <p className="mt-3 text-base leading-7 text-slate-300">
          Each panel hints at the exact kind of prompt the agent can convert into a tool call.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card, index) => {
          const Icon = card.icon;

          return (
            <motion.article
              key={card.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              whileHover={{ y: -8 }}
              className="group relative min-h-72 overflow-hidden rounded-lg border border-white/10 bg-slate-950/65 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-electricBlue to-transparent opacity-60" />
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-electricBlue/25 bg-electricBlue/10 text-electricBlue transition group-hover:border-neonPurple/40 group-hover:text-purple-100">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-white">{card.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">{card.description}</p>

              <div className="absolute inset-x-4 bottom-4 translate-y-5 rounded-lg border border-white/10 bg-white/[0.06] p-4 opacity-0 shadow-glow backdrop-blur-xl transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <p className="text-[11px] font-semibold uppercase tracking-normal text-slate-500">Prompt</p>
                <p className="mt-1 text-sm leading-6 text-slate-100">{card.prompt}</p>
                <p className="mt-3 text-[11px] font-semibold uppercase tracking-normal text-slate-500">Result</p>
                <p className="mt-1 text-sm font-semibold text-emerald-100">{card.result}</p>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
