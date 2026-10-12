import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { extname } from "node:path";
import { pathToFileURL } from "node:url";

/**
 * Determines whether the calling module is the entry point of the current process.
 *
 * Useful for distinguishing direct CLI execution from module imports.
 * For example, when LangGraph Studio imports a graph, the graph module
 * is not considered the entry point.
 *
 * @param moduleUrl - The calling module's `import.meta.url`.
 * @returns `true` if the module is the entry point; otherwise, `false`.
 */
export function isMainModule(moduleUrl: string): boolean {
  const entryPath = process.argv[1];
  if (entryPath === undefined) return false;

  const entryUrl = pathToFileURL(entryPath).href;

  return (
    moduleUrl === entryUrl ||
    (extname(entryPath) === "" && moduleUrl === `${entryUrl}.ts`)
  );
}

export async function askQuestion(query: string) {
  const rl = readline.createInterface({ input: stdin, output: stdout });
  const answer = await rl.question(query);
  rl.close();

  return answer;
}
