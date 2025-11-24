import React, { useState } from 'react';
import { X } from 'lucide-react';

interface PhotoGridProps {
    images: string[];
}

const PhotoGrid: React.FC<PhotoGridProps> = ({ images }) => {
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);

    const openLightbox = (image: string) => setLightboxImage(image);
    const closeLightbox = () => setLightboxImage(null);

    return (
        <div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image, index) => (
                    <div key={index} className="aspect-square bg-gray-800 rounded-lg overflow-hidden cursor-pointer group" onClick={() => openLightbox(image)}>
                        <img src={image} alt={`Moment image ${index + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    </div>
                ))}
            </div>

            {lightboxImage && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in-up" onClick={closeLightbox}>
                    <button onClick={closeLightbox} className="absolute top-4 right-4 text-white bg-white/10 p-2 rounded-full hover:bg-white/20">
                        <X className="w-6 h-6" />
                    </button>
                    <img src={lightboxImage} alt="Lightbox view" className="max-w-full max-h-full object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
                </div>
            )}
        </div>
    );
};

export default PhotoGrid;