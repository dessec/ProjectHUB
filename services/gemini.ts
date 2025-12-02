import { GoogleGenAI, Modality } from "@google/genai";

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  // Chat with context (Projects/Tasks)
  async chatWithContext(message: string, contextData: string) {
    try {
      const ai = getClient();
      const model = "gemini-2.5-flash";
      
      const systemInstruction = `You are an elite Executive Project Assistant.
      You are integrated into a high-level project management dashboard ("ProjectHub Exec").
      
      Your Capabilities:
      1. Analyze the provided project structure (nested sub-projects), tasks, and deadlines.
      2. Provide strategic advice on prioritization and scheduling.
      3. When asked to "modify files" or "create files", understand that you are operating within the application's virtual environment (Tasks/Notes/Goals). 
         - If the user asks to modify a PC file (e.g., C:/Windows), politely explain that for security within the web interface, you act on the Application's internal database (Notes/Tasks), but you can draft the content for them to save manually.
      
      Tone: Professional, Concise, Executive, and Action-Oriented.
      Current Date: ${new Date().toLocaleDateString()}
      
      Context Data:
      ${contextData}`;

      const response = await ai.models.generateContent({
        model,
        contents: message,
        config: {
          systemInstruction,
        }
      });
      
      return response.text;
    } catch (error) {
      console.error("Gemini Chat Error:", error);
      throw error;
    }
  },

  // Image Editing (Nano Banana)
  async editImage(base64Image: string, prompt: string) {
    try {
      const ai = getClient();
      // Using the specific model for image generation/editing
      const model = "gemini-2.5-flash-image";

      // For editing, we provide the image and the prompt as parts
      const response = await ai.models.generateContent({
        model,
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: "image/png", // Assuming PNG, but flexible
                data: base64Image.split(',')[1] || base64Image, // Strip header if present
              },
            },
            {
              text: prompt,
            },
          ],
        },
        config: {
            // CRITICAL: Must specify IMAGE modality for image output
            responseModalities: [Modality.IMAGE], 
        },
      });

      // Extract the image from the response
      const firstCandidate = response.candidates?.[0];
      const firstPart = firstCandidate?.content?.parts?.[0];
      
      if (firstPart && firstPart.inlineData && firstPart.inlineData.data) {
         return `data:image/png;base64,${firstPart.inlineData.data}`;
      }
      
      throw new Error("No image data returned");
    } catch (error) {
      console.error("Gemini Image Edit Error:", error);
      throw error;
    }
  }
};