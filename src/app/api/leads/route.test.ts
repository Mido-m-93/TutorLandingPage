import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const notifyNewLeadMock = vi.fn().mockResolvedValue(undefined);
vi.mock("@/lib/notifyLead", () => ({
  notifyNewLead: notifyNewLeadMock,
}));

let tempFilePath: string;

beforeEach(() => {
  tempFilePath = path.join(os.tmpdir(), `leads-test-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
  process.env.LEADS_FILE_PATH = tempFilePath;
  vi.resetModules();
  notifyNewLeadMock.mockReset().mockResolvedValue(undefined);
});

afterEach(() => {
  if (fs.existsSync(tempFilePath)) fs.rmSync(tempFilePath);
  delete process.env.LEADS_FILE_PATH;
});

describe("POST /api/leads", () => {
  it("persists a valid lead and returns 201", async () => {
    const { POST } = await import("./route");

    const response = await POST(
      new Request("http://localhost/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "find-tutor",
          name: "Ada Lovelace",
          email: "ada@example.com",
          goal: "Learn Python for data analysis",
        }),
      })
    );

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.lead).toMatchObject({
      type: "find-tutor",
      name: "Ada Lovelace",
      email: "ada@example.com",
      goal: "Learn Python for data analysis",
    });

    const stored = JSON.parse(fs.readFileSync(tempFilePath, "utf-8"));
    expect(stored).toHaveLength(1);
    expect(stored[0].email).toBe("ada@example.com");
  });

  it("rejects a submission missing required fields with a 400 error", async () => {
    const { POST } = await import("./route");

    const response = await POST(
      new Request("http://localhost/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "find-tutor",
          name: "Ada Lovelace",
          // missing email and goal
        }),
      })
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBeTruthy();
    expect(fs.existsSync(tempFilePath)).toBe(false);
  });

  it.each(["find-tutor", "become-tutor", "request-training"] as const)(
    "stores the lead type %s correctly",
    async (type) => {
      const { POST } = await import("./route");

      const response = await POST(
        new Request("http://localhost/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type,
            name: "Grace Hopper",
            email: "grace@example.com",
            goal: "Learn robotics",
          }),
        })
      );

      const body = await response.json();
      expect(body.lead.type).toBe(type);

      const stored = JSON.parse(fs.readFileSync(tempFilePath, "utf-8"));
      expect(stored[0].type).toBe(type);
    }
  );

  it("rejects a type outside the known lead types", async () => {
    const { POST } = await import("./route");

    const response = await POST(
      new Request("http://localhost/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "spam-bot",
          name: "Ada Lovelace",
          email: "ada@example.com",
          goal: "Learn Python",
        }),
      })
    );

    expect(response.status).toBe(400);
    expect(fs.existsSync(tempFilePath)).toBe(false);
  });

  it("rejects an invalid email format", async () => {
    const { POST } = await import("./route");

    const response = await POST(
      new Request("http://localhost/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "find-tutor",
          name: "Ada Lovelace",
          email: "not-an-email",
          goal: "Learn Python",
        }),
      })
    );

    expect(response.status).toBe(400);
  });

  it("rejects a goal exceeding the maximum length", async () => {
    const { POST } = await import("./route");

    const response = await POST(
      new Request("http://localhost/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "find-tutor",
          name: "Ada Lovelace",
          email: "ada@example.com",
          goal: "x".repeat(2001),
        }),
      })
    );

    expect(response.status).toBe(400);
  });

  it("returns 400 instead of throwing on malformed JSON", async () => {
    const { POST } = await import("./route");

    const response = await POST(
      new Request("http://localhost/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{not valid json",
      })
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBeTruthy();
  });

  it("notifies about the lead after it is persisted", async () => {
    const { POST } = await import("./route");

    const response = await POST(
      new Request("http://localhost/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "find-tutor",
          name: "Ada Lovelace",
          email: "ada@example.com",
          goal: "Learn Python",
        }),
      })
    );

    expect(response.status).toBe(201);
    expect(notifyNewLeadMock).toHaveBeenCalledTimes(1);
    expect(notifyNewLeadMock).toHaveBeenCalledWith(
      expect.objectContaining({ email: "ada@example.com" })
    );
  });

  it("notifies with the full persisted lead, including the generated id and createdAt", async () => {
    const { POST } = await import("./route");

    const response = await POST(
      new Request("http://localhost/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "find-tutor",
          name: "Ada Lovelace",
          email: "ada@example.com",
          goal: "Learn Python",
        }),
      })
    );

    const body = await response.json();
    expect(notifyNewLeadMock).toHaveBeenCalledWith(body.lead);
    expect(notifyNewLeadMock.mock.calls[0][0]).toMatchObject({
      id: expect.any(String),
      type: "find-tutor",
      name: "Ada Lovelace",
      email: "ada@example.com",
      goal: "Learn Python",
      createdAt: expect.any(String),
    });
  });

  it("still returns 201 with the persisted lead if the notifier rejects (defense-in-depth against a broken never-throws contract)", async () => {
    notifyNewLeadMock.mockReset().mockRejectedValue(new Error("boom"));
    const { POST } = await import("./route");

    const response = await POST(
      new Request("http://localhost/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "find-tutor",
          name: "Ada Lovelace",
          email: "ada@example.com",
          goal: "Learn Python",
        }),
      })
    );

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.lead.email).toBe("ada@example.com");
  });
});
