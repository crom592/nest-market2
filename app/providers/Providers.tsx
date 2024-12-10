'use client';

import { SessionProvider } from 'next-auth/react';

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * A wrapper component that provides all the necessary providers for the application.
 * This includes SessionProvider for authentication state management.
 * 
 * This must be a client component as it uses React Context.
 */
const Providers = ({ children }: ProvidersProps) => {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
};

export default Providers;
