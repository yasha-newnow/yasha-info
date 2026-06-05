// Points git at the repo's tracked hooks (.githooks) so the CV PDF
// auto-rebuild hook is active without a manual `git config` step. Runs from
// postinstall. Safe everywhere: silently no-ops when git is unavailable or
// this isn't a work tree (e.g. CI installing from a tarball).
import { execSync } from "node:child_process";

try {
  execSync("git rev-parse --is-inside-work-tree", { stdio: "ignore" });
} catch {
  process.exit(0); // not a git repo — nothing to wire up
}

try {
  execSync("git config core.hooksPath .githooks", { stdio: "ignore" });
} catch {
  // non-fatal — the hook just won't be auto-active on this machine
}
