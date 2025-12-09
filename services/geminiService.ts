
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Moment, Journey, AeternyStyle, AeternyVoice, UserTier } from '../types';
import { decode, decodeAudioData } from '../utils/audio';

// Helper to get system instructions based on style
export function getGenericAeternySystemInstruction(style: AeternyStyle, tier: UserTier): string {
  let base = "You are æterny, a personal AI biographer and curator. Your goal is to help the user preserve their memories.";
  if (style === 'Warm & Empathetic') base += " Be warm, kind, and empathetic. Ask thoughtful questions.";
  if (style === 'Humorous') base += " Be lighthearted and witty, making the process fun.";
  if (style === 'Formal') base += " Be professional, respectful, and structured.";
  return base;
}

export async function startGenericAeternyChat(style: AeternyStyle, tier: UserTier): Promise<{ chat: any, initialMessage: string }> {
  // Initialize inside function to grab latest key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const systemInstruction = getGenericAeternySystemInstruction(style, tier);
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: { systemInstruction },
  });
  
  const response = await chat.sendMessage({ message: "Hello, I am ready to help you curate your memories. How can I assist you today?" });
  return { chat, initialMessage: response.text || "Hello!" };
}

export async function continueAeternyChat(chat: any, message: string): Promise<string> {
  const response = await chat.sendMessage({ message });
  return response.text || "I'm listening.";
}

export async function textToSpeech(text: string, ctx: AudioContext, voice: AeternyVoice, style?: AeternyStyle): Promise<AudioBuffer | null> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: { parts: [{ text }] },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return null;

    return await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
}

export async function createStoryFromImages(images: { data: string; mimeType: string }[]): Promise<{ title: string; story: string; tags: { location: string[]; people: string[]; activities: string[] } }> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const parts: any[] = images.map(img => ({
    inlineData: {
      mimeType: img.mimeType,
      data: img.data,
    },
  }));
  
  parts.push({ text: "Create a title and a heartwarming story based on these images. Also identify tags for location, people, and activities." });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          story: { type: Type.STRING },
          tags: {
            type: Type.OBJECT,
            properties: {
              location: { type: Type.ARRAY, items: { type: Type.STRING } },
              people: { type: Type.ARRAY, items: { type: Type.STRING } },
              activities: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
          },
        },
      },
    },
  });

  const jsonStr = response.text || "{}";
  return JSON.parse(jsonStr);
}

export async function createDemoStoryFromImages(images: { data: string; mimeType: string }[]): Promise<{ title: string; story: string; tags: { location: string[]; people: string[]; activities: string[] } }> {
    return createStoryFromImages(images);
}

export async function rewriteStory(currentStory: string, prompt: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Rewrite the following story based on this instruction: "${prompt}".\n\nStory: ${currentStory}`,
  });
  return response.text || currentStory;
}

export async function createMomentFromRecording(transcription: string, images: { data: string; mimeType: string }[], location?: GeolocationCoordinates | null): Promise<any> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const parts: any[] = images.map(img => ({
    inlineData: {
      mimeType: img.mimeType,
      data: img.data,
    },
  }));
  
  let prompt = `Create a moment from this recording. Transcription: "${transcription}".`;
  if (location) {
    prompt += ` Location coordinates: ${location.latitude}, ${location.longitude}.`;
  }
  prompt += " Extract a title, a narrative story, and tags.";

  parts.push({ text: prompt });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          story: { type: Type.STRING },
          tags: {
            type: Type.OBJECT,
            properties: {
              location: { type: Type.ARRAY, items: { type: Type.STRING } },
              people: { type: Type.ARRAY, items: { type: Type.STRING } },
              activities: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
          },
        },
      },
    },
  });

  return JSON.parse(response.text || "{}");
}

export async function imageUrlToPayload(url: string): Promise<{ data: string; mimeType: string }> {
  // If it's a data URL, parse it
  if (url.startsWith('data:')) {
    const [header, base64] = url.split(',');
    const mimeType = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
    return { data: base64, mimeType };
  }
  
  // If it's a remote URL (like pexels), fetch it
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64data = (reader.result as string).split(',')[1];
            resolve({ data: base64data, mimeType: blob.type });
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
  } catch (e) {
      throw new Error("Failed to load image for payload");
  }
}

export async function generateVideo(
  prompt: string,
  image: { data: string; mimeType: string },
  aspectRatio: "16:9" | "9:16"
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  let operation;
  
  try {
      operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        image: {
          imageBytes: image.data,
          mimeType: image.mimeType,
        },
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: aspectRatio
        }
      });
  } catch (e: any) {
      if (e.message?.includes("404") || e.status === 404 || e.message?.includes("Requested entity was not found")) {
          throw new Error("Requested entity was not found.");
      }
      throw e;
  }

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  if (operation.error) {
    if (operation.error.message?.includes('SAFETY')) {
      throw new Error("SAFETY_FILTER_BLOCK");
    }
     if (operation.error.message?.includes("Requested entity was not found.") || operation.error.code === 404) {
      throw new Error("Requested entity was not found.");
    }
    throw new Error(`Video generation failed: ${operation.error.message}`);
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (downloadLink) {
    const separator = downloadLink.includes('?') ? '&' : '?';
    const videoResponse = await fetch(`${downloadLink}${separator}key=${process.env.API_KEY}`);
    
    if (!videoResponse.ok) {
        throw new Error(`Failed to download video: ${videoResponse.statusText}`);
    }
    
    const blob = await videoResponse.blob();
    return URL.createObjectURL(blob);
  }

  throw new Error("Video generation failed to produce a download link.");
}

export async function generateVideoScript(item: Moment | Journey, style: AeternyStyle): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const context = `Title: ${item.title}. Description: ${item.description}.`;
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Write a short video script (voiceover only) for a video about this memory. Style: ${style}. Context: ${context}. Keep it under 50 words.`,
    });
    return response.text || "";
}

