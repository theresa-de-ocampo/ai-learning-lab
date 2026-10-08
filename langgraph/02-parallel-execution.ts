import { StateGraph, START, END } from "@langchain/langgraph";
import { registry } from "@langchain/langgraph/zod";
import z from "zod";

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
  console.log(`Adding "A" to ${JSON.stringify(state)}`);
  return { nlist: ["A"] };
}

function nodeB(state: State): State {
  console.log(`Adding "B" to ${JSON.stringify(state)}`);
  return { nlist: ["B"] };
}

function nodeC(state: State): State {
  console.log(`Adding "C" to ${JSON.stringify(state)}`);
  return { nlist: ["C"] };
}

function nodeBB(state: State): State {
  console.log(`Adding "BB" to ${JSON.stringify(state)}`);
  return { nlist: ["BB"] };
}

function nodeCC(state: State): State {
  console.log(`Adding "CC" to ${JSON.stringify(state)}`);
  return { nlist: ["CC"] };
}

function nodeD(state: State): State {
  console.log(`Adding "D" to ${JSON.stringify(state)}`);
  return { nlist: ["D"] };
}

const graph = new StateGraph(StateDefinition)
  .addNode("a", nodeA)
  .addNode("b", nodeB)
  .addNode("bb", nodeBB)
  .addNode("c", nodeC)
  .addNode("cc", nodeCC)
  .addNode("d", nodeD)
  .addEdge(START, "a")
  .addEdge("a", "b")
  .addEdge("a", "c")
  .addEdge("b", "bb")
  .addEdge("c", "cc")
  .addEdge("bb", "d")
  .addEdge("cc", "d")
  .addEdge("d", END)
  .compile();

console.log("\n=== L1: Parallel Execution Example ===\n");

const initialState: State = {
  nlist: ["Initial String"]
};

const result = await graph.invoke(initialState);
console.log(`Final Result: ${JSON.stringify(result)}`);
