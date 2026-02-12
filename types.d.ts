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
} | {
    type: "object";
    description: string;
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
} ? any[] : T extends {
    type: "object";
} ? Record<string, any> : any;
type InferFormat<T extends FormatModel> = {
    [K in keyof T["properties"]]: InferProperty<T["properties"][K]>;
};

type MessageRole = "assistant" | "system" | "user";
interface MessageModel {
    role: MessageRole;
    content: string;
}

interface IOutlineParams<F extends FormatModel = FormatModel> {
    format: F;
    messages: MessageModel[];
}

declare const generateObject: <F extends FormatModel>(inferenceName: InferenceName, params: IOutlineParams<F>, model: string, apiKey?: string) => Promise<InferFormat<F>>;

export { type FormatModel, type FormatProperty, type IOutlineParams, type InferFormat, InferenceName, generateObject };
