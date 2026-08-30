import "dotenv/config";

export const OPENAI_COMPATIBLE_ENV = ["AI_KEY", "AI_URL", "AI_MODEL"] as const;
export const HUGGING_FACE_ENV = ["HF_TOKEN"] as const;
export const SUPABASE_ENV = ["SUPABASE_URL", "SUPABASE_API_KEY"] as const;

type EnvironmentVariable =
  | (typeof OPENAI_COMPATIBLE_ENV)[number]
  | (typeof HUGGING_FACE_ENV)[number]
  | (typeof SUPABASE_ENV)[number];

type RequiredEnvironment<Variable extends EnvironmentVariable> =
  NodeJS.ProcessEnv & Record<Variable, string>;

export function checkEnvironment<Variable extends EnvironmentVariable>(
  environment: NodeJS.ProcessEnv,
  requiredVariables: readonly Variable[]
): asserts environment is RequiredEnvironment<Variable> {
  for (const variable of requiredVariables) {
    if (!environment[variable]) {
      throw new Error(`Missing ${variable}`);
    }
  }
}
