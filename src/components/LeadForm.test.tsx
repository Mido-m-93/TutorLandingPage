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
});
