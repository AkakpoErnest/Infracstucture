"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { AlternativeGrid, type Alternative } from "@/components/design/alternative-grid";
import { AppHeader } from "@/components/layout/app-header";

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
  const [error, setError] = useState<string | null>(null);
  // Next.js App Router re-renders this component with new `params` rather than
  // remounting it when navigating between two /design/[id] URLs. Track the id
  // the most recently started fetch was for, so a slow in-flight response for
  // a previous id can never clobber state for the id currently being viewed.
  const latestIdRef = useRef(params.id);

  const load = useCallback(async () => {
    const requestedId = params.id;
    latestIdRef.current = requestedId;
    setError(null);

    try {
      const res = await fetch(`/api/designs/${requestedId}`);
      if (latestIdRef.current !== requestedId) return; // navigated away before this resolved

      if (res.ok) {
        const data = await res.json();
        if (latestIdRef.current !== requestedId) return;
        setDesign(data);
      } else {
        setError(res.status === 401 ? "Please sign in to view this design." : "Design not found.");
      }
    } catch {
      setError("Could not load your design. Please try again.");
    }
  }, [params.id]);

  useEffect(() => {
    latestIdRef.current = params.id;
    setDesign(null);
    load();
  }, [params.id, load]);

  if (error) {
    return (
      <>
        <AppHeader />
        <main className="mx-auto max-w-xl p-8">
          <p className="text-sm text-destructive">{error}</p>
          <Link href="/design/new" className="mt-4 inline-block text-sm underline">
            Start a new design
          </Link>
        </main>
      </>
    );
  }

  if (!design) {
    return (
      <>
        <AppHeader />
        <main className="p-8">Loading...</main>
      </>
    );
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
    <>
      <AppHeader />
      <main className="mx-auto max-w-4xl p-8">
        <h1 className="mb-6 text-2xl font-bold">Your designs</h1>
        <AlternativeGrid alternatives={alternatives} onRegenerate={() => load()} />
      </main>
    </>
  );
}
