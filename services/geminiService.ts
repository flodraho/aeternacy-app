
import { GoogleGenAI, Chat, GenerateContentResponse, Modality, LiveServerMessage, Blob, FunctionDeclaration, Type } from "@google/genai";
import { AeternyStyle, AeternyVoice, Moment, Journey, UserTier } from '../types';
import { decode, decodeAudioData as decodePcmAudioData } from '../utils/audio';

// Initialize the Google AI client directly.
// IMPORTANT: This exposes the API key on the client-side. This is acceptable for this demo environment,
// but for a production application, all of this logic MUST be moved to a secure backend (like Firebase Functions).
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });


export async function generateFirstMomentDetails(
    image: { data: string; mimeType: string },
    hint: string
): Promise<{ title: string; story: string; tags: { location: string[]; people: string[]; activities: string[] } }> {
    const prompt = `You are æterny, an AI storyteller. Analyze the user's image and their brief description of a memory.
    Your task is to craft a beautiful, short, first-person narrative that brings this memory to life.
    Also, create an evocative title and extract relevant tags.

    User's description:
    "${hint}"

    Return a JSON object with this exact schema: { "title": "string", "story": "string", "tags": { "location": ["string"], "people": ["string"], "activities": ["string"] } }`;

    const imagePart = { inlineData: image };
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ text: prompt }, imagePart] },
        config: {
            responseMimeType: 'application/json',
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
        }
    });

    return JSON.parse(response.text.trim());
}

export async function createStoryFromImages(images: {data: string, mimeType: string}[]): Promise<{title: string, story: string, tags: {location:string[], people: string[], activities: string[]}}> {
    const imageParts = images.map(image => ({
        inlineData: { data: image.data, mimeType: image.mimeType }
    }));

    const prompt = `You are æterny, an AI storyteller. Analyze these images and create a cohesive, beautiful, short story (approx 75 words) that connects them into a single "momænt".
    Also, create an evocative title and extract relevant tags.
    Return a JSON object with this exact schema: { "title": "string", "story": "string", "tags": { "location": ["string"], "people": ["string"], "activities": ["string"] } }`;
    
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [textPart, ...imageParts] },
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
        }
    });

    return JSON.parse(response.text.trim());
}

export async function rewriteStory(originalStory: string, prompt: string): Promise<string> {
    const fullPrompt = `Rewrite the following story: "${originalStory}".
    Apply this instruction: "${prompt}".
    Return only the rewritten text, with no additional commentary.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt
    });
    return response.text;
}

export async function createLegacyLetter(moments: Moment[]): Promise<string> {
    const momentSummaries = moments.map(m => `- ${m.title} (${m.date}): ${m.description}`).join('\n');
    const prompt = `You are æterny, an AI biographer writing a "Legacy Letter" on behalf of a user.
    The user has selected these cherished moments from their life:
    ${momentSummaries}

    Your task is to write a heartfelt, wise, and reflective letter addressed to the user's loved ones (e.g., "To my dearest family,").
    Use your advanced reasoning to identify the core emotional themes, recurring values, and the overarching narrative that connects these seemingly separate moments.
    Do not simply summarize. Synthesize the essence of these memories into a touching and profound message that captures the spirit of the person who lived them. The tone should be warm, personal, and timeless.`;

    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
            thinkingConfig: { thinkingBudget: 4096 }
        }
    });
    return response.text;
}

export async function weaveRitualStory(moments: Moment[]): Promise<string> {
    const momentContributions = moments.map(m => `- A contribution for "${m.title}" by ${m.createdBy || 'Family'}: "${m.description}"`).join('\n');
    const prompt = `You are æterny, an AI story-weaver. A family has contributed several small moments as part of a shared ritual.
    Contributions:
    ${momentContributions}

    Your task is to weave these individual contributions into a single, cohesive, and heartwarming narrative. Find the common thread, emotion, or theme that connects them all, even if they seem disparate.
    The final output should be a short story, told in a warm, third-person narrative voice, that celebrates the family's shared experience.`;

    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
            thinkingConfig: { thinkingBudget: 2048 }
        }
    });
    return response.text;
}

export async function textToSpeech(
  text: string,
  audioContext: AudioContext,
  voice: AeternyVoice,
  style?: AeternyStyle
): Promise<AudioBuffer> {
    const prompt = style === 'Warm & Empathetic' ? `Say cheerfully: ${text}` : text;
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
        },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
        return await decodePcmAudioData(decode(base64Audio), audioContext, 24000, 1);
    }
    throw new Error("Text-to-speech generation failed.");
}

