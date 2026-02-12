import { str } from "functools-kit";

import { generateObject, InferenceName } from "json-inference";

const output = await generateObject(
  InferenceName.GroqInference,
  {
    messages: [
      {
        role: "user",
        content: str.newline(`Верни в message строку "Hello world!"`),
      },
    ],
    format: {
      type: "object",
      properties: {
        message: {
          type: "string",
          description: "Message content",
        },
      },
      required: ["message"],
    },
  },
  "qwen/qwen3-32b",
  process.env.CC_GROQ_API_KEY,
);

console.log(output.message);
