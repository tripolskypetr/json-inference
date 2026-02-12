import OpenAI from "openai";
import { jsonrepair } from "jsonrepair";
import { str } from "functools-kit";
import { ILogger } from "../interface/Logger.interface";
import IProvider, { IOutlineParams } from "../interface/Provider.interface";
import { MessageModel } from "../model/Message.model";

export class PerplexityProvider implements IProvider {
  constructor(readonly logger: ILogger) {}

  public async getOutlineCompletion(
    params: IOutlineParams, model: string, apiKey: string
  ): Promise<MessageModel> {
    const { messages: rawMessages, format } = params;

    const perplexity = new OpenAI({
      baseURL: "https://api.perplexity.ai",
      apiKey,
    });

    this.logger.log("perplexityProvider getOutlineCompletion", { model });

    // Filter and sort messages like GPT5Provider
    const messages: any[] = rawMessages
      .filter(({ role }) => role === "user" || role === "assistant")

    const systemPrompt = rawMessages
      .filter(({ role }) => role === "system")
      .reduce((acm, { content }) => str.newline(acm, content), "");

    if (systemPrompt) {
      messages.unshift({
        role: "system",
        content: systemPrompt,
      });
    }

    // Merge consecutive assistant messages
    for (let i = messages.length - 1; i > 0; i--) {
      if (
        messages[i].role === "assistant" &&
        messages[i - 1].role === "assistant"
      ) {
        messages[i - 1].content = str.newline(
          messages[i - 1].content,
          messages[i].content
        );
        // Merge tool_calls if they exist
        if (messages[i].tool_calls || messages[i - 1].tool_calls) {
          messages[i - 1].tool_calls = [
            ...(messages[i - 1].tool_calls || []),
            ...(messages[i].tool_calls || []),
          ];
        }
        messages.splice(i, 1);
      }
    }

    // Merge consecutive user messages
    for (let i = messages.length - 1; i > 0; i--) {
      if (messages[i].role === "user" && messages[i - 1].role === "user") {
        messages[i - 1].content = str.newline(
          messages[i - 1].content,
          messages[i].content
        );
        messages.splice(i, 1);
      }
    }

    // Extract response format like GPT5Provider
    const response_format =
      "json_schema" in format
        ? format
        : { type: "json_schema", json_schema: { schema: format } };

    const completion = await perplexity.chat.completions.create({
      messages: messages as any,
      model,
      response_format: response_format as any,
    });

    const choice = completion.choices[0];

    if (choice.message.refusal) {
      throw new Error(choice.message.refusal);
    }

    const json = jsonrepair(choice.message.content || "");
    const result = {
      role: "assistant" as const,
      content: json,
    };

    return result;
  }
}

export default PerplexityProvider;
