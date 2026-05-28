import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");
const tauriBin = join(
  projectRoot,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "tauri.cmd" : "tauri",
);

const env = { ...process.env };
const isWayland =
  process.platform === "linux" &&
  (env.XDG_SESSION_TYPE === "wayland" || Boolean(env.WAYLAND_DISPLAY));

if (isWayland && env.WEBKIT_DISABLE_DMABUF_RENDERER === undefined) {
  env.WEBKIT_DISABLE_DMABUF_RENDERER = "1";
  console.info(
    "Detected Wayland; launching Tauri with WEBKIT_DISABLE_DMABUF_RENDERER=1.",
  );
}

const child = spawn(tauriBin, process.argv.slice(2), {
  cwd: projectRoot,
  env,
  stdio: "inherit",
  windowsHide: false,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});

child.on("error", (error) => {
  console.error(`Failed to launch Tauri CLI: ${error.message}`);
  process.exit(1);
});
