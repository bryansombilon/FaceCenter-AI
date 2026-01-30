
import { GoogleGenAI } from "@google/genai";
import { ImagePart } from "../types";

export const processImageWithAI = async (base64Data: string, mimeType: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `
    Transform this image into a professional, high-resolution 1:1 square portrait.
    1. Detect the main face in the image.
    2. Center the face perfectly within the square frame.
    3. If the image needs to be expanded to fit the square while keeping the face centered, use generative AI to outpaint/fill the missing background, shoulders, and head parts seamlessly.
    4. Ensure the output is high quality, sharp, and consistent with the original image's lighting and style.
    5. Return only the edited image.
  `.trim();

  const imagePart: ImagePart = {
    inlineData: {
      mimeType,
      data: base64Data,
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { 
        parts: [
          imagePart, 
          { text: prompt }
        ] 
      },
    });

    // Iterate through candidates to find the image part
    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("No image data returned from AI");
  } catch (error) {
    console.error("AI processing error:", error);
    throw error;
  }
};
