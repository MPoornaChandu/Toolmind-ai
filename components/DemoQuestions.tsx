"use client";

import { Calculator, CloudSun, Search, Sparkles, WalletCards } from "lucide-react";

export const demoQuestions = [
  "What is the weather in Hyderabad today and should I carry an umbrella?",
  "If I invest ₹5000 at 12% yearly growth for 3 years, calculate the final amount.",
  "Search latest AI internship opportunities and summarize the top 5.",
  "Calculate taxi cost for 18 km at ₹22/km and explain the result.",
  "Check Hyderabad weather and calculate taxi cost for 18 km at ₹22/km."
];

const icons = [CloudSun, WalletCards, Search, Calculator, Sparkles];

interface DemoQuestionsProps {
  onSelect: (question: string) => void;
  disabled?: boolean;
}

export default function DemoQuestions({ onSelect, disabled }: DemoQuestionsProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {demoQuestions.map((question, index) => {
        const Icon = icons[index] ?? Sparkles;

        return (
          <button
            key={question}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(question)}
            className="group flex min-h-16 items-start gap-3 rounded-lg border border-white/10 bg-white/[0.045] p-3 text-left text-sm leading-5 text-slate-300 transition hover:-translate-y-0.5 hover:border-electricBlue/50 hover:bg-electricBlue/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-electricBlue transition group-hover:text-white" />
            <span>{question}</span>
          </button>
        );
      })}
    </div>
  );
}
