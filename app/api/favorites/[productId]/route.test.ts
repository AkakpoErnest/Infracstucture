import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetServerSession = vi.fn();
vi.mock("next-auth", () => ({ getServerSession: (...a: unknown[]) => mockGetServerSession(...a) }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));

const mockDeleteMany = vi.fn();
vi.mock("@/lib/prisma", () => ({
  prisma: {
    favorite: { deleteMany: (...a: unknown[]) => mockDeleteMany(...a) },
  },
}));

import { DELETE } from "./route";

function req() {
  return new Request("http://localhost/api/favorites/p1", { method: "DELETE" });
}

describe("DELETE /api/favorites/[productId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerSession.mockResolvedValue({ user: { id: "u1" } });
    mockDeleteMany.mockResolvedValue({ count: 1 });
  });

  it("returns 401 when not signed in", async () => {
    mockGetServerSession.mockResolvedValue(null);
    const res = await DELETE(req(), { params: { productId: "p1" } });
    expect(res.status).toBe(401);
  });

  it("removes the favorite and returns 200", async () => {
    const res = await DELETE(req(), { params: { productId: "p1" } });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ favorited: false });
    expect(mockDeleteMany).toHaveBeenCalledWith({ where: { userId: "u1", productId: "p1" } });
  });

  it("is idempotent - succeeds even if nothing was favorited", async () => {
    mockDeleteMany.mockResolvedValue({ count: 0 });
    const res = await DELETE(req(), { params: { productId: "p1" } });
    expect(res.status).toBe(200);
  });
});
