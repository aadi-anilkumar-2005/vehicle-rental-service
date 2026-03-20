import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string): string {
  const numberAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numberAmount)) return `₹ 0`;
  
  // Format as Indian format (e.g., 1,00,000)
  return `₹ ${numberAmount.toLocaleString("en-IN")}`;
}

export function getImageSource(uri?: string | null) {
  return uri && uri.trim() !== ""
    ? { uri }
    : require("../assets/images/imageNotFound.png");
}
