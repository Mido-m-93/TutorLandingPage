import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "./page";

describe("Home page", () => {
  it("shows the Become a Tutor form when that CTA is clicked", () => {
    render(<Home />);

    fireEvent.click(screen.getByRole("button", { name: /become a tutor/i }));

    expect(screen.getByRole("button", { name: /apply to tutor/i })).toBeInTheDocument();
  });

  it("shows the Request Training form when that CTA is clicked", () => {
    render(<Home />);

    fireEvent.click(screen.getByRole("button", { name: /request training/i }));

    expect(screen.getByRole("button", { name: /request training/i })).toBeInTheDocument();
  });
});
