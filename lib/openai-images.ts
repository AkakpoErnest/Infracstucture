import OpenAI, { toFile } from "openai";
import fs from "fs/promises";

export interface GeneratedImage {
  base64: string;
  mimeType: string;
}

// --- API surface verification note ---
// Verified 2026-08-18 against the installed node_modules/openai/resources/images.d.ts
// (v7.5.0) type definitions, since platform.openai.com/docs/guides/image-generation and
// platform.openai.com/docs/api-reference/images now redirect (301/403) to
// developers.openai.com, whose fetched content disagreed with itself across queries (one
// pass described a `images`/`file_id` request shape that does not match the installed SDK
// at all — likely a mismatch between a newer "Responses API" image tool and the classic
// `/v1/images/edits` REST endpoint this SDK method calls). The installed .d.ts is the
// ground truth actually exercised at runtime, so it wins over the fetched docs pages.
//
// `openai` was not previously a project dependency; installed via `npm install
// openai@latest`, which resolved to `openai@7.5.0` (package.json now depends on
// `openai@^7.5.0`). Note: npm printed an EBADENGINE warning because this package's
// package.json declares `engines.node >= 22.0.0` while this project runs on Node
// v20.19.4 — this is a warning, not a hard failure (npm still installed it), and the
// live smoke test below (see task report) confirms it works at runtime on this Node
// version. Flagging in case a future Node upgrade becomes necessary for a later
// `openai` release that enforces this. This project's own package.json now declares
// `engines.node: ">=20.19.0"` documenting the actual current baseline (not the
// `openai` package's aspirational >=22 requirement) — that Node-version mismatch
// is a known, accepted gap: nothing enforces `engines` by default in npm, so this
// stays silent unless someone runs `npm install` with `engine-strict` on, or
// upgrades `openai` to a release that hard-requires 22 at runtime, not just install time.
//
// Confirmed API shape for `gpt-image-1` image editing (image-to-image restyle):
//   - Method: `client.images.edit({ image, prompt, model, ... })` — NOT `generate`
//     (`generate` is text-to-image only, with no input photo).
//   - `image` accepts `Uploadable | Array<Uploadable>`, not a raw base64 string. The SDK's
//     `toFile()` helper wraps a Buffer (what `fs.readFile` returns) into an `Uploadable`
//     given a filename and `{ type: mimeType }` — mirrors the Buffer-in-memory pattern
//     lib/gemini.ts uses for inlineData, just wrapped for multipart upload instead of
//     base64-embedded in a JSON body.
//   - `mask` is optional — confirmed via the field's own JSDoc ("An additional image
//     whose fully transparent areas... indicate where `image` should be edited"). Omitting
//     it edits/restyles the whole image, which is what a full-room redesign needs.
//   - There is no `response_format` param for GPT image models: the `Image.b64_json` field
//     JSDoc states base64 is "Returned by default for the GPT image models"; `response_format`
//     is documented as "only supported for `dall-e-2`" (GPT image models "always return
//     base64-encoded images"). `Image.url` is explicitly "Unsupported for the GPT image
//     models". So no response_format needs to be passed — b64_json is just always present.
//   - `size` accepts `1024x1024` | `1536x1024` | `1024x1536` | `auto` (plus dall-e-only
//     values); left as `auto` (the API's own default-of-sorts) rather than hardcoded, since
//     nothing in this task specifies a target resolution.
//   - `quality` accepts `low` | `medium` | `high` | `auto` (defaults to `auto`); left unset
//     to take that default.
//   - `n` (number of images) defaults to 1 when omitted, which is what's wanted here — one
//     edited image per call (the route already loops NUM_ALTERNATIVES times for variety).
//
// Model name / deprecation: the SDK's own `.d.ts` for `ImageEditParamsBase.model` states
// GPT image models are one of `gpt-image-1`, `gpt-image-1-mini`, `gpt-image-1.5`,
// `gpt-image-2`, `gpt-image-2-2026-04-21`, or `chatgpt-image-latest`, defaulting to
// `gpt-image-1.5` if `model` is omitted entirely. Live web research (developers.openai.com's
// deprecations page) found `gpt-image-1` itself is marked deprecated with a December 1,
// 2026 shutdown and `gpt-image-2` as the recommended replacement — this task explicitly
// asked for `gpt-image-1` specifically, so that is what's used below, but — matching the
// GEMINI_IMAGE_MODEL precedent in lib/gemini.ts for exactly this kind of model churn — the
// model id is overridable via OPENAI_IMAGE_MODEL (.env.local / .env.example) so migrating
// to gpt-image-2 later needs no code change. Full round-trip image generation against the
// real, funded OPENAI_API_KEY in .env.local was exercised live for gpt-image-1 — see task
// report for the exact call/response shape.

function getClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  return new OpenAI({ apiKey });
}

// TODO(2026-11-01): gpt-image-1 shuts down 2026-12-01 — switch OPENAI_IMAGE_MODEL to
// gpt-image-2 before then.
function getImageModel(): string {
  return process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";
}

export function isOpenAiConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

/**
 * Generates one photorealistic room redesign image from a source room photo
 * and a text prompt describing the desired style and allowed products.
 */
export async function generateRoomDesign(
  roomPhotoPath: string,
  prompt: string
): Promise<GeneratedImage> {
  const client = getClient();

  const imageBytes = await fs.readFile(roomPhotoPath);
  const mimeType = roomPhotoPath.endsWith(".png")
    ? "image/png"
    : roomPhotoPath.endsWith(".webp")
    ? "image/webp"
    : "image/jpeg";

  const uploadableImage = await toFile(imageBytes, `room.${mimeType.split("/")[1]}`, {
    type: mimeType,
  });

  const response = await client.images.edit({
    model: getImageModel(),
    image: uploadableImage,
    prompt,
  });

  const image = response.data?.[0];

  if (!image?.b64_json) {
    throw new Error("OpenAI response did not contain an image");
  }

  const outputFormat = response.output_format ?? mimeType.split("/")[1];

  return {
    base64: image.b64_json,
    mimeType: `image/${outputFormat}`,
  };
}
