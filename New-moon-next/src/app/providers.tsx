'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import AuthRequirementModal from '@/components/Modal/AuthRequirementModal';

function GlobalAuthModal() {
  const { isAuthModalOpen, closeAuthModal } = useAuth();
  return <AuthRequirementModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 60 * 1000,
            gcTime: 60 * 60 * 1000,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster position="top-center" reverseOrder={false} />
        <GlobalAuthModal />
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
}
