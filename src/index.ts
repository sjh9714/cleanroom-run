#!/usr/bin/env node
import { main } from "./cli.js";

main(process.argv.slice(2)).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`cleanroom-run: ${message}`);
  process.exitCode = 1;
});

