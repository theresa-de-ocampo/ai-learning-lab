import { StateGraph, START, END } from "@langchain/langgraph";
import { registry } from "@langchain/langgraph/zod";
import z from "zod";

import { askQuestion } from "./utils.js";

const StateDefinition = z.object({
  nlist: z.array(z.string()).register(registry, {
    reducer: {
      fn: (left: string[], right: string[]) => left.concat(right)
    },
    default: () => []
  })
});

type State = z.infer<typeof StateDefinition>;

function nodeA(state: State): State {
  console.log(`Adding "A" to ${JSON.stringify(state.nlist)}`);
  return { nlist: ["A"] };
}

function nodeB(state: State): State {
  console.log(`Adding "B" to ${JSON.stringify(state.nlist)}`);
  return { nlist: ["B"] };
}

function nodeC(state: State): State {
  console.log(`Adding "C" to ${JSON.stringify(state.nlist)}`);
  return { nlist: ["C"] };
}

function routeFromA(state: State): string {
  const selected = state.nlist.at(-2);
  let nextNode = END;

  if (selected == "b") {
    nextNode = "b";
  } else if (selected === "c") {
    nextNode = "c";
  }

  return nextNode;
}

const graph = new StateGraph(StateDefinition)
  .addNode("a", nodeA, { ends: ["b", "c"] })
  .addNode("b", nodeB)
  .addNode("c", nodeC)
  .addEdge(START, "a")
  .addConditionalEdges("a", routeFromA)
  .addEdge("b", END)
  .addEdge("c", END)
  .compile();

console.log("\n=== L1: Conditional Edges Example ===\n");
const userSelection = await askQuestion("Enter a Node: ");

const inputState: State = {
  nlist: [userSelection]
};

const result = await graph.invoke(inputState);
console.log(`Final Result: ${JSON.stringify(result.nlist)}`);
