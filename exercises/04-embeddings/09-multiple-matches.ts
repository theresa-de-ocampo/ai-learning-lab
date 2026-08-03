import type { ChatCompletionMessageParam } from "openai/resources";
import { openai, supabase } from "../utils/clients.js";

async function main() {
  const query = "Which movies can I take my child to?";
  //   const query = "I feel like having a good laugh!";
  //   const query = "Which movie would give me an adrenaline rush?";
  //   const query = "What's the highest rated movie?";
  //   const query = "The movie with that actor from Cast Away.";
  const queryEmbedding = await createEmbedding(query);
  const match = await findNearestMatch(queryEmbedding);
  console.log(" ");
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
  const { data } = await supabase.rpc("match_movies", {
    query_embedding: queryEmbedding,
    match_threshold: 0.2,
    match_count: 3
  });

  return data.map((match: { content: string }) => match.content).join("\n");
}

async function getChatCompletion(podcast: string | null, query: string) {
  const FALLBACK_REPLY = "Sorry, I don't know the answer.";
  let reply = FALLBACK_REPLY;

  if (podcast) {
    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `You are an enthusiastic movie expert who loves recommending movies to people. You will be given two pieces of information - some context about movies and a question. Your main job is to formulate a natural, conversational response in one or two complete sentences. If you are unsure and cannot find the answer in the context, say, "${reply}" Please do not make up the answer.`
      },
      {
        role: "user",
        content: `<movie_context>${podcast}</movie_context> <question>${query}</question>`
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
