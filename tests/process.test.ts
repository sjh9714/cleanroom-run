import { existsSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { runProcess } from "../src/process.js";

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(roots.map((root) => rm(root, { recursive: true, force: true })));
  roots.length = 0;
});

describe("runProcess", () => {
  it("kills child processes that outlive a timed out command on Unix", async () => {
    if (process.platform === "win32") {
      return;
    }

    const root = await mkdtemp(join(tmpdir(), "cleanroom-process-"));
    roots.push(root);
    const marker = join(root, "child-survived.txt");
    const childScript = `setTimeout(() => require('node:fs').writeFileSync(${JSON.stringify(marker)}, 'alive'), 700)`;
    const parentScript = `
      require('node:child_process').spawn(process.execPath, ['-e', ${JSON.stringify(childScript)}], { stdio: 'ignore' });
      setTimeout(() => {}, 5000);
    `;

    const result = await runProcess(
      {
        kind: "argv",
        argv: [process.execPath, "-e", parentScript],
        display: "node -e parent"
      },
      root,
      100
    );

    await new Promise((resolve) => setTimeout(resolve, 1000));

    expect(result.timedOut).toBe(true);
    expect(existsSync(marker)).toBe(false);
  });
});
