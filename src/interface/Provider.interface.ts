import { FormatModel } from "../model/Format.model";
import { MessageModel } from "../model/Message.model";

export interface IOutlineParams {
  format: FormatModel;
  messages: MessageModel[];
}

export interface IProvider {
  getOutlineCompletion(params: IOutlineParams, model: string, apiKey?: string): Promise<MessageModel>;
}

export default IProvider;
