import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";
import { ChatView, verifyEnv, formatErrorMessage } from "./utils.js";
import initialMessages from "./conversation.js";

// Verify that environment variables are set
verifyEnv();
// Initialize OpenRouter client with API key
const openRouter = createOpenRouter({ apiKey: process.env.OPENROUTER_KEY });
// Get current model and convert it to AI SDK compatible model
const openRouterModel = openRouter(process.env.MODEL_ID);

// Get UI Elements
const chatForm = document.getElementById("chat-form");
const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");
const messagesContainer = document.getElementById("messages-container");
const chatContainer = document.getElementById("chat-container");

// Create chat view
const chatView = new ChatView(chatContainer, messagesContainer);

// Conversation is initially empty
const messages = [...initialMessages];

function start() {
  // Display initial conversation
  messages.forEach((message) => {
    chatView.addMessage(message);
  });

  // Update initial message counter
  chatView.updateCounters(messages);

  // Handle user's message to the AI
  chatForm.addEventListener("submit", handleUserMessage);
}

async function handleUserMessage(event) {
  // Prevents default form submission
  event.preventDefault();

  // Exit if message is empty, otherwise disable input while loading
  const userInput = messageInput.value.trim();
  if (!userInput) return;
  messageInput.value = "";
  disableInputWhileLoading(true);

  // Add user message
  const userMessage = { role: "user", content: userInput };
  messages.push(userMessage);
  chatView.addMessage(userMessage);

  // Add assistant message placeholder
  const assistantMessage = { role: "assistant", content: "" };
  // messages.push(assistantMessage);
  chatView.addMessage(assistantMessage);

  try {
    // Send conversation history and stream the response
    const response = await streamText({
      model: openRouterModel,
      instructions:
        "You are a helpful assistant. Never guess what the user wants if the request is short or missing key details. First, ask up to three short questions to get the facts. Do not write the full response until the user answers your questions. No need to add intros and conclusions.",
      messages
    });

    // Update the assistant message as chunks arrive
    // for await (const textChunk of response.textStream) {
    //   assistantMessage.content += textChunk;
    //   chatView.updateLatestMessage(assistantMessage.content);
    // }
    for await (const event of response.stream) {
      if (event.type === "error") {
        throw event.error;
      } else if (event.type === "text-delta") {
        assistantMessage.content += event.text;
        chatView.updateLatestMessage(assistantMessage.content);
      }
    }

    messages.push(assistantMessage);
  } catch (err) {
    assistantMessage.content = formatErrorMessage(err);
    chatView.updateLatestMessage(assistantMessage.content);
  }

  disableInputWhileLoading(false);
  chatView.updateCounters(messages, contextMessages);
}

function disableInputWhileLoading(shouldDisable) {
  messageInput.disabled = shouldDisable;
  sendButton.disabled = shouldDisable;
}

start();
