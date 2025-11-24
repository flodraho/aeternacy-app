
import React from "react";

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
  VRLab,
  Biografer,
  BulkUpload,
  AIVideo,
  About,
  SmartCollection,
  TrustCenter,
  BulkUploadReview,
  Gift,
  FamilyTree,
  ComparePlans,
  FamilyRituals,
  RitualDashboard,
  Journal
}

export enum AuthMode {
  Login,
  Register,
  ResetPassword,
}

export interface Message {
  sender: 'user' | 'ai';
  text: string;
}

export type AiTier = 'diamond' | 'sparkle' | 'flash' | null;

export type UserTier = 'free' | 'essæntial' | 'fæmily' | 'fæmilyPlus' | 'legacy';

export type AeternyVoice = 'Kore' | 'Zephyr' | 'Charon' | 'Fenrir';
export type AeternyStyle = 'Neutral' | 'Warm & Empathetic' | 'Humorous' | 'Formal';


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
  suggestedMomentId?: string;
  ritualId?: string;
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

export interface FamilyTreeNode {
  id: string;
  name: string;
  profilePic?: string;
  spouse?: {
    id: string;
    name: string;
    profilePic?: string;
  };
  children?: FamilyTreeNode[];
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
  status: 'Pending' | 'Active' | 'Certified';
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

export interface TimeCapsule {
  id: string;
  name: string;
  openDate: string;
  recipient: string;
  momentIds: string[];
  status: 'Active' | 'Paused';
}

export interface RitualTemplate {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  iconName: string;
  frequency: string;
}

export interface ActiveRitual {
    id: string;
    templateId: string;
    title: string;
    description: string;
    iconName: string;
    frequency: string;
    progress: number;
    participants: { id: string, name: string, avatar: string }[];
}