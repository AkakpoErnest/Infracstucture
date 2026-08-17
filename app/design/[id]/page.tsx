"use client";
import { useEffect, useState, useCallback } from "react";
import { AlternativeGrid, type Alternative } from "@/components/design/alternative-grid";

interface DesignResponse {
  id: string;
  alternatives: Array<{
    id: string;
    index: number;
    imageUrl: string | null;
    status: "pending" | "ready" | "failed";
    hasHotspots: boolean;
    errorMessage: string | null;
    items: Array<{
      productId: string;
      bboxX: number;
      bboxY: number;
      bboxWidth: number;
      bboxHeight: number;
      product: {
        id: string;
        name: string;
        color: string;
        dimensions: string;
        material: string;
        price: number;
        imageUrl: string;
        brand: { name: string };
      };
    }>;
  }>;
}

export default function DesignResultsPage({ params }: { params: { id: string } }) {
  const [design, setDesign] = useState<DesignResponse | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/designs/${params.id}`);
    if (res.ok) setDesign(await res.json());
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  if (!design) {
    return <main className="p-8">Loading...</main>;
  }

  const alternatives: Alternative[] = design.alternatives.map((a) => ({
    id: a.id,
    index: a.index,
    imageUrl: a.imageUrl,
    status: a.status,
    hasHotspots: a.hasHotspots,
    errorMessage: a.errorMessage,
    items: a.items.map((i) => ({
      productId: i.productId,
      x: i.bboxX,
      y: i.bboxY,
      width: i.bboxWidth,
      height: i.bboxHeight,
      product: {
        id: i.product.id,
        name: i.product.name,
        brandName: i.product.brand.name,
        color: i.product.color,
        dimensions: i.product.dimensions,
        material: i.product.material,
        price: i.product.price,
        imageUrl: i.product.imageUrl,
      },
    })),
  }));

  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="mb-6 text-2xl font-bold">Your designs</h1>
      <AlternativeGrid alternatives={alternatives} onRegenerate={() => load()} />
    </main>
  );
}
