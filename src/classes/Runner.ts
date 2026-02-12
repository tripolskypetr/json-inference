import { memoize, ToolRegistry } from "functools-kit";

import { ILogger } from "../interface/Logger.interface";
import IProvider, { IOutlineParams } from "../interface/Provider.interface";
import InferenceName from "../enum/InferenceName";
import { MessageModel } from "../model/Message.model";

type RunnerClass = new (logger: ILogger) => IProvider;

const logger: ILogger = {
  debug() {},
  info() {},
  log() {},
  warn() {},
};

export class RunnerAdapter {
  private _registry = new ToolRegistry<Record<InferenceName, RunnerClass>>(
    "runner_registry",
  );

  private getRunner = memoize(
    ([inference]) => `${inference}`,
    (inference: InferenceName) => {
      const Runner = this._registry.get(inference);
      return new Runner(logger);
    },
  );

  public getOutlineCompletion = async (
    inferenceName: InferenceName,
    params: IOutlineParams,
    model: string,
    apiKey?: string
  ): Promise<MessageModel> => {
    const runner = this.getRunner(inferenceName);
    return await runner.getOutlineCompletion(params, model, apiKey);
  };

  public registerRunner = (name: InferenceName, runner: RunnerClass) => {
    this._registry = this._registry.register(name, runner);
  };
}

export const Runner = new RunnerAdapter();
