"use client";
import { PropsWithChildren } from 'react';
import { HelmetProvider } from 'react-helmet-async';

const HelmetWrapper = ({ children }:PropsWithChildren) => {
  return (
    <HelmetProvider>
      {children}
    </HelmetProvider>
  );
};

export default HelmetWrapper;