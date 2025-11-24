import React, { useState, useEffect, useCallback } from 'react';
import { generateVideo, imageUrlToPayload } from '../services/geminiService';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface LivingImagesSlideshowProps {
    images: string[];
}

type VideoStatus = {
    status: 'idle' | 'generating' | 'success' | 'error';
    url?: string;
    error?: string;
}

const LivingImagesSlideshow: React.FC<LivingImagesSlideshowProps> = ({ images }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [videos, setVideos] = useState<Record<string, VideoStatus>>({});

    const generateVideoForIndex = useCallback(async (index: number) => {
        const imageUrl = images[index];
        if (!imageUrl || (videos[imageUrl] && (videos[imageUrl].status === 'generating' || videos[imageUrl].status === 'success'))) {
            return;
        }

        setVideos(prev => ({ ...prev, [imageUrl]: { status: 'generating' } }));
        
        try {
            const imagePayload = await imageUrlToPayload(imageUrl);
            const prompt = `Create a beautiful, high-quality, short video that brings this moment to life. The theme is "Living Photograph". Animate the scene with gentle, realistic motion, like a slow zoom or a gentle parallax effect, to create the feeling of a living photograph.`;
            const videoUrl = await generateVideo(prompt, imagePayload, '16:9');
            setVideos(prev => ({ ...prev, [imageUrl]: { status: 'success', url: videoUrl } }));
        } catch (error) {
            console.error(`Failed to animate image ${imageUrl}`, error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            setVideos(prev => ({ ...prev, [imageUrl]: { status: 'error', error: errorMessage } }));
        }
    }, [images, videos]);

    useEffect(() => {
        if (images.length > 0) {
            generateVideoForIndex(currentIndex);
        }
    }, [currentIndex, images, generateVideoForIndex]);

    const goToPrevious = () => {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const goToNext = () => {
        const isLastSlide = currentIndex === images.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };
    
    const currentImageUrl = images[currentIndex];
    const currentVideo = videos[currentImageUrl];

    return (
         <div className="relative w-full max-w-4xl mx-auto">
            <div className="relative aspect-video w-full bg-black rounded-lg overflow-hidden flex items-center justify-center text-white">
                {!currentImageUrl && <p>No images in this moment.</p>}
                {currentVideo?.status === 'generating' && (
                    <>
                        <img src={currentImageUrl} alt="Generating animation..." className="w-full h-full object-contain blur-sm" />
                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-3"></div>
                             <p className="text-sm">Animating image...</p>
                        </div>
                    </>
                )}
                {currentVideo?.status === 'error' && (
                     <>
                        <img src={currentImageUrl} alt="Animation error" className="w-full h-full object-contain" />
                        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-4">
                            <p className="font-semibold text-red-400">Animation Failed</p>
                            <p className="text-xs text-slate-400 text-center mt-1">{currentVideo.error}</p>
                            {currentVideo.error?.includes("quota") && (
                                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline mt-2 text-xs text-cyan-400">
                                    Learn more about billing
                                </a>
                            )}
                        </div>
                    </>
                )}
                 {currentVideo?.status === 'success' && currentVideo.url && (
                    <video 
                        key={currentVideo.url} 
                        src={currentVideo.url} 
                        autoPlay 
                        loop 
                        muted 
                        playsInline
                        className="w-full h-full object-cover"
                    />
                )}
                 {(!currentVideo || currentVideo?.status === 'idle') && currentImageUrl && (
                    <img src={currentImageUrl} alt="Still image" className="w-full h-full object-contain" />
                 )}

                <button onClick={goToPrevious} className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full z-10">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <button onClick={goToNext} className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full z-10">
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>
            <div className="text-center mt-2 text-sm text-slate-400">
                {currentIndex + 1} / {images.length}
            </div>
        </div>
    );
};

export default LivingImagesSlideshow;