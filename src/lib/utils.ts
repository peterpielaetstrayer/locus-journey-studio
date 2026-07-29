import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function formatConfidence(level: number): string {
  const labels = ["tentative", "leaning", "fairly sure", "strongly held"];
  return labels[level - 1] ?? "Unknown";
}
