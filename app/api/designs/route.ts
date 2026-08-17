import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import path from "path";
import { mkdir, writeFile } from "fs/promises";
import { randomUUID } from "crypto";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildCatalogShortlist, type CatalogProduct } from "@/lib/catalog-shortlist";
import { buildDesignPrompt } from "@/lib/prompt-builder";
import { parseBboxResponse } from "@/lib/bbox-parser";
import {
  isGeminiConfigured,
  generateRoomDesign,
  identifyProductsInImage,
} from "@/lib/gemini";

const NUM_ALTERNATIVES = 4;

const designRequestSchema = z.object({
  roomPhotoUrl: z.string().min(1),
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
  const dir = path.join(process.cwd(), "public", "uploads", "designs");
  await mkdir(dir, { recursive: true });
  const filename = `${randomUUID()}.${ext}`;
  await writeFile(path.join(dir, filename), Buffer.from(base64, "base64"));
  return `/uploads/designs/${filename}`;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = designRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const input = parsed.data;

  if (!isGeminiConfigured()) {
    return NextResponse.json(
      { error: "AI generation is currently unavailable — no Gemini API key is configured." },
      { status: 503 }
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

  // Used below to filter Gemini's bounding-box response: DesignItem.productId
  // has a foreign-key constraint against Product.id, so if Gemini hallucinates
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

  const roomPhotoPath = path.join(process.cwd(), "public", input.roomPhotoUrl.replace(/^\//, ""));
  const wantsHotspots = input.serviceOption === "ready_to_implement";

  for (let index = 0; index < NUM_ALTERNATIVES; index++) {
    const alternative = await prisma.designAlternative.create({
      data: { designId: design.id, index, status: "pending" },
    });

    try {
      const generated = await generateRoomDesign(roomPhotoPath, prompt);
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
          // actually sent to Gemini — see comment on shortlistIds above.
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
