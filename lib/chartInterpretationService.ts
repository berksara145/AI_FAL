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
        `Write a natal chart reading in exactly 3 sections. Use these exact headers (keep the double asterisks and ✦):\n\n` +
        `**✦ Core Identity**\n` +
        `- [Sun, Moon, or Rising insight — who ${personName} is at the core]\n` +
        `- [A second defining trait or inner tension]\n` +
        `- [How these combine into a personality]\n\n` +
        `**✦ Inner World**\n` +
        `- [Emotional pattern or Moon placement insight]\n` +
        `- [A key aspect and what it creates internally]\n` +
        `- [How ${personName} relates and feels deeply]\n\n` +
        `**✦ Life Path**\n` +
        `- [A core strength or natural gift]\n` +
        `- [A challenge or growth edge]\n` +
        `- [Soul direction or life purpose]\n\n` +
        `Rules: exactly 3 bullet points per section starting with "-". Warm, personal, third person. No prose paragraphs. No extra headers.`,
    },
  ];

  return await sendChatToOpenAI(messages);
}
