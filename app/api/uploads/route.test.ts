import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetServerSession = vi.fn();
vi.mock("next-auth", () => ({ getServerSession: (...a: unknown[]) => mockGetServerSession(...a) }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));

const mockPut = vi.fn();
vi.mock("@vercel/blob", () => ({ put: (...a: unknown[]) => mockPut(...a) }));

import { POST } from "./route";

function fileRequest(file: File | null) {
  const form = new FormData();
  if (file) form.set("file", file);
  return new Request("http://localhost/api/uploads", { method: "POST", body: form });
}

describe("POST /api/uploads", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerSession.mockResolvedValue({ user: { id: "u1" } });
    mockPut.mockResolvedValue({ url: "https://example.public.blob.vercel-storage.com/rooms/abc.png" });
  });

  it("returns 401 when not signed in", async () => {
    mockGetServerSession.mockResolvedValue(null);
    const file = new File([new Uint8Array([1, 2, 3])], "room.png", { type: "image/png" });
    const res = await POST(fileRequest(file));
    expect(res.status).toBe(401);
    expect(mockPut).not.toHaveBeenCalled();
  });

  it("rejects a request with no file", async () => {
    const res = await POST(fileRequest(null));
    expect(res.status).toBe(400);
  });

  it("rejects a non-image file", async () => {
    const file = new File(["hello"], "notes.txt", { type: "text/plain" });
    const res = await POST(fileRequest(file));
    expect(res.status).toBe(400);
  });

  it("rejects a file over 10MB", async () => {
    const big = new Uint8Array(10 * 1024 * 1024 + 1);
    const file = new File([big], "room.png", { type: "image/png" });
    const res = await POST(fileRequest(file));
    expect(res.status).toBe(400);
  });

  it("accepts a valid image and returns its blob URL", async () => {
    const file = new File([new Uint8Array([1, 2, 3])], "room.png", { type: "image/png" });
    const res = await POST(fileRequest(file));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.url).toBe("https://example.public.blob.vercel-storage.com/rooms/abc.png");
    expect(mockPut).toHaveBeenCalledWith(
      expect.stringMatching(/^rooms\/.+\.png$/),
      file,
      { access: "public", contentType: "image/png" }
    );
  });
});
