# Running an LLM Locally with Ollama

A simple Node.js application that demonstrates how to run an **LLM locally using Ollama**.

The application uses the open-source **Mistral** model and performs inference on the local machine instead of sending prompts to a hosted AI provider.

## What This Demonstrates

- Running LLMs locally with **Ollama**
- Using an open-source model such as **Mistral**
- Calling a local model from a Node.js application
- Keeping prompts and model inference on the local machine
- Using AI without a cloud inference API or API key

This makes local models useful for scenarios where **privacy, data control, or offline-capable AI** are important.

## Running Locally

1. Download and install [Ollama](https://ollama.com/).
2. Download the Mistral model: `ollama pull mistral`.
3. Make sure Ollama is running locally before starting the application.
4. Install dependencies: `npm install`.
5. Start the application: `npm start`.
