import { graph as simpleNodeExample } from "./01-simple-node.js";
import { graph as parallelExecutionExample } from "./02-parallel-execution.js";
import { graph as conditionalEdgeExample } from "./03-conditional-edge.js";
import { graph as conditionalRouterEdgeExample } from "./04-conditional-router-edge.js";
import { graph as memoryExample } from "./05-memory.js";
import { graph as interruptExample } from "./06-interrupt.js";
import { graph as interruptReplayExample } from "./07-interrupt.js";
import { graph as emailExample } from "./08-email.js";

const graphs = {
  "01-simple-node": simpleNodeExample,
  "02-parallel-execution": parallelExecutionExample,
  "03-conditional-edge": conditionalEdgeExample,
  "04-conditional-router-edge": conditionalRouterEdgeExample,
  "05-memory": memoryExample,
  "06-interrupt": interruptExample,
  "07-interrupt-replay": interruptReplayExample,
  "08-email": emailExample
};

export default graphs;
