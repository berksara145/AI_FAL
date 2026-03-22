/**
 * Explore screen: 6 conversation classes (feature cards).
 * Each class opens a ChatSession with its own agenda (system prompt for AI).
 * Titles and initialMessage are fixed as specified for the cards.
 */

export type ExploreClassId =
  | "general"
  | "cosmic-crossroads"
  | "someone-on-mind"
  | "friend-dynamics"
  | "tarot-reading"
  | "natal-chart-analysis";

export interface ExploreClass {
  id: ExploreClassId;
  /** Card title — must remain exactly as specified */
  title: string;
  /** Feature key stored on the chat session (e.g. for filtering/history) */
  feature: string;
  /** Agenda: purpose of this conversation — used as system prompt for AI */
  agenda: string;
  /** First message shown from the assistant when session starts (predetermined) */
  initialMessage: string;
  /** Asset key for card image: "feature4" | "feature5" */
  imageKey: "feature4" | "feature5" | "feature7" | "feature8" | "feature9" | "feature10" | "feature11";
}

export const EXPLORE_CLASSES: ExploreClass[] = [
  {
    id: "general",
    title: "What's on your mind?",
    feature: "What's on your mind?",
    agenda:
      "You are a warm companion. Listen and respond briefly — 2-3 short sentences max. No long explanations. Be direct and caring.",
    initialMessage:
      "✨ What's on your mind? Speak freely — I'm here to listen and guide you.",
    imageKey: "feature10",
  },
  {
    id: "cosmic-crossroads",
    title: "Cosmic Crossroads",
    feature: "Cosmic Crossroads",
    agenda:
      "You are a laconic oracle. The crossroads reading has been delivered via the card. For any follow-up questions, respond in 2-3 sentences max — direct, intimate, no filler phrases.",
    initialMessage:
      "⟁ The card has been drawn. Speak your question — should you, will you, do you choose — and I will reveal what stands at your crossroads.",
    imageKey: "feature9",
  },
  {
    id: "someone-on-mind",
    title: "Someone Special",
    feature: "Someone Special",
    agenda:
      "You are an astrologer specializing in romantic and personal compatibility. When chart data is attached, analyze the two charts and give 3 key connection points — bold header + one short sentence each. Under 80 words. For follow-up questions, answer in 2-3 sentences using the chart data provided. Be direct and empathetic, no long paragraphs.",
    initialMessage:
      "❤️ Tell me about the person on your mind. I can help you understand the dynamics, compatibility, and what the stars reveal about your connection.",
    imageKey: "feature4",
  },
  {
    id: "friend-dynamics",
    title: "Friend dynamics",
    feature: "Friend Dynamics",
    agenda:
      "You are an astrologer specializing in friendship compatibility. When chart data is attached, analyze the two charts and give 3 key dynamics — bold header + one short sentence each. Under 80 words. Focus on what bonds them and where friction lives. For follow-up questions, answer in 2-3 sentences using the chart data provided. Plain language, no jargon.",
    initialMessage:
      "🤝 Which friend are you curious about? Tap their name and I'll read your friendship dynamic.",
    imageKey: "feature11",
  },
  {
    id: "tarot-reading",
    title: "Daily Tarot Reading",
    feature: "Tarot Reading",
    agenda:
      "You are Lunara, a tarot reader. For each card reveal, give 1-2 sentences max — short and symbolic. For follow-up questions, answer in 2-3 sentences. Never write long paragraphs.",
    initialMessage:
      "🔮 Three cards await you. Tap each one to reveal what the universe has to say about your past, present, and future.",
    imageKey: "feature5",
  },
  {
    id: "natal-chart-analysis",
    title: "Birth Chart Analysis",
    feature: "Natal Chart Analysis",
    agenda:
      "You are an astrologer. When chart data is attached, give 3 highlights max — bold header + one short sentence each. Under 80 words total. Plain simple language, no jargon. For follow-up questions, answer in 2-3 sentences using the chart data provided in each message.",
    initialMessage:
      "🪐 Natal chart analysis — list and names will appear when you open this chat.",
    imageKey: "feature8",
  },
];
