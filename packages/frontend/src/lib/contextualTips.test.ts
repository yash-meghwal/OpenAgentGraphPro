import { describe, expect, it } from "vitest";
import {
  CONTEXTUAL_TIPS_STORAGE_KEY,
  dismissContextualTip,
  isContextualTipDismissed,
  shouldShowContextualTip,
} from "./contextualTips.js";

function createMemoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key: string) => values.get(key) ?? null,
    key: (index: number) => Array.from(values.keys())[index] ?? null,
    removeItem: (key: string) => {
      values.delete(key);
    },
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
}

describe("contextualTips", () => {
  it("shows tips until dismissed", () => {
    const storage = createMemoryStorage();

    expect(shouldShowContextualTip("first_graph", true, storage)).toBe(true);
    dismissContextualTip("first_graph", storage);
    expect(isContextualTipDismissed("first_graph", storage)).toBe(true);
    expect(shouldShowContextualTip("first_graph", true, storage)).toBe(false);
    expect(JSON.parse(storage.getItem(CONTEXTUAL_TIPS_STORAGE_KEY) ?? "[]")).toEqual(["first_graph"]);
  });

  it("keeps dismissed tips isolated by id", () => {
    const storage = createMemoryStorage();
    dismissContextualTip("first_scan", storage);

    expect(isContextualTipDismissed("first_scan", storage)).toBe(true);
    expect(isContextualTipDismissed("first_approval", storage)).toBe(false);
    expect(shouldShowContextualTip("first_approval", true, storage)).toBe(true);
  });
});