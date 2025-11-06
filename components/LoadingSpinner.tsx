
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
      <span className="text-indigo-300">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
