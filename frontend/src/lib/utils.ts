import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export let tokens = ['AMETHYST', 'EMRALD', 'GOLDEN', 'RUBY']
export let tokenSymbols = ["AMTY", "EMRD", "GLDN", "RUBY"]

export let getPfp = (name: string = "") => "https://api.dicebear.com/9.x/identicon/svg?seed=" + name