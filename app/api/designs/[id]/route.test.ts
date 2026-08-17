import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetServerSession = vi.fn();
vi.mock("next-auth", () => ({ getServerSession: (...a: unknown[]) => mockGetServerSession(...a) }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));

const mockFindUnique = vi.fn();
vi.mock("@/lib/prisma", () => ({
  prisma: {
    design: { findUnique: (...a: unknown[]) => mockFindUnique(...a) },
  },
}));

import { GET } from "./route";

function req() {
  return new Request("http://localhost/api/designs/d1");
}

const sampleDesign = {
  id: "d1",
  userId: "u1",
  alternatives: [
    {
      id: "alt-0",
      index: 0,
      imageUrl: "/uploads/designs/abc.png",
      status: "ready",
      hasHotspots: false,
      errorMessage: null,
      items: [],
    },
  ],
};

describe("GET /api/designs/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerSession.mockResolvedValue({ user: { id: "u1" } });
    mockFindUnique.mockResolvedValue(sampleDesign);
  });

  it("returns 401 when not signed in", async () => {
    mockGetServerSession.mockResolvedValue(null);
    const res = await GET(req(), { params: { id: "d1" } });
    expect(res.status).toBe(401);
  });

  it("returns 404 when the design doesn't exist", async () => {
    mockFindUnique.mockResolvedValue(null);
    const res = await GET(req(), { params: { id: "missing" } });
    expect(res.status).toBe(404);
  });

  it("returns 404 when the design belongs to a different user", async () => {
    mockFindUnique.mockResolvedValue({ ...sampleDesign, userId: "someone-else" });
    const res = await GET(req(), { params: { id: "d1" } });
    expect(res.status).toBe(404);
  });

  it("returns 200 with the design data on success", async () => {
    const res = await GET(req(), { params: { id: "d1" } });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe("d1");
    expect(body.alternatives).toHaveLength(1);
  });
});
