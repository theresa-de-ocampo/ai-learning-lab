export const giftSchemaChatCompletionsAPI = {
  type: "json_schema",
  json_schema: {
    name: "gift_suggestions",
    schema: {
      type: "object",
      properties: {
        gifts: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              price_range: { type: "string" },
              why_its_good: { type: "string" }
            },
            required: ["name", "price_range", "why_its_good"]
          }
        }
      },
      required: ["gifts"]
    }
  }
};

// additionalProperties flag is required - if you leave this out, you'll get an error
export const giftSchemaResponsesAPI = {
  type: "json_schema",
  name: "gift_suggestions",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      gifts: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            name: { type: "string" },
            price_range: { type: "string" },
            why_its_good: { type: "string" }
          },
          required: ["name", "price_range", "why_its_good"]
        }
      }
    },
    required: ["gifts"]
  }
};
