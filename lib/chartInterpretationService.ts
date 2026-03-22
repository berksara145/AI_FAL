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
        `- [One sentence on Sun, Moon, or Rising — the core of who ${personName} is]\n` +
        `- [One sentence on a key trait or tension]\n\n` +
        `**✦ Inner World**\n` +
        `- [One sentence on emotional pattern or Moon placement]\n` +
        `- [One sentence on a standout aspect]\n\n` +
        `**✦ Life Path**\n` +
        `- [One sentence on a core strength]\n` +
        `- [One sentence on a challenge or soul direction]\n\n` +
        `Rules: exactly 2 bullet points per section starting with "-". Each bullet is one short plain sentence. No long sentences, no flowery prose, third person. No extra headers.`,
    },
  ];

  return await sendChatToOpenAI(messages);
}
