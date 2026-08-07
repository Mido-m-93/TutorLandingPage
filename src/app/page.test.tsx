import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "./page";

describe("Home page", () => {
  it("shows the Find a Tutor form when that CTA is clicked", () => {
    render(<Home />);

    fireEvent.click(screen.getByRole("button", { name: /find a tutor/i }));

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/goal/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /find a tutor/i })).toBeInTheDocument();
  });

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

  it("returns to the CTA choices when Back is clicked", () => {
    render(<Home />);

    fireEvent.click(screen.getByRole("button", { name: /become a tutor/i }));
    fireEvent.click(screen.getByRole("button", { name: /back/i }));

    expect(screen.getByRole("button", { name: /find a tutor/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /become a tutor/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /request training/i })).toBeInTheDocument();
  });
});
