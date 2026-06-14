import {
  Bot,
  Calculator,
  CloudSun,
  Eye,
  GitBranch,
  Route,
  Search,
  ShieldCheck
} from "lucide-react";

const features = [
  {
    title: "Tool Selection",
    description: "Rule-based routing chooses weather, calculator, search, or multi-tool execution.",
    icon: Route
  },
  {
    title: "Real Weather API",
    description: "Open-Meteo geocoding and forecast calls power live weather when available.",
    icon: CloudSun
  },
  {
    title: "Safe Calculator",
    description: "mathjs evaluates supported formulas without unsafe eval.",
    icon: Calculator
  },
  {
    title: "Web Search Ready",
    description: "Tavily search is prepared with a friendly mock path when the key is missing.",
    icon: Search
  },
  {
    title: "Gemini Function-Calling Ready",
    description: "Server utilities are structured for a later Gemini tool-calling loop.",
    icon: Bot
  },
  {
    title: "Transparent Agent Timeline",
    description: "Every thought, tool call, result, duration, and final step is visible.",
    icon: Eye
  },
  {
    title: "Error-Safe Backend",
    description: "Route handlers and tools return clean JSON fallbacks instead of crashing.",
    icon: ShieldCheck
  },
  {
    title: "Portfolio-Ready UI",
    description: "Responsive, polished interface designed for GitHub, resume, and demos.",
    icon: GitBranch
  }
];

export default function FeatureCards() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-normal text-neonPurple">Features</p>
        <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Built for a strong portfolio demo</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <article
              key={feature.title}
              className="glass-panel rounded-lg p-4 transition hover:-translate-y-0.5 hover:border-neonPurple/40"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-neonPurple/25 bg-neonPurple/10 text-purple-100">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-white">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{feature.description}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
