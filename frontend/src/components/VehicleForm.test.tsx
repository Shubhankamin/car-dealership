import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Vehicle } from "../types";
import VehicleForm from "./VehicleForm";

const existing: Vehicle = {
  id: "v1",
  make: "Toyota",
  model: "Camry",
  category: "Sedan",
  price: 28500,
  quantity: 5,
};

describe("VehicleForm", () => {
  it("submits the values for a new vehicle", async () => {
    const onSubmit = vi.fn();
    render(<VehicleForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    await userEvent.type(screen.getByLabelText(/make/i), "Honda");
    await userEvent.type(screen.getByLabelText(/model/i), "Civic");
    await userEvent.type(screen.getByLabelText(/category/i), "Sedan");
    await userEvent.type(screen.getByLabelText(/price/i), "24000");
    await userEvent.type(screen.getByLabelText(/quantity/i), "4");
    await userEvent.click(screen.getByRole("button", { name: /add vehicle/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      make: "Honda",
      model: "Civic",
      category: "Sedan",
      price: 24000,
      quantity: 4,
    });
  });

  it("pre-fills the fields when editing", () => {
    render(
      <VehicleForm vehicle={existing} onSubmit={vi.fn()} onCancel={vi.fn()} />,
    );

    expect(screen.getByLabelText(/make/i)).toHaveValue("Toyota");
    expect(screen.getByLabelText(/price/i)).toHaveValue(28500);
    expect(
      screen.getByRole("button", { name: /save changes/i }),
    ).toBeInTheDocument();
  });

  it("calls onCancel", async () => {
    const onCancel = vi.fn();
    render(<VehicleForm onSubmit={vi.fn()} onCancel={onCancel} />);

    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onCancel).toHaveBeenCalled();
  });
});
