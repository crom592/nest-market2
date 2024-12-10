'use client';

import { SessionProvider } from 'next-auth/react';
import { useEffect } from 'react';
import { registerSW } from '../pwa';

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * A wrapper component that provides all the necessary providers for the application.
 * This includes SessionProvider for authentication and PWA registration.
 * 
 * This must be a client component as it uses React Context and PWA registration.
 */
const Providers = ({ children }: ProvidersProps) => {
  useEffect(() => {
    registerSW();
  }, []);

  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
};

export default Providers;
