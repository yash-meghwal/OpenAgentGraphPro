import { describe, expect, it } from "vitest";
import type { Node } from "@openagentgraph/shared";
import {
  getActiveTaskGuideSteps,
  getSimpleNodeStatusLabel,
  shouldShowActiveTaskGuide,
} from "./activeTaskGuide.js";

function makeNode(status: Node["status"], id = "node-1"): Node {
  return {
    id,
    graphId: "graph-1",
    kind: "work",
    title: "Test step",
    intent: "Test intent",
    humanSummary: "Test summary",
    status,
    contract: {
      expectedArtifact: "Artifact",
      allowedTools: [],
      acceptanceCriteria: [],
      humanSummary: "Summary",
    },
    baselineGoalVersionId: "goal-v1",
    activeGoalVersionId: "goal-v1",
    dependsOnNodeIds: [],
    createdAt: "2026-06-08T00:00:00.000Z",
    updatedAt: "2026-06-08T00:00:00.000Z",
  };
}

describe("activeTaskGuide", () => {
  it("maps node statuses to plain step labels", () => {
    expect(getSimpleNodeStatusLabel(makeNode("running"))).toBe("Running");
    expect(getSimpleNodeStatusLabel(makeNode("ready"))).toBe("Ready");
    expect(getSimpleNodeStatusLabel(makeNode("completed"))).toBe("Done");
    expect(getSimpleNodeStatusLabel(makeNode("failed"))).toBe("Blocked");
    expect(getSimpleNodeStatusLabel(makeNode("blocked"))).toBe("Blocked");
    expect(getSimpleNodeStatusLabel(makeNode("pending"))).toBe("Waiting");
    expect(getSimpleNodeStatusLabel(makeNode("superseded"))).toBe("Skipped");
  });

  it("tracks the three-step Active task guide from runtime state", () => {
    const idle = getActiveTaskGuideSteps({
      workspaceRoot: "",
      runControlState: "idle",
      isRunning: false,
      completedNodeCount: 0,
      selectedNodeId: null,
      nodeCount: 0,
    });
    expect(idle.map((step) => step.done)).toEqual([false, false, false]);

    const folderReady = getActiveTaskGuideSteps({
      workspaceRoot: "C:/projects/demo",
      runControlState: "idle",
      isRunning: false,
      completedNodeCount: 0,
      selectedNodeId: null,
      nodeCount: 0,
    });
    expect(folderReady[0]?.done).toBe(true);
    expect(folderReady[1]?.done).toBe(false);

    const running = getActiveTaskGuideSteps({
      workspaceRoot: "C:/projects/demo",
      runControlState: "running",
      isRunning: true,
      completedNodeCount: 0,
      selectedNodeId: null,
      nodeCount: 2,
    });
    expect(running[1]?.done).toBe(true);

    const exploring = getActiveTaskGuideSteps({
      workspaceRoot: "C:/projects/demo",
      runControlState: "running",
      isRunning: true,
      completedNodeCount: 1,
      selectedNodeId: "node-1",
      nodeCount: 3,
    });
    expect(exploring.every((step) => step.done)).toBe(true);
  });

  it("shows the guide only before the first completed step and while idle", () => {
    expect(
      shouldShowActiveTaskGuide({
        activeGraphId: "graph-1",
        activeTaskGuideDismissed: false,
        runControlState: "idle",
        isRunning: false,
        completedNodeCount: 0,
      })
    ).toBe(true);

    expect(
      shouldShowActiveTaskGuide({
        activeGraphId: null,
        activeTaskGuideDismissed: false,
        runControlState: "idle",
        isRunning: false,
        completedNodeCount: 0,
      })
    ).toBe(false);

    expect(
      shouldShowActiveTaskGuide({
        activeGraphId: "graph-1",
        activeTaskGuideDismissed: true,
        runControlState: "idle",
        isRunning: false,
        completedNodeCount: 0,
      })
    ).toBe(false);

    expect(
      shouldShowActiveTaskGuide({
        activeGraphId: "graph-1",
        activeTaskGuideDismissed: false,
        runControlState: "running",
        isRunning: true,
        completedNodeCount: 0,
      })
    ).toBe(false);

    expect(
      shouldShowActiveTaskGuide({
        activeGraphId: "graph-1",
        activeTaskGuideDismissed: false,
        runControlState: "idle",
        isRunning: false,
        completedNodeCount: 2,
      })
    ).toBe(false);
  });
});