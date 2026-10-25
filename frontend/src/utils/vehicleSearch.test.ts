import { describe, expect, it } from "vitest";
import type { Vehicle } from "../types";
import { matchesKeyword } from "./vehicleSearch";

const camry: Vehicle = {
  id: "v1",
  make: "Toyota",
  model: "Camry",
  category: "Sedan",
  price: 4600000,
  quantity: 5,
};

describe("matchesKeyword", () => {
  it("matches everything when the keyword is blank", () => {
    expect(matchesKeyword(camry, "")).toBe(true);
    expect(matchesKeyword(camry, "   ")).toBe(true);
  });

  it("matches the make or the model, ignoring case", () => {
    expect(matchesKeyword(camry, "toyota")).toBe(true);
    expect(matchesKeyword(camry, "CAM")).toBe(true);
    expect(matchesKeyword(camry, "honda")).toBe(false);
  });

  it("requires every word to match somewhere", () => {
    expect(matchesKeyword(camry, "toyota camry")).toBe(true);
    expect(matchesKeyword(camry, "toyota civic")).toBe(false);
  });
});
