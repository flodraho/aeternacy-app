import React from 'react';

interface StarIconProps extends React.SVGProps<SVGSVGElement> {
    filled?: boolean;
}

const StarIcon: React.FC<StarIconProps> = ({ filled, ...props }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill={filled ? "currentColor" : "none"} 
        stroke="currentColor" 
        strokeWidth={1.5} 
        {...props}
    >
        <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.321h5.365c.34 0 .48.45.205.65l-4.24 3.51a.563.563 0 00-.18.57l1.528 4.96a.562.562 0 01-.84.622l-4.42-3.232a.563.563 0 00-.65 0l-4.42 3.232a.562.562 0 01-.84-.622l1.528-4.96a.563.563 0 00-.18-.57l-4.24-3.51a.563.563 0 01.205-.65h5.365a.563.563 0 00.475-.321l2.125-5.11z" 
        />
    </svg>
);

export default StarIcon;