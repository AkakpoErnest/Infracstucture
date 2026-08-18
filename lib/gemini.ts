import { GoogleGenAI } from "@google/genai";

// --- Scope note (2026-08-18) ---
// This file previously also handled image *generation* (generateRoomDesign) via Gemini's
// image-output models. That path has moved to lib/openai-images.ts (OpenAI's gpt-image-1)
// because this project's Gemini account has zero quota for image-*generation* specifically
// on its billing tier (confirmed via live testing — see lib/openai-images.ts's own
// verification note). Gemini's text/vision capabilities, used below by
// identifyProductsInImage to locate catalog products in an already-generated image, were
// confirmed working fine in that same testing and are unaffected — this file now only
// covers that product-identification/hotspot-detection path. `isGeminiConfigured()` is kept
// (still gates identifyProductsInImage from app/api/designs/route.ts), but no longer gates
// image generation.

// --- API surface verification note ---
// Verified 2026-08-17 against https://ai.google.dev/gemini-api/docs/image-generation,
// https://ai.google.dev/gemini-api/docs/migrate, and the installed
// node_modules/@google/genai/dist/genai.d.ts (v2.17.1) type definitions.
//
// `@google/generative-ai` (the package the plan's reference code used) is EOL:
// its GitHub repo was archived and renamed to `google-gemini/deprecated-generative-ai-js`,
// with "all support (including bug fixes)" stated to have ended 2025-11-30. The npm
// registry entry for `@google/generative-ai` is not (yet) marked `deprecated`, but the
// upstream repo is archived/read-only, so it should be treated as unmaintained.
// This project has migrated to the unified `@google/genai` SDK (installed via
// `npm uninstall @google/generative-ai && npm install @google/genai`, package.json
// now depends on `@google/genai@^2.17.1`).
//
// Shape differences from the plan's reference code:
//   - No `client.getGenerativeModel({model})` step; the model id is passed per-call
//     to `ai.models.generateContent({ model, contents })` instead.
//   - `result.response.text()` (a method) becomes `response.text` (a getter property).
//   - `result.response.candidates` becomes `response.candidates` directly (generateContent
//     resolves to the response object itself, there is no wrapping `.response`).
//   - Image parts are unchanged in shape: `part.inlineData.data` / `part.inlineData.mimeType`
//     on `response.candidates[0].content.parts`.
//
// Model name: the plan defaulted to "gemini-2.5-flash-image" ("Nano Banana"). As of this
// verification, Google's current docs list "gemini-2.5-flash-image" as legacy and recommend
// "gemini-3.1-flash-image" ("Nano Banana 2") for new integrations, so that is the default
// below. Both model names were confirmed live: a smoke test against this project's real
// GEMINI_API_KEY reached the server and got model-specific responses for each (a 429 quota
// error naming "gemini-2.5-flash-preview-image" / "gemini-3.1-flash-image" respectively —
// this account's free tier has 0 quota for image-*output* models, so full round-trip image
// generation could not be exercised live, but both model ids are recognized and routed
// correctly by the API). The image-input + text-output path (used by
// identifyProductsInImage) was fully exercised live on "gemini-3.6-flash" and confirmed to
// return `response.text` and `response.candidates[0].content.parts[].text` as expected — see
// task report for the exact call/response. The default here stays overridable via
// GEMINI_IMAGE_MODEL (.env.local / .env.example) so upgrading later requires no code change.

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenAI({ apiKey });
}

function getImageModel(): string {
  return process.env.GEMINI_IMAGE_MODEL || "gemini-3.1-flash-image";
}

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

/**
 * Given a generated design image and the shortlist of products it was
 * allowed to use, asks Gemini to identify which products appear where.
 * Returns the raw text response — parsing/validation happens in
 * lib/bbox-parser.ts so this function stays a thin I/O wrapper.
 */
export async function identifyProductsInImage(
  imageBase64: string,
  mimeType: string,
  shortlist: { id: string; name: string }[]
): Promise<string> {
  const client = getClient();

  const productList = shortlist.map((p) => `- id: ${p.id}, name: ${p.name}`).join("\n");
  const prompt = [
    "Identify which of the following products appear in this room image, and where.",
    productList,
    "",
    'Respond with ONLY a JSON array, no prose, in this exact shape:',
    '[{"productId": "<id>", "x": <0-1>, "y": <0-1>, "width": <0-1>, "height": <0-1>}]',
    "x/y are the top-left corner of the item's bounding box, normalized to the image dimensions.",
    "Omit any product you cannot confidently locate.",
  ].join("\n");

  const response = await client.models.generateContent({
    model: getImageModel(),
    contents: [
      { inlineData: { data: imageBase64, mimeType } },
      { text: prompt },
    ],
  });

  return response.text ?? "";
}
