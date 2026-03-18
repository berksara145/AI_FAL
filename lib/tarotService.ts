import { sendChatToOpenAI } from "./gptClient";

export async function generateTarotInterpretation(
  pastCard: string,
  todayCard: string,
  futureCard: string
): Promise<string> {
  const messages = [
    {
      role: "system" as const,
      content:
        "You are Lunara, a warm and mystical tarot reader. You give personal, poetic 3-card readings that feel intimate and meaningful — not generic.",
    },
    {
      role: "user" as const,
      content:
        `The cards drawn for today's reading:\n\n` +
        `PAST: ${pastCard}\n` +
        `TODAY: ${todayCard}\n` +
        `FUTURE: ${futureCard}\n\n` +
        `Write a 3-card reading using exactly this format (keep the asterisks and ✦):\n\n` +
        `**✦ Past — ${pastCard}**\n` +
        `[2-3 sentences about what has shaped or passed]\n\n` +
        `**✦ Today — ${todayCard}**\n` +
        `[2-3 sentences about the present energy and what to be aware of]\n\n` +
        `**✦ Future — ${futureCard}**\n` +
        `[2-3 sentences about what is unfolding or possible]\n\n` +
        `End with one closing sentence that weaves all three together.\n` +
        `Warm, personal, poetic. ~200 words. No extra headers.`,
    },
  ];

  return await sendChatToOpenAI(messages);
}
