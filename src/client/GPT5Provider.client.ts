import OpenAI from "openai";
import { jsonrepair } from "jsonrepair";
import { ILogger } from "../interface/Logger.interface";
import IProvider, { IOutlineParams } from "../interface/Provider.interface";
import { MessageModel } from "../model/Message.model";

export class GPT5Provider implements IProvider {
  constructor(readonly logger: ILogger) {}

  public async getOutlineCompletion(
    params: IOutlineParams, model: string, apiKey: string
  ): Promise<MessageModel> {
    const { messages, format } = params;

    const openai = new OpenAI({ apiKey });

    this.logger.log("gpt5Provider getOutlineCompletion", { model });

    // Extract response format
    const response_format =
      "json_schema" in format
        ? format
        : { type: "json_schema", json_schema: { schema: format } };

    const completion = await openai.chat.completions.create({
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

export default GPT5Provider;
