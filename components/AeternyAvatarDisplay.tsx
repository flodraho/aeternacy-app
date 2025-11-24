import React from 'react';
import { Bot, Activity, Aperture } from 'lucide-react';

interface AeternyAvatarDisplayProps {
  avatar: string | null;
  className?: string; // This className applies to the outermost element.
}

// This map will hold the component for each icon identifier
const iconMap: { [key: string]: React.ElementType } = {
  'bot-default': Bot,
  'activity': Activity,
  'aperture': Aperture,
};

const AeternyAvatarDisplay: React.FC<AeternyAvatarDisplayProps> = ({ avatar, className }) => {
  const IconComponent = avatar ? iconMap[avatar] : iconMap['bot-default'];

  if (IconComponent) {
    // For icons, we create a container and center the icon within it.
    return (
      <div className={`flex items-center justify-center bg-gray-800 ring-1 ring-white/10 ${className}`}>
        <IconComponent className="w-2/3 h-2/3 text-cyan-400" />
      </div>
    );
  }
  
  // For images, we assume the element itself is the image.
  return <img src={avatar} alt="Aeterny Avatar" className={`object-cover ${className}`} />;
};

export default AeternyAvatarDisplay;
