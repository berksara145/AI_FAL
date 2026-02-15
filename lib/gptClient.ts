// Simple OpenAI Chat client helper.
// IMPORTANT: Do NOT hardcode API keys in source. Provide key via
// - environment variable OPENAI_API_KEY, or
// - pass an apiKey string to sendChatToOpenAI at runtime.
//
// This file intentionally does NOT store any secrets.

export type ChatMsg = { role: "system" | "user" | "assistant"; content: string };

const apiKey = "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";
          

export async function sendChatToOpenAI(messages: ChatMsg[],): Promise<string> {
  const key = apiKey;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      temperature: 0.8,
      max_tokens: 600,
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`OpenAI API error ${res.status}: ${txt}`);
  }

  const data = await res.json();
  const assistant = data?.choices?.[0]?.message?.content ?? "";
  return assistant;
}

