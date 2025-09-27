import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export let tokens = ['AMETHYST', 'EMRALD', 'GOLDEN', 'RUBY']
export let tokenSymbols = ["AMTY", "EMRD", "GLDN", "RUBY"]

export let getPfp = (name: string = "") => "https://api.dicebear.com/9.x/identicon/svg?seed=" + name

export let string_to_num = (str: string) => {
  let encoder = new TextEncoder();
  let data = encoder.encode(str);
  
  let n = 0
  for (let byte of data) {
    n *= 256
    n += byte
  }

  return n
}