import z from "zod";
import { StateGraph, START, END } from "@langchain/langgraph";

import { isMainModule } from "./utils.js";

const StateDefinition = z.object({
  nlist: z.array(z.string())
});

type State = z.infer<typeof StateDefinition>;

function nodeA(state: State): State {
  console.log(`nodeA is receiving ${JSON.stringify(state.nlist)}`);
  const note = "Hello World from NodeA";
  console.log(note);
  return { nlist: [note] };
}

/**
 * Calling .compile() on a StateGraph validates the graph's structure and
 * turns it into an executable CompiledStateGraph.
 * It checks the graph topology to ensure there are no errors,
 * such as orphaned nodes or invalid connections.
 */
export const graph = new StateGraph(StateDefinition)
  .addNode("a", nodeA)
  .addEdge(START, "a")
  .addEdge("a", END)
  .compile();

// LangSmith Studio imports the graph above; only a direct launch runs this demo.
if (isMainModule(import.meta.url)) {
  console.log("\n=== L1: Simple Node Example ===\n");

  const initialState: State = {
    nlist: ["Hello NodeA, how are you?"]
  };

  console.log(
    `Running graph with initial state: ${JSON.stringify(initialState)}`
  );

  const result = await graph.invoke(initialState);
  console.log(`Final Result: ${JSON.stringify(result)}`);
}
