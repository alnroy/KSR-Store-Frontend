"use client"
import { useState, useContext, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CartContext } from '@/context/CartContext';
import { AuthContext } from '@/context/AuthContext';
import { WishlistContext } from '@/context/WishlistContext';
import CartDrawer from './CartDrawer';
import SidebarMenu from './SidebarMenu';
import axios from 'axios';
import { Heart, ShoppingCart, Menu, Search, User, LogOut, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { cart } = useContext(CartContext);
  const { wishlist } = useContext(WishlistContext);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { isLoggedIn, logout, user } = useContext(AuthContext);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mounted, setMounted] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { setMounted(true); }, []);

  // Fetch Admin Status
  useEffect(() => {
    if (isLoggedIn && mounted) {
      const token = localStorage.getItem('access_token');
      if (token) {
        axios.get('https://alnroy.pythonanywhere.com/api/auth/me/', {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(res => setIsAdmin(res.data.is_staff))
          .catch(() => setIsAdmin(false));
      }
    }
  }, [isLoggedIn, mounted]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchTerm) params.set('search', searchTerm);
    else params.delete('search');
    router.push(`/?${params.toString()}`);
    setIsSearchOpen(false);
  };

  return (
    <>

      {/* --- 2. MAIN NAVBAR --- */}
      <header className="sticky top-0 z-50 bg-slate-900 text-white shadow-2xl">
        <div className="max-w-[1500px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-2">
            {/* HAMBURGER MENU (Now on Left) */}
            <button suppressHydrationWarning onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-300 hover:text-white transition-colors">
              <Menu size={26} />
            </button>

            {/* LOGO */}
            <Link href="/" className="text-xl md:text-2xl font-black tracking-tighter text-blue-400 shrink-0 italic">
              KSR &nbsp;<span className="text-white not-italic">BAIT & TACKLE</span>
            </Link>
          </div>

          {/* DESKTOP SEARCH */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl hidden md:flex h-11 ml-10">
            <input
              type="text"
              suppressHydrationWarning
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for Rods, Reels, or Lures..."
              className="w-full px-5 bg-white text-slate-900 rounded-l-2xl outline-none font-bold placeholder:text-slate-400 text-sm shadow-inner"
            />
            <button type="submit" suppressHydrationWarning className="bg-blue-600 hover:bg-blue-500 px-8 rounded-r-2xl font-black transition-all">🔍</button>
          </form>

          {/* RIGHT SIDE ICONS */}
          <div className="flex items-center gap-4 md:gap-8">
            <Link href="/" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors hidden md:block">Home</Link>
            {/* MOBILE SEARCH ICON */}
            <button 
              suppressHydrationWarning 
              onClick={() => setIsSearchOpen(!isSearchOpen)} 
              className="md:hidden p-2 text-slate-300 hover:text-white transition-colors"
            >
              <Search size={22} />
            </button>

            {/* WISHLIST ICON */}
            <button 
              suppressHydrationWarning 
              onClick={() => setIsSidebarOpen(true)} 
              className="relative p-2 group transition-all active:scale-95"
            >
              <Heart 
                size={22} 
                className="group-hover:fill-red-500 group-hover:text-red-500 transition-all" 
              />
              {mounted && wishlist.length > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-[8px] font-black w-3.5 h-3.5 flex items-center justify-center rounded-full border border-slate-900">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* CART ICON */}
            <button suppressHydrationWarning onClick={() => setIsCartOpen(true)} className="relative p-2 group transition-all active:scale-95">
              <ShoppingCart size={22} className="group-hover:text-blue-400 transition-all" />
              {mounted && cart.length > 0 && (
                <span className="absolute top-1 right-1 bg-blue-500 text-[8px] font-black w-3.5 h-3.5 flex items-center justify-center rounded-full border border-slate-900">
                  {cart.length}
                </span>
              )}
            </button>

            {/* DESKTOP NAV LINKS */}
            <div className="hidden md:flex items-center gap-6 ml-4 min-w-[200px] justify-end">
              {mounted && (
                <>
                  {isLoggedIn ? (
                    <>
                      {isAdmin && (
                        <Link href="/admin-dashboard" className="bg-red-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase hover:bg-red-500 shadow-lg shadow-red-900/20">
                          Admin
                        </Link>
                      )}
                      <Link href="/my-orders" className="text-xs font-black uppercase tracking-widest hover:text-blue-400 transition-colors">Orders</Link>
                      <button onClick={logout} className="text-red-400 text-xs font-black uppercase tracking-widest hover:text-red-300">Logout</button>
                    </>
                  ) : (
                    <Link href="/login" className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-xl text-xs font-black uppercase transition-all shadow-lg shadow-blue-900/20">Login</Link>
                  )}
                  <button 
                    onClick={(e) => {
                      if (!isLoggedIn) {
                        router.push('/login?redirect=profile&message=login_required');
                      } else {
                        router.push('/profile');
                      }
                    }}
                    className="text-2xl hover:opacity-70 transition-opacity"
                  >
                    👤
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* MOBILE SEARCH DROPDOWN (White Background) */}
        {isSearchOpen && (
          <div className="md:hidden p-4 bg-slate-800 border-t border-slate-700 animate-in slide-in-from-top duration-200">
            <form onSubmit={handleSearchSubmit} className="flex h-12 w-full shadow-2xl">
              <input
                autoFocus
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search gear..."
                className="flex-1 px-5 bg-white text-slate-900 rounded-l-2xl outline-none text-base font-bold placeholder:text-slate-400"
              />
              <button suppressHydrationWarning type="submit" className="bg-blue-600 px-6 rounded-r-2xl font-black">🔍</button>
            </form>
          </div>
        )}

      </header>
      <SidebarMenu isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      {/* --- 4. OFFICIAL WHATSAPP FLOATING BUTTON --- */}
      <a
        href="https://wa.me/917511136171?text=Hi%20KSR%20Bait%20%26%20Tackle,%20I'm%20interested%20in%20some%20fishing%20gear!"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-[100] bg-[#25D366] text-white w-16 h-16 rounded-full shadow-[0_10px_40px_rgba(37,211,102,0.4)] flex items-center justify-center hover:scale-110 transition-all active:scale-95 group"
      >
        <svg width="35" height="35" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        onItemClick={(item) => {
          const params = new URLSearchParams(searchParams.toString());
          params.set('product', item.id.toString());
          router.push(`/?${params.toString()}#products`);
          setIsCartOpen(false);
        }}
      />
    </>
  );
}