
// This file contains only the types needed for the backend.
// It is a simplified version of the root types.ts file to avoid React dependencies.

export type AiTier = 'diamond' | 'sparkle' | 'flash' | null;

export type Moment = {
  id: string;
  type: 'standard' | 'focus' | 'insight' | 'collection' | 'fæmilyStoryline' | 'aeternySuggestion';
  aiTier: AiTier;
  pinned: boolean;
  image?: string;
  images?: string[];
  video?: string;
  title: string;
  date: string;
  description: string;
  location?: string;
  people?: string[];
  activities?: string[];
  photoCount?: number;
  emotion?: 'joy' | 'love' | 'adventure' | 'peace' | 'reflection' | 'achievement';
  createdBy?: string;
  ritualId?: string;
  isLegacy?: boolean;
};

export interface Journey {
  id: string;
  title: string;
  description: string;
  momentIds: string[];
  coverImage: string;
  collaborators?: string[];
  isLegacy?: boolean;
}

export type UserTier = 'free' | 'essæntial' | 'fæmily' | 'fæmilyPlus' | 'legacy';
export type AeternyVoice = 'Kore' | 'Zephyr' | 'Charon' | 'Fenrir';
export type AeternyStyle = 'Neutral' | 'Warm & Empathetic' | 'Humorous' | 'Formal';
