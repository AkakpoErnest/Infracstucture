"use client";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface ProductDetail {
  id: string;
  name: string;
  brandName: string;
  color: string;
  dimensions: string;
  material: string;
  price: number;
  imageUrl: string;
}

export function ProductDetailPanel({
  product,
  open,
  onOpenChange,
}: {
  product: ProductDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>{product.name}</DialogTitle>
        <DialogDescription className="sr-only">Product details for {product.name}</DialogDescription>
        <Image
          src={product.imageUrl}
          alt={product.name}
          width={400}
          height={300}
          className="mt-2 w-full rounded-md object-cover"
        />
        <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <dt className="text-muted-foreground">Brand</dt>
          <dd>{product.brandName}</dd>
          <dt className="text-muted-foreground">Color</dt>
          <dd>{product.color}</dd>
          <dt className="text-muted-foreground">Dimensions</dt>
          <dd>{product.dimensions}</dd>
          <dt className="text-muted-foreground">Material</dt>
          <dd>{product.material}</dd>
          <dt className="text-muted-foreground">Price</dt>
          <dd>${product.price}</dd>
        </dl>
        <Button className="mt-4 w-full" disabled title="Purchasing isn't available yet">
          Buy Now (Coming soon)
        </Button>
      </DialogContent>
    </Dialog>
  );
}
