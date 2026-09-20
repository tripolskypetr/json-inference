declare enum InferenceName {
    /** Ollama provider for local/cloud LLM inference */
    OllamaInference = "ollama_inference",
    /** Grok provider by X.AI (api.x.ai) */
    GrokInference = "grok_inference",
    /** Hugging Face Inference API provider */
    HfInference = "hf_inference",
    /** Claude provider by Anthropic (api.anthropic.com) */
    ClaudeInference = "claude_inference",
    /** OpenAI GPT provider (api.openai.com) */
    GPT5Inference = "gpt5_inference",
    /** Z.ai GPT Provider (api.z.ai/api/paas/v4) */
    GLM4Inference = "glm4_inference",
    /** DeepSeek provider (api.deepseek.com) */
    DeepseekInference = "deepseek_inference",
    /** Mistral AI provider (api.mistral.ai) */
    MistralInference = "mistral_inference",
    /** Perplexity AI provider (api.perplexity.ai) */
    PerplexityInference = "perplexity_inference",
    /** Cohere provider (api.cohere.ai) */
    CohereInference = "cohere_inference",
    /** Alibaba Cloud provider (dashscope-intl.aliyuncs.com) */
    AlibabaInference = "alibaba_inference",
    /** Groq provider (api.groq.com) */
    GroqInference = "groq_inference"
}

type FormatItems = {
    type: "string";
    description?: string;
    enum?: string[];
} | {
    type: "number";
    description?: string;
} | {
    type: "integer";
    description?: string;
} | {
    type: "boolean";
    description?: string;
} | {
    type: "array";
    description?: string;
    items?: FormatItems;
    minItems?: number;
    maxItems?: number;
} | {
    type: "object";
    description?: string;
    required?: string[];
    properties?: {
        [key: string]: FormatProperty;
    };
};
type FormatProperty = {
    type: "string";
    description: string;
    enum?: string[];
} | {
    type: "number";
    description: string;
} | {
    type: "integer";
    description: string;
} | {
    type: "boolean";
    description: string;
} | {
    type: "array";
    description: string;
    items?: FormatItems;
    minItems?: number;
    maxItems?: number;
} | {
    type: "object";
    description: string;
    required?: string[];
    properties?: {
        [key: string]: FormatProperty;
    };
};
interface FormatModel {
    type: string;
    required: string[];
    properties: {
        [key: string]: FormatProperty;
    };
}
type InferProperty<T> = T extends {
    type: "string";
} ? string : T extends {
    type: "number";
} ? number : T extends {
    type: "integer";
} ? number : T extends {
    type: "boolean";
} ? boolean : T extends {
    type: "array";
    items: infer I;
} ? InferProperty<I>[] : T extends {
    type: "array";
} ? any[] : T extends {
    type: "object";
    properties: infer P;
} ? {
    [K in keyof P]: InferProperty<P[K]>;
} : T extends {
    type: "object";
} ? Record<string, any> : any;
type InferFormat<T extends FormatModel> = {
    [K in keyof T["properties"]]: InferProperty<T["properties"][K]>;
};

type MessageRole = "assistant" | "system" | "user";
interface MessageModel {
    role: MessageRole;
    content: string;
    /** Attached images: raw base64 strings or data: URLs. Providers adapt them to their own wire format. */
    images?: string[];
}

interface IOutlineParams<F extends FormatModel = FormatModel> {
    format: F;
    messages: MessageModel[];
}
interface ITextParams {
    messages: MessageModel[];
}

declare const generateObject: <F extends FormatModel>(inferenceName: InferenceName, params: IOutlineParams<F>, model: string, apiKey?: string) => Promise<InferFormat<F>>;
declare const generateText: (inferenceName: InferenceName, params: ITextParams, model: string, apiKey?: string) => Promise<string>;

interface ValidationResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}
declare const typeOf: (value: unknown) => string;
declare const validateValue: (value: unknown, schema: any, path: string) => string | null;
declare const validateToolArguments: <T = any>(parsedArguments: unknown, schema: FormatModel) => ValidationResult<T>;

declare const toDataUrl: (image: string, mimeType?: string) => string;
declare const stripDataUrl: (image: string) => string;
/**
 * Adapts messages to the OpenAI-compatible wire format.
 * Messages without images pass through unchanged; messages with images
 * become content-part arrays with text followed by image_url entries.
 */
declare const toOpenAIMessages: (messages: MessageModel[]) => ({
    role: MessageRole;
    content: string;
} | {
    role: MessageRole;
    content: ({
        type: string;
        image_url: {
            url: string;
        };
    } | {
        type: string;
        text: string;
    })[];
})[];
/**
 * Adapts messages to the Ollama wire format: content stays a plain string,
 * images go to the separate images field as raw base64 (data: prefix stripped).
 */
declare const toOllamaMessages: (messages: MessageModel[]) => ({
    role: MessageRole;
    content: string;
    images?: undefined;
} | {
    role: MessageRole;
    content: string;
    images: string[];
})[];

export { type FormatItems, type FormatModel, type FormatProperty, type IOutlineParams, type ITextParams, type InferFormat, InferenceName, type MessageModel, type MessageRole, generateObject, generateText, stripDataUrl, toDataUrl, toOllamaMessages, toOpenAIMessages, typeOf, validateToolArguments, validateValue };
