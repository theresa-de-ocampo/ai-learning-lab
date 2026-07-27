import type { ChatCompletionMessageParam } from "openai/resources";
import { openai, supabase } from "../utils/clients.js";

async function main() {
  const query = "Something peaceful and relaxing";
  const queryEmbedding = await createEmbedding(query);
  const match = await findNearestMatch(queryEmbedding);
  const response = await getChatCompletion(match, query);
  console.log(response);
}

async function createEmbedding(query: string) {
  const response = await openai.embeddings.create({
    input: query,
    model: "text-embedding-3-small"
  });

  return response.data[0].embedding;
}

async function findNearestMatch(
  queryEmbedding: number[]
): Promise<string | null> {
  const { data } = await supabase.rpc("match_documents", {
    query_embedding: queryEmbedding,
    match_threshold: 0.38,
    match_count: 1
  });

  return data?.[0]?.content || null;
}

async function getChatCompletion(podcast: string | null, query: string) {
  const FALLBACK_REPLY = "Sorry, I don't know the answer.";
  let reply = FALLBACK_REPLY;

  if (podcast) {
    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `You are an enthusiastic podcast expert who loves recommending podcasts to people. You will be given two pieces of information - some context about podcasts episodes and a question. Your main job is to formulate a short answer to the question using the provided context. If you are unsure and cannot find the answer in the context, say, "${reply}" Please do not make up the answer.`
      },
      {
        role: "user",
        content: `<podcast_context>${podcast}</podcast_context> <question>${query}</question>`
      }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-5-nano",
      messages
    });

    reply = response.choices[0].message.content || FALLBACK_REPLY;
  }

  return reply;
}

main();
