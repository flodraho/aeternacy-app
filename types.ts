
export enum Page {
  Landing,
  Home,
  Interview,
  Moments,
  Create,
  Record,
  Curate,
  MomentDetail,
  Profile,
  DataInsight,
  TimeCapsule,
  FamilyStoryline,
  LegacySpace,
  Theater,
  FamilyPlan,
  FamilySpace,
  Subscription,
  FamilyMoments,
  Shop,
  Journeys,
  LegacyTrust,
  Magazine,
  Journaling,
  Photobook,
  Biografer,
  BulkUpload,
  AIVideo,
  About,
  SmartCollection,
  TrustCenter,
  BulkUploadReview,
  Articles,
  VRLab
}

export enum AuthMode {
  Login,
  Register,
}

export interface Message {
  sender: 'user' | 'ai';
  text: string;
}

export type AiTier = 'diamond' | 'sparkle' | 'flash' | null;

export type UserTier = 'free' | 'essæntial' | 'fæmily' | 'legacy';

export type AeternyVoice = 'Kore' | 'Zephyr' | 'Charon' | 'Fenrir';
export type AeternyStyle = 'Neutral' | 'Warm & Empathetic' | 'Humorous' | 'Formal';


export type Moment = {
  id: number;
  type: 'standard' | 'focus' | 'insight' | 'collection' | 'fæmilyStoryline';
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
  focusInfo?: string;
  insightData?: {
    memories: number;
    period: string;
  };
  collectionData?: {
    ready: number;
    type: string;
  };
  fæmilyStorylineData?: {
    members: number;
    moments: number;
  };
  emotion?: 'joy' | 'love' | 'adventure' | 'peace' | 'reflection' | 'achievement';
  collaborators?: string[];
  isLegacy?: boolean;
  createdBy?: string;
  comments?: { user: string; text: string; date: string }[];
};

export interface Journey {
  id: number;
  title: string;
  description: string;
  momentIds: number[];
  coverImage: string;
  collaborators?: string[];
  isLegacy?: boolean;
}

export interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  liked: boolean;
  alt: string;
}

export interface PexelsResponse {
  total_results: number;
  page: number;
  per_page: number;
  photos: PexelsPhoto[];
  next_page: string;
}

export type StewardRole = 'Guardian' | 'Co-Curator' | 'Successor';

export interface Steward {
  id: string;
  name: string;
  email: string;
  role: StewardRole;
}

export interface TokenState {
  balance: number;
  monthlyAllocation: number;
  rollover: number;
  freeHeaderAnimations: {
    used: number;
    total: number;
  };
}

export type SuggestedPhoto = {
  id: string;
  url: string;
  suggestion?: 'Best Shot' | 'Duplicate' | 'Low Quality';
};

export type SuggestedMoment = {
  id: string;
  title: string;
  dateRange: string;
  photos: SuggestedPhoto[];
};
