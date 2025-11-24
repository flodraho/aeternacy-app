import React from 'react';

const TokenIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <text
        x="12"
        y="16" 
        fontFamily="'SF Pro', 'Inter', system-ui, -apple-system, sans-serif"
        fontSize="12"
        fontWeight="bold"
        fill="currentColor"
        textAnchor="middle"
        stroke="none"
    >
      æ
    </text>
  </svg>
);

export default TokenIcon;