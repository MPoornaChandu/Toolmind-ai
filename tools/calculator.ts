import { evaluate } from "mathjs";

import type { CalculatorResult } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export type CalculationIntent =
  | {
      kind: "taxi_cost";
      expression: string;
      distanceKm: number;
      ratePerKm: number;
    }
  | {
      kind: "compound_growth";
      expression: string;
      principal: number;
      ratePercent: number;
      years: number;
    }
  | {
      kind: "gst_reverse";
      expression: string;
      finalPrice: number;
      gstPercent: number;
    }
  | {
      kind: "percentage";
      expression: string;
      percent: number;
      base: number;
    }
  | {
      kind: "direct_expression";
      expression: string;
    };

const SAFE_EXPRESSION_PATTERN = /^[0-9+\-*/().,^%\s]+$/;

function toNumber(value: string) {
  return Number(value.replace(/,/g, ""));
}

function normalizeExpression(expression: string) {
  return expression
    .replace(/,/g, "")
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/₹/g, "")
    .replace(/\b(?:rs\.?|inr)\b/gi, "")
    .trim();
}

function evaluateSafeExpression(expression: string) {
  const normalized = normalizeExpression(expression);

  if (!SAFE_EXPRESSION_PATTERN.test(normalized)) {
    throw new Error("Only numeric calculator expressions are supported.");
  }

  const result = evaluate(normalized);
  const numberResult = Number(result);

  if (!Number.isFinite(numberResult)) {
    throw new Error("Calculator result was not a finite number.");
  }

  return { expression: normalized, result: numberResult };
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2
  }).format(value);
}

function buildResult(expression: string, result: number, explanation: string): CalculatorResult {
  return {
    expression,
    result,
    explanation,
    formattedResult: formatCurrency(result),
    source: "mathjs/custom-calculator"
  };
}

export async function runCalculator(input: CalculationIntent | string): Promise<CalculatorResult> {
  try {
    const intent =
      typeof input === "string"
        ? ({
            kind: "direct_expression",
            expression: input
          } satisfies CalculationIntent)
        : input;

    if (intent.kind === "taxi_cost") {
      const { expression, result } = evaluateSafeExpression(intent.expression);
      return buildResult(
        expression,
        result,
        `${formatNumber(intent.distanceKm)} km multiplied by ${formatCurrency(intent.ratePerKm)} per km.`
      );
    }

    if (intent.kind === "compound_growth") {
      const { expression, result } = evaluateSafeExpression(intent.expression);
      return buildResult(
        expression,
        result,
        `${formatCurrency(intent.principal)} grows at ${intent.ratePercent}% per year for ${intent.years} years.`
      );
    }

    if (intent.kind === "gst_reverse") {
      const { expression, result } = evaluateSafeExpression(intent.expression);
      return buildResult(
        expression,
        result,
        `${formatCurrency(intent.finalPrice)} divided by ${(1 + intent.gstPercent / 100).toFixed(2)} removes ${intent.gstPercent}% GST.`
      );
    }

    if (intent.kind === "percentage") {
      const { expression, result } = evaluateSafeExpression(intent.expression);
      return buildResult(
        expression,
        result,
        `${intent.percent}% of ${formatNumber(intent.base)}.`
      );
    }

    const { expression, result } = evaluateSafeExpression(intent.expression);
    return buildResult(expression, result, `Evaluated the numeric expression using mathjs.`);
  } catch {
    return {
      expression: typeof input === "string" ? input : input.expression,
      result: 0,
      explanation:
        "I could not safely extract a supported calculation, so the calculator returned a safe fallback.",
      formattedResult: formatCurrency(0),
      source: "mathjs/custom-calculator"
    };
  }
}

export { toNumber };
