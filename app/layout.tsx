import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Trivia Arena',
  description: 'Fast-paced AI-powered trivia battles in a cosmic arena.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-white min-h-screen font-sans antialiased">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.18),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(168,85,247,0.18),transparent_25%),radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.12),transparent_40%)]" />
        {children}
      </body>
    </html>
  );
}
