import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import YAML from "yaml";
import { CleanroomError } from "./errors.js";
import type { CheckConfig, CleanroomConfig } from "./types.js";

export const DEFAULT_CONFIG_NAME = ".cleanroom-run.yml";

const defaultConfig: CleanroomConfig = {
  checks: {
    verify: {
      command: "npm run verify",
      timeoutMs: 120000
    }
  }
};

export function resolveConfigPath(repoRoot: string, explicitPath?: string): string {
  return explicitPath ? explicitPath : join(repoRoot, DEFAULT_CONFIG_NAME);
}

export async function loadConfig(repoRoot: string, explicitPath?: string): Promise<CleanroomConfig> {
  const path = resolveConfigPath(repoRoot, explicitPath);
  if (!existsSync(path)) {
    return { checks: {} };
  }

  let parsed: unknown;
  try {
    parsed = YAML.parse(await readFile(path, "utf8"));
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new CleanroomError(`could not parse ${path}: ${detail}`);
  }

  return normalizeConfig(parsed, path);
}

export function normalizeConfig(value: unknown, source = DEFAULT_CONFIG_NAME): CleanroomConfig {
  if (!value || typeof value !== "object") {
    throw new CleanroomError(`${source} must contain a YAML object`);
  }

  const rawChecks = (value as { checks?: unknown }).checks;
  if (rawChecks === undefined) {
    return { checks: {} };
  }

  if (!rawChecks || typeof rawChecks !== "object" || Array.isArray(rawChecks)) {
    throw new CleanroomError(`${source} field "checks" must be an object`);
  }

  const checks: Record<string, CheckConfig> = {};
  for (const [name, rawCheck] of Object.entries(rawChecks)) {
    if (!rawCheck || typeof rawCheck !== "object" || Array.isArray(rawCheck)) {
      throw new CleanroomError(`${source} check "${name}" must be an object`);
    }

    const command = (rawCheck as { command?: unknown }).command;
    if (typeof command !== "string" || command.trim().length === 0) {
      throw new CleanroomError(`${source} check "${name}" needs a non-empty command`);
    }

    const timeoutMs = (rawCheck as { timeoutMs?: unknown }).timeoutMs;
    if (timeoutMs !== undefined && (!Number.isInteger(timeoutMs) || Number(timeoutMs) <= 0)) {
      throw new CleanroomError(`${source} check "${name}" timeoutMs must be a positive integer`);
    }

    checks[name] = {
      command,
      timeoutMs: timeoutMs === undefined ? undefined : Number(timeoutMs)
    };
  }

  return { checks };
}

export async function writeDefaultConfig(repoRoot: string, force: boolean): Promise<string> {
  const path = resolveConfigPath(repoRoot);
  if (existsSync(path) && !force) {
    throw new CleanroomError(`${path} already exists; pass --force to overwrite it`);
  }

  const body = YAML.stringify(defaultConfig);
  await writeFile(path, body, "utf8");
  return path;
}

