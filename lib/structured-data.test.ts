import { describe, expect, it } from "vitest";
import { site } from "@/content/site";
import { personJsonLd, websiteJsonLd } from "./structured-data";

const privateKeys = ["telephone", "phone", "birthDate", "birthday"];

function collectKeys(value: unknown, found: string[] = []): string[] {
  if (Array.isArray(value)) {
    for (const item of value) collectKeys(item, found);
    return found;
  }
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      found.push(key);
      collectKeys(child, found);
    }
  }
  return found;
}

describe("public site data", () => {
  it("publishes the email and Discord username without private contact fields", () => {
    expect(site.email).toBe("arafatshahriar98@gmail.com");
    expect(site.discordUsername).toBe("shahriararafat");
    const keys = collectKeys(site);
    for (const key of privateKeys) expect(keys).not.toContain(key);

    const person = personJsonLd();
    const personKeys = collectKeys(person);
    for (const key of privateKeys) expect(personKeys).not.toContain(key);
    expect(JSON.stringify(person)).toContain(site.email);
    expect(JSON.stringify(person)).not.toMatch(/\+?\d[\d\s()-]{8,}/);
    expect(JSON.stringify(websiteJsonLd())).not.toMatch(/birth/i);
  });
});
