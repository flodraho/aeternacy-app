
import React from 'react';

const CakeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 15.75c-1.112-2.133-3.44-3.75-6.188-3.75-1.44 0-2.775.462-3.812 1.25V9.75a.75.75 0 00-.75-.75h-1.5a.75.75 0 00-.75.75v3.25c-1.037-.788-2.372-1.25-3.812-1.25-2.748 0-5.076 1.617-6.188 3.75H3v.75A2.25 2.25 0 005.25 18h13.5A2.25 2.25 0 0021 15.75v-.75h-1.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75V6.75a.75.75 0 011.5 0V9.75m0 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
);

export default CakeIcon;
