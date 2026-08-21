import { marked } from "marked";
import DOMPurify from "dompurify";
import { encode } from "gpt-tokenizer";

export function verifyEnv() {
  if (!process.env.OPENROUTER_KEY) {
    console.error("❌ OPENROUTER_KEY env variable is not set");
  }
  if (!process.env.MODEL_ID) {
    console.error("❌ MODEL_ID env variable is not set");
  }
  if (process.env.OPENROUTER_KEY && process.env.MODEL_ID) {
    console.log("✅ OPENROUTER_KEY and MODEL_ID env variables are set");
  }
}

export function formatErrorMessage(error) {
  if (error.message.includes("maximum context length")) {
    return "Error: Your request does not fit within the model's context window.";
  } else {
    return `Error: ${error.message}`;
  }
}

export function calculateTokens(messages) {
  const content = messages.map((message) => message.content).join("");
  return encode(content).length;
}

export function getTrimmedContent(messages, tokenLimit = 10_000) {
  let tokenCount = calculateTokens(messages);
  let trimmedMessages = [...messages];

  while (tokenCount > tokenLimit) {
    trimmedMessages.shift();
    tokenCount = calculateTokens(trimmedMessages);
  }

  if (trimmedMessages.length === 0) {
    throw new Error("maximum context length");
  }

  return trimmedMessages;
}

export class ChatView {
  constructor(chatContainer, messagesContainer) {
    this.chatContainer = chatContainer;
    this.messagesContainer = messagesContainer;
    this.messageCount = 0;
    this.maxMessages = 20;

    this.totalMessagesCounter = chatContainer.querySelector(
      "#total-messages-counter"
    );
    this.contextMessagesCounter = chatContainer.querySelector(
      "#context-messages-counter"
    );
    this.counterSeparator = chatContainer.querySelector(".separator");
  }

  addMessage(message) {
    const messageElement = this.createMessageElement(message);
    this.messagesContainer.appendChild(messageElement);
    this.messageCount++;

    this.trimOldMessages();
    this.scrollToBottom();

    return messageElement;
  }

  updateLatestMessage(content) {
    const lastMessage = this.messagesContainer.lastElementChild;
    if (lastMessage) {
      const contentDiv = lastMessage.querySelector(".message-content");
      if (contentDiv) {
        contentDiv.innerHTML = DOMPurify.sanitize(marked.parse(content));
      } else {
        // Fallback if no content div exists
        lastMessage.innerHTML = DOMPurify.sanitize(marked.parse(content));
      }
    }
  }

  createMessageElement(message) {
    const messageElement = document.createElement("div");
    messageElement.className = `message ${message.role}`;

    const contentDiv = document.createElement("div");
    contentDiv.className = "message-content";

    if (message.role === "assistant" && !message.content) {
      // Loading state
      contentDiv.innerHTML = `
        <div class="loading-indicator">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
      `;
    } else {
      contentDiv.innerHTML = DOMPurify.sanitize(
        marked.parse(message.content || "")
      );
    }

    messageElement.appendChild(contentDiv);
    return messageElement;
  }

  trimOldMessages() {
    while (this.messagesContainer.children.length > this.maxMessages) {
      this.messagesContainer.removeChild(this.messagesContainer.firstChild);
      this.messageCount--;
    }
  }

  scrollToBottom() {
    this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
  }

  updateCounters(allMessages, contextMessages = null) {
    const totalCount = allMessages.length;
    const hasContextMessages = contextMessages !== null;

    this.totalMessagesCounter.textContent = `${totalCount} total message${totalCount === 1 ? "" : "s"}`;
    this.counterSeparator.hidden = !hasContextMessages;
    this.contextMessagesCounter.hidden = !hasContextMessages;

    if (hasContextMessages) {
      const contextCount = contextMessages.length;
      this.contextMessagesCounter.textContent = `${contextCount} context message${contextCount === 1 ? "" : "s"}`;
    }
  }
}
