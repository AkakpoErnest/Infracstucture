import type { CatalogProduct } from "./catalog-shortlist";

export interface DesignPromptInput {
  roomType: string;
  style: string;
  colorPrefs: string;
  materialPrefs: string[];
  flooringPref: string;
  budget: number;
  shortlist: CatalogProduct[];
}

export function buildDesignPrompt(input: DesignPromptInput): string {
  if (input.shortlist.length === 0) {
    throw new Error("Cannot build a design prompt from an empty shortlist");
  }

  const productLines = input.shortlist
    .map((p) => `- ${p.name} (${p.category}, $${p.price})`)
    .join("\n");

  return [
    `Redesign this ${input.roomType} in a ${input.style} style.`,
    `Preferred colors: ${input.colorPrefs || "no strong preference"}.`,
    `Preferred materials: ${input.materialPrefs.join(", ") || "no strong preference"}.`,
    `Preferred flooring: ${input.flooringPref}.`,
    `Total budget: $${input.budget}.`,
    "",
    "You may ONLY use the following products in the redesign — do not invent, substitute, or use any product not on this list:",
    productLines,
    "",
    "Produce a single photorealistic rendering of the room using the existing room geometry (walls, windows, doors) but replacing furnishings and finishes per the above.",
  ].join("\n");
}
