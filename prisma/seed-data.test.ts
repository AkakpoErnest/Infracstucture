import { describe, it, expect } from "vitest";
import { seedProducts, seedBrands } from "./seed-data";

describe("seed catalog data", () => {
  it("has at least 30 products", () => {
    expect(seedProducts.length).toBeGreaterThanOrEqual(30);
  });

  it("covers all six required categories", () => {
    const categories = new Set(seedProducts.map((p) => p.category));
    expect(categories).toEqual(
      new Set([
        "Furniture",
        "Lighting",
        "Rugs & Flooring",
        "Paint & Wall Finishes",
        "Curtains & Textiles",
        "Decor & Art",
      ])
    );
  });

  it("every product references a brand that exists", () => {
    const brandNames = new Set(seedBrands.map((b) => b.name));
    for (const p of seedProducts) {
      expect(brandNames.has(p.brandName)).toBe(true);
    }
  });

  it("every product has a positive price", () => {
    for (const p of seedProducts) {
      expect(p.price).toBeGreaterThan(0);
    }
  });
});
