import { InferenceClient } from "@huggingface/inference";
import {
  checkEnvironment,
  HUGGING_FACE_ENV
} from "../shared/check-environment.js";

checkEnvironment(process.env, HUGGING_FACE_ENV);

const client = new InferenceClient(process.env.HF_TOKEN);

// 410 gone
// InferenceClientInputError: We have not been able to find inference provider information for model HuggingFaceTB/SmolLM3-3B.
// The error occurs because the Hugging Face Serverless Inference API currently does not have the HuggingFaceTB/SmolLM3-3B model deployed or routed for cloud inference. This API requires models to be actively hosted by supported partners.

const response = await client.chatCompletion({
  messages: [
    {
      role: "system",
      content:
        "Respond like you are William Shakespeare, that is, in old English style."
    },
    {
      role: "user",
      content: "Tell me a fun fact about the Internet."
    }
  ],
  // model: "Qwen/Qwen2.5-0.5B-Instruct:featherless-ai"
  model: "Qwen/Qwen2.5-0.5B-Instruct",
  provider: "featherless-ai"
});

console.log(response.choices[0].message.content);
