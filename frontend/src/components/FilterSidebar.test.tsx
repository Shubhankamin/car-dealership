import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import FilterSidebar from "./FilterSidebar";

const categories = ["Sedan", "SUV"];

function renderSidebar(props: Partial<Parameters<typeof FilterSidebar>[0]> = {}) {
  const onChange = vi.fn();
  const onInStockChange = vi.fn();
  render(
    <FilterSidebar
      filters={{}}
      categories={categories}
      inStockOnly={false}
      onChange={onChange}
      onInStockChange={onInStockChange}
      {...props}
    />,
  );
  return { onChange, onInStockChange };
}

describe("FilterSidebar", () => {
  it("selects a category", async () => {
    const { onChange } = renderSidebar();

    await userEvent.click(screen.getByRole("button", { name: "SUV" }));

    expect(onChange).toHaveBeenCalledWith({ category: "SUV" });
  });

  it("clears the category when All is chosen", async () => {
    const { onChange } = renderSidebar({ filters: { category: "SUV" } });

    await userEvent.click(screen.getByRole("button", { name: "All" }));

    expect(onChange).toHaveBeenCalledWith({ category: "" });
  });

  it("applies a price preset as a min and max range", async () => {
    const { onChange } = renderSidebar();

    await userEvent.click(
      screen.getByRole("button", { name: /₹10L – ₹50L/ }),
    );

    expect(onChange).toHaveBeenCalledWith({
      minPrice: "1000000",
      maxPrice: "5000000",
    });
  });

  it("toggles in-stock only", async () => {
    const { onInStockChange } = renderSidebar();

    await userEvent.click(screen.getByRole("checkbox", { name: /in stock only/i }));

    expect(onInStockChange).toHaveBeenCalledWith(true);
  });

  it("shows Clear all only when a filter is active and resets everything", async () => {
    renderSidebar();
    expect(screen.queryByRole("button", { name: /clear all/i })).toBeNull();

    const { onChange, onInStockChange } = renderSidebar({
      filters: { minPrice: "100" },
    });
    await userEvent.click(screen.getByRole("button", { name: /clear all/i }));

    expect(onChange).toHaveBeenCalledWith({});
    expect(onInStockChange).toHaveBeenCalledWith(false);
  });
});
