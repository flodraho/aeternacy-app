
import React from 'react';

const ApplePhotosIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 120 120" {...props}>
        <defs>
            <path id="petal" d="M60,60 C30,0 90,0 60,60" />
        </defs>
        <use href="#petal" fill="#F55264" transform="rotate(0, 60, 60)" />
        <use href="#petal" fill="#F87932" transform="rotate(45, 60, 60)" />
        <use href="#petal" fill="#FBE134" transform="rotate(90, 60, 60)" />
        <use href="#petal" fill="#78C53C" transform="rotate(135, 60, 60)" />
        <use href="#petal" fill="#32BFE2" transform="rotate(180, 60, 60)" />
        <use href="#petal" fill="#2E86E5" transform="rotate(225, 60, 60)" />
        <use href="#petal" fill="#9357E3" transform="rotate(270, 60, 60)" />
        <use href="#petal" fill="#D9408D" transform="rotate(315, 60, 60)" />
    </svg>
);

export default ApplePhotosIcon;
