import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { GoogleGenAI, Chat, GenerateContentResponse, Modality, Blob, Type } from "@google/genai";
import { AeternyStyle, AeternyVoice, Moment, Journey, UserTier } from "../../types"; // Adjust path as needed in real project

admin.initializeApp();

// IMPORTANT: Set your Gemini API key in your Firebase environment
// Run: firebase functions:config:set gemini.key="YOUR_API_KEY"
const ai = new GoogleGenAI({ apiKey: functions.config().gemini.key });

const cors = require('cors')({origin: true});

// Helper to wrap functions in CORS for onRequest, although onCall is preferred
const asHttpsOnRequest = (handler: (req: functions.https.Request, res: functions.Response<any>) => void) => {
    return functions.https.onRequest((req, res) => {
        cors(req, res, () => {
            handler(req, res);
        });
    });
};


// --- Callable Functions ---

export const generateFirstMomentDetails = functions.https.onCall(async (data, context) => {
    // context.auth will contain user info if logged in
    const { image, hint } = data;
    const prompt = `You are æterny, an AI storyteller. Analyze the user's image and their brief description of a memory.
    Your task is to craft a beautiful, short, first-person narrative that brings this memory to life.
    Also, create an evocative title and extract relevant tags.

    User's description:
    "${hint}"

    Return a JSON object with: title, story, tags (location, people, activities).`;

    const imagePart = { inlineData: image };
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ text: prompt }, imagePart] },
        config: {
            responseMimeType: 'application/json',
            responseSchema: { /* Schema omitted for brevity, but should be included as before */ }
        }
    });
    return JSON.parse(response.text.trim());
});

export const createDemoStoryFromImages = functions.https.onCall(async (data, context) => {
    const { images } = data;
    const imageParts = images.map((image: any) => ({
        inlineData: { data: image.data, mimeType: image.mimeType }
    }));
    const prompt = `You are æterny. Analyze these images and create a cohesive, beautiful, short story (approx 75 words) that connects them. 
    Return JSON with: title, story, tags (location, people, activities).`;
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [textPart, ...imageParts] },
        config: { responseMimeType: "application/json", /* Schema needed */ }
    });
    return JSON.parse(response.text.trim());
});

export const rewriteStory = functions.https.onCall(async (data, context) => {
    const { originalStory, prompt } = data;
     const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Rewrite: "${originalStory}". Instruction: ${prompt}. Return only text.`
    });
    return response.text;
});

export const createLegacyLetter = functions.https.onCall(async (data, context) => {
    const { moments } = data;
     const momentSummaries = moments.map((m: Moment) => `- ${m.title} (${m.date}): ${m.description}`).join('\n');
    const prompt = `You are æterny, writing a "Legacy Letter" based on these moments:\n${momentSummaries}\n\nWrite a heartfelt, wise letter for the user's loved ones reflecting on these memories. Use deep reasoning to find emotional threads and recurring themes.`;

    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
            thinkingConfig: { thinkingBudget: 4096 }
        }
    });

    return response.text;
});

export const weaveRitualStory = functions.https.onCall(async (data, context) => {
    const { moments } = data;
    const momentSummaries = moments.map((m: Moment) => `- ${m.title}: ${m.description} (by ${m.createdBy || 'Family'})`).join('\n');
    const prompt = `Weave these individual family contributions into a single, cohesive narrative story. Find the common thread that connects them all. Use a warm, storytelling voice:\n${momentSummaries}`;

    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
            thinkingConfig: { thinkingBudget: 2048 }
        }
    });
    return response.text;
});


// Note: Functions requiring streaming (like textToSpeech, generateVideo, Live API) are more complex.
// onCall is not suitable for streams. They typically require onRequest with long-polling or WebSockets.
// For this refactor, we'll expose them as onCall but acknowledge they'd need a different architecture in production.

export const textToSpeech = functions.https.onCall(async (data, context) => {
    const { text, voice, style } = data;
    const prompt = style === 'Warm & Empathetic' ? `Say cheerfully: ${text}` : text;
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
        },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data; // returns base64 string
});


// generateVideo would need to be an onRequest function that initiates a long-running operation
// and returns an operation ID. The client would then poll another function for the result.
// This is a simplified version for architectural demonstration.
export const generateVideo = functions.runWith({timeoutSeconds: 540, memory: '1GB'}).https.onCall(async (data, context) => {
    const { prompt, imagePayload, aspectRatio } = data;
    
    // In a real app, you might need a separate, higher-permissioned AI client for Veo
    const aiClient = new GoogleGenAI({ apiKey: functions.config().gemini.key });

    let operation = await aiClient.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        image: {
            imageBytes: imagePayload.data,
            mimeType: imagePayload.mimeType,
        },
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: aspectRatio
        }
    });

    // Polling inside the function for simplicity here, but not ideal for long operations
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await aiClient.operations.getVideosOperation({ operation: operation });
    }

    if (operation.error) {
        throw new functions.https.HttpsError('internal', `Video generation failed: ${operation.error.message}`);
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (downloadLink) return downloadLink;

    throw new functions.https.HttpsError('internal', "Video generation failed to return a link.");
});


// All other functions from geminiService.ts would be converted similarly...
// checkImageForMinors, analyzeImageForCuration, editImage, etc.
