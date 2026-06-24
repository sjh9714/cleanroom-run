import { cpSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync, spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const cliPath = join(repoRoot, "dist", "index.js");

if (!existsSync(cliPath)) {
  console.error("dist/index.js does not exist. Run `npm run build` before `npm run test:smoke`.");
  process.exit(1);
}

const tempRoot = mkdtempSync(join(tmpdir(), "cleanroom-smoke-"));
const fixtureRoot = join(tempRoot, "fixture");

try {
  cpSync(join(repoRoot, "fixtures", "generated-file-demo"), fixtureRoot, { recursive: true });
  git(fixtureRoot, ["init", "-b", "main"]);
  git(fixtureRoot, ["config", "user.email", "smoke@example.com"]);
  git(fixtureRoot, ["config", "user.name", "Smoke Test"]);
  git(fixtureRoot, ["add", "."]);
  git(fixtureRoot, ["commit", "-m", "fixture"]);

  const clean = spawnSync("node", [cliPath, "run", "--", "node", "-e", "console.log('cleanroom ok')"], {
    cwd: fixtureRoot,
    encoding: "utf8"
  });
  if (clean.status !== 0) {
    console.error(clean.stdout);
    console.error(clean.stderr);
    throw new Error("expected clean command to pass");
  }

  const generated = spawnSync("node", [cliPath, "run", "--", "npm", "run", "check"], {
    cwd: fixtureRoot,
    encoding: "utf8"
  });
  if (generated.status === 0) {
    console.error(generated.stdout);
    console.error(generated.stderr);
    throw new Error("expected generated-file command to fail");
  }
  if (!generated.stdout.includes("generated/schema.json")) {
    console.error(generated.stdout);
    console.error(generated.stderr);
    throw new Error("expected generated-file report to mention generated/schema.json");
  }

  console.log("smoke test passed");
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}

function git(cwd, args) {
  execFileSync("git", args, { cwd, stdio: "ignore" });
}

