'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationProvider } from './components/Notification';

// Create a client
const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        {children}
      </NotificationProvider>
    </QueryClientProvider>
  );
} 