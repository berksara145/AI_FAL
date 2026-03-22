import { sendChatToOpenAI } from "./gptClient";
import { getSelfPerson } from "../db/person.repo";
import {
  buildCrossroadsSystemPrompt,
  type CrossroadsCard,
  type BirthChartContext,
} from "./cosmicCrossroads";

function extractChartContext(chartGptJson: string | null): BirthChartContext {
  if (!chartGptJson) return {};
  try {
    const data = JSON.parse(chartGptJson);
    const placements: { body: string; sign: string }[] = data.placements ?? [];
    const angles: { ac?: { sign: string } } = data.angles ?? {};
    return {
      sunSign: placements.find((p) => p.body === "Sun")?.sign,
      moonSign: placements.find((p) => p.body === "Moon")?.sign,
      risingSign: angles.ac?.sign,
    };
  } catch {
    return {};
  }
}

export async function generateCrossroadsReading(
  card: CrossroadsCard,
  question: string
): Promise<string> {
  const self = await getSelfPerson();
  const chart = extractChartContext(self?.chart_gpt_json ?? null);
  const systemPrompt = buildCrossroadsSystemPrompt(card, chart, question);
  const reply = await sendChatToOpenAI([
    { role: "system", content: systemPrompt },
    { role: "user", content: question },
  ]);
  return reply.trim();
}
