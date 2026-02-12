import OpenAI from "openai";
import { jsonrepair } from "jsonrepair";
import { str } from "functools-kit";
import { ILogger } from "../interface/Logger.interface";
import IProvider, { IOutlineParams } from "../interface/Provider.interface";
import { MessageModel } from "../model/Message.model";

export class CohereProvider implements IProvider {
  constructor(readonly logger: ILogger) {}

  public async getOutlineCompletion(
    params: IOutlineParams, model: string, apiKey: string
  ): Promise<MessageModel> {
    const { messages: rawMessages, format } = params;

    const cohere = new OpenAI({
      baseURL: "https://api.cohere.ai/compatibility/v1",
      apiKey,
    });

    this.logger.log("cohereProvider getOutlineCompletion", { model });

    // Filter and sort messages like GPT5Provider
    const messages: any[] = rawMessages
      .filter(({ role }) => role === "user" || role === "assistant");

    const systemPrompt = rawMessages
      .filter(({ role }) => role === "system")
      .reduce((acm, { content }) => str.newline(acm, content), "");

    if (systemPrompt) {
      messages.unshift({
        role: "system",
        content: systemPrompt,
      });
    }

    // DO NOT merge consecutive assistant messages in Cohere - breaks tool calling flow
    // Cohere requires strict tool_calls -> tool_responses sequence

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

    const completion = await cohere.chat.completions.create({
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

export default CohereProvider;
