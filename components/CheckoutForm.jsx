// components/CheckoutForm.jsx
import React, { useState, useContext } from 'react';
import { createOrder } from '@/lib/api';
import { CartContext } from '@/context/CartContext';

export default function CheckoutForm() {
    const { cart, totalPrice } = useContext(CartContext);
    const [loading, setLoading] = useState(false);
    const [orderId, setOrderId] = useState(null);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        address: '',
        transaction_id: '',
    });
    const [screenshot, setScreenshot] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append('full_name', formData.full_name);
        data.append('email', formData.email);
        data.append('address', formData.address);
        data.append('total_amount', totalPrice);
        data.append('transaction_id', formData.transaction_id);
        if (screenshot) data.append('payment_screenshot', screenshot);

        try {
            const response = await createOrder(data);
            setOrderId(response.data.id);
            alert("Order Submitted! Admin will verify your payment soon.");
        } catch (error) {
            console.error("Order failed", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto p-4 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Checkout</h2>
            <input type="text" placeholder="Full Name" required className="w-full p-2 border rounded" 
                   onChange={e => setFormData({...formData, full_name: e.target.value})} />
            
            <input type="email" placeholder="Email" required className="w-full p-2 border rounded" 
                   onChange={e => setFormData({...formData, email: e.target.value})} />

            <textarea placeholder="Shipping Address" required className="w-full p-2 border rounded" 
                      onChange={e => setFormData({...formData, address: e.target.value})} />

            <div className="p-4 border-2 border-dashed border-blue-200 bg-blue-50 rounded text-center">
                <p className="text-sm font-semibold mb-2">Upload Payment Screenshot</p>
                <input type="file" accept="image/*" required 
                       onChange={e => setScreenshot(e.target.files[0])} />
            </div>

            <input type="text" placeholder="UTR / Transaction ID (12 digits)" required className="w-full p-2 border rounded" 
                   onChange={e => setFormData({...formData, transaction_id: e.target.value})} />

            <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold">
                {loading ? "Processing..." : `Confirm Purchase (₹${totalPrice})`}
            </button>
        </form>
    );
}