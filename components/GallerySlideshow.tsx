import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface GallerySlideshowProps {
    images: string[];
}

const GallerySlideshow: React.FC<GallerySlideshowProps> = ({ images }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

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

    const goToSlide = (slideIndex: number) => {
        setCurrentIndex(slideIndex);
    };

    return (
        <div className="relative w-full max-w-4xl mx-auto">
            <div className="relative aspect-video w-full bg-black rounded-lg overflow-hidden">
                {images.map((image, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
                    >
                        <img src={image} alt={`Slide ${index}`} className="w-full h-full object-contain" />
                    </div>
                ))}

                <button onClick={goToPrevious} className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full z-10">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <button onClick={goToNext} className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full z-10">
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>
            <div className="flex justify-center mt-4 space-x-2">
                {images.map((_, slideIndex) => (
                    <button
                        key={slideIndex}
                        onClick={() => goToSlide(slideIndex)}
                        className={`w-12 h-12 bg-gray-800 rounded-md overflow-hidden ring-2 ${currentIndex === slideIndex ? 'ring-cyan-400' : 'ring-transparent hover:ring-white/50'}`}
                    >
                         <img src={images[slideIndex]} alt={`Thumbnail ${slideIndex}`} className="w-full h-full object-cover"/>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default GallerySlideshow;