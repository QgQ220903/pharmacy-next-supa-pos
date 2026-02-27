import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

// lib/utils.ts
export function formatCompactNumber(value: number): string {
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)} tỷ`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)} tr`;
  return new Intl.NumberFormat("vi-VN").format(value);
}


// lib/utils.ts
export function formatDate(date: string | Date, format: string = "DD/MM/YYYY"): string {
  if (!date) return "";
  
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  const shortYear = year.toString().slice(-2);
  
  switch (format) {
    case "DD/MM/YY":
      return `${day}/${month}/${shortYear}`;
    case "DD/MM/YYYY":
    default:
      return `${day}/${month}/${year}`;
  }
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("vi-VN").format(num);
}
