import { afterEach, describe, expect, it, vi } from "vitest";
import type { Lead, LeadType } from "./leadStore";

const sendMock = vi.fn();
const resendConstructorMock = vi.fn();

vi.mock("resend", () => ({
  Resend: class {
    constructor(apiKey?: string) {
      resendConstructorMock(apiKey);
    }
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
  resendConstructorMock.mockReset();
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

  it("logs and does not throw when Resend resolves with an error (the real API failure shape)", async () => {
    sendMock.mockResolvedValue({
      data: null,
      error: { name: "validation_error", message: "Invalid `from` address" },
    });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { notifyNewLead } = await import("./notifyLead");

    await expect(notifyNewLead(lead)).resolves.toBeUndefined();
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("Resend"),
      expect.stringContaining("Invalid `from` address")
    );

    errorSpy.mockRestore();
  });

  it("does not throw when the send call itself rejects (transport failure)", async () => {
    sendMock.mockRejectedValue(new Error("Resend API unreachable"));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { notifyNewLead } = await import("./notifyLead");

    await expect(notifyNewLead(lead)).resolves.toBeUndefined();
    expect(errorSpy).toHaveBeenCalled();

    errorSpy.mockRestore();
  });

  it.each([
    ["find-tutor", /find a tutor/i],
    ["become-tutor", /become a tutor/i],
    ["request-training", /request training/i],
  ] as [LeadType, RegExp][])(
    "uses the correct subject label for lead type %s",
    async (type, expectedSubject) => {
      sendMock.mockResolvedValue({ data: { id: "email-1" }, error: null });
      const { notifyNewLead } = await import("./notifyLead");

      await notifyNewLead({ ...lead, type });

      const call = sendMock.mock.calls[0][0];
      expect(call.subject).toMatch(expectedSubject);
      expect(call.subject).toMatch(/new/i);
    }
  );

  it("constructs the Resend client with the RESEND_API_KEY environment variable", async () => {
    const originalKey = process.env.RESEND_API_KEY;
    process.env.RESEND_API_KEY = "test-api-key";
    sendMock.mockResolvedValue({ data: { id: "email-1" }, error: null });
    vi.resetModules();
    const { notifyNewLead } = await import("./notifyLead");

    await notifyNewLead(lead);

    expect(resendConstructorMock).toHaveBeenCalledWith("test-api-key");

    if (originalKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = originalKey;
  });
});
