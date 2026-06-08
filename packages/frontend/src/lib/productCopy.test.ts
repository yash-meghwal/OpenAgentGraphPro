import { describe, expect, it } from "vitest";
import {
  formatFrontierStatusLabel,
  formatRuntimeStatusLabel,
  formatSessionLifecycleLabel,
  getOnboardingState,
} from "./productCopy.js";

describe("productCopy", () => {
  it("keeps key runtime wording aligned across shared labels", () => {
    expect(formatRuntimeStatusLabel("connected")).toBe("Connected");
    expect(formatRuntimeStatusLabel("auth_required")).toBe("Sign-in required");
    expect(formatRuntimeStatusLabel("read_only")).toBe("View only");
    expect(formatRuntimeStatusLabel("unreachable")).toBe("Offline");
    expect(formatSessionLifecycleLabel("read_only")).toBe("View only");
    expect(formatSessionLifecycleLabel("invalid_session")).toBe("Sign-in required");
    expect(formatFrontierStatusLabel("on_track")).toBe("On track");
    expect(formatFrontierStatusLabel("exploring")).toBe("Exploring");
    expect(formatFrontierStatusLabel("drifting")).toBe("Needs attention");
    expect(formatFrontierStatusLabel("blocked")).toBe("Blocked");
  });

  it("derives deterministic onboarding guidance from runtime state only", () => {
    expect(
      getOnboardingState({
        runtimeStatus: "unreachable",
        runtimeFallbackLikely: false,
        sessionLifecycle: "signed_in",
      })
    ).toEqual({
      title: "Can't reach OpenAgentGraph",
      body: "The app couldn't connect to its server.",
      nextSteps: [
        "Make sure the app is running. If someone else set this up, ask them to start the server.",
        "Refresh this page once the connection is back.",
      ],
    });
  });
});