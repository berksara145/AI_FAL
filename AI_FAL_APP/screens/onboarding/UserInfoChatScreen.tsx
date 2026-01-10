import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/RootStack";
import BasicChatUI, { type ChatMessage } from "../../components/BasicChatUI";
import { updateUserName, updateBirthDate, completeOnboarding } from "../../db/user.repo";
import IOSDatePicker from "../../components/IOSDatePicker";
import { SafeAreaView } from "react-native-safe-area-context";

const INITIAL_MESSAGE = "Hello! I'm LUNARA, your AI fortune teller. Let's get to know each other! What's your name?";

// Helper function to extract name from user message
const extractName = (text: string): string | null => {
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

// Helper function to extract year from user message
const extractYear = (text: string): number | null => {
  const trimmed = text.trim();
  // Look for 4-digit year (1900-2100)
  const yearMatch = trimmed.match(/\b(19\d{2}|20[0-9]\d|2100)\b/);
  if (yearMatch) {
    const year = parseInt(yearMatch[1], 10);
    if (year >= 1900 && year <= 2100) {
      return year;
    }
  }
  // Also try to extract just numbers that could be a year
  const numbers = trimmed.match(/\d{4}/);
  if (numbers) {
    const year = parseInt(numbers[0], 10);
    if (year >= 1900 && year <= 2100) {
      return year;
    }
  }
  return null;
};

// Helper function to extract month from user message
const extractMonth = (text: string): number | null => {
  const trimmed = text.trim().toLowerCase();
  
  // Month names
  const monthNames: { [key: string]: number } = {
    january: 1, jan: 1,
    february: 2, feb: 2,
    march: 3, mar: 3,
    april: 4, apr: 4,
    may: 5,
    june: 6, jun: 6,
    july: 7, jul: 7,
    august: 8, aug: 8,
    september: 9, sept: 9, sep: 9,
    october: 10, oct: 10,
    november: 11, nov: 11,
    december: 12, dec: 12,
  };

  for (const [name, num] of Object.entries(monthNames)) {
    if (trimmed.includes(name)) {
      return num;
    }
  }

  // Try to extract numeric month (1-12)
  const monthMatch = trimmed.match(/\b([1-9]|1[0-2])\b/);
  if (monthMatch) {
    const month = parseInt(monthMatch[1], 10);
    if (month >= 1 && month <= 12) {
      return month;
    }
  }

  return null;
};

// Helper function to extract day from user message
const extractDay = (text: string, month?: number, year?: number): number | null => {
  const trimmed = text.trim();
  
  // Try to extract numeric day (1-31)
  const dayMatch = trimmed.match(/\b([1-9]|[12]\d|3[01])\b/);
  if (dayMatch) {
    const day = parseInt(dayMatch[1], 10);
    if (day >= 1 && day <= 31) {
      // Basic validation based on month
      if (month) {
        const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        if (day <= daysInMonth[month - 1]) {
          return day;
        }
      } else {
        return day;
      }
    }
  }

  return null;
};

// Helper to validate full date
const isValidDate = (year: number, month: number, day: number): boolean => {
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

export default function UserInfoChatScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content: INITIAL_MESSAGE,
      isStreaming: true, // Stream the initial message
    },
  ]);
  const [nameCollected, setNameCollected] = useState(false);
  const [birthDateState, setBirthDateState] = useState<{
    year: number | null;
    month: number | null;
    day: number | null;
  }>({ 
    year: new Date().getFullYear() - 25, // Default to 25 years ago
    month: 1, 
    day: 1 
  });
  const [currentStep, setCurrentStep] = useState<"name" | "date" | "complete">("name");
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Mark initial message as done streaming after it completes
  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === "1" ? { ...msg, isStreaming: false } : msg
        )
      );
    }, INITIAL_MESSAGE.length * 20 + 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = async (text: string): Promise<void> => {
    // If we're in date step, ignore text input (user should use date picker)
    if (currentStep === "date") {
      return;
    }

    // Add user message to the chat
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);

    // Handle different steps of onboarding
    if (currentStep === "name" && !nameCollected) {
      const extractedName = extractName(text);
      
      if (extractedName) {
        try {
          // Automatically gets user from database and updates name
          await updateUserName(extractedName);
          setNameCollected(true);
          setCurrentStep("date");

          // Generate AI response with the name and show date picker
          const aiMessageId = (Date.now() + 1).toString();
          const fullResponse = `Wonderful to meet you, ${extractedName}! ✨\n\nTo create your personalized astrological profile, I need to know your birth date. This helps me understand the cosmic energies that influence your life.\n\nPlease select your birth date below:`;
          
          // Add the message with streaming flag
          setMessages((prev) => [
            ...prev,
            {
              id: aiMessageId,
              role: "assistant",
              content: fullResponse,
              isStreaming: true,
            },
          ]);

          // After streaming completes, mark it as done and show date picker
          setTimeout(() => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === aiMessageId
                  ? { ...msg, isStreaming: false }
                  : msg
              )
            );
            setShowDatePicker(true);
          }, fullResponse.length * 20 + 100);
        } catch (error) {
          console.error("Error updating user name:", error);
          // Show error message
          const errorMessageId = (Date.now() + 1).toString();
          setMessages((prev) => [
            ...prev,
            {
              id: errorMessageId,
              role: "assistant",
              content: "I'm sorry, I had trouble saving your name. Could you please tell me your name again?",
              isStreaming: false,
            },
          ]);
        }
      } else {
        // Name extraction failed, ask again
        const aiMessageId = (Date.now() + 1).toString();
        const fullResponse = "I didn't quite catch that. Could you please tell me your name?";
        
        setMessages((prev) => [
          ...prev,
          {
            id: aiMessageId,
            role: "assistant",
            content: fullResponse,
            isStreaming: true,
          },
        ]);

        setTimeout(() => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId
                ? { ...msg, isStreaming: false }
                : msg
            )
          );
          }, fullResponse.length * 20 + 100);
      }
    }
  };

  const handleDateConfirm = async () => {
    if (!birthDateState.year || !birthDateState.month || !birthDateState.day) {
      return;
    }

    // Validate the date
    if (!isValidDate(birthDateState.year, birthDateState.month, birthDateState.day)) {
      const errorMessageId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        {
          id: errorMessageId,
          role: "assistant",
          content: "That doesn't seem like a valid date. Please check your selection.",
          isStreaming: false,
        },
      ]);
      return;
    }

    try {
      // Save birth date to database
      await updateBirthDate(birthDateState.year, birthDateState.month, birthDateState.day);
      setShowDatePicker(false);
      setCurrentStep("complete");

      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];

      const aiMessageId = (Date.now() + 1).toString();
      const fullResponse = `Perfect! Your birth date is ${monthNames[birthDateState.month - 1]} ${birthDateState.day}, ${birthDateState.year}. 🎂✨\n\nI now have everything I need to create your personalized astrological profile. The stars are aligning for you, and I'm excited to share what they reveal!\n\nLet me finish setting up your profile...`;
      
      setMessages((prev) => [
        ...prev,
        {
          id: aiMessageId,
          role: "assistant",
          content: fullResponse,
          isStreaming: true,
        },
      ]);

      setTimeout(async () => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? { ...msg, isStreaming: false }
              : msg
          )
        );

        // Complete onboarding and navigate to MainApp
        try {
          //await completeOnboarding();
          // Small delay before navigation for better UX
          setTimeout(() => {
            navigation.replace("MainApp");
          }, 500);
        } catch (error) {
          console.error("Error completing onboarding:", error);
          navigation.replace("MainApp");
        }
      }, fullResponse.length * 20 + 100);
    } catch (error) {
      console.error("Error saving birth date:", error);
      const errorMessageId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        {
          id: errorMessageId,
          role: "assistant",
          content: "I'm sorry, I had trouble saving your birth date. Please try again.",
          isStreaming: false,
        },
      ]);
    }
  };

  // Calculate max days for selected month/year
  const getMaxDays = (month: number, year: number): number => {
    return new Date(year, month, 0).getDate();
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: "#1a0d2e" }} edges={["top", "bottom"]}>
      <BasicChatUI
        title="About You"
        onSendMessage={handleSendMessage}
        messages={messages}
        disabled={showDatePicker}
      />
      
      {/* iOS Style Date Picker */}
      {showDatePicker && (
        <View style={styles.datePickerContainer}>
          <View style={styles.datePickerHeader}>
            <Text style={styles.datePickerTitle}>Select Your Birth Date</Text>
          </View>
          
          <View style={styles.datePickerRow}>
            {/* Month Picker */}
            <IOSDatePicker
              value={birthDateState.month || 1}
              onValueChange={(month) => {
                const maxDay = getMaxDays(month, birthDateState.year || new Date().getFullYear());
                setBirthDateState((prev) => ({
                  ...prev,
                  month,
                  day: prev.day && prev.day > maxDay ? maxDay : prev.day,
                }));
              }}
              min={1}
              max={12}
              label="Month"
              formatter={(month) => {
                const monthNames = [
                  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
                ];
                return monthNames[month - 1];
              }}
            />
            
            {/* Day Picker */}
            <IOSDatePicker
              value={birthDateState.day || 1}
              onValueChange={(day) => {
                setBirthDateState((prev) => ({ ...prev, day }));
              }}
              min={1}
              max={getMaxDays(birthDateState.month || 1, birthDateState.year || new Date().getFullYear())}
              label="Day"
            />
            
            {/* Year Picker */}
            <IOSDatePicker
              value={birthDateState.year || new Date().getFullYear()}
              onValueChange={(year) => {
                const maxDay = getMaxDays(birthDateState.month || 1, year);
                setBirthDateState((prev) => ({
                  ...prev,
                  year,
                  day: prev.day && prev.day > maxDay ? maxDay : prev.day,
                }));
              }}
              min={1900}
              max={new Date().getFullYear()}
              label="Year"
            />
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleDateConfirm}
            activeOpacity={0.8}
          >
            <Text style={styles.confirmButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  datePickerContainer: {
    backgroundColor: "#1a0d2e",
    borderTopWidth: 1,
    borderTopColor: "rgba(212, 175, 55, 0.2)",
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  datePickerHeader: {
    marginBottom: 16,
    alignItems: "center",
  },
  datePickerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#d4af37",
    letterSpacing: 1,
  },
  datePickerRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    height: 250,
  },
  confirmButton: {
    backgroundColor: "#d4af37",
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: "center",
    marginTop: 8,
  },
  confirmButtonText: {
    color: "#1a0d2e",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 1,
  },
});
