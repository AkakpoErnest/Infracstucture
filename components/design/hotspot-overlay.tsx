"use client";

export interface Hotspot {
  productId: string;
  productName: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export function HotspotOverlay({
  hotspots,
  onSelect,
}: {
  hotspots: Hotspot[];
  onSelect: (productId: string) => void;
}) {
  return (
    <div className="absolute inset-0">
      {hotspots.map((h) => (
        <button
          key={h.productId}
          type="button"
          aria-label={h.productName}
          onClick={() => onSelect(h.productId)}
          className="absolute rounded border-2 border-primary/70 bg-primary/10 transition-colors hover:bg-primary/25"
          style={{
            left: `${h.x * 100}%`,
            top: `${h.y * 100}%`,
            width: `${h.width * 100}%`,
            height: `${h.height * 100}%`,
          }}
        />
      ))}
    </div>
  );
}
