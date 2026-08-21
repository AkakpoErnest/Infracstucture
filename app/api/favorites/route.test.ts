import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetServerSession = vi.fn();
vi.mock("next-auth", () => ({ getServerSession: (...a: unknown[]) => mockGetServerSession(...a) }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));

const mockFindMany = vi.fn();
const mockCreate = vi.fn();
const mockProductFindUnique = vi.fn();
vi.mock("@/lib/prisma", () => ({
  prisma: {
    favorite: {
      findMany: (...a: unknown[]) => mockFindMany(...a),
      create: (...a: unknown[]) => mockCreate(...a),
    },
    product: {
      findUnique: (...a: unknown[]) => mockProductFindUnique(...a),
    },
  },
}));

import { GET, POST } from "./route";

function postReq(body: unknown) {
  return new Request("http://localhost/api/favorites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("GET /api/favorites", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerSession.mockResolvedValue({ user: { id: "u1" } });
  });

  it("returns 401 when not signed in", async () => {
    mockGetServerSession.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns favorited products in ProductDetail shape", async () => {
    mockFindMany.mockResolvedValue([
      {
        id: "f1",
        createdAt: new Date(),
        product: {
          id: "p1",
          name: "Oslo Sofa",
          color: "Grey",
          dimensions: "210x90x80cm",
          material: "Boucle",
          price: 899,
          imageUrl: "/img/oslo.png",
          brand: { name: "Nordika" },
        },
      },
    ]);
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual([
      {
        id: "p1",
        name: "Oslo Sofa",
        brandName: "Nordika",
        color: "Grey",
        dimensions: "210x90x80cm",
        material: "Boucle",
        price: 899,
        imageUrl: "/img/oslo.png",
      },
    ]);
  });
});

describe("POST /api/favorites", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerSession.mockResolvedValue({ user: { id: "u1" } });
    mockProductFindUnique.mockResolvedValue({ id: "p1" });
    mockCreate.mockResolvedValue({ id: "f1", userId: "u1", productId: "p1" });
  });

  it("returns 401 when not signed in", async () => {
    mockGetServerSession.mockResolvedValue(null);
    const res = await POST(postReq({ productId: "p1" }));
    expect(res.status).toBe(401);
  });

  it("returns 400 when productId is missing", async () => {
    const res = await POST(postReq({}));
    expect(res.status).toBe(400);
  });

  it("returns 404 when the product doesn't exist", async () => {
    mockProductFindUnique.mockResolvedValue(null);
    const res = await POST(postReq({ productId: "missing" }));
    expect(res.status).toBe(404);
  });

  it("creates a favorite and returns 200", async () => {
    const res = await POST(postReq({ productId: "p1" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ favorited: true });
    expect(mockCreate).toHaveBeenCalledWith({ data: { userId: "u1", productId: "p1" } });
  });

  it("treats an already-favorited product as success, not an error", async () => {
    mockCreate.mockRejectedValue({ code: "P2002" });
    const res = await POST(postReq({ productId: "p1" }));
    expect(res.status).toBe(200);
  });

  it("rethrows non-duplicate errors", async () => {
    mockCreate.mockRejectedValue(new Error("db exploded"));
    await expect(POST(postReq({ productId: "p1" }))).rejects.toThrow("db exploded");
  });
});
