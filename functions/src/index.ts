import {onCall, HttpsError} from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const callGeminiAPI = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be logged in');
  }

  const {prompt, systemInstruction, model = 'gemini-2.0-flash-exp'} = request.data;

  if (!prompt) {
    throw new HttpsError('invalid-argument', 'Prompt is required');
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new HttpsError('internal', 'API key not configured');
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          contents: [{parts: [{text: prompt}]}],
          systemInstruction: systemInstruction ?
            {parts: [{text: systemInstruction}]} : undefined,
        }),
      }
    );

    if (!response.ok) {
      throw new HttpsError('internal', 'API request failed');
    }

    const data = await response.json();
    return {
      text: data.candidates[0].content.parts[0].text,
      usage: data.usageMetadata,
    };
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new HttpsError('internal', 'Failed to generate content');
  }
});
