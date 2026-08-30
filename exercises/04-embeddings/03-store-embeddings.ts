import OpenAI from "openai";
import {
  checkEnvironment,
  OPENAI_COMPATIBLE_ENV
} from "../shared/check-environment.js";
import path from "node:path";
import fs from "node:fs/promises";

checkEnvironment(process.env, OPENAI_COMPATIBLE_ENV);

const openai = new OpenAI({
  apiKey: process.env.AI_KEY,
  baseURL: process.env.AI_URL
});

const podcasts = [
  "Beyond Mars (1 hr 15 min): Join space enthusiasts as they speculate about extraterrestrial life and the mysteries of distant planets.",
  "Jazz under stars (55 min): Experience a captivating night in New Orleans, where jazz melodies echo under the moonlit sky.",
  "Mysteries of the deep (1 hr 30 min): Dive with marine explorers into the uncharted caves of our oceans and uncover their hidden wonders.",
  "Rediscovering lost melodies (48 min): Journey through time to explore the resurgence of vinyl culture and its timeless appeal.",
  "Tales from the tech frontier (1 hr 5 min): Navigate the complex terrain of AI ethics, understanding its implications and challenges.",
  "The soundscape of silence (30 min): Traverse the globe with sonic explorers to find the world's most serene and silent spots.",
  "Decoding dreams (1 hr 22 min): Step into the realm of the subconscious, deciphering the intricate narratives woven by our dreams.",
  "Time capsules (50 min): Revel in the bizarre, endearing, and profound discoveries that unveil the quirks of a century past.",
  "Frozen in time (1 hr 40 min): Embark on an icy expedition, unearthing secrets hidden within the majestic ancient glaciers.",
  "Songs of the Sea (1 hr): Dive deep with marine biologists to understand the intricate whale songs echoing in our vast oceans."
];

const response = await openai.embeddings.create({
  input: podcasts,
  model: process.env.AI_MODEL
});

const file = path.join(
  "..",
  "artifacts",
  "04-embeddings",
  "03-create-embeddings.json"
);

await fs.writeFile(file, JSON.stringify(response));

// const data = response.data.map(({ embedding }, i) => {
//   return {
//     content: podcasts[i],
//     embedding
//   };
// });

// try {
//   await supabase.from("documents").insert(data);
//   console.log("Done!");
// } catch (error) {
//   console.log("An error occurred.");
//   console.dir(error, { depth: null });
// }
