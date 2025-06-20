'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationProvider } from './components/Notification';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from '@/components/ui/sonner';

// Create a client
const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <SessionProvider>
          {children}
        </SessionProvider>
      </NotificationProvider>
    </QueryClientProvider>
  );
} 