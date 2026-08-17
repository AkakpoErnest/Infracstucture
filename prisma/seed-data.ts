export interface SeedBrand {
  name: string;
  logoUrl?: string;
}

export interface SeedProduct {
  name: string;
  brandName: string;
  category:
    | "Furniture"
    | "Lighting"
    | "Rugs & Flooring"
    | "Paint & Wall Finishes"
    | "Curtains & Textiles"
    | "Decor & Art";
  styleTags: string[];
  color: string;
  material: string;
  price: number;
  dimensions: string;
  imageUrl: string;
}

export const seedBrands: SeedBrand[] = [
  { name: "Nordika" },
  { name: "Oakwell" },
  { name: "Luma Lighting" },
  { name: "Terra Finishes" },
  { name: "Weave & Co" },
  { name: "Studio Verde" },
  { name: "Kessho" },
];

const img = (seed: string) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/800/600`;

export const seedProducts: SeedProduct[] = [
  // Furniture
  { name: "Oslo 3-Seat Sofa", brandName: "Nordika", category: "Furniture", styleTags: ["Scandinavian", "Minimalist"], color: "Light Grey", material: "Boucle Fabric", price: 899, dimensions: "210x90x80cm", imageUrl: img("oslo-sofa") },
  { name: "Kyoto Low Sofa", brandName: "Kessho", category: "Furniture", styleTags: ["Japandi", "Minimalist"], color: "Charcoal", material: "Linen", price: 1049, dimensions: "200x85x70cm", imageUrl: img("kyoto-sofa") },
  { name: "Marlowe Chesterfield Sofa", brandName: "Oakwell", category: "Furniture", styleTags: ["Classic", "Luxury"], color: "Emerald", material: "Velvet", price: 1499, dimensions: "220x95x85cm", imageUrl: img("marlowe-sofa") },
  { name: "Foundry Coffee Table", brandName: "Oakwell", category: "Furniture", styleTags: ["Industrial"], color: "Black Steel", material: "Steel & Reclaimed Wood", price: 320, dimensions: "120x60x40cm", imageUrl: img("foundry-table") },
  { name: "Haku Coffee Table", brandName: "Kessho", category: "Furniture", styleTags: ["Japandi", "Minimalist"], color: "Natural Oak", material: "Solid Oak", price: 289, dimensions: "110x55x38cm", imageUrl: img("haku-table") },
  { name: "Bergen Dining Table", brandName: "Nordika", category: "Furniture", styleTags: ["Scandinavian"], color: "Whitewash Oak", material: "Oak Veneer", price: 749, dimensions: "180x90x75cm", imageUrl: img("bergen-table") },
  { name: "Casa Rustica Dining Table", brandName: "Studio Verde", category: "Furniture", styleTags: ["Rustic", "Mediterranean"], color: "Weathered Brown", material: "Reclaimed Pine", price: 680, dimensions: "200x95x76cm", imageUrl: img("rustica-table") },
  { name: "Aria Accent Chair", brandName: "Studio Verde", category: "Furniture", styleTags: ["Bohemian"], color: "Terracotta", material: "Cotton Weave", price: 349, dimensions: "75x80x85cm", imageUrl: img("aria-chair") },
  { name: "Nomad Rattan Chair", brandName: "Weave & Co", category: "Furniture", styleTags: ["Bohemian", "Rustic"], color: "Natural Rattan", material: "Rattan", price: 259, dimensions: "65x70x90cm", imageUrl: img("nomad-chair") },
  { name: "Milano TV Unit", brandName: "Oakwell", category: "Furniture", styleTags: ["Modern", "Luxury"], color: "Walnut", material: "Walnut Veneer", price: 620, dimensions: "180x40x45cm", imageUrl: img("milano-tv-unit") },
  { name: "Cube Bookshelf", brandName: "Nordika", category: "Furniture", styleTags: ["Minimalist", "Scandinavian"], color: "White", material: "MDF", price: 210, dimensions: "80x30x180cm", imageUrl: img("cube-bookshelf") },

  // Lighting
  { name: "Arc Floor Lamp", brandName: "Luma Lighting", category: "Lighting", styleTags: ["Modern", "Minimalist"], color: "Brushed Brass", material: "Metal & Marble Base", price: 189, dimensions: "150cm H", imageUrl: img("arc-lamp") },
  { name: "Kessho Paper Pendant", brandName: "Kessho", category: "Lighting", styleTags: ["Japandi"], color: "Natural White", material: "Washi Paper", price: 129, dimensions: "45cm dia", imageUrl: img("paper-pendant") },
  { name: "Foundry Cage Pendant", brandName: "Oakwell", category: "Lighting", styleTags: ["Industrial"], color: "Matte Black", material: "Iron & Glass", price: 149, dimensions: "30cm dia", imageUrl: img("cage-pendant") },
  { name: "Bergen Table Lamp", brandName: "Nordika", category: "Lighting", styleTags: ["Scandinavian", "Minimalist"], color: "Oak & Linen", material: "Wood & Fabric Shade", price: 89, dimensions: "45cm H", imageUrl: img("bergen-lamp") },
  { name: "Palazzo Crystal Chandelier", brandName: "Oakwell", category: "Lighting", styleTags: ["Luxury", "Classic"], color: "Antique Gold", material: "Crystal & Brass", price: 1290, dimensions: "70cm dia", imageUrl: img("palazzo-chandelier") },
  { name: "Sol Wall Sconce", brandName: "Studio Verde", category: "Lighting", styleTags: ["Mediterranean", "Rustic"], color: "Terracotta", material: "Ceramic", price: 69, dimensions: "20cm H", imageUrl: img("sol-sconce") },

  // Rugs & Flooring
  { name: "Nordic Wool Rug", brandName: "Weave & Co", category: "Rugs & Flooring", styleTags: ["Scandinavian", "Minimalist"], color: "Ivory", material: "Wool", price: 210, dimensions: "200x300cm", imageUrl: img("nordic-rug") },
  { name: "Kessho Tatami Mat", brandName: "Kessho", category: "Rugs & Flooring", styleTags: ["Japandi"], color: "Natural Green", material: "Woven Rush", price: 175, dimensions: "180x270cm", imageUrl: img("tatami-mat") },
  { name: "Casbah Wool Rug", brandName: "Weave & Co", category: "Rugs & Flooring", styleTags: ["Bohemian"], color: "Rust & Cream", material: "Wool", price: 245, dimensions: "200x290cm", imageUrl: img("casbah-rug") },
  { name: "Oak Herringbone Flooring", brandName: "Oakwell", category: "Rugs & Flooring", styleTags: ["Classic", "Modern"], color: "Natural Oak", material: "Engineered Hardwood", price: 62, dimensions: "per sqm", imageUrl: img("herringbone-floor") },
  { name: "Terrazzo Tile Flooring", brandName: "Terra Finishes", category: "Rugs & Flooring", styleTags: ["Modern", "Mediterranean"], color: "Grey Fleck", material: "Terrazzo", price: 48, dimensions: "per sqm", imageUrl: img("terrazzo-floor") },
  { name: "Polished Concrete Finish", brandName: "Terra Finishes", category: "Rugs & Flooring", styleTags: ["Industrial", "Minimalist"], color: "Ash Grey", material: "Concrete", price: 55, dimensions: "per sqm", imageUrl: img("concrete-floor") },
  { name: "Carrara Marble Tile", brandName: "Terra Finishes", category: "Rugs & Flooring", styleTags: ["Luxury", "Classic"], color: "White & Grey Veined", material: "Marble", price: 95, dimensions: "per sqm", imageUrl: img("carrara-tile") },

  // Paint & Wall Finishes
  { name: "Fog Grey Matte Paint", brandName: "Terra Finishes", category: "Paint & Wall Finishes", styleTags: ["Minimalist", "Modern"], color: "Fog Grey", material: "Matte Emulsion", price: 45, dimensions: "5L can", imageUrl: img("fog-grey-paint") },
  { name: "Warm White Paint", brandName: "Terra Finishes", category: "Paint & Wall Finishes", styleTags: ["Scandinavian", "Japandi"], color: "Warm White", material: "Matte Emulsion", price: 42, dimensions: "5L can", imageUrl: img("warm-white-paint") },
  { name: "Terracotta Limewash", brandName: "Terra Finishes", category: "Paint & Wall Finishes", styleTags: ["Mediterranean", "Rustic"], color: "Terracotta", material: "Limewash", price: 58, dimensions: "5L can", imageUrl: img("terracotta-limewash") },
  { name: "Charcoal Feature Paint", brandName: "Terra Finishes", category: "Paint & Wall Finishes", styleTags: ["Industrial", "Luxury"], color: "Charcoal", material: "Matte Emulsion", price: 45, dimensions: "5L can", imageUrl: img("charcoal-paint") },
  { name: "Oak Wood Panelling", brandName: "Oakwell", category: "Paint & Wall Finishes", styleTags: ["Japandi", "Scandinavian"], color: "Natural Oak", material: "Wood Slat Panel", price: 78, dimensions: "per sqm", imageUrl: img("oak-panelling") },
  { name: "Raw Stone Cladding", brandName: "Terra Finishes", category: "Paint & Wall Finishes", styleTags: ["Rustic", "Industrial"], color: "Grey Stone", material: "Stone Veneer", price: 89, dimensions: "per sqm", imageUrl: img("stone-cladding") },
  { name: "Botanical Wallpaper", brandName: "Weave & Co", category: "Paint & Wall Finishes", styleTags: ["Bohemian"], color: "Green & Cream", material: "Non-woven Wallpaper", price: 52, dimensions: "per roll", imageUrl: img("botanical-wallpaper") },

  // Curtains & Textiles
  { name: "Linen Sheer Curtains", brandName: "Weave & Co", category: "Curtains & Textiles", styleTags: ["Scandinavian", "Minimalist"], color: "Off-White", material: "Linen", price: 89, dimensions: "140x260cm (pair)", imageUrl: img("linen-sheers") },
  { name: "Shoji-Style Panel Curtains", brandName: "Kessho", category: "Curtains & Textiles", styleTags: ["Japandi"], color: "Natural White", material: "Washi-textured Fabric", price: 110, dimensions: "150x250cm", imageUrl: img("shoji-curtains") },
  { name: "Velvet Blackout Curtains", brandName: "Oakwell", category: "Curtains & Textiles", styleTags: ["Luxury", "Classic"], color: "Deep Emerald", material: "Velvet", price: 149, dimensions: "140x260cm (pair)", imageUrl: img("velvet-curtains") },
  { name: "Kilim Throw Blanket", brandName: "Weave & Co", category: "Curtains & Textiles", styleTags: ["Bohemian", "Rustic"], color: "Multicolor", material: "Wool Kilim", price: 65, dimensions: "130x180cm", imageUrl: img("kilim-throw") },
  { name: "Boucle Cushion Set", brandName: "Nordika", category: "Curtains & Textiles", styleTags: ["Scandinavian", "Minimalist"], color: "Cream", material: "Boucle", price: 39, dimensions: "45x45cm (set of 2)", imageUrl: img("boucle-cushions") },

  // Decor & Art
  { name: "Kessho Ink Wash Print", brandName: "Kessho", category: "Decor & Art", styleTags: ["Japandi", "Minimalist"], color: "Black & White", material: "Framed Print", price: 89, dimensions: "50x70cm", imageUrl: img("ink-wash-print") },
  { name: "Abstract Terracotta Canvas", brandName: "Studio Verde", category: "Decor & Art", styleTags: ["Bohemian", "Mediterranean"], color: "Terracotta & Cream", material: "Canvas Print", price: 119, dimensions: "60x90cm", imageUrl: img("abstract-canvas") },
  { name: "Brass Sculptural Vase", brandName: "Oakwell", category: "Decor & Art", styleTags: ["Luxury", "Modern"], color: "Antique Brass", material: "Cast Metal", price: 75, dimensions: "35cm H", imageUrl: img("brass-vase") },
  { name: "Raw Ceramic Vase Set", brandName: "Studio Verde", category: "Decor & Art", styleTags: ["Rustic", "Bohemian"], color: "Sand", material: "Stoneware", price: 55, dimensions: "set of 3", imageUrl: img("ceramic-vase-set") },
  { name: "Industrial Wall Clock", brandName: "Oakwell", category: "Decor & Art", styleTags: ["Industrial"], color: "Black & Brass", material: "Metal & Glass", price: 65, dimensions: "40cm dia", imageUrl: img("industrial-clock") },
  { name: "Fiddle Leaf Fig (Faux)", brandName: "Studio Verde", category: "Decor & Art", styleTags: ["Scandinavian", "Bohemian", "Modern"], color: "Green", material: "Faux Botanical", price: 99, dimensions: "150cm H", imageUrl: img("fiddle-leaf-fig") },
];
