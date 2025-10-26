import { GoogleGenAI } from "@google/genai";
// FIX: The API key should be sourced from environment variables, not firebaseConfig.
// import { firebaseConfig } from "../../firebaseConfig"; // FIX: Correct path to root

// Initialize the Google Gemini API client.
// The API key is sourced from the environment variable `process.env.API_KEY`.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a creative and friendly welcome message for a new member using the Gemini API.
 * @param name The name of the new member.
 * @returns A personalized welcome message string.
 */
export const generateWelcomeMessage = async (name: string): Promise<string> => {
  try {
    const prompt = `Buat pesan selamat datang yang singkat, ramah, dan sedikit ceria untuk anggota baru bernama "${name}" yang baru saja bergabung dengan "Klub Pecinta Martabak Juara". Sapa dengan namanya. Jangan lebih dari 2 kalimat.`;

    // Use ai.models.generateContent for text generation.
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash', // A suitable model for basic text tasks.
        contents: prompt,
    });

    // Access the generated text directly from the response.text property.
    const welcomeMessage = response.text;

    if (welcomeMessage) {
      return welcomeMessage.trim();
    } else {
      // Provide a fallback message if the API returns an empty or unexpected response.
      console.warn("Gemini API returned an empty response for welcome message.");
      return `Selamat datang di Klub Pecinta Martabak, ${name}! Kami senang Anda bergabung.`;
    }
  } catch (error) {
    console.error("Error generating welcome message with Gemini:", error);
    // Fallback message in case of an API error to ensure a good user experience.
    return `Selamat datang di Klub Pecinta Martabak, ${name}! Kami senang Anda bergabung.`;
  }
};
