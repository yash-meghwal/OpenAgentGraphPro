import { spawn, type ChildProcess } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  buildBrowserOpenCommand,
  findMonorepoRoot,
  isNodeVersionSupported,
  LAUNCH_HELP_TEXT,
  MINIMUM_NODE_VERSION,
  parseLaunchArgs,
  resolveLaunchUrls,
  shouldCopyEnvExample,
  shouldInstallDependencies,
} from "./launchLocalCore.js";

const moduleDir = path.dirname(fileURLToPath(import.meta.url));

function exists(target: string) {
  try {
    fs.accessSync(target);
    return true;
  } catch {
    return false;
  }
}

function runCommand(command: string, args: string[], cwd: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: "inherit",
      shell: process.platform === "win32",
      env: process.env,
    });
    child.on("error", reject);
    child.on("exit", (code) => resolve(code ?? 1));
  });
}

async function waitForHttpOk(url: string, attempts = 120, delayMs = 500): Promise<boolean> {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url, { method: "GET" });
      if (response.ok) return true;
    } catch {
      // Retry until timeout.
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  return false;
}

async function openBrowser(url: string) {
  const { command, args } = buildBrowserOpenCommand(url, process.platform);
  await runCommand(command, args, process.cwd());
}

function attachShutdown(child: ChildProcess) {
  const shutdown = () => {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

async function main() {
  const args = parseLaunchArgs(process.argv);
  if (args.help) {
    console.log(LAUNCH_HELP_TEXT);
    return;
  }

  if (!isNodeVersionSupported(process.version)) {
    console.error(
      `Node ${MINIMUM_NODE_VERSION.major}.${MINIMUM_NODE_VERSION.minor}+ is required. Current version: ${process.version}`
    );
    process.exit(1);
  }

  const repoRoot = findMonorepoRoot(moduleDir, exists);
  if (!repoRoot) {
    console.error("Could not locate the OpenAgentGraph Pro repository root.");
    process.exit(1);
  }

  const envPath = path.join(repoRoot, ".env");
  const envExamplePath = path.join(repoRoot, ".env.example");
  if (shouldCopyEnvExample(exists(envPath), exists(envExamplePath))) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log("Created .env from .env.example.");
  }

  const nodeModulesPath = path.join(repoRoot, "node_modules");
  if (shouldInstallDependencies({ nodeModulesExists: exists(nodeModulesPath), skipInstall: args.skipInstall })) {
    console.log("Installing dependencies with npm ci...");
    const installCode = await runCommand("npm", ["ci"], repoRoot);
    if (installCode !== 0) {
      process.exit(installCode);
    }
  }

  if (args.desktop) {
    const desktopCode = await runCommand("npm", ["run", "electron:start"], repoRoot);
    process.exit(desktopCode);
  }

  const urls = resolveLaunchUrls(process.env);
  console.log("Starting OpenAgentGraph Pro (backend + frontend)...");
  const devProcess = spawn("npm", ["run", "dev"], {
    cwd: repoRoot,
    stdio: "inherit",
    shell: process.platform === "win32",
    env: process.env,
  });
  attachShutdown(devProcess);

  const backendReady = await waitForHttpOk(urls.readyUrl);
  const frontendReady = await waitForHttpOk(urls.frontendUrl);
  if (!backendReady || !frontendReady) {
    console.error("OpenAgentGraph did not become ready in time.");
    console.error(`Backend ready check: ${urls.readyUrl}`);
    console.error(`Frontend check: ${urls.frontendUrl}`);
    devProcess.kill("SIGTERM");
    process.exit(1);
  }

  console.log(`OpenAgentGraph is ready at ${urls.frontendUrl}`);
  if (args.openBrowser) {
    await openBrowser(urls.frontendUrl);
  }

  const exitCode = await new Promise<number>((resolve) => {
    devProcess.on("exit", (code) => resolve(code ?? 0));
  });
  process.exit(exitCode);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});