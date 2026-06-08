import { describe, expect, it } from "vitest";
import { PROJECT_TEMPLATES, findProjectTemplate } from "./projectTemplates.js";

describe("projectTemplates", () => {
  it("exposes the three starter templates", () => {
    expect(PROJECT_TEMPLATES.map((template) => template.id)).toEqual([
      "review-folder",
      "track-goal",
      "fix-bug",
    ]);
    expect(PROJECT_TEMPLATES.map((template) => template.title)).toEqual([
      "Review this folder",
      "Track a goal",
      "Fix a bug",
    ]);
  });

  it("finds templates by id", () => {
    expect(findProjectTemplate("track-goal")?.goal).toContain("approve along the way");
    expect(findProjectTemplate("missing")).toBeUndefined();
  });
});