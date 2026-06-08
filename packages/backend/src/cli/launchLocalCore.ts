import path from "path";

export const DEFAULT_BACKEND_PORT = "3001";
export const DEFAULT_FRONTEND_PORT = "5173";
export const MINIMUM_NODE_VERSION = { major: 20, minor: 19 } as const;

export type LaunchUrls = {
  backendPort: string;
  frontendPort: string;
  backendUrl: string;
  frontendUrl: string;
  frontendCheckUrls: string[];
  readyUrl: string;
  healthUrl: string;
};

export type LaunchArgs = {
  desktop: boolean;
  openBrowser: boolean;
  skipInstall: boolean;
  help: boolean;
};

export function findMonorepoRoot(
  startDir: string,
  exists: (target: string) => boolean
): string | null {
  let current = path.resolve(startDir);
  while (true) {
    const rootPackageJson = path.join(current, "package.json");
    const backendPackageJson = path.join(current, "packages", "backend", "package.json");
    if (exists(rootPackageJson) && exists(backendPackageJson)) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) {
      return null;
    }
    current = parent;
  }
}

export function isNodeVersionSupported(version: string): boolean {
  const match = /^v?(\d+)\.(\d+)\.(\d+)/.exec(version.trim());
  if (!match) return false;
  const major = Number(match[1]);
  const minor = Number(match[2]);
  if (major > MINIMUM_NODE_VERSION.major) return true;
  if (major < MINIMUM_NODE_VERSION.major) return false;
  return minor >= MINIMUM_NODE_VERSION.minor;
}

export function buildFrontendCheckUrls(
  frontendPort: string,
  env: NodeJS.ProcessEnv = {}
): string[] {
  const explicitHost = env.OPENAGENTGRAPH_FRONTEND_HOST?.trim();
  if (explicitHost) {
    const host = explicitHost.replace(/^https?:\/\//, "").replace(/\/$/, "");
    return [`http://${host}:${frontendPort}`];
  }

  return [
    `http://localhost:${frontendPort}`,
    `http://127.0.0.1:${frontendPort}`,
    `http://[::1]:${frontendPort}`,
  ];
}

export function resolveLaunchUrls(env: NodeJS.ProcessEnv): LaunchUrls {
  const backendPort = env.PORT?.trim() || DEFAULT_BACKEND_PORT;
  const frontendPort = env.OPENAGENTGRAPH_FRONTEND_PORT?.trim() || DEFAULT_FRONTEND_PORT;
  const frontendCheckUrls = buildFrontendCheckUrls(frontendPort, env);
  const backendUrl = `http://127.0.0.1:${backendPort}`;
  return {
    backendPort,
    frontendPort,
    backendUrl,
    frontendUrl: frontendCheckUrls[0]!,
    frontendCheckUrls,
    readyUrl: `${backendUrl}/ready`,
    healthUrl: `${backendUrl}/health`,
  };
}

export function buildBrowserOpenCommand(
  url: string,
  platform: NodeJS.Platform
): { command: string; args: string[] } {
  if (platform === "win32") {
    return { command: "cmd", args: ["/c", "start", "", url] };
  }
  if (platform === "darwin") {
    return { command: "open", args: [url] };
  }
  return { command: "xdg-open", args: [url] };
}

export function parseLaunchArgs(argv: string[]): LaunchArgs {
  const flags = new Set(argv.slice(2));
  return {
    desktop: flags.has("--desktop"),
    openBrowser: !flags.has("--no-open"),
    skipInstall: flags.has("--no-install"),
    help: flags.has("--help") || flags.has("-h"),
  };
}

export function shouldCopyEnvExample(envExists: boolean, exampleExists: boolean): boolean {
  return !envExists && exampleExists;
}

export function shouldInstallDependencies(input: {
  nodeModulesExists: boolean;
  skipInstall: boolean;
}): boolean {
  return !input.nodeModulesExists && !input.skipInstall;
}

export const LAUNCH_HELP_TEXT = `OpenAgentGraph Pro local launcher

Usage:
  npm run launch
  npm run launch:desktop

Options:
  --desktop      Launch the desktop shell (Electron) instead of browser dev mode
  --no-open      Start services without opening a browser tab
  --no-install   Skip automatic npm ci when node_modules is missing
  --help         Show this help text
`;