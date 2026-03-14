import { sendChatToOpenAI } from "./gptClient";

export async function generateChartInterpretation(
  chartGptJson: string,
  personName: string
): Promise<string> {
  const messages = [
    {
      role: "system" as const,
      content:
        "You are Lunara, a warm and poetic astrologer. You interpret natal charts with personal depth and clarity. Always write in third person (e.g. 'Alice's Sun...'). Be concise but meaningful.",
    },
    {
      role: "user" as const,
      content:
        `Here is the natal chart data for ${personName}:\n\n${chartGptJson}\n\n` +
        `Write a natal chart interpretation divided into exactly 3 sections with these exact headers (keep the asterisks and symbols):\n\n` +
        `**✦ Core Identity**\n` +
        `(2-3 sentences about Sun, Moon, Rising synthesis — who this person is at their core)\n\n` +
        `**✦ Inner World**\n` +
        `(2-3 sentences about emotional patterns and key planetary aspects)\n\n` +
        `**✦ Life Path**\n` +
        `(2-3 sentences about strengths, challenges, and soul purpose)\n\n` +
        `Keep it warm, personal, and poetic. Total ~200 words.`,
    },
  ];

  return await sendChatToOpenAI(messages);
}
