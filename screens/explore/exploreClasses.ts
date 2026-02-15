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
  | "dream-insights";

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
  imageKey: "feature4" | "feature5";
}

export const EXPLORE_CLASSES: ExploreClass[] = [
  {
    id: "general",
    title: "What's weighing on you?",
    feature: "What's weighing on you?",
    agenda:
      "You are a warm, supportive companion. The user can share what's on their mind. Listen, reflect, and offer gentle guidance. Keep responses concise and caring.",
    initialMessage:
      "✨ What's weighing on you? Speak freely, and I'm here to listen and guide you through whatever is on your mind.",
    imageKey: "feature4",
  },
  {
    id: "todays-energy",
    title: "Today's energy",
    feature: "Today's Energy",
    agenda:
      "You help the user explore today's cosmic and energetic influences. Discuss how the day might feel, what to lean into or avoid, and simple ways to align with the energy. Keep it practical and uplifting.",
    initialMessage:
      "🌙 Let's explore the energy of today. What aspects of today's cosmic influences would you like to understand?",
    imageKey: "feature5",
  },
  {
    id: "someone-on-mind",
    title: "Someone on your mind?",
    feature: "Someone on your mind?",
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
    imageKey: "feature4",
  },
  {
    id: "tarot-reading",
    title: "Tarot reading",
    feature: "Tarot Reading",
    agenda:
      "You offer tarot-inspired guidance. The user may ask a question or describe a situation. Respond with reflective, wise perspectives that feel like card readings — symbolic, gentle, and opening rather than prescriptive. Do not claim to draw actual cards unless you have that capability.",
    initialMessage:
      "🔮 The cards are ready to reveal their wisdom. What question or situation would you like guidance on today?",
    imageKey: "feature5",
  },
  {
    id: "dream-insights",
    title: "Dream insights",
    feature: "Dream Insights",
    agenda:
      "You help the user explore their dreams as messages from the subconscious. Listen to their dream, reflect on symbols and feelings, and offer gentle insights about what it might be revealing about their inner world. Be curious and non-dogmatic.",
    initialMessage:
      "💭 Dreams carry messages from your subconscious. Share your dream with me, and let's explore what it might be revealing about your inner world.",
    imageKey: "feature4",
  },
];
