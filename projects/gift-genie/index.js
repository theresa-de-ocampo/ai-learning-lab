import { marked } from "marked";
import DOMPurify from "dompurify";
import { autoResizeTextarea, setLoading, showStream } from "./utils.js";

const giftForm = document.getElementById("gift-form");
const userInput = document.getElementById("user-input");
const outputContent = document.getElementById("output-content");

function start() {
  userInput.addEventListener("input", () => autoResizeTextarea(userInput));
  giftForm.addEventListener("submit", handleGiftRequest);
}

async function handleGiftRequest(e) {
  e.preventDefault();

  const userPrompt = userInput.value.trim();
  if (!userPrompt) return;

  setLoading(true);

  try {
    const response = await fetch("/api/gift", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ userPrompt })
    });

    showStream();

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let buffer = ""; // stores decoded SSE text that has arrived but may not yet be a complete event
    let giftSuggestions = ""; // stores full response accumulated so far

    while (true) {
      const { value, done } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split("\n\n");

      // The last item may be an incomplete event
      buffer = events.pop();

      for (const event of events) {
        // Event Stream Format may have several fields, extract `data`
        const dataLine = event
          .split("\n")
          .find((line) => line.startsWith("data: "));

        // If this SSE has no payload, skip it
        if (!dataLine) {
          continue;
        }

        const data = dataLine.replace("data:", "").trim();

        giftSuggestions += JSON.parse(data).message || "";

        const html = marked.parse(giftSuggestions);
        const safeHTML = DOMPurify.sanitize(html);
        outputContent.innerHTML = safeHTML;
      }
    }
  } catch (error) {
    console.error(error);
    outputContent.textContent = "Sorry, an unexpected error occurred.";
  } finally {
    setLoading(false);
  }
}

start();
