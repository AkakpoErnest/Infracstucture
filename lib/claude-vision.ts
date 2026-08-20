// --- Scope note (2026-08-20) ---
// Replaces lib/gemini.ts's identifyProductsInImage as the product bounding-box
// detector. Gemini's image-*generation* role had already been replaced by Replicate
// (lib/replicate-images.ts) before this change; this swap moves its one remaining
// job — locating named catalog products in an already-generated room image — off
// Gemini entirely, at the user's request.
//
// Model/approach chosen after live-testing alternatives:
//   - Replicate-hosted community vision models (lucataco/qwen2-vl-7b-instruct,
//     yorickvp/llava-v1.6-34b) were tried first, since Replicate is already this
//     app's provider for image generation. qwen2-vl-7b-instruct returned
//     `402 Insufficient credit` (community models bill dedicated GPU-hours,
//     separately from official models like flux-kontext-pro); llava-v1.6-34b has
//     no deployed version at all (archived). Neither was usable regardless of
//     billing, and open VLMs are historically much weaker than Gemini/Claude at
//     precise bounding-box coordinates for this kind of grounding task anyway.
//   - Claude (claude-sonnet-4-5) was live-tested instead: given the same
//     generated room image and a shortlist of real catalog product names, it
//     returned a markdown-fenced JSON array of {productId, x, y, width, height}
//     that parses cleanly through the *existing, unmodified*
//     lib/bbox-parser.ts (which already strips ``` fences) — same output
//     contract as Gemini, zero changes needed downstream. It also correctly
//     omitted the one product it couldn't confidently locate, matching the
//     "omit what you can't find" instruction. See task notes for the exact
//     request/response.
//
// Call shape: POST to https://api.anthropic.com/v1/messages with the image as
// a base64 content block alongside the text prompt, same one-shot fire-and-parse
// shape identifyProductsInImage always had (no SDK dependency added — plain
// fetch, matching lib/replicate-images.ts's style).

function getModel(): string {
  return process.env.ANTHROPIC_VISION_MODEL || "claude-sonnet-4-5";
}

export function isClaudeConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/**
 * Given a generated design image and the shortlist of products it was
 * allowed to use, asks Claude to identify which products appear where.
 * Returns the raw text response — parsing/validation happens in
 * lib/bbox-parser.ts so this function stays a thin I/O wrapper.
 */
export async function identifyProductsInImage(
  imageBase64: string,
  mimeType: string,
  shortlist: { id: string; name: string }[]
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }

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

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: getModel(),
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mimeType, data: imageBase64 } },
            { type: "text", text: prompt },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`Claude request failed (${response.status}): ${errText}`);
  }

  const message = (await response.json()) as {
    content?: { type: string; text?: string }[];
  };

  const textBlock = message.content?.find((c) => c.type === "text");
  return textBlock?.text ?? "";
}
