"use client"
import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/context/AuthContext';
import Swal from 'sweetalert2';

const AdminDashboard = () => {
    const { isLoggedIn } = useContext(AuthContext);
    const router = useRouter();

    // --- CORE STATE ---
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('orders');

    // --- MODALS & FETCH ---
    const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [availableAttributes, setAvailableAttributes] = useState([]);
    const [videos, setVideos] = useState([]);
    
    // --- NOTIFICATIONS ---
    const [unseenOrdersCount, setUnseenOrdersCount] = useState(0);

    // --- PRODUCT FORM STATE ---
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [pName, setPName] = useState('');
    const [pBrand, setPBrand] = useState('');
    const [pDesc, setPDesc] = useState('');
    const [pPrice, setPPrice] = useState('');
    const [pOfferPrice, setPOfferPrice] = useState('');
    const [pIsCombo, setPIsCombo] = useState(false);
    const [pIsHeroMarquee, setPIsHeroMarquee] = useState(false);
    const [pStock, setPStock] = useState('10');

    const [pCategory, setPCategory] = useState('');
    const [pImage, setPImage] = useState(null); // Primary
    const [pImages, setPImages] = useState([]); // Multiple gallery images

    // --- VARIANTS & SPECS ---
    const [pVariants, setPVariants] = useState([]);
    const [pSpecs, setPSpecs] = useState([{ key: '', value: '' }]);

    // --- CATEGORY FORM ---
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [cName, setCName] = useState('');
    const [cImage, setCImage] = useState(null);
    const [pBrandImage, setPBrandImage] = useState(null); // Brand logo image for new brands

    // --- BRAND FORM ---
    const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
    const [brandNameInput, setBrandNameInput] = useState('');
    const [brandLogoInput, setBrandLogoInput] = useState(null);

    const getValidImageUrl = (url) => {
        if (!url) return '';
        return url.startsWith('http') ? url : `https://alnroy.pythonanywhere.com${url}`;
    };

    useEffect(() => {
        if (activeTab === 'orders' && orders.length > 0) {
            localStorage.setItem('admin_last_seen_orders', orders.length);
            setUnseenOrdersCount(0);
        }
    }, [activeTab, orders]);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) { router.push('/login'); return; }

        axios.get('https://alnroy.pythonanywhere.com/api/auth/me/', {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            if (res.data.is_staff || res.data.is_superuser) {
                setIsAdmin(true);
                fetchProductsAndCategories();
                fetchOrders();
            } else {
                router.push('/');
            }
        }).catch(() => router.push('/login'))
            .finally(() => setLoading(false));
    }, [router]);

    const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
            const token = localStorage.getItem('access_token');
            const res = await axios.get('https://alnroy.pythonanywhere.com/api/orders/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const fetchedOrders = res.data.results || res.data;
            setOrders(fetchedOrders);
            
            const lastSeen = parseInt(localStorage.getItem('admin_last_seen_orders')) || 0;
            if (fetchedOrders.length > lastSeen) {
                setUnseenOrdersCount(fetchedOrders.length - lastSeen);
            }
        } catch (err) { console.error("Order fetch failed", err); }
        finally { setLoadingOrders(false); }
    };

    const fetchProductsAndCategories = async () => {
        try {
            const [prodRes, catRes, attrRes, brandRes, vidRes] = await Promise.all([
                axios.get('https://alnroy.pythonanywhere.com/api/products/'),
                axios.get('https://alnroy.pythonanywhere.com/api/categories/'),
                axios.get('https://alnroy.pythonanywhere.com/api/attributes/'),
                axios.get('https://alnroy.pythonanywhere.com/api/brands/'),
                axios.get('https://alnroy.pythonanywhere.com/api/videos/')
            ]);
            setProducts(prodRes.data.results || prodRes.data);
            setCategories(catRes.data.results || catRes.data);
            setAvailableAttributes(attrRes.data.results || attrRes.data);
            setBrands(brandRes.data.results || brandRes.data);
            setVideos(vidRes.data.results || vidRes.data);
        } catch (err) { console.error("Sync error", err); }
    };

    // --- DELETE PRODUCT ---
    const handleDeleteProduct = async (product) => {
        const result = await Swal.fire({
            title: `Delete ${product.name}?`,
            text: "This will remove all associated gallery images and variants. This action cannot be undone!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, Delete It',
            cancelButtonText: 'Cancel',
        });
        if (!result.isConfirmed) return;
        const token = localStorage.getItem('access_token');
        try {
            await axios.delete(`https://alnroy.pythonanywhere.com/api/products/${product.id}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchProductsAndCategories();
            Swal.fire({ icon: 'success', title: 'Product Deleted', timer: 1500, showConfirmButton: false });
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Delete Failed', text: err.response?.data?.detail || 'Could not delete product.' });
        }
    };

    // --- DELETE CATEGORY ---
    const handleDeleteCategory = async (cat) => {
        const result = await Swal.fire({
            title: `Delete "${cat.name}"?`,
            text: 'Warning: All products inside this category will also be deleted!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, Delete Category',
            cancelButtonText: 'Cancel',
        });
        if (!result.isConfirmed) return;
        const token = localStorage.getItem('access_token');
        try {
            await axios.delete(`https://alnroy.pythonanywhere.com/api/categories/${cat.id}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchProductsAndCategories();
            Swal.fire({ icon: 'success', title: 'Category Deleted', timer: 1500, showConfirmButton: false });
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Delete Failed', text: err.response?.data?.detail || 'Could not delete category.' });
        }
    };

    // --- SAVE BRAND ---
    const handleSaveBrand = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('access_token');
        const formData = new FormData();
        formData.append('name', brandNameInput);
        if (brandLogoInput) formData.append('logo', brandLogoInput);

        try {
            await axios.post('https://alnroy.pythonanywhere.com/api/brands/', formData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            setIsBrandModalOpen(false);
            setBrandNameInput('');
            setBrandLogoInput(null);
            fetchProductsAndCategories();
            Swal.fire({ icon: 'success', title: 'Brand Added' });
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Failed to add brand', text: JSON.stringify(err.response?.data) });
        }
    };

    // --- DELETE BRAND ---
    const handleDeleteBrand = async (brand) => {
        const result = await Swal.fire({
            title: `Delete "${brand.name}"?`,
            text: 'This will remove the brand logo and name from the system.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, Delete Brand',
            cancelButtonText: 'Cancel',
        });
        if (!result.isConfirmed) return;
        const token = localStorage.getItem('access_token');
        try {
            await axios.delete(`https://alnroy.pythonanywhere.com/api/brands/${brand.id}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchProductsAndCategories();
            Swal.fire({ icon: 'success', title: 'Brand Deleted', timer: 1500, showConfirmButton: false });
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Delete Failed', text: err.response?.data?.detail || 'Could not delete brand.' });
        }
    };

    // --- ORDER ACTIONS ---
    const updateOrderStatus = async (orderId, newStatus) => {
        const token = localStorage.getItem('access_token');
        try {
            await axios.patch(`https://alnroy.pythonanywhere.com/api/orders/${orderId}/`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
            fetchOrders();
            setSelectedOrderDetails(null);
            Swal.fire({ icon: 'success', title: 'Order Updated', text: `Status changed to ${newStatus}`, timer: 1500 });
        } catch (err) { Swal.fire({ icon: 'error', title: 'Failed to update order status' }); }
    };

    const handleSaveProduct = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('access_token');
        const formData = new FormData();

        formData.append('name', pName);
        formData.append('brand', pBrand || '');
        formData.append('description', pDesc);
        formData.append('price', pPrice);
        formData.append('offer_price', pOfferPrice || '');
        formData.append('is_combo', pIsCombo ? 'true' : 'false');
        formData.append('is_hero_marquee', pIsHeroMarquee ? 'true' : 'false');
        formData.append('stock', pStock);
        formData.append('category', pCategory);

        const specsObj = {};
        pSpecs.forEach(s => { if (s.key) specsObj[s.key] = s.value; });
        formData.append('specifications', JSON.stringify(specsObj));
        formData.append('variants_data', JSON.stringify(pVariants));

        if (pImage) formData.append('image', pImage);
        pImages.forEach((img) => formData.append('uploaded_images', img));

        try {
            const config = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } };

            if (pBrand && pBrandImage) {
                const brandFormData = new FormData();
                brandFormData.append('name', pBrand);
                brandFormData.append('logo', pBrandImage);
                const existingBrand = brands.find(b => b.name.toLowerCase() === pBrand.toLowerCase());
                try {
                    if (existingBrand) {
                        await axios.patch(`https://alnroy.pythonanywhere.com/api/brands/${existingBrand.id}/`, brandFormData, config);
                    } else {
                        await axios.post('https://alnroy.pythonanywhere.com/api/brands/', brandFormData, config);
                    }
                } catch (bErr) { console.error("Brand sync error", bErr); }
            }

            if (editingProduct) {
                await axios.patch(`https://alnroy.pythonanywhere.com/api/products/${editingProduct.id}/`, formData, config);
            } else {
                await axios.post('https://alnroy.pythonanywhere.com/api/products/', formData, config);
            }
            setIsProductModalOpen(false);
            fetchProductsAndCategories();
            Swal.fire({ icon: 'success', title: 'Inventory Updated' });
        } catch (err) {
            console.error("400 Error details:", err.response?.data);
            Swal.fire({ icon: 'error', title: 'Save Failed', text: JSON.stringify(err.response?.data) });
        }
    };

    const handleSaveCategory = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('access_token');
        const formData = new FormData();
        formData.append('name', cName);
        formData.append('slug', cName.toLowerCase().replace(/ /g, '-'));
        if (cImage) formData.append('image', cImage);

        try {
            await axios.post('https://alnroy.pythonanywhere.com/api/categories/', formData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            setIsCategoryModalOpen(false);
            setCName('');
            setCImage(null);
            fetchProductsAndCategories();
            Swal.fire({ icon: 'success', title: 'Category Added' });
        } catch (err) { Swal.fire({ icon: 'error', title: 'Failed to add category' }); }
    };

    // --- ATTRIBUTE FORM ---
    const [isAttributeModalOpen, setIsAttributeModalOpen] = useState(false);
    const [attrName, setAttrName] = useState('');

    const handleSaveAttribute = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('access_token');
        try {
            await axios.post('https://alnroy.pythonanywhere.com/api/attributes/', { name: attrName }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsAttributeModalOpen(false);
            setAttrName('');
            fetchProductsAndCategories();
            Swal.fire({ icon: 'success', title: 'Attribute Added' });
        } catch (err) { Swal.fire({ icon: 'error', title: 'Failed to add attribute' }); }
    };

    const handleDeleteAttribute = async (attr) => {
        const result = await Swal.fire({
            title: `Delete "${attr.name}"?`,
            text: 'Warning: This may affect existing product variants!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, Delete',
            cancelButtonText: 'Cancel',
        });
        if (!result.isConfirmed) return;
        const token = localStorage.getItem('access_token');
        try {
            await axios.delete(`https://alnroy.pythonanywhere.com/api/attributes/${attr.id}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchProductsAndCategories();
            Swal.fire({ icon: 'success', title: 'Attribute Deleted', timer: 1500, showConfirmButton: false });
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Delete Failed', text: err.response?.data?.detail || 'Could not delete attribute.' });
        }
    };

    // --- VIDEO STATE & CRUD ---
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [vTitle, setVTitle] = useState('');
    const [vFile, setVFile] = useState(null);
    const [vProduct, setVProduct] = useState('');

    const handleSaveVideo = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('access_token');
        const formData = new FormData();
        formData.append('title', vTitle);
        formData.append('product', vProduct);
        if (vFile) formData.append('video_file', vFile);

        try {
            await axios.post('https://alnroy.pythonanywhere.com/api/videos/', formData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            setIsVideoModalOpen(false);
            setVTitle('');
            setVFile(null);
            setVProduct('');
            fetchProductsAndCategories();
            Swal.fire({ icon: 'success', title: 'Video Added' });
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Failed to add video', text: JSON.stringify(err.response?.data) });
        }
    };
    
    const handleDeleteVideo = async (vid) => {
        const result = await Swal.fire({
            title: `Delete Video?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Delete',
        });
        if (!result.isConfirmed) return;
        const token = localStorage.getItem('access_token');
        try {
            await axios.delete(`https://alnroy.pythonanywhere.com/api/videos/${vid.id}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchProductsAndCategories();
            Swal.fire({ icon: 'success', title: 'Deleted', timer: 1500, showConfirmButton: false });
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Delete Failed' });
        }
    };

    const addVariantRow = () => setPVariants([...pVariants, { attribute: '', value: '', price_modifier: 0, stock: 10 }]);
    const updateVariantRow = (index, field, value) => {
        const v = [...pVariants];
        v[index][field] = value;
        setPVariants(v);
    };
    const removeVariantRow = (index) => setPVariants(pVariants.filter((_, i) => i !== index));

    if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-slate-400 animate-pulse">KSR SECURE PORTAL...</div>;

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-slate-900 text-white pt-10 pb-6 px-4 shadow-xl border-b-4 border-blue-600">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <h1 className="text-3xl font-black text-blue-400 italic">KSR <span className="text-white not-italic">ADMIN</span></h1>
                    <div className="bg-blue-600 text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest">Live Control Panel</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="max-w-6xl mx-auto px-4 mt-8">
                <div className="grid grid-cols-2 lg:grid-cols-7 md:grid-cols-4 bg-white rounded-2xl shadow-sm p-1 border border-slate-200 overflow-hidden relative">
                    {['orders', 'products', 'categories', 'brands', 'attributes', 'videos', 'analytics'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-4 text-[10px] md:text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === tab ? 'bg-slate-900 text-white shadow-lg rounded-xl' : 'text-slate-400 hover:text-slate-900'}`}
                        >
                            {tab}
                            {tab === 'orders' && unseenOrdersCount > 0 && (
                                <span className="absolute -top-1 right-2 lg:right-4 bg-red-500 text-white text-[8px] px-2 py-0.5 rounded-full animate-bounce">
                                    {unseenOrdersCount} New
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* TAB CONTENTS */}
            <div className="max-w-6xl mx-auto px-4 mt-6 md:mt-10">
                {activeTab === 'orders' && (
                    <div className="bg-white p-4 md:p-8 rounded-[2rem] shadow-sm border border-slate-100">
                        <h2 className="text-2xl font-black text-slate-900 mb-8">Live Orders</h2>
                        {loadingOrders ? <p className="animate-pulse font-bold text-slate-400">Loading orders...</p> : (
                            <div className="space-y-4">
                                {orders.map(order => (
                                    <div key={order.id} className="bg-slate-50 p-4 md:p-6 rounded-[1.5rem] border border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                                        <div className="w-full">
                                            <div className="flex justify-between items-center w-full mb-1">
                                                <p className="text-[10px] font-black text-blue-600 uppercase">Order #{order.id}</p>
                                                <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider ${order.status === 'PENDING' ? 'bg-amber-100 text-amber-600' : order.status === 'PAID' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>{order.status}</span>
                                            </div>
                                            <h3 className="font-bold text-slate-900">{order.full_name}</h3>
                                            <p className="text-xs text-slate-500 font-bold mb-3">Total: ₹{order.total_amount}</p>
                                        </div>
                                        <button onClick={() => setSelectedOrderDetails(order)} className="w-full md:w-auto bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap">View Action</button>
                                    </div>
                                ))}
                                {orders.length === 0 && <p className="text-slate-400 font-bold">No orders found.</p>}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'categories' && (
                    <div className="bg-white p-4 md:p-8 rounded-[2rem] shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-10">
                            <h2 className="text-2xl font-black text-slate-900">Categories</h2>
                            <button onClick={() => setIsCategoryModalOpen(true)} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs md:text-sm shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all">+ Add Category</button>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {categories.map(cat => (
                                <div key={cat.id} className="bg-slate-50 border border-slate-100 p-4 md:p-6 rounded-[1.5rem] text-center shadow-sm flex flex-col items-center gap-3">
                                    <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl border border-slate-100 mb-2 overflow-hidden flex items-center justify-center p-2 shrink-0">
                                        {cat.image ? <img src={getValidImageUrl(cat.image)} alt={cat.name} className="max-w-full max-h-full object-contain" /> : <span className="text-slate-200 font-black text-[9px] uppercase">No Image</span>}
                                    </div>
                                    <p className="font-black text-slate-900 uppercase tracking-widest text-xs md:text-sm flex-1">{cat.name}</p>
                                    <button onClick={() => handleDeleteCategory(cat)} className="w-full bg-red-50 border border-red-100 hover:bg-red-500 hover:text-white hover:border-red-500 text-red-500 py-2 px-3 rounded-xl font-black text-[9px] uppercase transition-all mb-auto mt-2">🗑️ Delete</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'brands' && (
                    <div className="bg-white p-4 md:p-8 rounded-[2rem] shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-10">
                            <h2 className="text-2xl font-black text-slate-900">Brands</h2>
                            <button onClick={() => setIsBrandModalOpen(true)} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs md:text-sm shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all">+ Add Brand</button>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {brands.map(brand => (
                                <div key={brand.id} className="bg-slate-50 border border-slate-100 p-4 rounded-[1.5rem] flex flex-col items-center shadow-sm">
                                    <div className="w-16 h-16 md:w-24 md:h-24 bg-white rounded-2xl border border-slate-100 mb-4 overflow-hidden flex items-center justify-center p-2">
                                        {brand.logo ? <img src={getValidImageUrl(brand.logo)} alt={brand.name} className="max-w-full max-h-full object-contain" /> : <span className="text-slate-200 font-black text-xs uppercase">No Logo</span>}
                                    </div>
                                    <p className="font-black text-slate-900 uppercase tracking-widest text-[10px] md:text-xs mb-3">{brand.name}</p>
                                    <button onClick={() => handleDeleteBrand(brand)} className="bg-red-50 border border-red-100 hover:bg-red-500 hover:text-white hover:border-red-500 text-red-500 py-2 px-4 rounded-xl font-black text-[8px] uppercase transition-all">🗑️ Delete</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {activeTab === 'products' && (
                    <div className="bg-white p-4 md:p-8 rounded-[2rem] shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-10">
                            <h2 className="text-2xl font-black text-slate-900">Gear Management</h2>
                            <button
                                onClick={() => {
                                    setEditingProduct(null); setPName(''); setPBrand(''); setPBrandImage(null); setPDesc(''); setPPrice('');
                                    setPOfferPrice(''); setPSpecs([{ key: '', value: '' }]); setPVariants([]); setPCategory(categories[0]?.id || ''); setPImages([]); setPImage(null); setIsProductModalOpen(true);
                                }}
                                className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs md:text-sm shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all"
                            >
                                + Add Gear
                            </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                            {products.map((p) => (
                                <div key={p.id} className="bg-slate-50/50 border border-slate-100 p-3 md:p-5 rounded-[1.5rem] group hover:bg-white hover:shadow-xl transition-all flex flex-col">
                                    <div className="aspect-square rounded-2xl overflow-hidden mb-4 relative bg-white">
                                        <img src={getValidImageUrl(p.image)} className="w-full h-full object-contain" alt="" />
                                        {p.is_hero_marquee && <span className="absolute top-2 left-2 bg-orange-500 text-white text-[8px] font-black px-2 py-1 rounded-md uppercase">Hero</span>}
                                        <span className={`absolute top-2 right-2 text-[8px] font-black px-2 py-1 rounded-md uppercase ${p.stock > 0 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>{p.stock} Left</span>
                                    </div>
                                    <p className="text-[10px] font-black text-blue-600 uppercase mb-1">{p.brand_name || 'Generic'}</p>
                                    <h3 className="font-bold text-xs md:text-sm text-slate-900 line-clamp-2 md:line-clamp-1 h-8 md:h-auto">{p.name}</h3>
                                    <div className="mt-auto pt-4 flex gap-2">
                                        <button
                                            onClick={() => {
                                                setEditingProduct(p); setPName(p.name || ''); setPBrand(p.brand || ''); setPBrandImage(null); setPDesc(p.description || '');
                                                setPPrice(p.price ?? ''); setPOfferPrice(p.offer_price ?? ''); setPStock(p.stock ?? 10); setPCategory(p.category || ''); setPIsHeroMarquee(!!p.is_hero_marquee);
                                                setPVariants(p.variants || []); setPImages([]); const loadedSpecs = Object.entries(p.specifications || {}).map(([key, value]) => ({ key, value }));
                                                setPSpecs(loadedSpecs.length ? loadedSpecs : [{ key: '', value: '' }]); setIsProductModalOpen(true);
                                            }}
                                            className="flex-1 bg-white border border-slate-200 py-3 rounded-xl font-black text-[10px] uppercase shadow-sm hover:border-slate-300 transition-all"
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button onClick={() => handleDeleteProduct(p)} className="bg-red-50 border border-red-100 hover:bg-red-500 hover:text-white hover:border-red-500 text-red-500 px-3 py-3 rounded-xl font-black text-[10px] uppercase transition-all">🗑️</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'attributes' && (
                    <div className="bg-white p-4 md:p-8 rounded-[2rem] shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-10">
                            <h2 className="text-2xl font-black text-slate-900">Product Attributes</h2>
                            <button onClick={() => setIsAttributeModalOpen(true)} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs md:text-sm shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all">+ Add Attribute</button>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {availableAttributes.map(attr => (
                                <div key={attr.id} className="bg-slate-50 border border-slate-100 p-6 rounded-[1.5rem] flex flex-col items-center shadow-sm">
                                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4 font-black">
                                        {attr.name[0]}
                                    </div>
                                    <p className="font-black text-slate-900 uppercase tracking-widest text-[10px] md:text-xs mb-3">{attr.name}</p>
                                    <button onClick={() => handleDeleteAttribute(attr)} className="bg-red-50 border border-red-100 hover:bg-red-500 hover:text-white hover:border-red-500 text-red-500 py-2 px-4 rounded-xl font-black text-[8px] uppercase transition-all">🗑️ Delete</button>
                                </div>
                            ))}
                        </div>
                        {availableAttributes.length === 0 && <p className="text-slate-400 font-bold text-center py-10">No attributes found. Create "Size" or "Length" to start using variants.</p>}
                    </div>
                )}
                {activeTab === 'analytics' && (
                    <div className="space-y-8">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Gross Income</p>
                                <h3 className="text-3xl font-black text-slate-900 mb-2">₹{orders.reduce((acc, o) => acc + (parseFloat(o.total_amount) || 0), 0).toLocaleString()}</h3>
                                <div className="flex items-center gap-2 text-green-500 font-bold text-xs">
                                    <span>↑ 12%</span>
                                    <span className="text-slate-400">vs Previous Month</span>
                                </div>
                            </div>
                            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Active Orders</p>
                                <h3 className="text-3xl font-black text-slate-900 mb-2">{orders.length}</h3>
                                <div className="flex items-center gap-2 text-blue-500 font-bold text-xs">
                                    <span>{orders.filter(o => o.status === 'PENDING').length} Pending</span>
                                    <span className="text-slate-400">Next 24h</span>
                                </div>
                            </div>
                            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Net Productivity</p>
                                <h3 className="text-3xl font-black text-slate-900 mb-2">94.2%</h3>
                                <div className="flex items-center gap-2 text-orange-500 font-bold text-xs">
                                    <span>Stable</span>
                                    <span className="text-slate-400">Operational Flow</span>
                                </div>
                            </div>
                        </div>

                        {/* Category & Comparison View */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Revenue by Category */}
                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                                <h3 className="text-xl font-black text-slate-900 mb-8">Income by Category</h3>
                                <div className="space-y-6">
                                    {categories.map(cat => {
                                        const catIncome = orders.reduce((acc, order) => {
                                            const itemTotal = order.items?.reduce((iAcc, item) => {
                                                return (item.product_category === cat.name) ? iAcc + (parseFloat(item.price) * item.quantity) : iAcc;
                                            }, 0) || 0;
                                            return acc + itemTotal;
                                        }, 0);
                                        const percentage = Math.min(100, (catIncome / (orders.reduce((acc, o) => acc + (parseFloat(o.total_amount) || 1), 0) || 1)) * 100);
                                        
                                        return (
                                            <div key={cat.id}>
                                                <div className="flex justify-between items-end mb-2">
                                                    <p className="font-black text-slate-700 text-xs uppercase tracking-wider">{cat.name}</p>
                                                    <p className="font-black text-slate-900">₹{catIncome.toLocaleString()}</p>
                                                </div>
                                                <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${percentage}%` }}></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Weekly Expense / Income Tracker Mockup */}
                            <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl">
                                <p className="text-[10px] font-black tracking-widest uppercase text-slate-500 mb-2">Prototype Mockup</p>
                                <h3 className="text-xl font-black mb-8 text-blue-400 italic">Projected ROI Analytics</h3>
                                <div className="flex gap-4 items-end h-64 mb-8 opacity-50">
                                    {[65, 45, 85, 30, 95, 75, 55].map((h, i) => (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-3">
                                            <div className="w-full bg-white/10 rounded-t-xl group relative flex flex-col justify-end overflow-hidden" style={{ height: '100%' }}>
                                                <div className="w-full bg-blue-500 rounded-t-xl transition-all duration-1000" style={{ height: `${h}%` }}></div>
                                                <div className="w-full bg-red-400 opacity-40 absolute bottom-0" style={{ height: `${h * 0.4}%` }}></div>
                                            </div>
                                            <span className="text-[10px] font-black text-slate-500 uppercase">W{i+1}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                        <p className="text-[10px] font-black text-blue-400 uppercase mb-1">Dummy Growth Data</p>
                                        <h4 className="text-xl font-black text-slate-400">+₹---</h4>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                        <p className="text-[10px] font-black text-red-400 uppercase mb-1">Dummy Operational Exp</p>
                                        <h4 className="text-xl font-black text-slate-400">₹---</h4>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Performance Log */}
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                           <h3 className="text-xl font-black text-slate-900 mb-8">Daily Productivity Breakdown</h3>
                           <div className="overflow-x-auto">
                              <table className="w-full text-left">
                                 <thead>
                                    <tr className="border-b border-slate-100">
                                       <th className="py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Timeframe</th>
                                       <th className="py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Revenue</th>
                                       <th className="py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Expenses</th>
                                       <th className="py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Net Margin</th>
                                    </tr>
                                 </thead>
                                 <tbody className="text-slate-700 font-bold">
                                    <tr className="border-b border-slate-50">
                                       <td className="py-4 text-sm">Real-time Today</td>
                                       <td className="py-4 text-center text-green-600">₹8,450</td>
                                       <td className="py-4 text-center text-red-400">₹2,100</td>
                                       <td className="py-4 text-right text-slate-900">₹6,350</td>
                                    </tr>
                                    <tr className="border-b border-slate-50">
                                       <td className="py-4 text-sm">Last 24 Hours</td>
                                       <td className="py-4 text-center text-green-600">₹12,200</td>
                                       <td className="py-4 text-center text-red-400">₹4,500</td>
                                       <td className="py-4 text-right text-slate-900">₹7,700</td>
                                    </tr>
                                    <tr>
                                       <td className="py-4 text-sm text-blue-600 font-black italic">Projected Month End</td>
                                       <td className="py-4 text-center text-blue-600">---</td>
                                       <td className="py-4 text-center text-blue-600">---</td>
                                       <td className="py-4 text-right text-blue-600 font-black">₹1.2L Est.</td>
                                    </tr>
                                 </tbody>
                              </table>
                           </div>
                        </div>
                    </div>
                )}
                {activeTab === 'videos' && (
                    <div className="bg-white p-4 md:p-8 rounded-[2rem] shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-10">
                            <h2 className="text-2xl font-black text-slate-900">Shoppable Videos</h2>
                            <button onClick={() => setIsVideoModalOpen(true)} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs md:text-sm shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all">+ Add Video</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {videos.map(vid => {
                                const matchedProduct = products.find(p => p.id === vid.product);
                                return (
                                <div key={vid.id} className="bg-slate-50 border border-slate-100 p-4 rounded-[1.5rem] shadow-sm flex flex-col gap-3">
                                    <p className="font-black text-slate-900 line-clamp-1">{vid.title}</p>
                                    <div className="w-full aspect-video bg-black rounded-xl overflow-hidden mb-2">
                                        <video src={getValidImageUrl(vid.video_file)} controls className="w-full h-full object-cover"></video>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase truncate">Product: {matchedProduct?.name || `ID: ${vid.product}`}</p>
                                    <button onClick={() => handleDeleteVideo(vid)} className="w-full bg-red-50 border border-red-100 hover:bg-red-500 hover:text-white text-red-500 py-3 rounded-xl font-black text-[10px] uppercase transition-all mt-auto">🗑️ Delete Video</button>
                                </div>
                            )})}
                        </div>
                    </div>
                )}
            </div>

            {/* MODALS */}
            {selectedOrderDetails && (
                <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg max-h-[90vh] overflow-y-auto p-10 shadow-2xl relative">
                        <button onClick={() => setSelectedOrderDetails(null)} className="absolute top-6 right-6 text-slate-400 hover:text-red-500 transition-colors">✕</button>
                        <h2 className="text-2xl font-black text-slate-900 mb-6 underline decoration-blue-500 decoration-4 underline-offset-4">#{selectedOrderDetails.id} - {selectedOrderDetails.full_name}</h2>
                        <div className="space-y-6">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Items</p>
                                {selectedOrderDetails.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center py-2 border-b border-dashed border-slate-200 last:border-0 last:pb-0">
                                        <p className="text-xs font-bold text-slate-800">{item.quantity}x {item.product_name}</p>
                                        <p className="text-xs font-black text-slate-900">₹{item.price}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Shipping Information</p>
                                <div className="space-y-2 text-xs font-bold text-slate-700">
                                    <p><span className="text-slate-400 uppercase text-[9px]">Mobile:</span> {selectedOrderDetails.mobile_number || 'N/A'}</p>
                                    <p><span className="text-slate-400 uppercase text-[9px]">Region:</span> {selectedOrderDetails.country_region}</p>
                                    <p><span className="text-slate-400 uppercase text-[9px]">Building:</span> {selectedOrderDetails.house_info}</p>
                                    <p><span className="text-slate-400 uppercase text-[9px]">Area:</span> {selectedOrderDetails.street_info}</p>
                                    <p><span className="text-slate-400 uppercase text-[9px]">Landmark:</span> {selectedOrderDetails.landmark || 'None'}</p>
                                    <p><span className="text-slate-400 uppercase text-[9px]">Location:</span> {selectedOrderDetails.city}, {selectedOrderDetails.state} - {selectedOrderDetails.pincode}</p>
                                    {selectedOrderDetails.address && <p className="mt-2 pt-2 border-t border-slate-200 border-dashed">{selectedOrderDetails.address}</p>}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                {(selectedOrderDetails.status === 'PENDING' || selectedOrderDetails.status === 'VERIFYING') && (
                                    <button onClick={() => updateOrderStatus(selectedOrderDetails.id, 'PAID')} className="bg-green-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-green-700 transition-all shadow-lg shadow-green-500/20">Mark as Paid</button>
                                )}
                                {selectedOrderDetails.status === 'PAID' && (
                                    <button onClick={() => updateOrderStatus(selectedOrderDetails.id, 'SHIPPED')} className="bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">Mark as Shipped</button>
                                )}
                                {(selectedOrderDetails.status === 'SHIPPED' || selectedOrderDetails.status === 'DELIVERED') && (
                                    <button onClick={() => updateOrderStatus(selectedOrderDetails.id, 'CLOSED')} className="bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-500/20">Close Order</button>
                                )}
                            </div>
                            {selectedOrderDetails.payment_screenshot && (
                                <div className="rounded-2xl border-4 border-slate-100 overflow-hidden mt-4">
                                    <img src={getValidImageUrl(selectedOrderDetails.payment_screenshot)} className="w-full h-auto" alt="Proof" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {isCategoryModalOpen && (
                <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <form onSubmit={handleSaveCategory} className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl relative">
                        <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-red-500">✕</button>
                        <h2 className="text-2xl font-black text-slate-900 mb-6">New Category</h2>
                        <input required type="text" value={cName} onChange={e => setCName(e.target.value)} placeholder="Category Name" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold mb-4" />
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Category Thumbnail (Optional)</label>
                        <input type="file" onChange={e => setCImage(e.target.files[0])} accept="image/*" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-bold mb-6" />
                        <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl">Create</button>
                    </form>
                </div>
            )}

            {isAttributeModalOpen && (
                <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[101] flex items-center justify-center p-4">
                    <form onSubmit={handleSaveAttribute} className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl relative">
                        <button type="button" onClick={() => setIsAttributeModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-red-500">✕</button>
                        <h2 className="text-2xl font-black text-slate-900 mb-6 italic">Define <span className="text-blue-600 not-italic">Attribute</span></h2>
                        <p className="text-[10px] text-slate-400 font-bold mb-6 uppercase tracking-widest">Create categories like "Size", "Rod Length", or "Material".</p>
                        <input required type="text" value={attrName} onChange={e => setAttrName(e.target.value)} placeholder="e.g. Length" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold mb-6" />
                        <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl">Create Metric</button>
                    </form>
                </div>
            )}

            {isVideoModalOpen && (
                <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <form onSubmit={handleSaveVideo} className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl relative">
                        <button type="button" onClick={() => setIsVideoModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-red-500">✕</button>
                        <h2 className="text-2xl font-black text-slate-900 mb-6">Add Shoppable Video</h2>
                        
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Video Title</label>
                        <input required type="text" value={vTitle} onChange={e => setVTitle(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold mb-4" />
                        
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Link to Product</label>
                        <select required value={vProduct} onChange={e => setVProduct(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold mb-4">
                            <option value="">Select Gear...</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Video File</label>
                        <input required type="file" accept="video/*" onChange={e => setVFile(e.target.files[0])} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-bold mb-6" />
                        
                        <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl">Upload Video</button>
                    </form>
                </div>
            )}

            {isProductModalOpen && (
                <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <form onSubmit={handleSaveProduct} className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-10 shadow-2xl no-scrollbar">
                        <h2 className="text-3xl font-black text-slate-900 mb-8">{editingProduct ? 'Update Gear' : 'Add Gear'}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gear Name</label>
                                <input suppressHydrationWarning type="text" required value={pName} onChange={e => setPName(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Brand</label>
                                <select
                                    value={pBrand}
                                    onChange={e => setPBrand(e.target.value)}
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold"
                                >
                                    <option value="">No Brand (Generic)</option>
                                    {brands.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <div className="relative">
                                    <input type="checkbox" checked={pIsHeroMarquee} onChange={e => setPIsHeroMarquee(e.target.checked)} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </div>
                                <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Show in Hero Marquee</span>
                            </label>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <input suppressHydrationWarning type="number" required value={pPrice} onChange={e => setPPrice(e.target.value)} placeholder="Price" className="p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black" />
                            <input suppressHydrationWarning type="number" value={pOfferPrice} onChange={e => setPOfferPrice(e.target.value)} placeholder="Offer" className="p-4 bg-blue-50 border border-blue-100 rounded-2xl font-black text-blue-600" />
                            <input suppressHydrationWarning type="number" required value={pStock} onChange={e => setPStock(e.target.value)} placeholder="Stock" className="p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black" />
                        </div>
                        <div className="mb-6">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Category</label>
                            <select required value={pCategory} onChange={e => setPCategory(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black outline-none font-bold">
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Primary Image</label>
                                <input type="file" onChange={e => setPImage(e.target.files[0])} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-bold" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Gallery Images ({pImages.length} selected)</label>
                                <input type="file" multiple onChange={e => setPImages(Array.from(e.target.files))} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-bold" />
                            </div>
                        </div>
                        <textarea required value={pDesc} onChange={e => setPDesc(e.target.value)} placeholder="Description" rows="3" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-xs mb-8"></textarea>

                        <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 mb-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xs font-black text-blue-900 uppercase tracking-widest italic">Inventory Variants</h3>
                                <button type="button" onClick={addVariantRow} className="bg-blue-600 text-white font-black text-[9px] px-3 py-1 rounded-full uppercase tracking-widest hover:bg-blue-700 transition-all">+ Add Row</button>
                            </div>
                            <div className="space-y-3">
                                {pVariants.map((v, index) => (
                                    <div key={index} className="flex flex-col sm:flex-row gap-2 p-3 bg-white/50 rounded-2xl border border-blue-50 relative group">
                                        <select required className="flex-1 p-3 text-[10px] md:text-xs bg-white rounded-xl outline-none font-bold border border-blue-50" value={v.attribute} onChange={e => updateVariantRow(index, 'attribute', e.target.value)}>
                                            <option value="">Attribute...</option>
                                            {availableAttributes.map(attr => <option key={attr.id} value={attr.id}>{attr.name}</option>)}
                                        </select>
                                        <input required placeholder="Value (6ft)" value={v.value} onChange={e => updateVariantRow(index, 'value', e.target.value)} className="flex-1 p-3 text-[10px] md:text-xs bg-white rounded-xl outline-none font-bold border border-blue-50" />
                                        <div className="flex gap-2">
                                            <div className="flex-1">
                                                <label className="text-[7px] font-black text-blue-400 uppercase tracking-widest ml-1 mb-1 block">Modifier (₹)</label>
                                                <input type="number" placeholder="+/-" value={v.price_modifier} onChange={e => updateVariantRow(index, 'price_modifier', e.target.value)} className="w-20 p-2 text-[10px] bg-blue-50 rounded-lg outline-none font-black text-blue-600 border border-blue-100" />
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-[7px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Stock</label>
                                                <input type="number" placeholder="Qty" value={v.stock} onChange={e => updateVariantRow(index, 'stock', e.target.value)} className="w-16 p-2 text-[10px] bg-slate-50 rounded-lg outline-none font-black text-slate-900 border border-slate-100" />
                                            </div>
                                        </div>
                                        <button type="button" onClick={() => removeVariantRow(index)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-[10px] font-black hidden group-hover:flex shadow-sm">✕</button>
                                    </div>
                                ))}
                            </div>
                            {pVariants.length === 0 && <p className="text-[9px] text-blue-400/60 font-bold text-center py-4">No variants defined. Add rows for different sizes or weights.</p>}
                        </div>
                        <div className="flex gap-4">
                            <button type="submit" className="flex-1 bg-slate-900 text-white py-5 rounded-3xl font-black uppercase tracking-widest shadow-xl">Save Gear</button>
                            <button type="button" onClick={() => setIsProductModalOpen(false)} className="flex-1 bg-slate-100 text-slate-500 py-5 rounded-3xl font-black uppercase tracking-widest">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {isBrandModalOpen && (
                <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <form onSubmit={handleSaveBrand} className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl relative">
                        <button type="button" onClick={() => setIsBrandModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-red-500">✕</button>
                        <h2 className="text-2xl font-black text-slate-900 mb-6">New Brand</h2>
                        <input required type="text" value={brandNameInput} onChange={e => setBrandNameInput(e.target.value)} placeholder="Brand Name" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold mb-4" />
                        <input type="file" onChange={e => setBrandLogoInput(e.target.files[0])} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-bold mb-6" />
                        <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl">Add Brand</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;