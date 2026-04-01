import Constants from "expo-constants";

export type ChatMsg = { role: "system" | "user" | "assistant"; content: string };

const apiKey = (Constants.expoConfig?.extra?.openAiApiKey ?? "") as string;


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

