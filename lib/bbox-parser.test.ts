import { describe, it, expect } from "vitest";
import { parseBboxResponse } from "./bbox-parser";

describe("parseBboxResponse", () => {
  it("parses a well-formed JSON array response", () => {
    const raw = JSON.stringify([
      { productId: "1", x: 0.1, y: 0.2, width: 0.3, height: 0.25 },
    ]);
    const result = parseBboxResponse(raw);
    expect(result).toEqual([{ productId: "1", x: 0.1, y: 0.2, width: 0.3, height: 0.25 }]);
  });

  it("strips surrounding markdown code fences", () => {
    const raw = "```json\n" + JSON.stringify([{ productId: "1", x: 0, y: 0, width: 0.5, height: 0.5 }]) + "\n```";
    const result = parseBboxResponse(raw);
    expect(result).toHaveLength(1);
  });

  it("drops entries missing required fields instead of throwing", () => {
    const raw = JSON.stringify([
      { productId: "1", x: 0.1, y: 0.2, width: 0.3, height: 0.25 },
      { productId: "2", x: 0.1 },
    ]);
    const result = parseBboxResponse(raw);
    expect(result).toEqual([{ productId: "1", x: 0.1, y: 0.2, width: 0.3, height: 0.25 }]);
  });

  it("drops entries with out-of-range coordinates", () => {
    const raw = JSON.stringify([
      { productId: "1", x: 1.5, y: 0.2, width: 0.3, height: 0.25 },
    ]);
    const result = parseBboxResponse(raw);
    expect(result).toEqual([]);
  });

  it("returns an empty array for completely malformed input", () => {
    expect(parseBboxResponse("not json at all")).toEqual([]);
  });

  it("returns an empty array for valid JSON that is not an array", () => {
    expect(parseBboxResponse('{"foo": "bar"}')).toEqual([]);
  });
});
