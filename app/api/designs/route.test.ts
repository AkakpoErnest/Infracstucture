import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetServerSession = vi.fn();
vi.mock("next-auth", () => ({ getServerSession: (...a: unknown[]) => mockGetServerSession(...a) }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));

const mockFindMany = vi.fn();
const mockDesignCreate = vi.fn();
const mockAlternativeCreate = vi.fn();
const mockAlternativeUpdate = vi.fn();
const mockDesignItemCreateMany = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: { findMany: (...a: unknown[]) => mockFindMany(...a) },
    design: { create: (...a: unknown[]) => mockDesignCreate(...a) },
    designAlternative: {
      create: (...a: unknown[]) => mockAlternativeCreate(...a),
      update: (...a: unknown[]) => mockAlternativeUpdate(...a),
    },
    designItem: { createMany: (...a: unknown[]) => mockDesignItemCreateMany(...a) },
  },
}));

const mockIsConfigured = vi.fn();
const mockGenerate = vi.fn();
const mockIdentify = vi.fn();
vi.mock("@/lib/gemini", () => ({
  isGeminiConfigured: () => mockIsConfigured(),
  generateRoomDesign: (...a: unknown[]) => mockGenerate(...a),
  identifyProductsInImage: (...a: unknown[]) => mockIdentify(...a),
}));

vi.mock("fs/promises", () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  writeFile: vi.fn().mockResolvedValue(undefined),
}));

import { POST } from "./route";

function req(body: unknown) {
  return new Request("http://localhost/api/designs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  roomPhotoUrl: "/uploads/rooms/abc.png",
  roomType: "Living Room",
  style: "Scandinavian",
  colorPrefs: "warm neutrals",
  materialPrefs: ["Wood Panels"],
  flooringPref: "Hardwood Flooring",
  budget: 2000,
  serviceOption: "ready_to_implement",
};

describe("POST /api/designs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerSession.mockResolvedValue({ user: { id: "u1" } });
    mockFindMany.mockResolvedValue([
      { id: "1", name: "Oslo Sofa", category: "Furniture", styleTags: "Scandinavian", price: 899 },
      { id: "3", name: "Nordic Rug", category: "Rugs & Flooring", styleTags: "Scandinavian", price: 210 },
    ]);
    mockDesignCreate.mockResolvedValue({ id: "d1" });
    mockAlternativeCreate.mockImplementation(({ data }: { data: Record<string, unknown> }) =>
      Promise.resolve({ id: `alt-${data.index}`, ...data })
    );
    mockIsConfigured.mockReturnValue(true);
    mockGenerate.mockResolvedValue({ base64: "ZmFrZQ==", mimeType: "image/png" });
    mockIdentify.mockResolvedValue(
      JSON.stringify([{ productId: "1", x: 0.1, y: 0.1, width: 0.3, height: 0.3 }])
    );
  });

  it("returns 401 when not signed in", async () => {
    mockGetServerSession.mockResolvedValue(null);
    const res = await POST(req(validBody));
    expect(res.status).toBe(401);
  });

  it("returns 400 for an invalid body", async () => {
    const res = await POST(req({ ...validBody, roomType: "Not A Room" }));
    expect(res.status).toBe(400);
  });

  it("returns 503 with a clear message when Gemini is not configured", async () => {
    mockIsConfigured.mockReturnValue(false);
    const res = await POST(req(validBody));
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.error).toMatch(/unavailable/i);
  });

  it("generates 4 alternatives and returns the design id on success", async () => {
    const res = await POST(req(validBody));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.designId).toBe("d1");
    expect(mockGenerate).toHaveBeenCalledTimes(4);
  });

  it("continues generating remaining alternatives when one fails", async () => {
    mockGenerate
      .mockResolvedValueOnce({ base64: "ZmFrZQ==", mimeType: "image/png" })
      .mockRejectedValueOnce(new Error("safety block"))
      .mockResolvedValueOnce({ base64: "ZmFrZQ==", mimeType: "image/png" })
      .mockResolvedValueOnce({ base64: "ZmFrZQ==", mimeType: "image/png" });

    const res = await POST(req(validBody));
    expect(res.status).toBe(201);
    expect(mockGenerate).toHaveBeenCalledTimes(4);
    const failedUpdate = mockAlternativeUpdate.mock.calls.find(
      (c) => c[0].data.status === "failed"
    );
    expect(failedUpdate).toBeTruthy();
  });

  it("skips the bounding-box call for Design Inspiration Only", async () => {
    await POST(req({ ...validBody, serviceOption: "inspiration_only" }));
    expect(mockIdentify).not.toHaveBeenCalled();
  });

  it("returns 422 when the shortlist is empty for the requested style", async () => {
    mockFindMany.mockResolvedValue([]);
    const res = await POST(req(validBody));
    expect(res.status).toBe(422);
  });

  it("drops a hallucinated productId not in the shortlist without failing the whole alternative", async () => {
    mockIdentify.mockResolvedValue(
      JSON.stringify([
        { productId: "1", x: 0.1, y: 0.1, width: 0.3, height: 0.3 },
        { productId: "does-not-exist", x: 0.5, y: 0.5, width: 0.2, height: 0.2 },
      ])
    );

    const res = await POST(req(validBody));
    expect(res.status).toBe(201);

    // createMany should only have been called with the valid productId ("1"),
    // never with the hallucinated one — otherwise the FK constraint on
    // DesignItem.productId would reject the whole batch.
    for (const call of mockDesignItemCreateMany.mock.calls) {
      const rows = call[0].data as { productId: string }[];
      for (const row of rows) {
        expect(row.productId).not.toBe("does-not-exist");
      }
    }

    const readyUpdate = mockAlternativeUpdate.mock.calls.find(
      (c) => c[0].data.status === "ready"
    );
    expect(readyUpdate).toBeTruthy();
    expect(readyUpdate?.[0].data.hasHotspots).toBe(true);
  });
});
