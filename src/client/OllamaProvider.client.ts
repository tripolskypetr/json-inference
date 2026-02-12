import { Ollama } from "ollama";
import { jsonrepair } from "jsonrepair";
import { singleshot } from "functools-kit";
import { ILogger } from "../interface/Logger.interface";
import IProvider, { IOutlineParams } from "../interface/Provider.interface";
import { MessageModel } from "../model/Message.model";
import validateToolArguments from "../helpers/validateToolArguments";
import set from "../utils/set";
import get from "../utils/get";

const MAX_ATTEMPTS = 3;

export class OllamaProvider implements IProvider {
  constructor(readonly logger: ILogger) {}

  public async getOutlineCompletion(
    params: IOutlineParams, model: string, apiKey?: string
  ): Promise<MessageModel> {
    const { messages: rawMessages, format } = params;

    const ollama = apiKey
      ? new Ollama({
          host: "https://ollama.com",
          headers: { Authorization: `Bearer ${apiKey}` },
        })
      : new Ollama();

    this.logger.log("ollamaProvider getOutlineCompletion", { model });

    // Create tool definition based on format schema
    const schema =
      "json_schema" in format
        ? get(format, "json_schema.schema", format)
        : format;
    const toolDefinition = {
      type: "function",
      function: {
        name: "provide_answer",
        description: "Предоставить ответ в требуемом формате",
        parameters: schema,
      },
    };

    // Add system instruction for tool usage
    const systemMessage = {
      role: "system",
      content:
        "ОБЯЗАТЕЛЬНО используй инструмент provide_answer для предоставления ответа. НЕ отвечай обычным текстом. ВСЕГДА вызывай инструмент provide_answer с правильными параметрами.",
    };

    const messages = [
      systemMessage,
      ...rawMessages,
    ];

    let attempt = 0;

    const addToolRequestMessage = singleshot(() => {
      messages.push({
        role: "user",
        content:
          "Пожалуйста, используй инструмент provide_answer для предоставления ответа. Не отвечай обычным текстом.",
      });
    });

    while (attempt < MAX_ATTEMPTS) {
      const response = await ollama.chat({
        model,
        messages,
        tools: [toolDefinition],
        think: true,
      });

      const { tool_calls } = response.message;

      if (!tool_calls?.length) {
        console.error(
          `Attempt ${attempt + 1}: Model did not use tool, adding user message`
        );
        addToolRequestMessage();
        attempt++;
        continue;
      }

      if (tool_calls && tool_calls.length > 0) {
        const toolCall = tool_calls[0];
        if (toolCall.function?.name === "provide_answer") {
          let parsedArguments: any;
          try {
            const argumentsString = typeof toolCall.function.arguments === 'string'
              ? toolCall.function.arguments
              : JSON.stringify(toolCall.function.arguments);
            const json = jsonrepair(argumentsString);
            parsedArguments = JSON.parse(json);
          } catch (error) {
            console.error(
              `Attempt ${attempt + 1}: Failed to parse tool arguments:`,
              error
            );
            addToolRequestMessage();
            attempt++;
            continue;
          }

          const validation = validateToolArguments(parsedArguments, schema);

          if (!validation.success) {
            console.error(`Attempt ${attempt + 1}: ${validation.error}`);
            addToolRequestMessage();
            attempt++;
            continue;
          }

          set(validation.data, "_context", { model, apiKey });

          const result = {
            role: "assistant" as const,
            content: JSON.stringify(validation.data),
          };

          return result;
        }
      }

      console.error(`Attempt ${attempt + 1}: Model send refusal`);
      attempt++;
    }

    throw new Error("Model failed to use tool after maximum attempts");
  }
}

export default OllamaProvider;
