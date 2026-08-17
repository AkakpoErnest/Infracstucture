"use client";
import { useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { HotspotOverlay } from "./hotspot-overlay";
import { ProductDetailPanel, type ProductDetail } from "./product-detail-panel";

export interface AlternativeItem {
  productId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  product: ProductDetail;
}

export interface Alternative {
  id: string;
  index: number;
  imageUrl: string | null;
  status: "pending" | "ready" | "failed";
  hasHotspots: boolean;
  errorMessage: string | null;
  items: AlternativeItem[];
}

export function AlternativeGrid({
  alternatives,
  onRegenerate,
}: {
  alternatives: Alternative[];
  onRegenerate: (index: number) => void;
}) {
  const [active, setActive] = useState<Alternative | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductDetail | null>(null);

  function selectProduct(productId: string) {
    const item = active?.items.find((i) => i.productId === productId);
    if (item) setSelectedProduct(item.product);
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {alternatives.map((alt) => (
          <Card key={alt.id}>
            <CardContent className="p-2">
              {alt.status === "ready" && alt.imageUrl && (
                <button className="block w-full" onClick={() => setActive(alt)}>
                  <Image
                    src={alt.imageUrl}
                    alt={`Design alternative ${alt.index + 1}`}
                    width={400}
                    height={300}
                    className="w-full rounded-md object-cover"
                  />
                </button>
              )}
              {alt.status === "pending" && (
                <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                  Generating...
                </div>
              )}
              {alt.status === "failed" && (
                <div className="flex h-48 flex-col items-center justify-center gap-2 text-sm">
                  <p className="text-destructive">{alt.errorMessage ?? "Generation failed"}</p>
                  <button
                    className="rounded-md border border-border px-3 py-1 text-xs"
                    onClick={() => onRegenerate(alt.index)}
                  >
                    Regenerate
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {active && active.imageUrl && (
        <div className="mt-6">
          <div className="relative inline-block">
            <Image
              src={active.imageUrl}
              alt={`Design alternative ${active.index + 1} detail`}
              width={800}
              height={600}
              className="rounded-md"
            />
            {active.hasHotspots && (
              <HotspotOverlay
                hotspots={active.items.map((i) => ({
                  productId: i.productId,
                  productName: i.product.name,
                  x: i.x,
                  y: i.y,
                  width: i.width,
                  height: i.height,
                }))}
                onSelect={selectProduct}
              />
            )}
          </div>

          {!active.hasHotspots && active.items.length > 0 && (
            <ul className="mt-4 flex flex-col gap-2">
              {active.items.map((i) => (
                <li key={i.productId}>
                  <button
                    className="text-sm underline"
                    onClick={() => selectProduct(i.productId)}
                  >
                    {i.product.name} — ${i.product.price}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <ProductDetailPanel
        product={selectedProduct}
        open={Boolean(selectedProduct)}
        onOpenChange={(open) => !open && setSelectedProduct(null)}
      />
    </div>
  );
}
