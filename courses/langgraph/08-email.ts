import {
  Command,
  END,
  MemorySaver,
  START,
  StateGraph,
  interrupt
} from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import z from "zod";

const llm = new ChatOpenAI({ model: "gpt-5-nano" });

const EmailClassificationSchema = z.object({
  intent: z.enum(["question", "bug", "billing", "feature", "complex"]),
  urgency: z.enum(["low", "medium", "high", "critical"]),
  topic: z.string(),
  summary: z.string()
});

const EmailStateDefinition = z.object({
  content: z.string(),
  sender: z.email(),
  emailId: z.string(),
  classification: EmailClassificationSchema.optional(),
  ticketId: z.string().optional(),
  searchResults: z.array(z.string()).optional(),
  customerHistory: z.record(z.string(), z.any()).optional(),
  draftResponse: z.string().optional()
});

type EmailAgentState = z.infer<typeof EmailStateDefinition>;

const memory = new MemorySaver();

function readEmail(state: EmailAgentState) {
  console.log(`Processing Email From: ${state.sender}`);
  return {};
}

async function classifyIntent(state: EmailAgentState) {
  console.log("Classifying Email...");
  const structuredLlm = llm.withStructuredOutput(EmailClassificationSchema);

  const prompt = `Analyze the customer email and classify it: ${state.content}`;
  const classification = await structuredLlm.invoke(prompt);

  return { classification };
}

function bugTracking(state: EmailAgentState) {
  console.log("Creating Bug Ticket...");
  const ticketId = `BUG_${Date.now()}`;

  return { ticketId };
}

function searchDocumentation(state: EmailAgentState) {
  console.log("Searching Documentation");
  const validatedClassification = EmailClassificationSchema.parse(
    state.classification
  );

  const searchResults = [
    `Documentation for ${validatedClassification.intent}`,
    `Basic information about ${validatedClassification.topic}`,
    `FAQ Entry: Common questions related to ${validatedClassification.topic}`,
    `Knowledge base article: How to handle ${validatedClassification.intent} requests`
  ];

  console.log(`Found Search Results: ${searchResults.length} items`);

  return { searchResults };
}

async function writeResponse(state: EmailAgentState) {
  console.log("Writing Response...");
  const validatedClassification = EmailClassificationSchema.parse(
    state.classification
  );

  const context: string[] = [];

  if (state.searchResults) {
    const formattedDocs = state.searchResults
      .map((doc) => `- ${doc}`)
      .join("\n");
    context.push(`## Relevant Documentation:\n${formattedDocs}`);
  }

  if (state.customerHistory) {
    context.push(`Customer Tier: ${state.customerHistory?.tier || "standard"}`);
  }

  const prompt = `
Draft a response to this customer email: ${state.content}

Email Intent: ${validatedClassification.intent}
Urgency Level: ${validatedClassification.urgency}

${context.join("\n\n")}

Guidelines:
- Be professional and helpful
- Address their specific concern
- Be brief
- Use the provided context when relevant
  `;

  const response = await llm.invoke(prompt);

  return { draftResponse: response.content };
}

function routeFromWriteResponse(state: EmailAgentState): string {
  const validatedClassification = EmailClassificationSchema.parse(
    state.classification
  );

  const needsReview =
    ["high", "critical"].includes(validatedClassification.urgency) ||
    validatedClassification.intent === "complex";

  return needsReview ? "human_review" : "send_reply";
}

function humanReview(state: EmailAgentState) {
  let command;

  const humanDecision = interrupt({
    ...state,
    action: "Please review and approve/edit this response"
  });

  if (humanDecision.approved) {
    const editedResponse =
      humanDecision?.editedResponse?.trim() || state.draftResponse;
    command = new Command({
      update: { draftReponse: editedResponse },
      goto: "send_reply"
    });
  } else {
    command = new Command({
      update: {},
      goto: END
    });
  }

  return command;
}

function sendReply(state: EmailAgentState) {
  const preview = state.draftResponse?.slice(60);
  console.log(`Sending reply ${preview}...`);

  return {};
}

export const graph = new StateGraph(EmailStateDefinition)
  .addNode("read_email", readEmail)
  .addNode("classify_intent", classifyIntent)
  .addNode("bug_tracking", bugTracking)
  .addNode("search_documentation", searchDocumentation)
  .addNode("write_response", writeResponse)
  .addNode("human_review", humanReview, { ends: ["send_reply", END] })
  .addNode("send_reply", sendReply)
  .addEdge(START, "read_email")
  .addEdge("read_email", "classify_intent")
  .addEdge("classify_intent", "bug_tracking")
  .addEdge("classify_intent", "search_documentation")
  .addEdge("bug_tracking", "write_response")
  .addEdge("search_documentation", "write_response")
  .addConditionalEdges("write_response", routeFromWriteResponse, [
    "human_review",
    "send_reply"
  ])
  // .addConditionalEdges("human_review", routeFromHumanReview, [
  //   "send_reply",
  //   END
  // ])
  .addEdge("send_reply", END)
  .compile({ checkpointer: memory });
