'use client';

import { NotificationProvider } from './components/Notification';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      {children}
    </NotificationProvider>
  );
} 