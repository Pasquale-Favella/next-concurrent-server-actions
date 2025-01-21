import type { Metadata } from 'next';
import { PropsWithChildren } from 'react';

import "./globals.css";

export const metadata: Metadata = {
  title: 'Concurrent Next.js Server Actions',
  description: 'Sample Next.js project to test Next.js server actions concurrently',
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}