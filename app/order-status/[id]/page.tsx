"use client"
import { useEffect, useState, use } from 'react'; // Added 'use'
import axios from 'axios';

// 1. Fix: Tell TypeScript what 'params' looks like
interface PageProps {
  params: Promise<{ id: string }>;
}

export default function OrderStatus({ params }: PageProps) {
    // 2. Fix: Properly unwrap the async params
    const resolvedParams = use(params);
    const orderId = resolvedParams.id;

    const [order, setOrder] = useState<any>(null); // Added 'any' to stop type errors

    useEffect(() => {
        // 3. Fix: Use Environment Variable or Production URL
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://alnroy.pythonanywhere.com";
        
        axios.get(`${API_URL}/api/orders/${orderId}/`)
             .then(res => setOrder(res.data))
             .catch(err => console.error("Order fetch failed:", err));
    }, [orderId]);

    if (!order) return <div className="p-10 text-center">Loading Order Details...</div>;

    // Use a Record type for the object to satisfy TypeScript
    const statusColors: Record<string, string> = {
        'PENDING': 'bg-yellow-100 text-yellow-800',
        'VERIFYING': 'bg-blue-100 text-blue-800',
        'PAID': 'bg-green-100 text-green-800',
        'REJECTED': 'bg-red-100 text-red-800',
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
            <h1 className="text-2xl font-bold mb-4 text-center">Order Status</h1>
            
            <div className="flex justify-between items-center mb-6">
                <span className="text-gray-500">Order ID: #{order.id}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[order.status] || 'bg-gray-100'}`}>
                    {order.status}
                </span>
            </div>

            <div className="space-y-4">
                <div className="border-t pt-4">
                    <p className="text-sm text-gray-400 uppercase font-bold">Shipping To</p>
                    <p className="font-medium">{order.full_name}</p>
                    <p className="text-sm text-gray-600">{order.address}</p>
                </div>

                <div className="border-t pt-4">
                    <p className="text-sm text-gray-400 uppercase font-bold">Payment Amount</p>
                    <p className="text-xl font-black text-blue-900">₹{order.total_amount}</p>
                </div>
            </div>

            {order.status === 'VERIFYING' && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg animate-pulse text-blue-700 text-sm text-center">
                    Admin is currently checking your payment proof...
                </div>
            )}
        </div>
    );
}