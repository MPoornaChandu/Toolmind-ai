"use client";

import { AlertTriangle } from "lucide-react";

interface ErrorMessageProps {
  title?: string;
  message: string;
}

export default function ErrorMessage({ title = "Something went wrong", message }: ErrorMessageProps) {
  return (
    <div className="rounded-lg border border-errorRose/30 bg-errorRose/10 p-4 text-sm text-rose-100">
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-errorRose" />
        <div>
          <p className="font-semibold text-white">{title}</p>
          <p className="mt-1 leading-6 text-rose-100/85">{message}</p>
        </div>
      </div>
    </div>
  );
}
