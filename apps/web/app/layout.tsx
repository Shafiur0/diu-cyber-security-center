import type { Metadata } from 'next';
import './globals.css';
import AuthProvider from '../components/layout/SessionProvider';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export const metadata: Metadata = {
  title: 'DIU Cyber Security Center (CSC) | Daffodil International University',
  description: 'The official platform of DIU Cyber Security Center. Explore member profiles, verified hacking certifications, upcoming Capture The Flag (CTF) events, academic notices, and interactive AI cyber roadmaps.',
  keywords: 'Cyber Security, DIU, Daffodil International University, CTF, Ethical Hacking, InfoSec, Bangladesh',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="min-h-full flex flex-col bg-[#0D0D0D] text-[#F0F0F0] antialiased">
        <AuthProvider>
          <Navbar />
          <main className="flex-grow pt-20">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
