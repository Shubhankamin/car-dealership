import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as uploadsApi from "../api/uploads";
import ImageUpload from "./ImageUpload";

vi.mock("../api/uploads");

describe("ImageUpload", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("uploads the chosen file and reports the new url", async () => {
    vi.mocked(uploadsApi.uploadImage).mockResolvedValue("/api/uploads/abc.png");
    const onChange = vi.fn();
    render(<ImageUpload value="" onChange={onChange} />);
    const file = new File(["x"], "car.png", { type: "image/png" });

    await userEvent.upload(screen.getByLabelText(/vehicle photo/i), file);

    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith("/api/uploads/abc.png"),
    );
    expect(uploadsApi.uploadImage).toHaveBeenCalledWith(file);
  });

  it("rejects a file that is not an image without calling the API", async () => {
    // applyAccept: false lets the test bypass the input's accept filter, as a real user could.
    const user = userEvent.setup({ applyAccept: false });
    render(<ImageUpload value="" onChange={vi.fn()} />);

    await user.upload(
      screen.getByLabelText(/vehicle photo/i),
      new File(["x"], "notes.txt", { type: "text/plain" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /JPEG, PNG or WebP/i,
    );
    expect(uploadsApi.uploadImage).not.toHaveBeenCalled();
  });

  it("shows the message when the upload fails", async () => {
    vi.mocked(uploadsApi.uploadImage).mockRejectedValue(
      new Error("Image must be 2 MB or smaller"),
    );
    render(<ImageUpload value="" onChange={vi.fn()} />);

    await userEvent.upload(
      screen.getByLabelText(/vehicle photo/i),
      new File(["x"], "car.png", { type: "image/png" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Image must be 2 MB or smaller",
    );
  });

  it("shows a preview and a replace button when a photo is set", () => {
    render(<ImageUpload value="/api/uploads/abc.png" onChange={vi.fn()} />);

    expect(
      screen.getByRole("img", { name: /vehicle preview/i }),
    ).toHaveAttribute("src", "/api/uploads/abc.png");
    expect(screen.getByText(/replace photo/i)).toBeInTheDocument();
  });
});
