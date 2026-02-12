import InferenceName from "../enum/InferenceName";
import { Runner } from "../classes/Runner";
import { FormatModel, InferFormat } from "../model/Format.model";
import { IOutlineParams } from "../interface/Provider.interface";

export const generateObject = async <F extends FormatModel>(
  inferenceName: InferenceName,
  params: IOutlineParams<F>,
  model: string,
  apiKey?: string,
): Promise<InferFormat<F>> => {
  const { content } = await Runner.getOutlineCompletion(
    inferenceName,
    params,
    model,
    apiKey,
  );
  return JSON.parse(content);
};

export default generateObject;
