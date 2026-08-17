import { describe, it, expect, vi, beforeEach } from "vitest";

const mockCreate = vi.fn();
const mockFindUnique = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      create: (...args: unknown[]) => mockCreate(...args),
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
    },
  },
}));

import { POST } from "./route";

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/auth/signup", () => {
  beforeEach(() => {
    mockCreate.mockReset();
    mockFindUnique.mockReset();
  });

  it("creates a user with a hashed password", async () => {
    mockFindUnique.mockResolvedValue(null);
    mockCreate.mockResolvedValue({ id: "u1", email: "a@b.com", name: "Ana" });

    const res = await POST(jsonRequest({ email: "a@b.com", password: "hunter22", name: "Ana" }));

    expect(res.status).toBe(201);
    const createArgs = mockCreate.mock.calls[0][0];
    expect(createArgs.data.passwordHash).not.toBe("hunter22");
  });

  it("rejects a duplicate email with 409", async () => {
    mockFindUnique.mockResolvedValue({ id: "u1", email: "a@b.com" });

    const res = await POST(jsonRequest({ email: "a@b.com", password: "hunter22", name: "Ana" }));

    expect(res.status).toBe(409);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("rejects a short password with 400", async () => {
    const res = await POST(jsonRequest({ email: "a@b.com", password: "123", name: "Ana" }));
    expect(res.status).toBe(400);
  });

  it("rejects a malformed JSON body with 400", async () => {
    const res = await POST(
      new Request("http://localhost/api/auth/signup", {
        method: "POST",
        body: "{not valid json",
        headers: { "Content-Type": "application/json" },
      })
    );

    expect(res.status).toBe(400);
    expect(mockFindUnique).not.toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("normalizes email to lowercase before lookup and creation", async () => {
    mockFindUnique.mockResolvedValue(null);
    mockCreate.mockResolvedValue({ id: "u1", email: "foo@x.com", name: "Ana" });

    const res = await POST(jsonRequest({ email: "Foo@X.com", password: "hunter22", name: "Ana" }));

    expect(res.status).toBe(201);
    expect(mockFindUnique.mock.calls[0][0]).toEqual({ where: { email: "foo@x.com" } });
    expect(mockCreate.mock.calls[0][0].data.email).toBe("foo@x.com");
  });
});
