import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetServerSession = vi.fn();
vi.mock("next-auth", () => ({ getServerSession: (...a: unknown[]) => mockGetServerSession(...a) }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));

const mockFindMany = vi.fn();
const mockDesignCreate = vi.fn();
const mockDesignFindMany = vi.fn();
const mockDesignCount = vi.fn();
const mockAlternativeCreate = vi.fn();
const mockAlternativeUpdate = vi.fn();
const mockDesignItemCreateMany = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: { findMany: (...a: unknown[]) => mockFindMany(...a) },
    design: {
      create: (...a: unknown[]) => mockDesignCreate(...a),
      findMany: (...a: unknown[]) => mockDesignFindMany(...a),
      count: (...a: unknown[]) => mockDesignCount(...a),
    },
    designAlternative: {
      create: (...a: unknown[]) => mockAlternativeCreate(...a),
      update: (...a: unknown[]) => mockAlternativeUpdate(...a),
    },
    designItem: { createMany: (...a: unknown[]) => mockDesignItemCreateMany(...a) },
  },
}));

const mockIsClaudeConfigured = vi.fn();
const mockIdentify = vi.fn();
vi.mock("@/lib/claude-vision", () => ({
  isClaudeConfigured: () => mockIsClaudeConfigured(),
  identifyProductsInImage: (...a: unknown[]) => mockIdentify(...a),
}));

const mockIsReplicateConfigured = vi.fn();
const mockGenerate = vi.fn();
vi.mock("@/lib/replicate-images", () => ({
  isReplicateConfigured: () => mockIsReplicateConfigured(),
  generateRoomDesign: (...a: unknown[]) => mockGenerate(...a),
}));

const mockPut = vi.fn();
vi.mock("@vercel/blob", () => ({ put: (...a: unknown[]) => mockPut(...a) }));

import { POST, GET } from "./route";

function req(body: unknown) {
  return new Request("http://localhost/api/designs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  roomPhotoUrl: "https://example.public.blob.vercel-storage.com/rooms/abc.png",
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
    mockIsClaudeConfigured.mockReturnValue(true);
    mockIsReplicateConfigured.mockReturnValue(true);
    mockDesignCount.mockResolvedValue(0);
    mockGenerate.mockResolvedValue({ base64: "ZmFrZQ==", mimeType: "image/png" });
    mockIdentify.mockResolvedValue(
      JSON.stringify([{ productId: "1", x: 0.1, y: 0.1, width: 0.3, height: 0.3 }])
    );
    mockPut.mockResolvedValue({
      url: "https://example.public.blob.vercel-storage.com/designs/generated.png",
    });
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

  it("rejects a non-URL roomPhotoUrl (e.g. a path-traversal attempt) with 400", async () => {
    const res = await POST(req({ ...validBody, roomPhotoUrl: "../.env.local" }));
    expect(res.status).toBe(400);
  });

  it("rejects a bare filesystem path roomPhotoUrl with 400", async () => {
    const res = await POST(req({ ...validBody, roomPhotoUrl: "/etc/passwd" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for a malformed JSON body", async () => {
    const malformedReq = new Request("http://localhost/api/designs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{not valid json",
    });
    const res = await POST(malformedReq);
    expect(res.status).toBe(400);
  });

  it("returns 503 with a clear message when Replicate is not configured", async () => {
    mockIsReplicateConfigured.mockReturnValue(false);
    const res = await POST(req(validBody));
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.error).toMatch(/unavailable/i);
  });

  it("returns 429 with a clear message once the user hits the daily design limit", async () => {
    mockDesignCount.mockResolvedValue(4);
    const res = await POST(req(validBody));
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error).toMatch(/daily limit/i);
    // Should reject before doing any generation work.
    expect(mockDesignCreate).not.toHaveBeenCalled();
    expect(mockGenerate).not.toHaveBeenCalled();
  });

  it("scopes the daily design count to the signed-in user", async () => {
    await POST(req(validBody));
    expect(mockDesignCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: "u1" }),
      })
    );
  });

  it("allows generation when the user is just under the daily limit", async () => {
    mockDesignCount.mockResolvedValue(3);
    const res = await POST(req(validBody));
    expect(res.status).toBe(201);
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
    expect(failedUpdate?.[0].data.errorMessage).toBe("safety block");
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

describe("GET /api/designs", () => {
  beforeEach(() => {
    // This describe block's own beforeEach — the POST block's vi.clearAllMocks()
    // is scoped to its own describe and does not run before these tests. Reset
    // mockDesignFindMany explicitly so no stale mockResolvedValue/call history
    // from a previous test (in this block or elsewhere) can leak in.
    mockDesignFindMany.mockReset();
    mockGetServerSession.mockResolvedValue({ user: { id: "u1" } });
  });

  it("returns 401 when not signed in", async () => {
    mockGetServerSession.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns only the signed-in user's designs, newest first", async () => {
    mockDesignFindMany.mockResolvedValue([
      { id: "d2", roomType: "Bedroom", style: "Japandi", createdAt: new Date("2026-01-02") },
      { id: "d1", roomType: "Living Room", style: "Scandinavian", createdAt: new Date("2026-01-01") },
    ]);
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(2);
    expect(mockDesignFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "u1" },
        orderBy: { createdAt: "desc" },
      })
    );
  });

  it("returns an empty array when the user has no designs", async () => {
    mockDesignFindMany.mockResolvedValue([]);
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual([]);
  });
});
