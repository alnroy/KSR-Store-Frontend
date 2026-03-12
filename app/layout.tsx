import './globals.css';
import { Inter } from 'next/font/google';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { WishlistProvider } from '@/context/WishlistContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Suspense } from 'react';

const inter = Inter({ subsets: ['latin'] });


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