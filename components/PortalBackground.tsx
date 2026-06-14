"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

interface PortalBackgroundProps {
  className?: string;
  withPortal?: boolean;
  intensity?: "soft" | "strong";
}

export default function PortalBackground({
  className,
  withPortal = true,
  intensity = "soft"
}: PortalBackgroundProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;

    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    function handlePointerMove(event: PointerEvent) {
      if (!root) return;

      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;

      root.style.setProperty("--portal-x", `${x * 28}px`);
      root.style.setProperty("--portal-y", `${y * 22}px`);
      root.style.setProperty("--portal-tilt-x", `${y * -2.5}deg`);
      root.style.setProperty("--portal-tilt-y", `${x * 3.5}deg`);
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden",
        intensity === "strong" ? "opacity-100" : "opacity-75",
        className
      )}
    >
      <div className="subtle-grid absolute inset-0 opacity-45" />
      <div className="portal-glow-field portal-glow-field-a" />
      <div className="portal-glow-field portal-glow-field-b" />
      <div className="portal-radial-glow" />
      {withPortal ? (
        <div className="portal-background-ring">
          <span />
          <span />
        </div>
      ) : null}
    </div>
  );
}
