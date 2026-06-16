import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { parse, format } from "date-fns";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const getReadableDate = (date?: string | null) => {
  if (!date) return "";

  // Support DD-MM-YYYY and DD/MM/YYYY by constructing a local Date
  const ddMmYyyyPattern = /^(\d{1,2})[-\/]?(\d{1,2})[-\/]?(\d{4})$/;
  const match = date.match(ddMmYyyyPattern);

  let parsedDate: Date | null = null;
  if (match) {
    const [, day, month, year] = match;
    parsedDate = new Date(Number(year), Number(month) - 1, Number(day));
  } else {
    // Try common ISO-like formats
    const formats = ["yyyy-MM-dd", "yyyy/MM/dd"];
    for (const f of formats) {
      const d = parse(date, f, new Date());
      if (!isNaN(d.getTime())) {
        parsedDate = d;
        break;
      }
    }
    // Fallback to native Date parsing
    if (!parsedDate) {
      const d = new Date(date);
      if (!isNaN(d.getTime())) parsedDate = d;
    }
  }

  if (!parsedDate || isNaN(parsedDate.getTime())) return date;
  return format(parsedDate, "d MMM yyyy"); // e.g., 2 Jun 2025
};
export const capitalizeWords = (text: string): string => {
  return text
    .toLowerCase()
    .split(/[ _-]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
export const formatCurrency = (amount?: number): string => {
  if (!amount) return "0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};
