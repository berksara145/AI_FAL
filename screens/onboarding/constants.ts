export const INITIAL_MESSAGE = "Hello! I'm LUNARA, your AI fortune teller. Let's get to know each other! What's your name?";

export const STREAMING_SPEED_MS = 25; // milliseconds per character

export const MONTH_NAMES_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const MONTH_NAMES_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export const MESSAGES = {
  NAME_COLLECTED: (name: string) => 
    `Wonderful to meet you, ${name}! ✨\n\nTo create your personalized astrological profile, I need to know your birth date. This helps me understand the cosmic energies that influence your life.\n\nPlease select your birth date below:`,
  
  NAME_ERROR: "I'm sorry, I had trouble saving your name. Could you please tell me your name again?",
  
  NAME_INVALID: "I didn't quite catch that. Could you please tell me your name?",
  
  DATE_INVALID: "That doesn't seem like a valid date. Please check your selection.",
  
  DATE_SAVED: (month: string, day: number, year: number) =>
    `Perfect! Your birth date is ${month} ${day}, ${year}. 🎂✨\n\nI now have everything I need to create your personalized astrological profile. The stars are aligning for you, and I'm excited to share what they reveal!\n\nLet me finish setting up your profile...`,
  
  DATE_ERROR: "I'm sorry, I had trouble saving your birth date. Please try again.",
};

export const DATE_PICKER_CONFIG = {
  MIN_YEAR: 1900,
  MAX_YEAR: new Date().getFullYear(),
  DEFAULT_AGE: 25, // Default to 25 years ago
};
