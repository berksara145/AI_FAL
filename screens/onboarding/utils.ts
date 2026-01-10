/**
 * Extracts a name from user input text
 */
export const extractName = (text: string): string | null => {
  const trimmed = text.trim();
  if (!trimmed) return null;

  // Common patterns: "My name is X", "I'm X", "I am X", "Call me X", or just the name
  const patterns = [
    /(?:my name is|i'm|i am|call me|it's|it is)\s+([a-zA-Z\s]+)/i,
    /^([a-zA-Z\s]{2,50})$/i, // Just a name (2-50 characters, letters and spaces)
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) {
      const name = match[1]?.trim() || trimmed;
      // Clean up the name (remove extra spaces, capitalize first letter)
      return name
        .split(/\s+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ")
        .trim();
    }
  }

  // If no pattern matches, use the whole text as name (up to 50 chars)
  return trimmed.length <= 50 ? trimmed : trimmed.substring(0, 50).trim();
};

/**
 * Validates if a date is valid
 */
export const isValidDate = (year: number, month: number, day: number): boolean => {
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

/**
 * Calculates the maximum number of days in a given month/year
 */
export const getMaxDays = (month: number, year: number): number => {
  return new Date(year, month, 0).getDate();
};

/**
 * Calculates streaming duration based on text length
 */
export const calculateStreamingDuration = (text: string, speedMs: number = 25): number => {
  return text.length * speedMs;
};
