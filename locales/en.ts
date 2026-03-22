const en = {
  common: {
    cancel: "Cancel",
    save: "Save",
    notSet: "Not set",
    continue: "Continue",
    loading: "Loading...",
  },
  navigation: {
    insights: "Insights",
    birthChart: "Birth Chart",
  },
  settings: {
    title: "Settings",
    yourProfile: "Your Profile",
    name: "Name",
    namePlaceholder: "Your name",
    birthDate: "Birth Date",
    birthDateHint: "Day · Month · Year",
    birthTime: "Birth Time",
    birthTimeHint: "24h format — Hour : Minute",
    birthPlace: "Birth Place",
    data: "Data",
    clearHistory: "Clear Chat History",
    clearHistoryDesc: "Delete all saved conversations",
    about: "About",
    tagline: "Your personal astrology companion",
    credit: "Powered by OpenAI · Built with ✦",
    language: "Language",
    clearHistoryAlertTitle: "Clear Chat History",
    clearHistoryAlertMessage: "This will permanently delete all your conversations. This can't be undone.",
    clearHistoryAlertConfirm: "Clear All",
    clearHistorySuccessTitle: "Done",
    clearHistorySuccessMessage: "All chat history cleared.",
    support: "Support",
    contactUs: "Contact Us",
    contactUsDesc: "Send feedback or ask for help",
    termsOfService: "Terms of Service",
    privacyPolicy: "Privacy Policy",
    termsTitle: "Terms of Service",
    termsBody: "By using Lunara, you agree to use this app for personal, non-commercial purposes only. The astrological readings provided are for entertainment purposes and do not constitute professional advice. We reserve the right to update these terms at any time.",
    privacyTitle: "Privacy Policy",
    privacyBody: "Lunara stores all your data locally on your device. We do not transmit your personal information, birth data, or chat history to any server. Your conversations with the AI are sent to OpenAI for processing and are subject to OpenAI's privacy policy. We do not sell or share your data with third parties.",
    close: "Close",
  },
  orbit: {
    you: "YOU",
    celestialCircle: "Your Celestial Circle",
    tapYouPrompt: "Tap YOU to generate your birth chart and begin your cosmic journey.",
    addPeoplePrompt: "Add the people in your life to explore their natal charts and astrological connections.",
    tapPersonHint: "Tap a person to view their birth chart",
    whosInYourOrbit: "Who's in your orbit?",
    addPromptText: "Add a partner, friend, or family member to explore your astrological connection.",
    addPerson: "Add Person",
    addPersonTitle: "Add Person",
    name: "Name",
    namePlaceholder: "Their name",
    birthDate: "Birth Date",
    birthTime: "Birth Time",
    birthLocation: "Birth Location",
    generateChart: "Generate Chart",
  },
  personDetail: {
    openBirthMap: "Open Birth Map",
    openBirthMapSubtitle: "Requires birth date, time, and location",
    natalChartReading: "✦ Natal Chart Reading",
    preparingReading: "Lunara is preparing your reading…",
    tapToRetry: "Tap to retry",
    chatAboutChart: "✦ Chat about this chart",
  },
  history: {
    title: "Chat History",
    noConversations: "No conversations yet",
    noConversationsSubtitle: "Start a chat from the Insights tab",
    today: "Today",
    yesterday: "Yesterday",
    thisWeek: "This Week",
    thisMonth: "This Month",
    older: "Older",
    readonlyBadge: "Chat History",
  },
  chat: {
    inputPlaceholder: "Continue the dialogue…",
    loading: "Loading...",
    saveToChart: "Save to Birth Chart?",
    saveToChartSubtitle: "Same protocol as Birth Chart: name and birth date (day, month, year).",
    namePlaceholder: "Name",
    goToBirthChart: "Go to Birth Chart →",
    readonlyBadge: "Chat History",
    noBirthCharts:
      "🪐 You don't have any birth charts yet. Head to the Birth Chart tab to add someone and generate their chart — then come back here for a full analysis.",
    selectBirthChart: "🪐 Whose birth chart would you like to explore? Tap a name below.",
    noSelfChart:
      "❤️ To compare charts, I need your birth chart first. Head to the Birth Chart tab to generate yours.",
    noPartnerChart:
      "❤️ Add someone to your orbit and generate their birth chart — then I can reveal what the stars say about your connection.",
    whosOnYourMind:
      "❤️ Who's on your mind? Tap their name below and I'll reveal what the stars say about your connection.",
    noFriendChart:
      "🤝 Add someone to your orbit and generate their birth chart — then I can read your friendship dynamic.",
    whosYourFriend:
      "🤝 Which friend are you curious about? Tap their name and I'll read your friendship dynamic.",
  },
  tarot: {
    past: "PAST",
    today: "TODAY",
    future: "FUTURE",
    tap: "tap",
    readingCards: "✦  Reading the cards…  ✦",
  },
  onboarding: {
    title: "About You",
    initialMessage:
      "Hello! I'm LUNARA, your AI fortune teller. Let's get to know each other! What's your name?",
    nameCollected:
      "Wonderful to meet you, {{name}}! ✨\n\nI need to know your birth date. \n\nPlease select your birth date below:",
    nameError:
      "I'm sorry, I had trouble saving your name. Could you please tell me your name again?",
    nameInvalid: "I didn't quite catch that. Could you please tell me your name?",
    dateInvalid: "That doesn't seem like a valid date. Please check your selection.",
    dateSaved:
      "Perfect! Your birth date is {{month}} {{day}}, {{year}}. 🎂✨\n\nI now have everything \n\nLet me finish setting up your profile...",
    dateError:
      "I'm sorry, I had trouble saving your birth date. Please try again.",
    selectBirthDate: "Select Your Birth Date",
    selectTheirBirthDate: "Select their birth date",
    month: "Month",
    day: "Day",
    year: "Year",
  },
  timePicker: {
    title: "Select Your Birth Time",
    hour: "Hour",
    minute: "Minute",
  },
  birthMap: {
    title: "Generate Birth Map",
    complete: "✨ Your Natal Chart has been generated and saved!",
  },
  explore: {
    general: "What's on your mind?",
    cosmicCrossroads: "Cosmic Crossroads",
    someoneSpecial: "Someone Special",
    friendDynamics: "Friend dynamics",
    tarotReading: "Daily Tarot Reading",
    birthChartAnalysis: "Birth Chart Analysis",
    initialGeneral: "✨ What's on your mind? Speak freely — I'm here to listen and guide you.",
    initialCrossroads:
      "⟁ The card has been drawn. Speak your question — should you, will you, do you choose — and I will reveal what stands at your crossroads.",
    initialSomeoneSpecial:
      "❤️ Tell me about the person on your mind. I can help you understand the dynamics, compatibility, and what the stars reveal about your connection.",
    initialFriendDynamics:
      "🤝 Which friend are you curious about? Tap their name and I'll read your friendship dynamic.",
    initialTarot:
      "🔮 Three cards await you. Tap each one to reveal what the universe has to say about your past, present, and future.",
    initialBirthChart:
      "🪐 Natal chart analysis — list and names will appear when you open this chat.",
  },
  crossroads: {
    proceed: "Proceed",
    pause: "Pause",
    wait: "Wait",
    askYourQuestion: "type your question",
    reading: "✦  Reading the crossroads…  ✦",
  },
  months: {
    short: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    full: [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ],
  },
} as const;

export default en;
