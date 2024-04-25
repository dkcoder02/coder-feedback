import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
//clsx used to merge my tailwind css classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
