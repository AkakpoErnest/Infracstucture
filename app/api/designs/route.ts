import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { put } from "@vercel/blob";
import { randomUUID } from "crypto";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildCatalogShortlist, type CatalogProduct } from "@/lib/catalog-shortlist";
import { buildDesignPrompt } from "@/lib/prompt-builder";
import { parseBboxResponse } from "@/lib/bbox-parser";
import { identifyProductsInImage } from "@/lib/claude-vision";
import { isReplicateConfigured, generateRoomDesign } from "@/lib/replicate-images";

const NUM_ALTERNATIVES = 4;
const DAILY_DESIGN_LIMIT = 4;

const designRequestSchema = z.object({
  // Uploads live in Vercel Blob now (app/api/uploads/route.ts), which
  // returns a full https:// URL - not the old local /uploads/rooms/...
  // path this used to validate against.
  roomPhotoUrl: z.string().url(),
  roomType: z.enum([
    "Living Room", "Bedroom", "Kitchen", "Bathroom", "Children's Room",
    "Office", "Hallway", "Balcony", "Other",
  ]),
  style: z.enum([
    "Modern", "Minimalist", "Scandinavian", "Japandi", "Luxury", "Classic",
    "Industrial", "Mediterranean", "Bohemian", "Rustic",
  ]),
  colorPrefs: z.string(),
  materialPrefs: z.array(z.string()),
  flooringPref: z.string(),
  budget: z.number().positive(),
  serviceOption: z.enum(["inspiration_only", "ready_to_implement", "purchase_only", "turnkey"]),
});

async function saveGeneratedImage(base64: string, mimeType: string): Promise<string> {
  const ext = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
  const filename = `designs/${randomUUID()}.${ext}`;
  const blob = await put(filename, Buffer.from(base64, "base64"), {
    access: "public",
    contentType: mimeType,
  });
  return blob.url;
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

  const parsed = designRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const input = parsed.data;

  if (!isReplicateConfigured()) {
    return NextResponse.json(
      { error: "AI generation is currently unavailable. No Replicate API token is configured." },
      { status: 503 }
    );
  }

  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);
  const designsToday = await prisma.design.count({
    where: { userId, createdAt: { gte: startOfToday } },
  });
  if (designsToday >= DAILY_DESIGN_LIMIT) {
    return NextResponse.json(
      {
        error: `Daily limit reached (${DAILY_DESIGN_LIMIT} designs per day). Please try again tomorrow.`,
      },
      { status: 429 }
    );
  }

  const allProducts = await prisma.product.findMany();
  const catalogProducts: CatalogProduct[] = allProducts.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    styleTags: p.styleTags.split(","),
    price: p.price,
  }));

  const shortlist = buildCatalogShortlist(catalogProducts, {
    style: input.style,
    budget: input.budget,
  });

  if (shortlist.length === 0) {
    return NextResponse.json(
      { error: `No catalog products match style "${input.style}" within the given budget.` },
      { status: 422 }
    );
  }

  // Used below to filter Claude's bounding-box response: DesignItem.productId
  // has a foreign-key constraint against Product.id, so if Claude hallucinates
  // a productId that wasn't in the shortlist we sent it, createMany would
  // reject the *entire* batch for that alternative (Prisma FK violation),
  // silently discarding hotspots for every correctly-identified product too.
  const shortlistIds = new Set(shortlist.map((p) => p.id));

  const design = await prisma.design.create({
    data: {
      userId,
      roomPhotoUrl: input.roomPhotoUrl,
      roomType: input.roomType,
      style: input.style,
      colorPrefs: input.colorPrefs,
      materialPrefs: input.materialPrefs.join(","),
      flooringPref: input.flooringPref,
      budget: input.budget,
      serviceOption: input.serviceOption,
    },
  });

  const prompt = buildDesignPrompt({
    roomType: input.roomType,
    style: input.style,
    colorPrefs: input.colorPrefs,
    materialPrefs: input.materialPrefs,
    flooringPref: input.flooringPref,
    budget: input.budget,
    shortlist,
  });

  const wantsHotspots = input.serviceOption === "ready_to_implement";

  for (let index = 0; index < NUM_ALTERNATIVES; index++) {
    const alternative = await prisma.designAlternative.create({
      data: { designId: design.id, index, status: "pending" },
    });

    try {
      const generated = await generateRoomDesign(input.roomPhotoUrl, prompt);
      const imageUrl = await saveGeneratedImage(generated.base64, generated.mimeType);

      let hasHotspots = false;
      if (wantsHotspots) {
        try {
          const raw = await identifyProductsInImage(
            generated.base64,
            generated.mimeType,
            shortlist.map((p) => ({ id: p.id, name: p.name }))
          );
          const boxes = parseBboxResponse(raw);
          // Drop any hallucinated productId that isn't in the shortlist we
          // actually sent to Claude — see comment on shortlistIds above.
          const validBoxes = boxes.filter((b) => shortlistIds.has(b.productId));
          if (validBoxes.length > 0) {
            await prisma.designItem.createMany({
              data: validBoxes.map((b) => ({
                designAlternativeId: alternative.id,
                productId: b.productId,
                bboxX: b.x,
                bboxY: b.y,
                bboxWidth: b.width,
                bboxHeight: b.height,
              })),
            });
            hasHotspots = true;
          }
        } catch {
          // Hotspot mapping failed — alternative still succeeds, just falls
          // back to a plain product list in the UI (hasHotspots stays false).
        }
      }

      await prisma.designAlternative.update({
        where: { id: alternative.id },
        data: { status: "ready", imageUrl, hasHotspots },
      });
    } catch (err) {
      await prisma.designAlternative.update({
        where: { id: alternative.id },
        data: { status: "failed", errorMessage: err instanceof Error ? err.message : "Generation failed" },
      });
    }
  }

  return NextResponse.json({ designId: design.id }, { status: 201 });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const designs = await prisma.design.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, roomType: true, style: true, createdAt: true },
  });

  return NextResponse.json(designs);
}
