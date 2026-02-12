# json-inference

> Structured JSON output from 12 LLM providers with a single function call. Type-safe, retry-resilient, zero boilerplate.

[![npm](https://img.shields.io/npm/v/json-inference.svg?style=flat-square)](https://npmjs.org/package/json-inference)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)]()

Get structured, schema-validated JSON from any LLM provider through one unified `generateObject()` function with automatic return type inference.

## The Problem

Many LLM providers support tool calling but **not** `response_format` / structured outputs. You pass a JSON schema and get back... free-form text, malformed JSON, or a refusal. Providers like Groq, Ollama, Claude, DeepSeek, Mistral, HuggingFace, and Alibaba all have this issue — their models can call tools with structured arguments, but won't reliably return structured JSON on their own.

This library turns **tool calling into structured output**. Your JSON schema becomes a `provide_answer` tool definition. The model is forced to call it via `tool_choice`. The arguments are extracted, repaired with `jsonrepair`, validated against your schema, and retried up to 5 times on failure. You get clean, typed JSON back — regardless of how broken the provider's native structured output support is.

For providers that actually support `response_format` natively (OpenAI, Grok, Perplexity, Cohere, GLM-4), the library uses it directly. Same API, same schema, same result — the strategy is picked per provider.

## Features

- 12 LLM Providers: OpenAI, Claude, DeepSeek, Grok, Mistral, Perplexity, Cohere, Alibaba, Hugging Face, Ollama, GLM-4, Groq
- Tool-calling as structured output: forces `provide_answer` tool with your schema on providers that lack `response_format`
- Single Function API: one `generateObject()` call for all providers
- Type Inference: return type derived from JSON schema via `InferFormat<T>` — works in plain JavaScript
- Retry Logic: automatic retries with tool-forcing (up to 5 attempts)
- JSON Repair: malformed tool call arguments auto-fixed via `jsonrepair`
- Schema Validation: required fields validated before returning

## Installation

```bash
npm install json-inference openai ollama groq-sdk
```

All three SDK peer dependencies are required:

| Package | Providers |
|---------|-----------|
| `openai` | OpenAI, Claude, DeepSeek, Mistral, Perplexity, Cohere, GLM-4 |
| `ollama` | Ollama |
| `groq-sdk` | Groq |

## Quick Start

```javascript
import { generateObject, InferenceName } from 'json-inference';

const result = await generateObject(
  InferenceName.GPT5Inference,
  {
    format: {
      type: "object",
      required: ["sentiment", "confidence"],
      properties: {
        sentiment: { type: "string", description: "positive, negative, or neutral" },
        confidence: { type: "number", description: "Confidence score 0-1" },
      },
    },
    messages: [
      { role: "user", content: "Analyze sentiment: 'This product is amazing!'" },
    ],
  },
  "gpt-4o",
  process.env.OPENAI_API_KEY,
);

// result.sentiment → string (TypeScript infers from schema)
// result.confidence → number
console.log(result.sentiment, result.confidence);
```

## Type Inference

Return types are automatically inferred from the `format` schema via discriminated union on the `type` field. Works in JavaScript projects without `as const` or explicit generics:

```javascript
const result = await generateObject(
  InferenceName.DeepseekInference,
  {
    format: {
      type: "object",
      required: ["position", "price", "stop_loss"],
      properties: {
        position: { type: "string", description: "long, short, or wait" },
        price: { type: "number", description: "Entry price in USD" },
        stop_loss: { type: "number", description: "Stop-loss price in USD" },
        confirmed: { type: "boolean", description: "Signal confirmed" },
      },
    },
    messages,
  },
  "deepseek-chat",
  process.env.DEEPSEEK_API_KEY,
);

// TypeScript/IDE knows:
// result.position  → string
// result.price     → number
// result.stop_loss → number
// result.confirmed → boolean
```

The `InferFormat<T>` type maps JSON schema types to TypeScript:

| Schema `type` | TypeScript type |
|---------------|-----------------|
| `"string"` | `string` |
| `"number"` | `number` |
| `"integer"` | `number` |
| `"boolean"` | `boolean` |
| `"array"` | `any[]` |
| `"object"` | `Record<string, any>` |

## Providers

| Provider | `InferenceName` | Strategy | Base URL |
|----------|----------------|----------|----------|
| OpenAI | `GPT5Inference` | response_format | `api.openai.com` |
| Claude | `ClaudeInference` | tool-calling | `api.anthropic.com/v1/` |
| DeepSeek | `DeepseekInference` | tool-calling | `api.deepseek.com` |
| Grok | `GrokInference` | response_format | `api.x.ai/v1/` |
| Mistral | `MistralInference` | tool-calling | `api.mistral.ai/v1/` |
| Perplexity | `PerplexityInference` | response_format | `api.perplexity.ai` |
| Cohere | `CohereInference` | response_format | `api.cohere.ai/compatibility/v1` |
| Alibaba | `AlibabaInference` | tool-calling | `dashscope-intl.aliyuncs.com` |
| Hugging Face | `HfInference` | tool-calling | `router.huggingface.co/v1/` |
| Ollama | `OllamaInference` | tool-calling | `localhost:11434` |
| GLM-4 | `GLM4Inference` | response_format | `api.z.ai/api/paas/v4/` |
| Groq | `GroqInference` | tool-calling | `api.groq.com` |

**response_format** providers use native JSON schema output — single attempt, direct content extraction.

**tool-calling** providers define a `provide_answer` tool from your schema, force the model to call it, then extract and validate the arguments. Retries up to 3-5 times on failure with JSON repair.

## API

### generateObject

```typescript
function generateObject<F extends FormatModel>(
  inferenceName: InferenceName,
  params: IOutlineParams<F>,
  model: string,
  apiKey?: string,
): Promise<InferFormat<F>>
```

**Parameters:**

- `inferenceName` — provider to use (`InferenceName.GPT5Inference`, etc.)
- `params.format` — JSON schema describing the output shape
- `params.messages` — conversation history (`{ role, content }[]`)
- `model` — model name (`"gpt-4o"`, `"claude-3-5-sonnet-20241022"`, `"deepseek-chat"`, etc.)
- `apiKey` — API key (optional for Ollama local)

### FormatModel

```typescript
interface FormatModel {
  type: string;
  required: string[];
  properties: {
    [key: string]: FormatProperty;
  };
}

type FormatProperty =
  | { type: "string"; description: string; enum?: string[] }
  | { type: "number"; description: string }
  | { type: "integer"; description: string }
  | { type: "boolean"; description: string }
  | { type: "array"; description: string }
  | { type: "object"; description: string };
```

### MessageModel

```typescript
interface MessageModel {
  role: "assistant" | "system" | "user";
  content: string;
}
```

## How It Works

```
generateObject(InferenceName, params, model, apiKey)
       │
       ▼
   RunnerAdapter ──► looks up provider by InferenceName
       │
       ▼
   Provider.getOutlineCompletion(params, model, apiKey)
       │
       ├── response_format providers:
       │     API call with json_schema → parse content → return
       │
       └── tool-calling providers:
             Define provide_answer tool from schema
             Force tool_choice → extract arguments
             jsonrepair() → validateToolArguments()
             Retry on failure (up to 3-5 attempts)
             Return validated JSON
       │
       ▼
   JSON.parse(content) → typed result
```

## Switching Providers

Change one argument to switch between providers. The schema and messages stay the same:

```javascript
// OpenAI
await generateObject(InferenceName.GPT5Inference, params, "gpt-4o", OPENAI_KEY);

// Claude
await generateObject(InferenceName.ClaudeInference, params, "claude-3-5-sonnet-20241022", CLAUDE_KEY);

// DeepSeek
await generateObject(InferenceName.DeepseekInference, params, "deepseek-chat", DEEPSEEK_KEY);

// Ollama (local, no key)
await generateObject(InferenceName.OllamaInference, params, "llama3.3:70b");

// Groq
await generateObject(InferenceName.GroqInference, params, "llama-3.3-70b-versatile", GROQ_KEY);
```

## Exports

```typescript
// Function
export { generateObject } from "json-inference";

// Types
export { InferenceName } from "json-inference";
export { IOutlineParams } from "json-inference";
export { FormatModel, FormatProperty, InferFormat } from "json-inference";
```

## License

MIT © [tripolskypetr](https://github.com/tripolskypetr)