export async function generateVideo(
  prompt: string,
  imagePayload: { data: string; mimeType: string },
  aspectRatio: "16:9" | "9:16"
): Promise<string> {
    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt,
        image: { imageBytes: imagePayload.data, mimeType: imagePayload.mimeType },
        config: { numberOfVideos: 1, resolution: '720p', aspectRatio }
    });

    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation });
    }

    if (operation.error) {
        throw new Error(`Video generation failed: ${operation.error.message}`);
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        throw new Error("Video generation completed but returned no download link.");
    }
    return downloadLink;
}

export async function checkImageForMinors(image: { data: string, mimeType: string }): Promise<boolean> {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ text: "Does this image contain a person who appears to be a minor (under 18)? Answer only 'Yes' or 'No'." }, { inlineData: image }] }
    });
    return response.text.toLowerCase().includes('yes');
}

export async function createDemoStoryFromImages(images: { data: string, mimeType: string }[]): Promise<{ title: string; story: string; tags: { location: string[]; people: string[]; activities: string[] } }> {
    return createStoryFromImages(images);
}

export async function startBiographerTextChat(topic: string): Promise<{ chat: Chat; initialMessage: string }> {
    const systemInstruction = `You are The Biografær, a world-class oral historian and empathetic interviewer for æternacy. Your tone is warm, patient, and insightful. Your goal is to help the user explore their life story through gentle, open-ended questions.
    - Start with a warm welcome and introduce the topic.
    - Ask ONE question at a time.
    - Keep your responses concise.
    - Use maieutic questioning to help the user uncover deeper meaning in their own memories.
    - The current topic is: "${topic}". Begin the interview now.`;

    const chat = ai.chats.create({ model: 'gemini-3-pro-preview', config: { systemInstruction } });
    const response = await chat.sendMessage({ message: "Start the interview." });
    return { chat, initialMessage: response.text };
}

export async function startAeternyChat(aeternyStyle: AeternyStyle, userTier: UserTier): Promise<{ chat: Chat, initialMessage: string }> {
    const systemInstruction = getGenericAeternySystemInstruction(aeternyStyle, userTier);
    const chat = ai.chats.create({ model: 'gemini-2.5-flash', config: { systemInstruction } });
    const response = await chat.sendMessage({ message: "Give a brief, friendly greeting." });
    return { chat, initialMessage: response.text };
}

export async function continueAeternyChat(chat: Chat, message: string): Promise<string> {
    const response = await chat.sendMessage({ message });
    return response.text;
}

export const getGenericAeternySystemInstruction = (aeternyStyle: AeternyStyle, userTier: UserTier) => {
    return `You are æterny, a personal AI curator for a memory platform. Your personality is ${aeternyStyle}. You are helpful and concise. The user's subscription tier is ${userTier}. Be aware of features available to them but do not oversell.`;
};

// --- Re-implement other functions as needed ---
export const createMomentFromRecording = async (transcribedText: string, capturedImages: { data: string, mimeType: string }[], location: GeolocationCoordinates | null): Promise<{ title: string; story: string; tags: { location: string[]; people: string[]; activities: string[] } }> => {
    // This is a complex function that would combine multiple AI calls.
    // For this client-side version, we'll simplify it.
    let prompt = `Analyze the following transcribed audio and images from a recorded moment. Create a title, a short story, and tags.
    Transcription: "${transcribedText}"
    ${location ? `Location: Lat ${location.latitude}, Lon ${location.longitude}` : ''}
    Return a JSON object with title, story, and tags (location, people, activities).`;

    const imageParts = capturedImages.map(img => ({ inlineData: img }));

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ text: prompt }, ...imageParts] },
        config: { responseMimeType: "application/json", /* Schema */ }
    });
    return JSON.parse(response.text.trim());
};

export const imageUrlToPayload = async (url: string): Promise<{ data: string; mimeType: string }> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            const [, data] = result.split(',');
            if (data) {
                resolve({ data, mimeType: blob.type });
            } else {
                reject(new Error('Failed to convert blob to base64 data.'));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

export const editImage = async (data: string, mimeType: string, prompt: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                { inlineData: { data, mimeType } },
                { text: prompt },
            ],
        },
    });
    const imagePart = response.candidates?.[0]?.content.parts.find(p => p.inlineData);
    if (imagePart?.inlineData) {
        return `data:image/png;base64,${imagePart.inlineData.data}`;
    }
    throw new Error('AI did not return an image.');
};

