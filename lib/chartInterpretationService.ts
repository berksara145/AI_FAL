import { sendChatToOpenAI } from "./gptClient";
import i18n from "./i18n";

export async function generateChartInterpretation(
  chartGptJson: string,
  personName: string
): Promise<string> {
  const isTr = i18n.language === "tr";

  const messages = isTr
    ? [
        {
          role: "system" as const,
          content:
            "Sen Lunara, sıcak ve şiirsel bir astrologsun. Natal haritaları kişisel derinlik ve netlikle yorumlarsın. Her zaman üçüncü kişide yaz (örn. 'Ali'nin Güneş'i...'). Özlü ama anlamlı ol. Her zaman Türkçe yanıt ver.",
        },
        {
          role: "user" as const,
          content:
            `${personName} için natal harita verileri:\n\n${chartGptJson}\n\n` +
            `Tam olarak 3 bölümde bir natal harita okuması yaz. Bu tam başlıkları kullan (çift yıldız işaretlerini ve ✦ sembolünü koru):\n\n` +
            `**✦ Temel Kimlik**\n` +
            `- [Güneş, Ay veya Yükselen hakkında bir cümle — ${personName}'in özü]\n` +
            `- [Temel bir özellik veya gerilim hakkında bir cümle]\n\n` +
            `**✦ İç Dünya**\n` +
            `- [Duygusal örüntü veya Ay yerleşimi hakkında bir cümle]\n` +
            `- [Öne çıkan bir görünüm hakkında bir cümle]\n\n` +
            `**✦ Yaşam Yolu**\n` +
            `- [Temel bir güç hakkında bir cümle]\n` +
            `- [Bir zorluk veya ruhsal yön hakkında bir cümle]\n\n` +
            `Kurallar: bölüm başına tam olarak "-" ile başlayan 2 madde. Her madde kısa ve sade bir cümle. Uzun cümle yok, çiçekli anlatım yok, üçüncü kişi. Ekstra başlık yok.`,
        },
      ]
    : [
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
