import "./style.css";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_AI_KEY,
  dangerouslyAllowBrowser: true
});

const prompt = "Eiffel tower above the sea.";

const response = await openai.images.generate({
  model: "gpt-image-2",
  prompt,
  size: "1536x1024"
});

const imageBase64 = response?.data?.[0].b64_json;

if (imageBase64) {
  document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
    <image src="data:image/png;base64,${imageBase64}" alt="${prompt}" />
  `;
}
