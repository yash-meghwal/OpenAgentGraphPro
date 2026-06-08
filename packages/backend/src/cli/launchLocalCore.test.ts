import { describe, expect, it } from "vitest";
import {
  buildBrowserOpenCommand,
  buildFrontendCheckUrls,
  findMonorepoRoot,
  isNodeVersionSupported,
  parseLaunchArgs,
  resolveLaunchUrls,
  shouldCopyEnvExample,
  shouldInstallDependencies,
} from "./launchLocalCore.js";

describe("launchLocalCore", () => {
  it("finds the monorepo root from nested package paths", () => {
    const exists = (target: string) =>
      target.endsWith("C:\\repo\\OpenAgentGraphPro\\package.json") ||
      target.endsWith("C:\\repo\\OpenAgentGraphPro\\packages\\backend\\package.json");

    expect(
      findMonorepoRoot("C:\\repo\\OpenAgentGraphPro\\packages\\backend\\src\\cli", exists)
    ).toBe("C:\\repo\\OpenAgentGraphPro");
  });

  it("requires Node 20.19 or newer", () => {
    expect(isNodeVersionSupported("v20.19.0")).toBe(true);
    expect(isNodeVersionSupported("v22.4.1")).toBe(true);
    expect(isNodeVersionSupported("v20.18.9")).toBe(false);
    expect(isNodeVersionSupported("v18.20.0")).toBe(false);
  });

  it("resolves local launch URLs from environment defaults", () => {
    expect(resolveLaunchUrls({})).toEqual({
      backendPort: "3001",
      frontendPort: "5173",
      backendUrl: "http://127.0.0.1:3001",
      frontendUrl: "http://localhost:5173",
      frontendCheckUrls: [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://[::1]:5173",
      ],
      readyUrl: "http://127.0.0.1:3001/ready",
      healthUrl: "http://127.0.0.1:3001/health",
    });
  });

  it("prefers localhost and falls back to loopback hosts for frontend readiness", () => {
    expect(buildFrontendCheckUrls("5173")).toEqual([
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://[::1]:5173",
    ]);
    expect(buildFrontendCheckUrls("4173", { OPENAGENTGRAPH_FRONTEND_HOST: "127.0.0.1" })).toEqual([
      "http://127.0.0.1:4173",
    ]);
  });

  it("builds platform-specific browser open commands", () => {
    expect(buildBrowserOpenCommand("http://127.0.0.1:5173", "win32")).toEqual({
      command: "cmd",
      args: ["/c", "start", "", "http://127.0.0.1:5173"],
    });
    expect(buildBrowserOpenCommand("http://127.0.0.1:5173", "darwin")).toEqual({
      command: "open",
      args: ["http://127.0.0.1:5173"],
    });
    expect(buildBrowserOpenCommand("http://127.0.0.1:5173", "linux")).toEqual({
      command: "xdg-open",
      args: ["http://127.0.0.1:5173"],
    });
  });

  it("parses launcher flags", () => {
    expect(parseLaunchArgs(["node", "launch", "--desktop", "--no-open"])).toEqual({
      desktop: true,
      openBrowser: false,
      skipInstall: false,
      help: false,
    });
    expect(parseLaunchArgs(["node", "launch", "--no-install", "--help"])).toEqual({
      desktop: false,
      openBrowser: true,
      skipInstall: true,
      help: true,
    });
  });

  it("decides when to copy .env.example and install dependencies", () => {
    expect(shouldCopyEnvExample(false, true)).toBe(true);
    expect(shouldCopyEnvExample(true, true)).toBe(false);
    expect(shouldInstallDependencies({ nodeModulesExists: false, skipInstall: false })).toBe(true);
    expect(shouldInstallDependencies({ nodeModulesExists: false, skipInstall: true })).toBe(false);
    expect(shouldInstallDependencies({ nodeModulesExists: true, skipInstall: false })).toBe(false);
  });
});