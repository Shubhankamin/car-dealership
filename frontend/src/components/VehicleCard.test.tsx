import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Vehicle } from "../types";
import VehicleCard from "./VehicleCard";

const vehicle: Vehicle = {
  id: "v1",
  make: "Toyota",
  model: "Camry",
  category: "Sedan",
  price: 28500,
  quantity: 5,
};

describe("VehicleCard", () => {
  it("shows the vehicle details", () => {
    render(<VehicleCard vehicle={vehicle} onPurchase={vi.fn()} />);

    expect(screen.getByText("Toyota Camry")).toBeInTheDocument();
    expect(screen.getByText("Sedan")).toBeInTheDocument();
    expect(screen.getByText(/5 in stock/i)).toBeInTheDocument();
  });

  it("calls onPurchase with the vehicle id when Purchase is clicked", async () => {
    const onPurchase = vi.fn();
    render(<VehicleCard vehicle={vehicle} onPurchase={onPurchase} />);

    await userEvent.click(screen.getByRole("button", { name: /purchase/i }));

    expect(onPurchase).toHaveBeenCalledWith("v1");
  });

  it("disables Purchase and shows Out of stock when quantity is zero", () => {
    render(
      <VehicleCard
        vehicle={{ ...vehicle, quantity: 0 }}
        onPurchase={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /purchase/i })).toBeDisabled();
    expect(screen.getByText(/out of stock/i)).toBeInTheDocument();
  });

  it("shows the vehicle photo when one is provided", () => {
    render(
      <VehicleCard
        vehicle={{ ...vehicle, imageUrl: "/cars/camry.jpg" }}
        onPurchase={vi.fn()}
      />,
    );

    expect(screen.getByRole("img", { name: "Toyota Camry" })).toHaveAttribute(
      "src",
      "/cars/camry.jpg",
    );
  });

  it("calls onToggleFavorite with the vehicle id", async () => {
    const onToggleFavorite = vi.fn();
    render(
      <VehicleCard
        vehicle={vehicle}
        onPurchase={vi.fn()}
        onToggleFavorite={onToggleFavorite}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /favorites/i }));

    expect(onToggleFavorite).toHaveBeenCalledWith("v1");
  });
});
