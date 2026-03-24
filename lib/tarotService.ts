import { sendChatToOpenAI } from "./gptClient";
import i18n from "./i18n";

export async function generateTarotInterpretation(
  pastCard: string,
  todayCard: string,
  futureCard: string
): Promise<string> {
  const isTr = i18n.language === "tr";

  const messages = isTr
    ? [
        {
          role: "system" as const,
          content:
            "Sen Lunara, sıcak ve mistik bir tarot okuyucususun. Samimi ve anlamlı hissettiren kişisel, şiirsel 3 kartlı okumalar yaparsın — genel değil. Her zaman Türkçe yanıt ver.",
        },
        {
          role: "user" as const,
          content:
            `Bugünkü okuma için çekilen kartlar:\n\n` +
            `GEÇMİŞ: ${pastCard}\n` +
            `BUGÜN: ${todayCard}\n` +
            `GELECEK: ${futureCard}\n\n` +
            `Tam olarak bu formatı kullanarak 3 kartlı bir okuma yaz (yıldız işaretlerini ve ✦ sembolünü koru):\n\n` +
            `**✦ Geçmiş — ${pastCard}**\n` +
            `[Neyin şekillendirdiği veya geçip gittiği hakkında 2-3 cümle]\n\n` +
            `**✦ Bugün — ${todayCard}**\n` +
            `[Şimdiki enerji ve dikkat edilmesi gerekenler hakkında 2-3 cümle]\n\n` +
            `**✦ Gelecek — ${futureCard}**\n` +
            `[Açılmakta olan veya mümkün olan hakkında 2-3 cümle]\n\n` +
            `Üç kartı birbirine bağlayan bir kapanış cümlesiyle bitir.\n` +
            `Sıcak, kişisel, şiirsel. ~200 kelime. Ekstra başlık yok.`,
        },
      ]
    : [
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
