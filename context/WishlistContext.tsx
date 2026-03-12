"use client"
import { createContext, useState, useEffect } from 'react';

export const WishlistContext = createContext<any>(null);

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
    const [wishlist, setWishlist] = useState<any[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('ksr_wishlist');
        if (saved) setWishlist(JSON.parse(saved));
    }, []);

    useEffect(() => {
        localStorage.setItem('ksr_wishlist', JSON.stringify(wishlist));
    }, [wishlist]);

    const toggleWishlist = (product: any) => {
        setWishlist(prev => {
            const exists = prev.find(item => item.id === product.id);
            if (exists) {
                return prev.filter(item => item.id !== product.id);
            }
            return [...prev, product];
        });
    };

    const isInWishlist = (productId: number) => {
        return wishlist.some(item => item.id === productId);
    };

    const clearWishlist = () => setWishlist([]);

    return (
        <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist, clearWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};
