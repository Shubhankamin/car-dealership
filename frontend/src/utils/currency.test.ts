import { describe, expect, it } from "vitest";
import { formatPrice } from "./currency";

describe("formatPrice", () => {
  it("formats rupees with the rupee symbol", () => {
    expect(formatPrice(28500)).toBe("₹28,500");
  });

  it("uses Indian digit grouping for lakhs and crores", () => {
    expect(formatPrice(1250000)).toBe("₹12,50,000");
    expect(formatPrice(15000000)).toBe("₹1,50,00,000");
  });
});
