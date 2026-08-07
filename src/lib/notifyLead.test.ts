import { afterEach, describe, expect, it, vi } from "vitest";
import type { Lead, LeadType } from "./leadStore";
import { notifyNewLead } from "./notifyLead";

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

const successResponse = { data: { id: "email-1" }, error: null };

afterEach(() => {
  sendMock.mockReset();
  resendConstructorMock.mockReset();
});

describe("notifyNewLead", () => {
  it("sends an admin notification email with the lead's details", async () => {
    sendMock.mockResolvedValue(successResponse);

    await notifyNewLead(lead);

    expect(sendMock).toHaveBeenCalledTimes(1);
    const call = sendMock.mock.calls[0][0];
    expect(call.to).toBe("mohamada@roboco-op.org");
    expect(call.from).toBe("onboarding@resend.dev");
    expect(call.subject).toMatch(/find a tutor/i);
    expect(call.text ?? call.html).toEqual(
      expect.stringContaining("Ada Lovelace")
    );
  });

  it("includes the lead's email and goal in the email body, not just the name", async () => {
    sendMock.mockResolvedValue(successResponse);

    await notifyNewLead(lead);

    const call = sendMock.mock.calls[0][0];
    const body = call.text ?? call.html;
    expect(body).toEqual(expect.stringContaining("ada@example.com"));
    expect(body).toEqual(expect.stringContaining("Learn Python"));
  });

  it("logs and does not throw when Resend resolves with an error (the real API failure shape)", async () => {
    sendMock.mockResolvedValue({
      data: null,
      error: { name: "validation_error", message: "Invalid `from` address" },
    });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

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
      sendMock.mockResolvedValue(successResponse);

      await notifyNewLead({ ...lead, type });

      const call = sendMock.mock.calls[0][0];
      expect(call.subject).toMatch(expectedSubject);
      expect(call.subject).toMatch(/new/i);
    }
  );

  it("constructs the Resend client with the RESEND_API_KEY environment variable", async () => {
    const originalKey = process.env.RESEND_API_KEY;
    process.env.RESEND_API_KEY = "test-api-key";
    sendMock.mockResolvedValue(successResponse);

    await notifyNewLead(lead);

    expect(resendConstructorMock).toHaveBeenCalledWith("test-api-key");

    if (originalKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = originalKey;
  });

  it("does not throw when the Resend client itself fails to construct (e.g. missing API key)", async () => {
    resendConstructorMock.mockImplementationOnce(() => {
      throw new Error("Missing API key. Pass it to the constructor `new Resend(apiKey)`");
    });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(notifyNewLead(lead)).resolves.toBeUndefined();
    expect(errorSpy).toHaveBeenCalled();

    errorSpy.mockRestore();
  });

  it("does not time out before the configured 5000ms threshold", async () => {
    vi.useFakeTimers();
    sendMock.mockImplementation(() => new Promise(() => {}));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    notifyNewLead(lead);
    await vi.advanceTimersByTimeAsync(4999);

    expect(errorSpy).not.toHaveBeenCalled();

    errorSpy.mockRestore();
    vi.useRealTimers();
  });

  it("times out at exactly the configured 5000ms threshold", async () => {
    vi.useFakeTimers();
    sendMock.mockImplementation(() => new Promise(() => {}));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const pending = notifyNewLead(lead);
    await vi.advanceTimersByTimeAsync(5000);

    await expect(pending).resolves.toBeUndefined();
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("Failed to send"),
      expect.stringContaining("5000ms")
    );

    errorSpy.mockRestore();
    vi.useRealTimers();
  });

  it("delivers a successful result when the send resolves before the timeout elapses, without racing to a false timeout", async () => {
    vi.useFakeTimers();
    sendMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve(successResponse), 4000);
        })
    );
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const pending = notifyNewLead(lead);
    await vi.advanceTimersByTimeAsync(4000);

    await expect(pending).resolves.toBeUndefined();
    expect(errorSpy).not.toHaveBeenCalled();

    errorSpy.mockRestore();
    vi.useRealTimers();
  });

  it("clears the timeout timer once the send succeeds, leaving nothing pending", async () => {
    vi.useFakeTimers();
    sendMock.mockResolvedValue(successResponse);

    await notifyNewLead(lead);

    expect(vi.getTimerCount()).toBe(0);

    vi.useRealTimers();
  });
});
