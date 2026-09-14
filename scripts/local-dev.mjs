import { spawn } from "node:child_process";
import path from "node:path";

const [mode = "dev", ...extra] = process.argv.slice(2);
if (!["dev", "preview"].includes(mode)) throw new Error("Expected dev or preview.");
const cli = mode === "dev" ? "@react-router/dev/bin.js" : "wrangler/bin/wrangler.js";
const args = mode === "dev" ? ["dev", ...extra] : ["dev", "--config", "build/server/wrangler.json", "--env-file", ".dev.vars", "--ip", "127.0.0.1", "--port", "8790", ...extra];

// Wrangler's local trace collector is independent of production observability.
// Query-based upstream credentials must not be persisted by that collector.
const child = spawn(process.execPath, [path.resolve("node_modules", cli), ...args], {
  stdio: "inherit",
  env: { ...process.env, X_LOCAL_OBSERVABILITY: "false" },
});
child.on("error", () => { console.error("Could not start the local development server."); process.exitCode = 1; });
child.on("exit", code => { process.exitCode = code ?? 1; });
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
