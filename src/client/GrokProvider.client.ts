import { fetchApi } from "functools-kit";
import { jsonrepair } from "jsonrepair";
import { ILogger } from "../interface/Logger.interface";
import IProvider, { IOutlineParams } from "../interface/Provider.interface";
import { MessageModel } from "../model/Message.model";

export class GrokProvider implements IProvider {
  constructor(readonly logger: ILogger) {
  }

  public async getOutlineCompletion(
    params: IOutlineParams, model: string, apiKey: string
  ): Promise<MessageModel> {
    const { messages, format } = params;

    this.logger.log("grokProvider getOutlineCompletion", { model });

    const {
      choices: [
        {
          message: { refusal, content },
        },
      ],
    } = await fetchApi("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        messages,
        model,
        max_tokens: 5_000,
        response_format: format,
      }),
    });

    if (refusal) {
      throw new Error(refusal);
    }

    const json = jsonrepair(content);
    const result = {
      role: "assistant" as const,
      content: json,
    };

    return result;
  }
}

export default GrokProvider;
