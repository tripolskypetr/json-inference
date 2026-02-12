import { Runner } from "./classes/Runner";
import AlibabaProvider from "./client/AlibabaProvider.client";
import ClaudeProvider from "./client/ClaudeProvider.client";
import CohereProvider from "./client/CohereProvider.client";
import DeepseekProvider from "./client/DeepseekProvider.client";
import GLM4Provider from "./client/GLM4Provider.client";
import GPT5Provider from "./client/GPT5Provider.client";
import GrokProvider from "./client/GrokProvider.client";
import GroqProvider from "./client/GroqProvider.client";
import HfProvider from "./client/HfProvider.client";
import MistralProvider from "./client/MistralProvider.client";
import OllamaProvider from "./client/OllamaProvider.client";
import PerplexityProvider from "./client/PerplexityProvider.client";
import InferenceName from "./enum/InferenceName";

{
  Runner.registerRunner(
    InferenceName.OllamaInference,
    OllamaProvider
  );
  Runner.registerRunner(
    InferenceName.GrokInference,
    GrokProvider
  );
  Runner.registerRunner(
    InferenceName.HfInference,
    HfProvider
  );
  Runner.registerRunner(
    InferenceName.ClaudeInference,
    ClaudeProvider
  );
  Runner.registerRunner(
    InferenceName.GPT5Inference,
    GPT5Provider
  );
  Runner.registerRunner(
    InferenceName.DeepseekInference,
    DeepseekProvider
  );
  Runner.registerRunner(
    InferenceName.MistralInference,
    MistralProvider
  );
  Runner.registerRunner(
    InferenceName.PerplexityInference,
    PerplexityProvider
  );
  Runner.registerRunner(
    InferenceName.CohereInference,
    CohereProvider
  );
  Runner.registerRunner(
    InferenceName.AlibabaInference,
    AlibabaProvider
  );
  Runner.registerRunner(
    InferenceName.GLM4Inference,
    GLM4Provider,
  );
  Runner.registerRunner(
    InferenceName.GroqInference,
    GroqProvider,
  );
}

export { generateObject } from "./functions/generate.function";

export { IOutlineParams } from "./interface/Provider.interface";
export { InferenceName } from "./enum/InferenceName";
