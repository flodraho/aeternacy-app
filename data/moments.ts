
import { Moment, Journey, SuggestedMoment } from '../types';

export const initialMoments: Moment[] = [
  {
    id: '1',
    type: 'standard',
    aiTier: 'diamond',
    pinned: true,
    image: 'https://images.pexels.com/photos/167699/pexels-photo-167699.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    title: 'Morning Fog in the Forest',
    date: 'November 12, 2023',
    description: 'A quiet walk through the woods. The air was crisp, and the silence was only broken by the crunch of leaves underfoot. A moment of pure peace.',
    location: 'Black Forest, Germany',
    people: ['John Doe'],
    activities: ['Hiking', 'Nature', 'Reflection'],
    emotion: 'peace',
    isLegacy: true,
  },
  {
    id: '8',
    type: 'aeternySuggestion',
    aiTier: null,
    pinned: false,
    title: 'A Memory From æterny',
    date: 'On This Day...',
    description: "I noticed this momænt from your past. Would you like to relive your 'Morning Fog in the Forest' experience?",
    suggestedMomentId: '1',
  },
  {
    id: '2',
    type: 'focus',
    aiTier: 'sparkle',
    pinned: true,
    image: 'https://images.pexels.com/photos/386009/pexels-photo-386009.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    images: [
        'https://images.pexels.com/photos/386009/pexels-photo-386009.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/777059/pexels-photo-777059.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/1034662/pexels-photo-1034662.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    ],
    title: 'California Coast Adventures',
    date: 'August 22, 2023',
    description: 'An unforgettable road trip down Highway 1. We saw the dramatic cliffs of Big Sur, the iconic Golden Gate, and felt the ocean spray on our faces.',
    location: 'California, USA',
    people: ['John Doe', 'Jane Doe'],
    activities: ['Road Trip', 'Travel'],
    photoCount: 28,
    focusInfo: 'Curated from 28 photos',
    emotion: 'adventure',
    collaborators: ['JD', 'AD'],
  },
  {
    id: '3',
    type: 'standard',
    aiTier: 'flash',
    pinned: false,
    image: 'https://images.pexels.com/photos/931018/pexels-photo-931018.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    title: 'Celebration with Friends',
    date: 'July 5, 2023',
    description: 'A summer evening filled with laughter, good food, and even better company. One of those nights you wish would never end.',
    location: 'Home',
    people: ['John Doe', 'Jane Doe', 'Alex Smith'],
    activities: ['Party', 'Friends'],
    emotion: 'joy',
    comments: [
        { user: 'Alex Smith', text: 'What a great night!', date: '2023-07-06T10:00:00Z' }
    ]
  },
  {
    id: 'insight-teaser',
    type: 'insight',
    aiTier: null,
    pinned: false,
    title: "Your Story at a Glance",
    date: "AI-Powered",
    description: "Discover the patterns, connections, and emotional threads that make your story unique.",
    insightData: {
        memories: 12,
        period: 'Last 90 Days'
    }
  },
  {
    id: 'collection-teaser',
    type: 'collection',
    aiTier: null,
    pinned: false,
    title: "Curator's Studio",
    date: "New Suggestions",
    description: "æterny has found new themes in your moments. Explore these potential collections.",
    collectionData: {
        ready: 3,
        type: "collections"
    }
  },
  {
    id: 'family-teaser',
    type: 'fæmilyStoryline',
    aiTier: null,
    pinned: false,
    title: "The Fæmily Storyline",
    date: "A Shared History",
    description: "An interactive timeline of your shared history, connecting every memory into one continuous story.",
    fæmilyStorylineData: {
        members: 3,
        moments: 18
    }
  },
  {
    id: '7',
    type: 'standard',
    aiTier: 'sparkle',
    pinned: false,
    image: 'https://images.pexels.com/photos/2102416/pexels-photo-2102416.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    title: 'Wedding Anniversary',
    date: 'June 1, 2023',
    description: 'Celebrating another year together. It feels like just yesterday we started this journey, and I wouldn\'t change a thing.',
    location: 'Napa Valley',
    people: ['John Doe', 'Jane Doe'],
    activities: ['Celebration', 'Travel'],
    emotion: 'love',
    isLegacy: true,
    collaborators: ['JD', 'AD'],
    createdBy: 'AD'
  },
  {
    id: '9',
    type: 'standard',
    aiTier: 'flash',
    pinned: false,
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    title: 'Sunday Family Meal',
    date: 'November 19, 2023',
    description: 'We tried a new pasta recipe tonight. It was a huge hit! So much laughter around the table.',
    location: 'Home',
    people: ['John Doe', 'Jane Doe', 'Alex Smith'],
    activities: ['Cooking', 'Family Dinner'],
    emotion: 'joy',
    ritualId: 'weekly-reflection',
    createdBy: 'AD',
  },
];

export const initialJourneys: Journey[] = [
  {
    // FIX: Changed journey ID to be a string.
    id: '1',
    title: 'Pacific Coast Highway Trip',
    description: 'A journey from San Francisco to Los Angeles, capturing the beauty of the California coastline.',
    // FIX: Changed momentIds to be strings to match the Journey interface.
    momentIds: ['2', '7'],
    coverImage: 'https://images.pexels.com/photos/386009/pexels-photo-386009.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    isLegacy: true,
    collaborators: ['JD', 'AD'],
  }
];

export const initialSuggestedMoments: SuggestedMoment[] = [
    {
      id: 'sugg1',
      title: 'Weekend in the Mountains',
      dateRange: 'Nov 10-12, 2023',
      photos: [
        { id: 'p1', url: 'https://images.pexels.com/photos/167699/pexels-photo-167699.jpeg?auto=compress&cs=tinysrgb&w=800', suggestion: 'Best Shot' },
        { id: 'p2', url: 'https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=800' },
        { id: 'p3', url: 'https://images.pexels.com/photos/572897/pexels-photo-572897.jpeg?auto=compress&cs=tinysrgb&w=800' },
        { id: 'p4', url: 'https://images.pexels.com/photos/1528660/pexels-photo-1528660.jpeg?auto=compress&cs=tinysrgb&w=800', suggestion: 'Duplicate' },
        { id: 'p5', url: 'https://images.pexels.com/photos/2422915/pexels-photo-2422915.jpeg?auto=compress&cs=tinysrgb&w=800' },
      ]
    },
    {
      id: 'sugg2',
      title: 'Summer Beach Days',
      dateRange: 'Aug 20-25, 2023',
      photos: [
        { id: 'p6', url: 'https://images.pexels.com/photos/386009/pexels-photo-386009.jpeg?auto=compress&cs=tinysrgb&w=800', suggestion: 'Best Shot' },
        { id: 'p7', url: 'https://images.pexels.com/photos/2102416/pexels-photo-2102416.jpeg?auto=compress&cs=tinysrgb&w=800' },
        { id: 'p8', url: 'https://images.pexels.com/photos/1034662/pexels-photo-1034662.jpeg?auto=compress&cs=tinysrgb&w=800', suggestion: 'Low Quality' },
      ]
    }
];
