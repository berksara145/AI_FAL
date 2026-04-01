// app.config.js extends app.json and injects EAS build-time env vars
// into Constants.expoConfig.extra so they're accessible at runtime.
const appJson = require("./app.json");

module.exports = {
  ...appJson.expo,
  extra: {
    ...appJson.expo.extra,
    revenueCatKeyIos:     process.env.REVENUECAT_KEY_IOS,
    revenueCatKeyAndroid: process.env.REVENUECAT_KEY_ANDROID,
    openAiApiKey:         process.env.OPENAI_API_KEY,
    googlePlacesApiKey:   process.env.GOOGLE_PLACES_API_KEY,
  },
};
