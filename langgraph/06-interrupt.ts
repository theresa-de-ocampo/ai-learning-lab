import {
  StateGraph,
  START,
  END,
  MemorySaver,
  interrupt,
  Command
} from "@langchain/langgraph";
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

/**
 * Resuming replays the interrupted node's execution from the beginning,
 * rather than restoring a JavaScript call stack at the interrupted line.
 * "node" means it will restart from the caller which is nodeA in this case,
 * instead of solely restarting routeFromA
 * @param state
 * @returns nextNode
 */
function routeFromA(state: State): string {
  const selected = state.nlist.at(-2);
  let nextNode = END;
  console.log(`***** Selected: ${selected}`);

  if (selected == "b") {
    nextNode = "b";
  } else if (selected === "c") {
    nextNode = "c";
  } else {
    console.log("| Entered Else");
    const admin = interrupt({
      message: `💥 Unexpected input ${selected}! Continue? `
    });

    if (admin.toLowerCase() === "continue") {
      nextNode = "b";
    } else {
      nextNode = END;
    }
  }

  return nextNode;
}

// Simplified explanation—not the actual implementation
// function interrupt(payload) {
//   if (aResumeValueIsAvailableForThisInterrupt()) {
//     return theResumeValue;
//   }

//   throw new GraphInterrupt(payload);
// }

function hasInterrupt(result: any): result is { __interrupt__: any[] } {
  return result && result.__interrupt__ && Array.isArray(result.__interrupt__);
}

const graph = new StateGraph(StateDefinition)
  .addNode("a", nodeA)
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

    let result = await graph.invoke(inputState, config);

    if (hasInterrupt(result)) {
      console.log("\n------");
      console.log(`Interrupt: ${JSON.stringify(result)}`);

      const interruptMessage =
        result.__interrupt__.at(-1)?.value?.message || "Continue";

      const human = await askQuestion(interruptMessage);
      result = await graph.invoke(new Command({ resume: human }), config);
      console.log("-----\n");
    }

    console.log(`Thread ID ${threadId}: ${JSON.stringify(result.nlist)}`);
  }
}
