import React from 'react';

const LoadingSpinner: React.FC = () => (
  <div className="relative w-16 h-16">
    <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-blue-500 animate-spin"></div>
    <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-blue-500 animate-spin [animation-delay:1.2s]"></div>
  </div>
);

export default LoadingSpinner;
