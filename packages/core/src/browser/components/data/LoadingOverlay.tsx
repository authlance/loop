import React from 'react';

const LoadingOverlay: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div className="absolute inset-0 z-10 bg-gray-500 bg-opacity-75">
    {children}
  </div>
);

export default LoadingOverlay;
