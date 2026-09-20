export type MessageRole = "assistant" | "system" | "user";

export interface MessageModel {
  role: MessageRole;
  content: string;
  /** Attached images: raw base64 strings or data: URLs. Providers adapt them to their own wire format. */
  images?: string[];
}
