import { describe, it, expect } from "vitest";
import { buildDesignPrompt } from "./prompt-builder";
import type { CatalogProduct } from "./catalog-shortlist";

const shortlist: CatalogProduct[] = [
  { id: "1", name: "Oslo Sofa", category: "Furniture", styleTags: ["Scandinavian"], price: 899 },
  { id: "3", name: "Nordic Rug", category: "Rugs & Flooring", styleTags: ["Scandinavian"], price: 210 },
];

describe("buildDesignPrompt", () => {
  it("includes the room type and style", () => {
    const prompt = buildDesignPrompt({
      roomType: "Living Room",
      style: "Scandinavian",
      colorPrefs: "warm neutrals",
      materialPrefs: ["Wood Panels"],
      flooringPref: "Hardwood Flooring",
      budget: 2000,
      shortlist,
    });
    expect(prompt).toContain("Living Room");
    expect(prompt).toContain("Scandinavian");
  });

  it("lists every shortlisted product by name", () => {
    const prompt = buildDesignPrompt({
      roomType: "Living Room",
      style: "Scandinavian",
      colorPrefs: "warm neutrals",
      materialPrefs: ["Wood Panels"],
      flooringPref: "Hardwood Flooring",
      budget: 2000,
      shortlist,
    });
    expect(prompt).toContain("Oslo Sofa");
    expect(prompt).toContain("Nordic Rug");
  });

  it("instructs the model to use only the listed products", () => {
    const prompt = buildDesignPrompt({
      roomType: "Living Room",
      style: "Scandinavian",
      colorPrefs: "warm neutrals",
      materialPrefs: ["Wood Panels"],
      flooringPref: "Hardwood Flooring",
      budget: 2000,
      shortlist,
    });
    expect(prompt.toLowerCase()).toContain("only");
  });

  it("throws if the shortlist is empty", () => {
    expect(() =>
      buildDesignPrompt({
        roomType: "Living Room",
        style: "Scandinavian",
        colorPrefs: "",
        materialPrefs: [],
        flooringPref: "Hardwood Flooring",
        budget: 2000,
        shortlist: [],
      })
    ).toThrow(/empty shortlist/i);
  });
});
