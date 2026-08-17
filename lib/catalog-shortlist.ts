export interface CatalogProduct {
  id: string;
  name: string;
  category: string;
  styleTags: string[];
  price: number;
}

export interface ShortlistCriteria {
  style: string;
  budget: number;
}

/**
 * Filters the catalog down to products that match the requested style and
 * are individually affordable within the total budget. This shortlist is
 * what gets embedded in the Gemini prompt — the model is only ever told
 * about products in this list, never the full catalog.
 */
export function buildCatalogShortlist(
  products: CatalogProduct[],
  criteria: ShortlistCriteria
): CatalogProduct[] {
  return products.filter(
    (p) => p.styleTags.includes(criteria.style) && p.price <= criteria.budget
  );
}