export async function analyzeImageForCuration(data: string, mimeType: string): Promise<{ suggestions: string[], tags: any }> {
    const prompt = `Analyze this image for photo curation. Provide a JSON object with:
    1. "suggestions": An array of 3 creative editing prompts (e.g., "Add a vintage film filter", "Make the colors more vibrant").
    2. "tags": An object with location, people, and activities arrays.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{text: prompt}, {inlineData: {data, mimeType}}] },
        config: { responseMimeType: 'application/json' /* Schema */ }
    });
    return JSON.parse(response.text.trim());
}

export async function generateImage(prompt: string): Promise<string> {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] }
    });
    const imagePart = response.candidates?.[0]?.content.parts.find(p => p.inlineData);
    if (imagePart?.inlineData) {
        return `data:image/png;base64,${imagePart.inlineData.data}`;
    }
    throw new Error('AI did not return an image.');
}

export async function generateVideoScript(item: Moment | Journey, style: AeternyStyle): Promise<string> {
    const prompt = `You are a scriptwriter for a short, emotional video. The video is about:
    Title: ${item.title}
    Description: ${item.description}
    Write a short, poetic narration script (3-4 sentences) in a ${style.toLowerCase()} style. Return only the script text.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    return response.text;
}

export async function createMomentFromVoiceOnly(audio: { data: string; mimeType: string }): Promise<{ title: string; story: string; tags: any; imagePrompt: string }> {
    const prompt = `Listen to this audio recording of a personal memory. Transcribe it, then write a short, heartfelt story from it. Also create a title, tags, and a detailed, artistic prompt for an image generator that captures the mood of the story.
    Return JSON: { "title": "string", "story": "string", "tags": {...}, "imagePrompt": "string" }`;

    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: { parts: [{ text: prompt }, { inlineData: audio }] },
        config: {
            responseMimeType: "application/json",
            thinkingConfig: { thinkingBudget: 4096 },
            /* Schema */
        }
    });
    return JSON.parse(response.text.trim());
}

export async function scanPhysicalPhoto(image: { data: string; mimeType: string }): Promise<{ decade: string; context: string; handwrittenNotes: string }> {
  const prompt = `Analyze this image of a physical photograph.
  1. Estimate the decade it was taken (e.g., "1980s").
  2. Provide brief context based on clothing, style, and photo quality.
  3. Transcribe any handwritten notes on the back or border.
  Return JSON: { "decade": "string", "context": "string", "handwrittenNotes": "string" }`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [{ text: prompt }, { inlineData: image }] },
    config: { responseMimeType: "application/json", /* Schema */ }
  });
  return JSON.parse(response.text.trim());
}

export async function generateLegacyStatement(userName: string): Promise<string> {
  const prompt = `As an AI specialized in estate planning language, draft a formal but empathetic "Statement of Digital Intent" for a user named ${userName}.
  This document should clearly state their wish for their æternacy digital legacy to be preserved and passed on to their designated Successor(s).
  The tone should be clear, heartfelt, and suitable for inclusion with legal documents. It should express the value the user places on their memories and their desire for their story to be remembered.`;
  
  const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { thinkingConfig: { thinkingBudget: 2048 } }
  });
  return response.text;
}

// Live API functions remain client-side as they require direct WebSocket connections
export const startOralHistorySession = async (
    topic: string, 
    callbacks: { onMessage: (message: LiveServerMessage) => void; onError: (e: ErrorEvent) => void; onClose: (e: CloseEvent) => void }
) => {
    const systemInstruction = `You are The Biografær, an expert oral historian for æternacy. Your tone is warm, patient, and deeply empathetic. Your goal is to conduct a voice interview to help the user explore their life story.
    - Start with a warm spoken welcome and introduce the topic.
    - Ask ONE open-ended question at a time.
    - Listen patiently. Allow for silence and reflection.
    - The current topic is: "${topic}". Begin the interview now.`;

    const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
            onopen: () => {}, // onopen will be handled by the component to start audio stream
            onmessage: callbacks.onMessage,
            onerror: callbacks.onError,
            onclose: callbacks.onClose,
        },
        config: {
            responseModalities: [Modality.AUDIO],
            outputAudioTranscription: {},
            inputAudioTranscription: {},
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' }}},
            systemInstruction
        }
    });
    return sessionPromise;
};
