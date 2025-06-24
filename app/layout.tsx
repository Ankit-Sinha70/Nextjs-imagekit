import "./globals.css";
import { Providers } from './providers';
import { Toaster } from "@/components/ui/sonner";

// Metadata can be defined directly in a server component layout
// This export must be in a Server Component, so "use client" must NOT be present here.
export const metadata = {
  title: 'Next.js Fullstack App',
  description: 'A fullstack application built with Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          {children}
          {/* Toaster for notifications, place it where it can receive global notifications */}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}