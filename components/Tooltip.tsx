
import React, { useState } from 'react';

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ children, content }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="relative flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute bottom-full mb-2 w-max max-w-xs p-2 text-sm text-white bg-gray-900 border border-gray-700 rounded-md shadow-lg z-10">
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
