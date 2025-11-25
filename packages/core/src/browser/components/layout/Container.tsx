import React from 'react';

const Container: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl">
    {children}
  </div>
);

export default Container;
