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
  { name: "GO", color: "#00ff00", corner: true },
  { name: "Mediterranean Avenue", color: "#8B4A9C" },
  { name: "Community Chest", color: "#f0f0f0", special: true },
  { name: "Baltic Avenue", color: "#8B4A9C" },
  { name: "Income Tax", color: "#f0f0f0", special: true },
  { name: "Reading Railroad", color: "#000000" },
  { name: "Oriental Avenue", color: "#87CEEB" },
  { name: "Chance", color: "#ff8c00", special: true },
  { name: "Vermont Avenue", color: "#87CEEB" },
  { name: "Connecticut Avenue", color: "#87CEEB" },
  { name: "JAIL", color: "#ff0000", corner: true },
  { name: "St. Charles Place", color: "#D12B76" },
  { name: "Electric Company", color: "#ffffff", utility: true },
  { name: "States Avenue", color: "#D12B76" },
  { name: "Virginia Avenue", color: "#D12B76" },
  { name: "Pennsylvania Railroad", color: "#000000" },
  { name: "St. James Place", color: "#FF8C00" },
  { name: "Community Chest", color: "#f0f0f0", special: true },
  { name: "Tennessee Avenue", color: "#FF8C00" },
  { name: "New York Avenue", color: "#FF8C00" },
  { name: "FREE PARKING", color: "#ffff00", corner: true },
  { name: "Kentucky Avenue", color: "#E11D3F" },
  { name: "Chance", color: "#ff8c00", special: true },
  { name: "Indiana Avenue", color: "#E11D3F" },
  { name: "Illinois Avenue", color: "#E11D3F" },
  { name: "B. & O. Railroad", color: "#000000" },
  { name: "Atlantic Avenue", color: "#FEF135" },
  { name: "Ventnor Avenue", color: "#FEF135" },
  { name: "Water Works", color: "#ffffff", utility: true },
  { name: "Marvin Gardens", color: "#FEF135" },
  { name: "GO TO JAIL", color: "#ff0000", corner: true },
  { name: "Pacific Avenue", color: "#1FB25A" },
  { name: "North Carolina Avenue", color: "#1FB25A" },
  { name: "Community Chest", color: "#f0f0f0", special: true },
  { name: "Pennsylvania Avenue", color: "#1FB25A" },
  { name: "Short Line Railroad", color: "#000000" },
  { name: "Chance", color: "#ff8c00", special: true },
  { name: "Park Place", color: "#0072CE" },
  { name: "Luxury Tax", color: "#f0f0f0", special: true },
  { name: "Boardwalk", color: "#0072CE" },
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