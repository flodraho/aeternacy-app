

import React from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children, position = 'top', className }) => {
  const positionClasses = {
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2',
  };

  const arrowClasses = {
      top: 'top-full left-1/2 -translate-x-1/2 border-x-transparent border-t-slate-900',
      bottom: 'bottom-full left-1/2 -translate-x-1/2 border-x-transparent border-b-slate-900',
      left: 'left-full top-1/2 -translate-y-1/2 border-y-transparent border-l-slate-900',
      right: 'right-full top-1/2 -translate-y-1/2 border-y-transparent border-r-slate-900',
  }

  return (
    <div className={`relative group flex items-center ${className || ''}`}>
      {children}
      <div 
        className={`absolute max-w-sm bg-slate-900 text-white text-xs rounded-md py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50 ring-1 ring-white/10 shadow-lg whitespace-pre-wrap ${positionClasses[position]}`}
      >
        {text}
        <div className={`absolute border-[4px] ${arrowClasses[position]}`}></div>
      </div>
    </div>
  );
};

export default Tooltip;