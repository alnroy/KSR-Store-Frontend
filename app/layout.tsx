import './globals.css';
import { Inter } from 'next/font/google';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { WishlistProvider } from '@/context/WishlistContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Suspense } from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: {
    default: 'KSR Bait & Tackle | Premium Fishing Gear Shop',
    template: '%s | KSR Bait & Tackle'
  },
  description: 'ProFishing Gear for serious anglers. Rods, Reels, Lures, and more from KSR Bait & Tackle.',
  keywords: ['fishing gear', 'bait', 'tackle', 'rods', 'reels', 'fishing lures', 'KSR Bait and Tackle', 'Kerala fishing shop'],
  authors: [{ name: 'KSR Bait & Tackle' }],
  creator: 'KSR Bait & Tackle',
  publisher: 'KSR Bait & Tackle',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'KSR Bait & Tackle | Premium Fishing Gear Shop',
    description: 'ProFishing Gear for serious anglers. High-quality rods, reels, and lures.',
    url: 'https://www.ksrbaitandtackle.in',
    siteName: 'KSR Bait & Tackle',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'KSR Bait & Tackle',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KSR Bait & Tackle | Premium Fishing Gear Shop',
    description: 'ProFishing Gear for serious anglers. High-quality rods, reels, and lures.',
    images: ['/og-image.jpg'],
  },
  verification: {
    google: 'ENTER-YOUR-GOOGLE-VERIFICATION-CODE-HERE',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Suspense fallback={<div className="h-16" />}>
                <Navbar />
              </Suspense>
              <main className="min-h-screen">
                {children}
              </main>
              <Footer />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}