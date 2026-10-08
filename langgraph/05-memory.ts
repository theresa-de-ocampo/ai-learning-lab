import { StateGraph, START, END, MemorySaver } from "@langchain/langgraph";
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

const memory = new MemorySaver();

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
  .compile({ checkpointer: memory });

console.log("\n=== L1: Conditional Edges Example ===\n");

while (true) {
  const threadId = await askQuestion("\nEnter a Thread ID or [q]uit: ");

  if (threadId === "q") {
    console.log("Quitting...");
    break;
  }

  const config = {
    configurable: { thread_id: threadId }
  };

  while (true) {
    const userSelection = await askQuestion("\nEnter a Node (b/c) or [q]uit: ");

    if (userSelection === "q") {
      console.log("Exiting Thread ...");
      break;
    }

    const inputState: State = {
      nlist: [userSelection]
    };

    const result = await graph.invoke(inputState, config);
    console.log(`Thread ID ${threadId}: ${JSON.stringify(result.nlist)}`);
  }
}
