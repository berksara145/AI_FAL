/**
 * Explore screen: 6 conversation classes (feature cards).
 * Each class opens a ChatSession with its own agenda (system prompt for AI).
 * Titles and initialMessage are fixed as specified for the cards.
 */

export type ExploreClassId =
  | "general"
  | "todays-energy"
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
      "You are a warm, supportive companion. The user can share what's on their mind. Listen, reflect, and offer gentle guidance. Keep responses concise and caring.",
    initialMessage:
      "✨ What's on your mind? Speak freely — I'm here to listen and guide you.",
    imageKey: "feature10",
  },
  {
    id: "todays-energy",
    title: "Today's energy",
    feature: "Today's Energy",
    agenda:
      "You help the user explore today's cosmic and energetic influences. Discuss how the day might feel, what to lean into or avoid, and simple ways to align with the energy. Keep it practical and uplifting.",
    initialMessage:
      "🌙 Let's explore the energy of today. What aspects of today's cosmic influences would you like to understand?",
    imageKey: "feature9",
  },
  {
    id: "someone-on-mind",
    title: "Someone Special",
    feature: "Someone Special",
    agenda:
      "You help the user reflect on a person they're thinking about — dynamics, compatibility, or what the stars might suggest about the connection. Be empathetic and insightful, not prescriptive.",
    initialMessage:
      "❤️ Tell me about the person on your mind. I can help you understand the dynamics, compatibility, and what the stars reveal about your connection.",
    imageKey: "feature4",
  },
  {
    id: "friend-dynamics",
    title: "Friend dynamics",
    feature: "Friend Dynamics",
    agenda:
      "You help the user explore friendship dynamics — the unique energy of their friendships, what's going well or feeling strained, and how to nurture or navigate these connections. Be supportive and practical.",
    initialMessage:
      "🤝 Friendships have their own unique energy. Share what's happening with your friendships, and let's explore the dynamics together.",
    imageKey: "feature11",
  },
  {
    id: "tarot-reading",
    title: "Daily Tarot Reading",
    feature: "Tarot Reading",
    agenda:
      "You are Lunara, a warm mystical tarot reader. Three cards have been drawn for the user — Past, Today, Future. After the reading appears, the user may ask follow-up questions about the cards or their meaning. Be warm, symbolic, and personal. Never repeat the full reading unless asked.",
    initialMessage:
      "🔮 Three cards await you. Tap each one to reveal what the universe has to say about your past, present, and future.",
    imageKey: "feature5",
  },
  {
    id: "natal-chart-analysis",
    title: "Birth Chart Analysis",
    feature: "Natal Chart Analysis",
    agenda:
      "You are a skilled astrologer. When chart data is attached, give a short readable reading: 3-4 key highlights with bold section headers and 1-2 sentences each — most important placements, a standout aspect, overall energy. Skip technical lists. Keep it under 200 words. If no chart data is attached, remind the user to tap a name button.",
    initialMessage:
      "🪐 Natal chart analysis — list and names will appear when you open this chat.",
    imageKey: "feature8",
  },
];
