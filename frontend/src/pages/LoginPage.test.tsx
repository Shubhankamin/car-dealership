import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as authApi from "../api/auth";
import { AuthProvider } from "../context/AuthContext";
import LoginPage from "./LoginPage";

vi.mock("../api/auth");

function renderLogin() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<p>Home page</p>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

async function fillAndSubmit() {
  await userEvent.type(screen.getByLabelText(/email/i), "alice@test.com");
  await userEvent.type(screen.getByLabelText(/password/i), "Password123");
  await userEvent.click(screen.getByRole("button", { name: /log in/i }));
}

describe("LoginPage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetAllMocks();
  });

  it("logs in and redirects to the home page", async () => {
    vi.mocked(authApi.login).mockResolvedValue({
      token: "jwt",
      user: { id: "1", email: "alice@test.com", role: "USER" },
    });

    renderLogin();
    await fillAndSubmit();

    expect(authApi.login).toHaveBeenCalledWith("alice@test.com", "Password123");
    expect(await screen.findByText("Home page")).toBeInTheDocument();
  });

  it("shows the error message when login fails", async () => {
    vi.mocked(authApi.login).mockRejectedValue(
      new Error("Invalid email or password"),
    );

    renderLogin();
    await fillAndSubmit();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Invalid email or password",
    );
  });
});
