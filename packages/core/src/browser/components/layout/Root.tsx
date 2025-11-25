import React from 'react';

export interface RootProps {
  className?: string;
  children: React.ReactNode;
}

const Root: React.FC<RootProps> = ({ children, className }) => (
  <div className={`flex flex-col w-full h-full text-body font-sans ${className}`}>
    {children}
  </div>
);

export default Root;
