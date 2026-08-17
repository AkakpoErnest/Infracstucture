export interface ParsedBbox {
  productId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

function inUnitRange(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && n >= 0 && n <= 1;
}

/**
 * Parses Gemini's response to the "identify products in this image" call.
 * The model is asked for a JSON array but may wrap it in markdown fences or
 * occasionally omit fields — this never throws; malformed entries are
 * dropped so one bad entry doesn't break the whole alternative.
 */
export function parseBboxResponse(raw: string): ParsedBbox[] {
  const stripped = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(stripped);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) {
    return [];
  }

  const results: ParsedBbox[] = [];
  for (const entry of parsed) {
    if (
      entry &&
      typeof entry === "object" &&
      typeof (entry as Record<string, unknown>).productId === "string" &&
      inUnitRange((entry as Record<string, unknown>).x) &&
      inUnitRange((entry as Record<string, unknown>).y) &&
      inUnitRange((entry as Record<string, unknown>).width) &&
      inUnitRange((entry as Record<string, unknown>).height)
    ) {
      const e = entry as Record<string, unknown>;
      results.push({
        productId: e.productId as string,
        x: e.x as number,
        y: e.y as number,
        width: e.width as number,
        height: e.height as number,
      });
    }
  }
  return results;
}
