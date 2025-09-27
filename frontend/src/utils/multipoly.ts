import type { CSSProperties } from "react";

export type Property = {
  id: string;
  name: string;
  color: string;
  corner?: boolean;
  special?: boolean;
};

export type PropertyOrientation = "bottom" | "left" | "top" | "right";

export interface PropertyPosition {
  style: CSSProperties;
  orientation: PropertyOrientation | null;
  isCorner: boolean;
}

const SQUARE_SIZE_PERCENT = 8.45;
const CORNER_SIZE_PERCENT = 12;

export const MULTIPOLY_PROPERTIES: Property[] = [
  { id: "1", name: "START", color: "bg-white", corner: true },
  { id: "2", name: "Akshardham Temple", color: "bg-mred" },
  { id: "3", name: "CHANCE", color: "bg-white", special: true },
  { id: "4", name: "Jama Masjid", color: "bg-mred" },
  { id: "5", name: "DAO", color: "bg-white", special: true },
  { id: "6", name: "Connaught Place", color: "bg-purple-500" },
  { id: "7", name: "Lajpat Nagar", color: "bg-mpurple" },
  { id: "8", name: "CHANCE", color: "bg-white", special: true },
  { id: "9", name: "Khan Market", color: "bg-mpurple" },
  { id: "10", name: "Karol Bagh", color: "bg-mpurple" },
  { id: "11", name: "BURN", color: "bg-white", corner: true },
  { id: "12", name: "Yashobhoomi", color: "bg-mgreen" },
  { id: "13", name: "DAO", color: "bg-white", special: true },
  { id: "14", name: "Raj Ghat", color: "bg-mgreen" },
  { id: "15", name: "National Museum", color: "bg-mgreen" },
  { id: "16", name: "CHANCE", color: "bg-white", special: true },
  { id: "17", name: "Hauz Khas", color: "bg-myellow" },
  { id: "18", name: "DAO", color: "bg-white", special: true },
  { id: "19", name: "Select City Walk", color: "bg-myellow" },
  { id: "20", name: "Dilli Haat", color: "bg-myellow" },
  { id: "21", name: "FREE MINT", color: "bg-white", corner: true },
  { id: "22", name: "Taj Mahal", color: "bg-mred" },
  { id: "23", name: "CHANCE", color: "bg-white", special: true },
  { id: "24", name: "Humayun's Tomb", color: "bg-mred" },
  { id: "25", name: "Qutub Minar", color: "bg-mred" },
  { id: "26", name: "Gurgaon", color: "bg-mpurple" },
  { id: "27", name: "Noida", color: "bg-mpurple" },
  { id: "28", name: "Ghaziabad", color: "bg-mpurple" },
  { id: "29", name: "DAO", color: "bg-white", special: true },
  { id: "30", name: "Pragati Maidan", color: "bg-mpurple" },
  { id: "31", name: "BURN", color: "bg-white", corner: true },
  { id: "32", name: "DU", color: "bg-mgreen" },
  { id: "33", name: "JNU", color: "bg-mgreen" },
  { id: "34", name: "CHANCE", color: "bg-white", special: true },
  { id: "35", name: "IIT Delhi", color: "bg-mgreen" },
  { id: "36", name: "Sarojini Nagar", color: "bg-myellow" },
  { id: "37", name: "DAO", color: "bg-white", special: true },
  { id: "38", name: "India Gate", color: "bg-myellow" },
  { id: "39", name: "CHANCE", color: "bg-white", special: true },
  { id: "40", name: "Red Fort", color: "bg-myellow" },
];

export function getPropertyPosition(index: number, property: Property): PropertyPosition {
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
      const position = CORNER_SIZE_PERCENT + (index - 1) * SQUARE_SIZE_PERCENT;
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