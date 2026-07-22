import "dotenv/config";

type Environment = NodeJS.ProcessEnv & {
  AI_KEY: string;
  AI_URL: string;
  AI_MODEL: string;
  HF_TOKEN: string;
};

export function checkEnvironment(
  environment: NodeJS.ProcessEnv
): asserts environment is Environment {
  const { AI_KEY, AI_URL, AI_MODEL, HF_TOKEN } = environment;

  if (!AI_KEY) {
    throw new Error("Missing AI_KEY");
  }

  if (!AI_URL) {
    throw new Error("Missing AI_URL");
  }

  if (!AI_MODEL) {
    throw new Error("Missing AI_MODEL");
  }

  if (!HF_TOKEN) {
    throw new Error("Missing HF_TOKEN");
  }
}
