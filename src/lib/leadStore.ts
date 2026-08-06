import fs from "node:fs";
import path from "node:path";

export type LeadType = "find-tutor" | "become-tutor" | "request-training";

export type Lead = {
  id: string;
  type: LeadType;
  name: string;
  email: string;
  goal: string;
  createdAt: string;
};

export function createLeadStore(filePath: string) {
  function readAll(): Lead[] {
    if (!fs.existsSync(filePath)) return [];
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  }

  function writeAll(leads: Lead[]) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(leads, null, 2));
  }

  return {
    async saveLead(input: Omit<Lead, "id" | "createdAt">): Promise<Lead> {
      const lead: Lead = {
        ...input,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      const leads = readAll();
      leads.push(lead);
      writeAll(leads);
      return lead;
    },

    async listLeads(): Promise<Lead[]> {
      return readAll();
    },
  };
}

function defaultFilePath(): string {
  return process.env.LEADS_FILE_PATH ?? path.join(process.cwd(), "data", "leads.json");
}

export const leadStore = createLeadStore(defaultFilePath());
