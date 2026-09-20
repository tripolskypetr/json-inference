import { MessageModel } from "../model/Message.model";

const DEFAULT_MIME = "image/jpeg";

export const toDataUrl = (image: string, mimeType = DEFAULT_MIME): string =>
  image.startsWith("data:") ? image : `data:${mimeType};base64,${image}`;

export const stripDataUrl = (image: string): string =>
  image.startsWith("data:") ? image.slice(image.indexOf(",") + 1) : image;

/**
 * Adapts messages to the OpenAI-compatible wire format.
 * Messages without images pass through unchanged; messages with images
 * become content-part arrays with text followed by image_url entries.
 */
export const toOpenAIMessages = (messages: MessageModel[]) =>
  messages.map(({ role, content, images }) => {
    if (!images?.length) {
      return { role, content };
    }
    return {
      role,
      content: [
        ...(content ? [{ type: "text", text: content }] : []),
        ...images.map((image) => ({
          type: "image_url",
          image_url: { url: toDataUrl(image) },
        })),
      ],
    };
  });

/**
 * Adapts messages to the Ollama wire format: content stays a plain string,
 * images go to the separate images field as raw base64 (data: prefix stripped).
 */
export const toOllamaMessages = (messages: MessageModel[]) =>
  messages.map(({ role, content, images }) => {
    if (!images?.length) {
      return { role, content };
    }
    return {
      role,
      content,
      images: images.map(stripDataUrl),
    };
  });
