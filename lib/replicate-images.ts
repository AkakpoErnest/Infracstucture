import fs from "fs/promises";

export interface GeneratedImage {
  base64: string;
  mimeType: string;
}

// --- API surface verification note (2026-08-20) ---
// This file replaces lib/openai-images.ts (gpt-image-1) as the room-design image
// generator/editor, switching to Flux Kontext Pro via Replicate — chosen over
// black-forest-labs/flux-1.1-pro specifically because this app's job is to *edit* the
// user's actual uploaded room photo (restyle in place), not generate an unrelated room
// from a text prompt. flux-1.1-pro is text-to-image only (no input-image editing
// parameter); Flux Kontext is Black Forest Labs' image+text editing model, matching
// gpt-image-1's `images.edit` role here.
//
// Input schema confirmed against Black Forest Labs' own API docs
// (https://docs.bfl.ml/kontext/kontext_image_editing) since Replicate's model page is
// client-rendered and doesn't expose its schema via a plain fetch. Replicate proxies BFL's
// models directly, so the same field names apply:
//   - `prompt` (string, required): text description of the edit to apply.
//   - `input_image` (string, required): base64-encoded image OR a URL. A data: URI
//     (`data:<mime>;base64,<data>`) is accepted as the base64 form.
//   - `aspect_ratio`, `seed`, `prompt_upsampling`, `safety_tolerance`, `output_format`,
//     `webhook_url`, `webhook_secret` are optional; left at their defaults except
//     `output_format` (set to "png" to match this app's saved-file convention).
//
// Call shape mirrors the model docs the user supplied for flux-1.1-pro (same Replicate
// REST pattern): POST to
// `https://api.replicate.com/v1/models/{owner}/{model}/predictions` with a bearer token,
// using the `Prefer: wait` header so the request blocks until the prediction finishes
// (typically a few seconds for a single edit) instead of polling — keeps this function's
// shape a plain async call/return, matching generateRoomDesign's previous OpenAI shape.
// The model's output schema is a single string (a URI to the generated image), which is
// then downloaded and re-encoded as base64 so the return shape matches GeneratedImage
// exactly as OpenAI's version did (callers/route.ts are unchanged).
//
// The model id is overridable via REPLICATE_IMAGE_MODEL (.env.local / .env.example),
// matching the ANTHROPIC_VISION_MODEL / OPENAI_IMAGE_MODEL precedent for model churn.

function getModel(): string {
  return process.env.REPLICATE_IMAGE_MODEL || "black-forest-labs/flux-kontext-pro";
}

export function isReplicateConfigured(): boolean {
  return Boolean(process.env.REPLICATE_API_TOKEN);
}

/**
 * Generates one photorealistic room redesign image from a source room photo
 * and a text prompt describing the desired style and allowed products, via
 * Flux Kontext Pro (Black Forest Labs, hosted on Replicate).
 */
export async function generateRoomDesign(
  roomPhotoPath: string,
  prompt: string
): Promise<GeneratedImage> {
  const apiToken = process.env.REPLICATE_API_TOKEN;
  if (!apiToken) {
    throw new Error("REPLICATE_API_TOKEN is not set");
  }

  const imageBytes = await fs.readFile(roomPhotoPath);
  const mimeType = roomPhotoPath.endsWith(".png")
    ? "image/png"
    : roomPhotoPath.endsWith(".webp")
    ? "image/webp"
    : "image/jpeg";
  const inputImageDataUri = `data:${mimeType};base64,${imageBytes.toString("base64")}`;

  const response = await fetch(
    `https://api.replicate.com/v1/models/${getModel()}/predictions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
        Prefer: "wait",
      },
      body: JSON.stringify({
        input: {
          prompt,
          input_image: inputImageDataUri,
          output_format: "png",
        },
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`Replicate request failed (${response.status}): ${errText}`);
  }

  const prediction = (await response.json()) as {
    status: string;
    error?: string;
    output?: string | string[];
  };

  if (prediction.status !== "succeeded") {
    throw new Error(
      `Replicate prediction did not succeed (status: ${prediction.status}): ${
        prediction.error ?? "no error detail"
      }`
    );
  }

  const outputUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
  if (!outputUrl) {
    throw new Error("Replicate response did not contain an image output");
  }

  const imageResponse = await fetch(outputUrl);
  if (!imageResponse.ok) {
    throw new Error(`Failed to download generated image (${imageResponse.status})`);
  }
  const outputBytes = Buffer.from(await imageResponse.arrayBuffer());

  return {
    base64: outputBytes.toString("base64"),
    mimeType: "image/png",
  };
}
