import { describe, it, expect } from "vitest";
import { greetingText } from "./greeting";

describe("greetingText", () => {
  it("includes the name when given", () => {
    expect(greetingText("Demo User")).toBe("Welcome back, Demo User");
  });

  it("falls back to a plain greeting when name is null", () => {
    expect(greetingText(null)).toBe("Welcome back");
  });

  it("falls back to a plain greeting when name is undefined", () => {
    expect(greetingText(undefined)).toBe("Welcome back");
  });
});
