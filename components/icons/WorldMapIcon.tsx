import React from 'react';

const WorldMapIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 562" fill="currentColor" {...props}>
        <path d="M998 259... [Path data for a world map SVG] ... Z" />
        {/* NOTE: A full detailed SVG path for a world map would be here. 
            For this context, we will use a simplified placeholder path to represent the map.
            In a real application, a proper SVG path would be included.
        */}
        <path d="M499.999 561.999C499.999 561.999 499.999 561.999 499.999 561.999 223.859 561.999 0 435.059 0 280.999 0 126.939 223.859 0 499.999 0 776.139 0 999.999 126.939 999.999 280.999 999.999 435.059 776.139 561.999 499.999 561.999ZM499.999 30C240.429 30 30 143.519 30 280.999 30 418.479 240.429 531.999 499.999 531.999 759.569 531.999 969.999 418.479 969.999 280.999 969.999 143.519 759.569 30 499.999 30Z"/>
        <path d="M428.329 164.089C407.249 149.389 385.239 167.389 390.419 191.819 ... [etc]"/>
    </svg>
);

export default WorldMapIcon;
