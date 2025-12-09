import { PexelsPhoto } from '../types';

const staticFallbackImages = [
  'https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', // aurora
  'https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', // path
  'https://images.pexels.com/photos/1528660/pexels-photo-1528660.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', // forest
  'https://images.pexels.com/photos/572897/pexels-photo-572897.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',   // mountain
  'https://images.pexels.com/photos/2422915/pexels-photo-2422915.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',    // ocean
  'https://images.pexels.com/photos/414612/pexels-photo-414612.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',     // lake reflection
  'https://images.pexels.com/photos/4065876/pexels-photo-4065876.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', // person smiling
  'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', // abstract data
  'https://images.pexels.com/photos/3127880/pexels-photo-3127880.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', // projected video
];


const getFallbackImages = (query: string, perPage: number, orientation: string, page: number): PexelsPhoto[] => {
    // A simple hashing function to get a somewhat consistent starting index for a query
    const hash = query.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
    const startIndex = Math.abs(hash % staticFallbackImages.length);

    return Array.from({ length: perPage }, (_, i) => {
        const url = staticFallbackImages[(startIndex + i + page -1) % staticFallbackImages.length];
        return {
            id: i,
            alt: query,
            width: 1920,
            height: 1280,
            url: "https://www.pexels.com",
            photographer: "Pexels",
            photographer_url: "https://www.pexels.com",
            photographer_id: 0,
            avg_color: "#5E6C77",
            src: {
                large2x: url,
                large: url,
                portrait: url,
                original: url,
                medium: url,
                small: url,
                landscape: url,
                tiny: url,
            },
            liked: false
        } as PexelsPhoto
    });
};

/**
 * Fetches images to be used in the application.
 * NOTE: The Pexels API cannot be called directly from the client-side due to CORS restrictions
 * and the security risk of exposing an API key. This service has been modified to exclusively
 * use a static list of high-quality fallback images. This resolves the "Failed to fetch" errors
 * and ensures the application runs smoothly without needing a server-side proxy.
 */
export async function fetchPexelsImages(query: string, perPage: number = 1, orientation: 'landscape' | 'portrait' | 'square' = 'landscape', page: number = 1): Promise<PexelsPhoto[]> {
    // Directly return static images to avoid client-side API calls that fail due to CORS.
    return getFallbackImages(query, perPage, orientation, page);
}
