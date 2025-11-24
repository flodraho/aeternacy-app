
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { Moment } from "./types";

admin.initializeApp();

const ai = new GoogleGenAI({ apiKey: functions.config().gemini.key });

import cors from 'cors';
const corsHandler = cors({origin: true});


export const generateFirstMomentDetails = functions.https.onCall(async (data) => {
    const { image, hint } = data;
    const prompt = `You are æterny, an AI storyteller... (Your full prompt here)`;
    const imagePart = { inlineData: image };
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: { parts: [{ text: prompt }, imagePart] } });
    if (!response.text) throw new functions.https.HttpsError('internal', "AI response was empty.");
    return JSON.parse(response.text.trim());
});

export const createDemoStoryFromImages = functions.https.onCall(async (data) => {
    const { images } = data;
    const imageParts = images.map((image: any) => ({ inlineData: { data: image.data, mimeType: image.mimeType } }));
    const prompt = `You are æterny... (Your full prompt here)`;
    const textPart = { text: prompt };
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: { parts: [textPart, ...imageParts] } });
    if (!response.text) throw new functions.https.HttpsError('internal', "AI response was empty.");
    return JSON.parse(response.text.trim());
});

export const rewriteStory = functions.https.onCall(async (data) => {
    const { originalStory, prompt } = data;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: `Rewrite: "${originalStory}". Instruction: ${prompt}. Return only text.` });
    return response.text;
});

export const createLegacyLetter = functions.https.onCall(async (data) => {
    const { moments } = data;
    const momentSummaries = moments.map((m: Moment) => `- ${m.title} (${m.date}): ${m.description}`).join('\n');
    const prompt = `You are æterny... (Your full legacy letter prompt here):\n${momentSummaries}`;
    const response = await ai.models.generateContent({ model: 'gemini-3-pro-preview', contents: prompt, config: { thinkingConfig: { thinkingBudget: 4096 } } });
    return response.text;
});

export const weaveRitualStory = functions.https.onCall(async (data) => {
    const { moments } = data;
    const momentSummaries = moments.map((m: Moment) => `- ${m.title}: ${m.description} (by ${m.createdBy || 'Family'})`).join('\n');
    const prompt = `Weave these contributions... (Your full ritual prompt here):\n${momentSummaries}`;
    const response = await ai.models.generateContent({ model: 'gemini-3-pro-preview', contents: prompt, config: { thinkingConfig: { thinkingBudget: 2048 } } });
    return response.text;
});

export const textToSpeech = functions.https.onCall(async (data) => {
    const { text, voice, style } = data;
    const prompt = style === 'Warm & Empathetic' ? `Say cheerfully: ${text}` : text;
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
        config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } } },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
});

export const generateVideo = functions.runWith({timeoutSeconds: 540, memory: '1GB'}).https.onCall(async (data) => {
    const { prompt, imagePayload, aspectRatio } = data;
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
    if (operation.error) throw new functions.https.HttpsError('internal', `Video generation failed: ${operation.error.message}`);
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (downloadLink) return downloadLink;
    throw new functions.https.HttpsError('internal', "Video generation failed to return a link.");
});
