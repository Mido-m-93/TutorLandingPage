import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LeadForm } from "./LeadForm";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("LeadForm", () => {
  it("submits the entered values and shows a success message", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ lead: { id: "1" } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<LeadForm type="find-tutor" />);

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: "Ada Lovelace" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "ada@example.com" } });
    fireEvent.change(screen.getByLabelText(/goal/i), { target: { value: "Learn Python" } });
    fireEvent.click(screen.getByRole("button", { name: /find a tutor/i }));

    await waitFor(() => expect(screen.getByText(/thanks/i)).toBeInTheDocument());

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/leads");
    expect(JSON.parse(options.body)).toMatchObject({
      type: "find-tutor",
      name: "Ada Lovelace",
      email: "ada@example.com",
      goal: "Learn Python",
    });
  });

  it("shows an error message and keeps the form visible when the API responds with a non-ok status", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "type, name, email, and goal are all required" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<LeadForm type="find-tutor" />);

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: "Ada Lovelace" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "ada@example.com" } });
    fireEvent.change(screen.getByLabelText(/goal/i), { target: { value: "Learn Python" } });
    fireEvent.click(screen.getByRole("button", { name: /find a tutor/i }));

    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());

    // The success message must NOT appear, and the form must remain on screen
    // so the user can retry instead of being stuck on a dead end.
    expect(screen.queryByText(/thanks/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /find a tutor/i })).toBeEnabled();
  });

  it("shows an error and re-enables the form when the network request itself fails", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("Network request failed"));
    vi.stubGlobal("fetch", fetchMock);

    render(<LeadForm type="find-tutor" />);

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: "Ada Lovelace" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "ada@example.com" } });
    fireEvent.change(screen.getByLabelText(/goal/i), { target: { value: "Learn Python" } });
    fireEvent.click(screen.getByRole("button", { name: /find a tutor/i }));

    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /find a tutor/i })).toBeEnabled();
  });
});
