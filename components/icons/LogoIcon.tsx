
import React from 'react';

const LogoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="none"
    {...props}
  >
    <text
        x="12"
        y="16.5"
        fontFamily="inherit"
        fontSize="16"
        fontWeight="bold"
        textAnchor="middle"
    >
      æ
    </text>
  </svg>
);

export default LogoIcon;
