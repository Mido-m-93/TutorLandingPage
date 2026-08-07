import { afterEach, describe, expect, it, vi } from "vitest";
import type { Lead } from "./leadStore";

const sendMock = vi.fn();

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: sendMock };
  },
}));

const lead: Lead = {
  id: "1",
  type: "find-tutor",
  name: "Ada Lovelace",
  email: "ada@example.com",
  goal: "Learn Python",
  createdAt: "2026-01-01T00:00:00.000Z",
};

afterEach(() => {
  sendMock.mockReset();
});

describe("notifyNewLead", () => {
  it("sends an admin notification email with the lead's details", async () => {
    sendMock.mockResolvedValue({ data: { id: "email-1" }, error: null });
    const { notifyNewLead } = await import("./notifyLead");

    await notifyNewLead(lead);

    expect(sendMock).toHaveBeenCalledTimes(1);
    const call = sendMock.mock.calls[0][0];
    expect(call.to).toBe("Mohamada@roboco-op.org");
    expect(call.from).toBe("onboarding@resend.dev");
    expect(call.subject).toMatch(/find a tutor/i);
    expect(call.text ?? call.html).toEqual(
      expect.stringContaining("Ada Lovelace")
    );
  });

  it("does not throw when the email provider call fails", async () => {
    sendMock.mockRejectedValue(new Error("Resend API unreachable"));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { notifyNewLead } = await import("./notifyLead");

    await expect(notifyNewLead(lead)).resolves.toBeUndefined();
    expect(errorSpy).toHaveBeenCalled();

    errorSpy.mockRestore();
  });
});
