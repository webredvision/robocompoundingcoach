import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getUrl() {
  if (process.env.NODE_ENV === "development") {
    return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  } else {
    return process.env.NEXT_PUBLIC_WEB_URL || "";
  }
}