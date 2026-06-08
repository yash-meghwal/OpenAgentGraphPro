import { describe, expect, it } from "vitest";
import {
  formatAgentContextPackSummary,
  formatAttentionLabel,
  formatFrontierStatusLabel,
  formatGraphStatusLabel,
  formatLifecycleBucketLabel,
  formatRunControlStateLabel,
  formatRuntimeStatusLabel,
  formatSessionLifecycleLabel,
  getDashboardMetricLabel,
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
    expect(formatFrontierStatusLabel("blocked")).toBe("Stuck");
  });

  it("maps canonical graph and dashboard states to human labels in simple mode", () => {
    expect(formatGraphStatusLabel("running")).toBe("In progress");
    expect(formatGraphStatusLabel("blocked")).toBe("Stuck");
    expect(formatRunControlStateLabel("idle")).toBe("Ready to start");
    expect(formatAttentionLabel("urgent")).toBe("Needs you now");
    expect(formatLifecycleBucketLabel("needs_attention")).toBe("Needs attention");
    expect(getDashboardMetricLabel("urgent", "default")).toBe("Needs you now");
    expect(getDashboardMetricLabel("urgent", "developer")).toBe("Urgent runs");
    expect(getDashboardMetricLabel("blocked", "default")).toBe("Stuck");
    expect(
      formatAgentContextPackSummary({
        stepCount: 2,
        updateCount: 1,
        proposalCount: 0,
      })
    ).toBe("Context ready: 2 active steps, 1 recent updates, 0 open suggestions.");
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