import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { product: { include: { brand: true } } },
  });

  const products = favorites.map((f) => ({
    id: f.product.id,
    name: f.product.name,
    brandName: f.product.brand.name,
    color: f.product.color,
    dimensions: f.product.dimensions,
    material: f.product.material,
    price: f.product.price,
    imageUrl: f.product.imageUrl,
  }));

  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const productId = (body as { productId?: unknown })?.productId;
  if (typeof productId !== "string" || !productId) {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  try {
    await prisma.favorite.create({ data: { userId, productId } });
  } catch (err) {
    // Unique constraint violation (already favorited) - idempotent
    // success, not an error. Prisma's known-error code for this is P2002.
    const isDuplicate =
      typeof err === "object" && err !== null && "code" in err && (err as { code: unknown }).code === "P2002";
    if (!isDuplicate) throw err;
  }

  return NextResponse.json({ favorited: true }, { status: 200 });
}
