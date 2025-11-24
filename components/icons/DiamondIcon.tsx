
import React from 'react';

const DiamondIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="text-amber-300" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 3.25l-6 6 7.5 7.5 7.5-7.5-6-6h-3zM11.25 3.25v17.5" />
    </svg>
);

export default DiamondIcon;
