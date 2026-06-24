import { mkdirSync, writeFileSync } from "node:fs";

mkdirSync("generated", { recursive: true });
writeFileSync("generated/schema.json", JSON.stringify({ generatedAt: "fixture" }, null, 2));
console.log("wrote generated/schema.json");

