import MistralClient, {
  ChatCompletionResponseChunk,
} from "@mistralai/mistralai";
import { MistralStream, StreamingTextResponse } from "ai";
import { NextRequest, NextResponse } from "next/server";

const mistral = new MistralClient(process.env.MISTRAL_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const prompt =
      "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";

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
