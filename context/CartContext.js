"use client"
import { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    // Load cart from local storage on startup
    useEffect(() => {
        const savedCart = localStorage.getItem('fishing_cart');
        if (savedCart) setCart(JSON.parse(savedCart));
    }, []);

    // Save cart to local storage whenever it changes
    useEffect(() => {
        localStorage.setItem('fishing_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product) => {
        setCart((prevCart) => {
            const exists = prevCart.find(item => item.id === product.id);
            if (exists) {
                return prevCart.map(item => 
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prevCart, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    };

    const clearCart = () => setCart([]);

    // CRITICAL FIX: Dynamically use offer_price if it exists, otherwise use regular price
    const totalPrice = cart.reduce((acc, item) => {
        const activePrice = item.offer_price ? parseFloat(item.offer_price) : parseFloat(item.price);
        return acc + (activePrice * item.quantity);
    }, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, totalPrice }}>
            {children}
        </CartContext.Provider>
    );
};