export async function createLegacyLetter(moments: Moment[]): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const descriptions = moments.map(m => `Title: ${m.title}, Date: ${m.date}, Description: ${m.description}`).join('\n');
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Write a legacy letter to my family based on these memories:\n${descriptions}\n\nThe tone should be reflective, loving, and timeless.`,
    });
    return response.text || "";
}

export async function checkImageForMinors(imagePayload: { data: string, mimeType: string }): Promise<boolean> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: {
            parts: [
                { inlineData: { mimeType: imagePayload.mimeType, data: imagePayload.data } },
                { text: "Does this image contain a child or a minor? Answer with only 'yes' or 'no'." }
            ]
        }
    });
    const text = response.text?.toLowerCase().trim();
    return text === 'yes';
}

export async function editImage(data: string, mimeType: string, prompt: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: data,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image returned from edit operation.");
}

export interface SearchResult {
    id: number;
    reason: string;
}

export async function semanticSearch(query: string, moments: Moment[]): Promise<SearchResult[]> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const momentContext = moments.map(m => ({
        id: m.id,
        title: m.title,
        description: m.description,
        emotion: m.emotion,
        tags: [...(m.people || []), ...(m.activities || []), m.location].filter(Boolean)
    }));

    const prompt = `
    You are the semantic search engine for "æternacy", a memory preservation app.
    The user is searching for: "${query}"
    
    Here is the list of memories in JSON:
    ${JSON.stringify(momentContext)}
    
    Return a JSON array of objects with 'id' and a short 'reason' string.
    Find moments that semantically match the user's query, focusing on meaning, emotion, and context, not just keywords.
    Sort by relevance. Return max 5 items.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.NUMBER },
                        reason: { type: Type.STRING }
                    }
                }
            }
        }
    });

    const jsonStr = response.text || "[]";
    return JSON.parse(jsonStr);
}

export async function getRelatedMoments(currentMoment: Moment, allMoments: Moment[]): Promise<SearchResult[]> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const candidates = allMoments.filter(m => m.id !== currentMoment.id && m.type !== 'insight' && m.type !== 'collection');
    
    const candidatesContext = candidates.map(m => ({
        id: m.id,
        title: m.title,
        desc: m.description,
        emotion: m.emotion
    }));

    const prompt = `
    I am viewing this memory:
    Title: ${currentMoment.title}
    Description: ${currentMoment.description}
    Emotion: ${currentMoment.emotion}

    Find up to 3 "Connected Threads" from the list below. Look for deep thematic, emotional, or narrative connections, not just matching tags.
    List: ${JSON.stringify(candidatesContext)}

    Return JSON array: [{ id: number, reason: string }]
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.NUMBER },
                        reason: { type: Type.STRING }
                    }
                }
            }
        }
    });

    const jsonStr = response.text || "[]";
    return JSON.parse(jsonStr);
}
