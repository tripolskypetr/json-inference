import InferenceName from "../enum/InferenceName";
import { Runner } from "../classes/Runner";
import { IOutlineParams } from "src/interface/Provider.interface";

export const generateObject = async (
  interenceName: InferenceName,
  params: IOutlineParams,
  model: string,
  apiKey?: string,
) => {
  const { content } = await Runner.getOutlineCompletion(
    interenceName,
    params,
    model,
    apiKey,
  );
  return JSON.parse(content);
};

export default generateObject;
