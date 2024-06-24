import MistralClient, {
  ChatCompletionResponseChunk,
} from "@mistralai/mistralai";
import { MistralStream, StreamingTextResponse } from "ai";
import { NextRequest } from "next/server";

const mistral = new MistralClient(process.env.MISTRAL_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const prompt =
      "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous video streaming platform feature";

    const response: AsyncGenerator<ChatCompletionResponseChunk, void, unknown> =
      mistral.chatStream({
        model: "open-mixtral-8x22b",
        maxTokens: 200,
        messages: [{ role: "user", content: prompt }],
      });

    const stream = MistralStream(response);
    return new StreamingTextResponse(stream);
  } catch (error) {
    throw error;
  }
}
