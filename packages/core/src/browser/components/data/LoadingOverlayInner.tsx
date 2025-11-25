import React from 'react';

const LoadingOverlayInner: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center justify-center min-h-[200px]">
    {children}
  </div>
);

export default LoadingOverlayInner;
