import { GoogleGenAI, Type } from "@google/genai";
import { AIResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const interpretInput = async (input: string): Promise<AIResponse> => {
  if (!input || input.trim().length === 0) {
    throw new Error("Input cannot be empty");
  }

  // If it's already a valid URL and user didn't ask for help, just return it.
  try {
    const url = new URL(input);
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return {
        payload: input,
        type: 'URL',
        summary: 'Standard URL detected'
      };
    }
  } catch (e) {
    // Not a URL, proceed to AI
  }

  const currentDate = new Date().toISOString();

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Transform the following user input into a standardized string format suitable for a QR code. 
      The current reference date/time is: ${currentDate}.
      
      Detect intents such as:
      1. WiFi network (Format: WIFI:S:SSID;T:WPA;P:password;;) - Infer WPA if not specified.
      2. Calendar Event (Format: BEGIN:VEVENT...END:VEVENT) - Calculate relative dates (e.g., "next friday") based on the current reference date. Ensure standard iCal format with DTSTART, DTEND (default 1h if not specified), SUMMARY, LOCATION.
      3. Cryptocurrency (Format: bitcoin:address or ethereum:address) - Detect ETH (0x...) or BTC addresses.
      4. Contact/vCard (Format: BEGIN:VCARD...END:VCARD) - Extract details if user pastes a messy signature.
      5. Email (Format: mailto:email@example.com?subject=...)
      6. SMS (Format: sms:+1234567890?body=...)
      7. Geo Location (Format: geo:lat,long)
      8. Plain Text or URL (fallback)

      User Input: "${input}"
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            payload: {
              type: Type.STRING,
              description: "The formatted string ready for QR encoding",
            },
            type: {
              type: Type.STRING,
              enum: ["URL", "WIFI", "EMAIL", "SMS", "TEL", "VCARD", "TEXT", "GEO", "EVENT", "CRYPTO"],
              description: "The detected type of the content",
            },
            summary: {
              type: Type.STRING,
              description: "A short, user-friendly description of what was generated (e.g., 'Event: Launch Party, Oct 24')",
            }
          },
          required: ["payload", "type", "summary"],
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AIResponse;
    }
    throw new Error("No response from AI");
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback to plain text if AI fails
    return {
      payload: input,
      type: 'TEXT',
      summary: 'Raw Text (AI processing failed)'
    };
  }
};