import { get_encoding } from "tiktoken";

// ID Token <-> Token
// 904 <-> hello
// cl stands for chat language
// In this dictionary, we have about 100k unique tokens
const encoding = get_encoding("cl100k_base");
const tokens = encoding.encode(
  "Hellow World! This is the first test of tiktoken library."
);

// Each number in the array is a token ID that matches to an actual token.
// So when working with large amount of text, we can use the tiktoken library to count tokens,
// before sending a prompt to an LLM.
console.log(tokens);
