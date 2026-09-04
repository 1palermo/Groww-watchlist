import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Groww Pulse',
  description: 'Track the reasons behind your investments.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
