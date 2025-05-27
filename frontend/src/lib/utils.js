import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
export function parseToNumber(input, defaultValue) {
  const parsedNumber = Number(input);

  // Check if the parsed result is a valid number, otherwise return the default value
  if (isNaN(parsedNumber)) {
    return defaultValue;
  }

  return parsedNumber;
}
