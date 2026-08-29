import path from "node:path";
import { PROMPTS_DIR } from "./constants.js";
import fs from "node:fs/promises";

export async function getSystemPrompt() {
  const filePath = path.resolve(
    process.cwd(),
    path.join(PROMPTS_DIR, "system.md")
  );

  return await fs.readFile(filePath, { encoding: "utf-8" });
}
