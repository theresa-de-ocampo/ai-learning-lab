import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";

export async function askQuestion(query: string) {
  const rl = readline.createInterface({ input: stdin, output: stdout });
  const answer = await rl.question(query);
  rl.close();

  return answer;
}
