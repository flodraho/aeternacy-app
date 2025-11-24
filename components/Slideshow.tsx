import React, { useState, useEffect } from 'react';

interface SlideshowProps {
    images: string[];
    isPlaying: boolean;
}

const Slideshow: React.FC<SlideshowProps> = ({ images, isPlaying }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (isPlaying && images.length > 1) {
            const timer = setInterval(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
            }, 6000); // Change image every 6 seconds
            return () => clearInterval(timer);
        }
    }, [isPlaying, images.length]);

    // Define multiple Ken Burns animations
    const kenBurnsAnimations = [
        'animate-ken-burns-1',
        'animate-ken-burns-2',
        'animate-ken-burns-3',
        'animate-ken-burns-4',
    ];

    if (!images || images.length === 0) {
        return <div className="absolute inset-0 w-full h-full bg-slate-800"></div>;
    }

    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden bg-black">
            {images.map((image, index) => {
                const animationClass = kenBurnsAnimations[index % kenBurnsAnimations.length];
                return (
                     <img
                        key={image + index}
                        src={image}
                        alt={`Slideshow image ${index + 1}`}
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[2000ms] ${index === currentIndex ? `opacity-100 ${animationClass}` : 'opacity-0'}`}
                     />
                );
            })}
        </div>
    );
};

export default Slideshow;