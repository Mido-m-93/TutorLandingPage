import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

let tempFilePath: string;

beforeEach(() => {
  tempFilePath = path.join(os.tmpdir(), `leads-test-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
  process.env.LEADS_FILE_PATH = tempFilePath;
  vi.resetModules();
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
});
