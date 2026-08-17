import { describe, it, expect } from "vitest";
import { buildCatalogShortlist, type CatalogProduct } from "./catalog-shortlist";

const products: CatalogProduct[] = [
  { id: "1", name: "Oslo Sofa", category: "Furniture", styleTags: ["Scandinavian", "Minimalist"], price: 899 },
  { id: "2", name: "Palazzo Chandelier", category: "Lighting", styleTags: ["Luxury", "Classic"], price: 1290 },
  { id: "3", name: "Nordic Rug", category: "Rugs & Flooring", styleTags: ["Scandinavian"], price: 210 },
  { id: "4", name: "Industrial Clock", category: "Decor & Art", styleTags: ["Industrial"], price: 65 },
];

describe("buildCatalogShortlist", () => {
  it("only includes products matching the requested style", () => {
    const shortlist = buildCatalogShortlist(products, { style: "Scandinavian", budget: 10000 });
    expect(shortlist.map((p) => p.id).sort()).toEqual(["1", "3"]);
  });

  it("excludes products that individually exceed the total budget", () => {
    const shortlist = buildCatalogShortlist(products, { style: "Luxury", budget: 500 });
    expect(shortlist.find((p) => p.id === "2")).toBeUndefined();
  });

  it("returns an empty list when nothing matches the style", () => {
    const shortlist = buildCatalogShortlist(products, { style: "Bohemian", budget: 10000 });
    expect(shortlist).toEqual([]);
  });

  it("spans multiple categories when available", () => {
    const shortlist = buildCatalogShortlist(products, { style: "Scandinavian", budget: 10000 });
    const categories = new Set(shortlist.map((p) => p.category));
    expect(categories.size).toBeGreaterThan(1);
  });
});
