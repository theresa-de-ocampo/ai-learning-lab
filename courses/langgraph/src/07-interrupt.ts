import {
  StateGraph,
  START,
  END,
  MemorySaver,
  interrupt,
  isInterrupted,
  Command
} from "@langchain/langgraph";
import { registry } from "@langchain/langgraph/zod";
import z from "zod";

import { askQuestion, isMainModule } from "./utils.js";

// 1. setup completes. LangGraph checkpoints ["SETUP"].
// 2. A's task starts from that checkpoint.
// 3. nodeA produces ["A"], so the router sees ["SETUP", "A"].
// 4. The router interrupts. A's task remains unfinished.
// 5. On resume, LangGraph retries A's task from its starting checkpoint: ["SETUP"].

// Run from the langgraph directory: npx.cmd tsx 08-interrupt.ts
// This experiment always interrupts, so you only need to answer the resume prompt.
// Graph: START -> setup -> a -> routeFromA -> b or END
const StateDefinition = z.object({
  nlist: z.array(z.string()).register(registry, {
    reducer: {
      fn: (left: string[], right: string[]) => left.concat(right)
    },
    default: () => []
  })
});

type State = z.infer<typeof StateDefinition>;
type InterruptMessage = { message: string };

// These counters live outside graph state. They count actual function calls,
// even when LangGraph replays a task from its checkpoint.
const calls = { setup: 0, nodeA: 0, routeFromA: 0, nodeB: 0 };

function setup(state: State): State {
  console.log(
    `[setup #${++calls.setup}] input: ${JSON.stringify(state.nlist)}`
  );
  return { nlist: ["SETUP"] };
}

function nodeA(state: State): State {
  console.log(
    `[nodeA #${++calls.nodeA}] input: ${JSON.stringify(state.nlist)}`
  );
  return { nlist: ["A"] };
}

function nodeB(state: State): State {
  console.log(
    `[nodeB #${++calls.nodeB}] input: ${JSON.stringify(state.nlist)}`
  );
  return { nlist: ["B"] };
}

function routeFromA(state: State): string {
  console.log(
    `[routeFromA #${++calls.routeFromA}] input: ${JSON.stringify(state.nlist)}`
  );
  console.log("[router] About to call interrupt()");

  // First invocation: throws GraphInterrupt; code below does not run.
  // Resume invocation: returns the value supplied in Command({ resume: ... }).
  const answer = interrupt<InterruptMessage, string>({
    message: 'Type "continue" to visit B, or anything else to end: '
  });

  console.log(`[router] interrupt() returned: ${JSON.stringify(answer)}`);
  return answer.trim().toLowerCase() === "continue" ? "b" : END;
}

export const graph = new StateGraph(StateDefinition)
  .addNode("setup", setup)
  .addNode("a", nodeA)
  .addNode("b", nodeB)
  // A is deliberately NOT the entry node.
  .addEdge(START, "setup")
  .addEdge("setup", "a")
  // The router is attached to A's task, rather than being a separate node.
  .addConditionalEdges("a", routeFromA, ["b", END])
  .addEdge("b", END)
  .compile({ checkpointer: new MemorySaver() });

// LangSmith Studio imports the graph above; only a direct launch runs this demo.
if (isMainModule(import.meta.url)) {
  // Both invocations must use the same thread ID to resume the saved execution.
  const config = { configurable: { thread_id: "interrupt-replay-demo" } };

  console.log("\n=== FIRST INVOCATION ===");
  let result = await graph.invoke({ nlist: [] }, config);
  console.log("Returned result:", JSON.stringify(result));
  console.log("Calls so far:", JSON.stringify(calls));

  // isInterrupted is LangGraph's built-in equivalent of our hasInterrupt helper.
  if (isInterrupted<InterruptMessage>(result)) {
    const pending = result.__interrupt__[0]?.value;
    if (!pending)
      throw new Error("Expected an interrupt payload for this demo.");
    const human = await askQuestion(pending.message);

    console.log("\n=== RESUME INVOCATION ===");
    // This resumes the interrupted A task. It does not restart from START.
    // This will use the original input ["SETUP"] rather than the paused result ["SETUP", "A"].
    // This is because LangGraph is retrying an unfinished task,
    // it gives that task the input it originally started with.
    // LangGraph repeats the original computation,
    // this time with the human's answer available to the router can finish.
    // Watch for nodeA #2 and routeFromA #2, but no setup #2.
    result = await graph.invoke(new Command({ resume: human }), config);
  }

  console.log("\nFinal state:", JSON.stringify(result.nlist));
  console.log("Total calls:", JSON.stringify(calls));

  // Final state: ["SETUP", "A", "B"]. Replaying A does not append a second A:
  // its task re-executes from the original task input, ["SETUP"].
}
