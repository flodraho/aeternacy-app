import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

interface LightboxGalleryProps {
    images: string[];
    onClose: () => void;
    initialIndex?: number;
}

const LightboxGallery: React.FC<LightboxGalleryProps> = ({ images, onClose, initialIndex = 0 }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isPlaying, setIsPlaying] = useState(true);

    const advanceSlide = useCallback((forward = true) => {
        if (forward) {
            setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
        } else {
            setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
        }
    }, [images.length]);

    useEffect(() => {
        let timer: number;
        if (isPlaying && images.length > 1) {
            timer = window.setInterval(() => {
                advanceSlide();
            }, 5000); // Change slide every 5 seconds
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [isPlaying, currentIndex, advanceSlide, images.length]);


    const handleManualNav = (forward: boolean) => {
        setIsPlaying(false);
        advanceSlide(forward);
    };
    
    const handlePlayPause = () => {
        setIsPlaying(prev => !prev);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') handleManualNav(false);
            if (e.key === 'ArrowRight') handleManualNav(true);
            if (e.key === 'Escape') onClose();
            if (e.key === ' ') {
                e.preventDefault();
                handlePlayPause();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, advanceSlide]); // Removed handleManualNav from deps to avoid stale closures

    if (!images || images.length === 0) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/90 z-[100] backdrop-blur-sm animate-fade-in group" style={{ animation: 'fade-in 0.3s ease-out forwards' }} onClick={onClose}>
            {/* Main Image Viewer */}
            <div className="relative w-full h-full" onClick={e => e.stopPropagation()}>
                {images.map((image, index) => (
                     <img 
                        key={image + index}
                        src={image} 
                        alt={`View ${index + 1} of ${images.length}`} 
                        className={`max-w-full max-h-full object-contain rounded-lg absolute inset-0 m-auto transition-opacity duration-700 ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`} 
                    />
                ))}
            </div>

            {/* Controls Overlay */}
            <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button onClick={(e) => {e.stopPropagation(); handleManualNav(false)}} className="text-white bg-white/10 p-2 rounded-full hover:bg-white/20 z-[101] transition-colors">
                    <ChevronLeft className="w-8 h-8" />
                </button>
                 <button onClick={(e) => {e.stopPropagation(); handleManualNav(true)}} className="text-white bg-white/10 p-2 rounded-full hover:bg-white/20 z-[101] transition-colors">
                    <ChevronRight className="w-8 h-8" />
                </button>
            </div>
            
             <button onClick={onClose} className="absolute top-4 right-4 text-white bg-white/10 p-2 rounded-full hover:bg-white/20 z-[102] transition-colors opacity-0 group-hover:opacity-100">
                <X className="w-6 h-6" />
            </button>


            {/* Thumbnails and Play/Pause */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-5xl flex flex-col items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" onClick={e => e.stopPropagation()}>
                {images.length > 1 && (
                    <button onClick={handlePlayPause} className="bg-white/10 backdrop-blur-sm p-3 rounded-full text-white hover:bg-white/20">
                        {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    </button>
                )}
                <div className="w-full flex justify-center">
                    <div className="flex gap-2 max-w-[90vw] overflow-x-auto p-2">
                        {images.map((img, index) => (
                            <button key={index} onClick={() => { setIsPlaying(false); setCurrentIndex(index);}} className={`w-16 h-16 rounded-md overflow-hidden flex-shrink-0 ring-2 transition-all ${currentIndex === index ? 'ring-cyan-400 ring-offset-2 ring-offset-black' : 'ring-transparent opacity-60 hover:opacity-100'}`}>
                                <img src={img} className="w-full h-full object-cover" alt={`Thumbnail ${index + 1}`}/>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LightboxGallery;