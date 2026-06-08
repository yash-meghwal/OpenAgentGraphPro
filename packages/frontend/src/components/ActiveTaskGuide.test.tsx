import TestRenderer, { act } from "react-test-renderer";
import { describe, expect, it, vi } from "vitest";
import type { Graph } from "@openagentgraph/shared";
import { useStore } from "../lib/store.js";
import { ActiveTaskGuide } from "./ActiveTaskGuide.js";

const NOW = "2026-06-08T00:00:00.000Z";

function makeGraph(title: string): Graph {
  return {
    id: "graph-1",
    title,
    goal: "Goal",
    status: "running",
    activeGoalVersionId: "g1",
    originalGoalVersionId: "g1",
    createdAt: NOW,
    updatedAt: NOW,
  };
}

describe("ActiveTaskGuide", () => {
  it("renders the wizard handoff hint and dismisses the guide", () => {
    const dismissActiveTaskGuide = vi.fn();
    const clearActiveTaskStartHint = vi.fn();

    useStore.setState({
      activeGraphId: "graph-1",
      graphs: [makeGraph("Ship onboarding")],
      activeTaskGuideDismissed: false,
      activeTaskStartHint: true,
      runWorkspaceRoot: "C:/projects/demo",
      runControlState: "idle",
      isRunning: false,
      completedNodeCount: 0,
      selectedNodeId: null,
      nodes: [],
      dismissActiveTaskGuide,
      clearActiveTaskStartHint,
    });

    let renderer: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(<ActiveTaskGuide />);
    });

    const markup = JSON.stringify(renderer!.toJSON());
    expect(markup).toContain("Ship onboarding");
    expect(markup).toContain("click Run to start");

    const dismissButton = renderer!.root
      .findAllByType("button")
      .find((button) => String(button.props.children) === "Dismiss");
    expect(dismissButton).toBeTruthy();

    act(() => {
      dismissButton!.props.onClick();
    });

    expect(clearActiveTaskStartHint).toHaveBeenCalledTimes(1);
    expect(dismissActiveTaskGuide).toHaveBeenCalledTimes(1);
  });

  it("hides once work has completed a step", () => {
    useStore.setState({
      activeGraphId: "graph-1",
      graphs: [makeGraph("Ship onboarding")],
      activeTaskGuideDismissed: false,
      activeTaskStartHint: false,
      runWorkspaceRoot: "C:/projects/demo",
      runControlState: "running",
      isRunning: true,
      completedNodeCount: 1,
      selectedNodeId: "node-1",
      nodes: [],
      dismissActiveTaskGuide: vi.fn(),
      clearActiveTaskStartHint: vi.fn(),
    });

    let renderer: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(<ActiveTaskGuide />);
    });

    expect(renderer!.toJSON()).toBeNull();
  });
});