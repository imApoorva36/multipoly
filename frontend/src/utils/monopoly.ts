import type { CSSProperties } from "react";

export type MonopolyProperty = {
  name: string;
  color: string;
  corner?: boolean;
  special?: boolean;
  utility?: boolean;
};

export type PropertyOrientation = "bottom" | "left" | "top" | "right";

export interface PropertyPosition {
  style: CSSProperties;
  orientation: PropertyOrientation | null;
  isCorner: boolean;
}

const SQUARE_SIZE_PERCENT = 8.45;
const CORNER_SIZE_PERCENT = 12;

export const MONOPOLY_PROPERTIES: MonopolyProperty[] = [
  { name: "START", color: "bg-white", corner: true },
  { name: "Genesis Block", color: "bg-mred" },
  { name: "Smart Contract", color: "bg-white", special: true },
  { name: "Mining Pool", color: "bg-mred" },
  { name: "Gas Fee", color: "bg-white", special: true },
  { name: "DeFi Station", color: "bg-purple-500" },
  { name: "Blockchain Bridge", color: "bg-mpurple" },
  { name: "Oracle", color: "bg-white", special: true },
  { name: "Consensus Protocol", color: "bg-mpurple" },
  { name: "Validator Node", color: "bg-mpurple" },
  { name: "STAKING", color: "bg-white", corner: true },
  { name: "NFT Marketplace", color: "bg-mgreen" },
  { name: "MetaVerse Hub", color: "bg-mgreen", utility: true },
  { name: "DAO Treasury", color: "bg-mgreen" },
  { name: "Liquidity Pool", color: "bg-mgreen" },
  { name: "CEX Terminal", color: "bg-gold" },
  { name: "Layer 2 Network", color: "bg-myellow" },
  { name: "Governance Token", color: "bg-white", special: true },
  { name: "Flash Loan", color: "bg-myellow" },
  { name: "Yield Farm", color: "bg-myellow" },
  { name: "FREE MINT", color: "bg-white", corner: true },
  { name: "Crypto Wallet", color: "bg-mred" },
  { name: "Random Oracle", color: "bg-white", special: true },
  { name: "Hash Function", color: "bg-mred" },
  { name: "Digital Signature", color: "bg-mred" },
  { name: "DEX Protocol", color: "bg-mpurple" },
  { name: "Token Swap", color: "bg-mpurple" },
  { name: "Cross Chain", color: "bg-mpurple" },
  { name: "Web3 Gateway", color: "bg-white", utility: true },
  { name: "IPFS Storage", color: "bg-mpurple" },
  { name: "GO TO BURN", color: "bg-white", corner: true },
  { name: "Atomic Swap", color: "bg-mgreen" },
  { name: "Zero Knowledge", color: "bg-mgreen" },
  { name: "Merkle Tree", color: "bg-white", special: true },
  { name: "Sharding Network", color: "bg-mgreen" },
  { name: "Rollup Chain", color: "bg-myellow" },
  { name: "Random Beacon", color: "bg-white", special: true },
  { name: "Quantum Ledger", color: "bg-myellow" },
  { name: "Protocol Tax", color: "bg-white", special: true },
  { name: "Alpha Mainnet", color: "bg-myellow" },
];

export function getPropertyPosition(index: number, property: MonopolyProperty): PropertyPosition {
  const isCorner = Boolean(property.corner);
  const style: CSSProperties = {};
  let orientation: PropertyOrientation | null = null;

  if (index <= 10) {
    style.bottom = "0%";
    if (isCorner) {
      style.width = `${CORNER_SIZE_PERCENT}%`;
      style.height = `${CORNER_SIZE_PERCENT}%`;
      style[index === 0 ? "right" : "left"] = "0%";
    } else {
      orientation = "bottom";
      const position = CORNER_SIZE_PERCENT + (9 - index) * SQUARE_SIZE_PERCENT;
      style.right = `${position}%`;
      style.width = `${SQUARE_SIZE_PERCENT}%`;
      style.height = `${CORNER_SIZE_PERCENT}%`;
    }
  } else if (index <= 20) {
    style.left = "0%";
    if (isCorner) {
      style.top = "0%";
      style.width = `${CORNER_SIZE_PERCENT}%`;
      style.height = `${CORNER_SIZE_PERCENT}%`;
    } else {
      orientation = "left";
      const adjustedIndex = index - 11;
      const position = CORNER_SIZE_PERCENT + adjustedIndex * SQUARE_SIZE_PERCENT;
      style.bottom = `${position}%`;
      style.width = `${CORNER_SIZE_PERCENT}%`;
      style.height = `${SQUARE_SIZE_PERCENT}%`;
      style.writingMode = "vertical-rl";
      style.textOrientation = "mixed";
    }
  } else if (index <= 30) {
    style.top = "0%";
    if (isCorner) {
      style.right = "0%";
      style.width = `${CORNER_SIZE_PERCENT}%`;
      style.height = `${CORNER_SIZE_PERCENT}%`;
    } else {
      orientation = "top";
      const adjustedIndex = index - 21;
      const position = CORNER_SIZE_PERCENT + adjustedIndex * SQUARE_SIZE_PERCENT;
      style.left = `${position}%`;
      style.width = `${SQUARE_SIZE_PERCENT}%`;
      style.height = `${CORNER_SIZE_PERCENT}%`;
      style.transform = "rotate(180deg)";
    }
  } else {
    style.right = "0%";
    if (isCorner) {
      style.bottom = "0%";
      style.width = `${CORNER_SIZE_PERCENT}%`;
      style.height = `${CORNER_SIZE_PERCENT}%`;
    } else {
      orientation = "right";
      const adjustedIndex = 39 - index;
      const position = CORNER_SIZE_PERCENT + adjustedIndex * SQUARE_SIZE_PERCENT;
      style.bottom = `${position}%`;
      style.width = `${CORNER_SIZE_PERCENT}%`;
      style.height = `${SQUARE_SIZE_PERCENT}%`;
      style.writingMode = "sideways-lr";
      style.textOrientation = "mixed";
    }
  }

  return { style, orientation, isCorner };
}

export function getAccentPositionClasses(orientation: PropertyOrientation): string {
  switch (orientation) {
    case "bottom":
    case "top":
      return "top-0 left-0 right-0 h-1/4";
    case "left":
      return "top-0 bottom-0 right-0 w-1/4";
    case "right":
      return "top-0 bottom-0 left-0 w-1/4";
    default:
      return "";
  }
}

export function isRailroadProperty(property: MonopolyProperty): boolean {
  return property.color === "#000000" && !property.corner;
}