"use client";
import { useState, useEffect } from "react";

export default function AdminDashboard() {
  // --- SECURITY STATES ---
  const [isAuth, setIsAuth] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isChecking, setIsChecking] = useState(true); // Page load hote hi check karne ke liye

  // --- DASHBOARD STATES ---
  const [activeTab, setActiveTab] = useState("orders");
  const [items, setItems] = useState<any[]>([]);
  const [formData, setFormData] = useState({ name: "", description: "", price: "", isAvailable: true });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);

  // 1. Check if user is already logged in (Local Storage)
  useEffect(() => {
    const checkLogin = localStorage.getItem("adminAuth");
    if (checkLogin === "true") {
      setIsAuth(true);
    }
    setIsChecking(false);
  }, []);

  // 2. Fetch Data (Sirf tab chalega jab login hoga)
  useEffect(() => {
    if (!isAuth) return; // Agar login nahi hai, toh data fetch mat karo (Security)
    
    fetchItems();
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); 
    return () => clearInterval(interval);
  }, [isAuth]);

  // --- LOGIN & LOGOUT FUNCTIONS ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: passwordInput })
    });

    const data = await res.json();
    if (data.success) {
      setIsAuth(true);
      localStorage.setItem("adminAuth", "true"); // Browser mein save kar diya
      setPasswordInput("");
    } else {
      setLoginError("Incorrect password. Access Denied.");
    }
  };

  const handleLogout = () => {
    setIsAuth(false);
    localStorage.removeItem("adminAuth"); // Browser se hata diya
    setActiveTab("orders"); // Reset tab
  };

  // --- DATA FETCHING FUNCTIONS ---
  const fetchItems = async () => {
    const res = await fetch("/api/menu");
    const data = await res.json();
    if (data.success) setItems(data.data);
  };

  const fetchOrders = async () => {
    const res = await fetch("/api/orders");
    const data = await res.json();
    if (data.success) setOrders(data.data);
  };

  // --- MENU CRUD FUNCTIONS ---
  const convertToBase64 = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let imageUrl = "";

    if (imageFile) {
      const base64Image = await convertToBase64(imageFile);
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: base64Image, fileName: imageFile.name }),
      });
      const uploadData = await uploadRes.json();
      if (uploadData.success) imageUrl = uploadData.url;
    }

    const res = await fetch("/api/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, price: Number(formData.price), imageUrl }),
    });

    if (res.ok) {
      setFormData({ name: "", description: "", price: "", isAvailable: true });
      setImageFile(null);
      const fileInput = document.getElementById("imageInput") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      fetchItems();
    }
    setLoading(false);
  };

  const handleDeleteMenu = async (id: string) => {
    if (!confirm("Delete this dish?")) return;
    await fetch(`/api/menu?id=${id}`, { method: "DELETE" });
    fetchItems();
  };

  const handleToggleAvailability = async (id: string, currentStatus: boolean) => {
    await fetch(`/api/menu?id=${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isAvailable: !currentStatus }) });
    fetchItems();
  };

  // --- ORDER FUNCTIONS ---
  const updateOrderStatus = async (id: string, newStatus: string) => {
    await fetch(`/api/orders?id=${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus }) });
    fetchOrders();
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm("Remove this order record?")) return;
    await fetch(`/api/orders?id=${id}`, { method: "DELETE" });
    fetchOrders();
  };

  // Analytics
  const today = new Date();
  const todayOrders = orders.filter((o) => new Date(o.createdAt).getDate() === today.getDate());
  const todayRevenue = todayOrders.filter(o => o.status === 'Completed').reduce((sum, o) => sum + o.totalAmount, 0);

  // ==========================================
  // VIEW 1: LOADING SCREEN
  // ==========================================
  if (isChecking) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  // ==========================================
  // VIEW 2: LOGIN SCREEN
  // ==========================================
  if (!isAuth) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6">
        <div className="bg-black p-8 rounded-3xl shadow-2xl border border-gray-800 w-full max-w-md text-white text-center">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">🔒</div>
          <h2 className="text-2xl font-bold mb-2">Admin Access</h2>
          <p className="text-gray-400 text-sm mb-8">Enter your secret password to manage the restaurant menu and orders.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Enter Password" 
              className="w-full bg-gray-900 border border-gray-700 p-4 rounded-xl text-center text-lg outline-none focus:border-amber-500 transition-colors tracking-widest"
              required
            />
            {loginError && <p className="text-red-500 text-sm font-medium">{loginError}</p>}
            <button type="submit" className="w-full bg-amber-500 text-black font-bold py-4 rounded-xl hover:bg-amber-400 transition-colors">
              Unlock Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 3: ADMIN DASHBOARD (Jo pehle tha)
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button onClick={() => setActiveTab("orders")} className={`px-4 sm:px-6 py-2 rounded-md font-medium text-sm transition-all ${activeTab === "orders" ? "bg-white shadow-sm text-black" : "text-gray-500 hover:text-black"}`}>Live Orders</button>
              <button onClick={() => setActiveTab("menu")} className={`px-4 sm:px-6 py-2 rounded-md font-medium text-sm transition-all ${activeTab === "menu" ? "bg-white shadow-sm text-black" : "text-gray-500 hover:text-black"}`}>Manage Menu</button>
            </div>
            
            {/* NAYA: LOGOUT BUTTON */}
            <button onClick={handleLogout} className="text-sm font-bold text-red-500 hover:text-red-700 bg-red-50 px-4 py-2 rounded-lg transition-colors">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        
        {activeTab === "orders" && (
           <div>
              <div className="bg-gray-900 rounded-2xl p-6 mb-8 flex justify-between items-center shadow-lg text-white">
                <div><p className="text-gray-400 text-sm uppercase tracking-widest font-semibold mb-1">Today's Orders</p><h3 className="text-4xl font-black">{todayOrders.length}</h3></div>
                <div className="text-right"><p className="text-gray-400 text-sm uppercase tracking-widest font-semibold mb-1">Today's Revenue</p><h3 className="text-4xl font-black text-green-400">${todayRevenue.toFixed(2)}</h3></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {orders.map((order) => (
                   <div key={order._id} className={`bg-white p-6 rounded-2xl shadow-sm border-t-4 ${order.status === 'Completed' ? 'border-gray-300 bg-gray-50 opacity-80' : order.status === 'Preparing' ? 'border-amber-500' : 'border-green-500'}`}>
                   <div className="flex justify-between items-start mb-4">
                     <div>
                       <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Table</span>
                       <h3 className="text-3xl font-black text-gray-800">{order.tableNumber}</h3>
                     </div>
                     <span className={`px-3 py-1 text-xs font-bold rounded-full ${order.status === 'Completed' ? 'bg-gray-200 text-gray-600' : order.status === 'Preparing' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                       {order.status}
                     </span>
                   </div>
                   
                   <div className="border-t border-b border-gray-100 py-3 mb-4 min-h-[100px]">
                     {order.items.map((item: any, idx: number) => (
                       <div key={idx} className="flex justify-between text-sm mb-2">
                         <span className="font-medium">{item.quantity}x {item.name}</span>
                         <span className="text-gray-500">${(item.price * item.quantity).toFixed(2)}</span>
                       </div>
                     ))}
                   </div>
                   
                   <div className="flex justify-between items-center font-bold text-lg mb-6">
                     <span>Total:</span>
                     <span>${order.totalAmount.toFixed(2)}</span>
                   </div>

                   {order.status !== 'Completed' ? (
                     <div className="flex gap-2">
                       {order.status === 'Pending' && (
                         <button onClick={() => updateOrderStatus(order._id, 'Preparing')} className="flex-1 bg-amber-500 text-white font-bold py-2 rounded-lg hover:bg-amber-600">Cook</button>
                       )}
                       <button onClick={() => updateOrderStatus(order._id, 'Completed')} className="flex-1 bg-green-500 text-white font-bold py-2 rounded-lg hover:bg-green-600">Complete</button>
                     </div>
                   ) : (
                     <button onClick={() => handleDeleteOrder(order._id)} className="w-full bg-red-50 text-red-500 font-bold py-2 rounded-lg hover:bg-red-100 transition-colors">
                       Clear Record
                     </button>
                   )}
                 </div>
                ))}
              </div>
           </div>
        )}

        {activeTab === "menu" && (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="md:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
             <h2 className="text-xl font-semibold mb-4">Add New Dish</h2>
             <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-gray-600 mb-1">Dish Image (Optional)</label>
                 <input id="imageInput" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)} className="w-full border border-gray-300 p-2 rounded-lg outline-none text-sm" />
               </div>
               <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-300 p-2 rounded-lg outline-none" placeholder="Dish Name" />
               <input required type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full border border-gray-300 p-2 rounded-lg outline-none" placeholder="Price ($)" />
               <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full border border-gray-300 p-2 rounded-lg outline-none" placeholder="Description" rows={3} />
               
               <button type="submit" disabled={loading} className="w-full bg-black text-white font-semibold py-2 rounded-lg disabled:bg-gray-400 flex justify-center items-center gap-2">
                 {loading ? <span className="animate-pulse">Uploading Image & Saving...</span> : "Add to Menu"}
               </button>
             </form>
           </div>
           
           <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
             {items.map((item) => (
               <div key={item._id} className={`rounded-xl border overflow-hidden ${item.isAvailable ? 'bg-white border-gray-100 shadow-sm' : 'bg-gray-100 border-gray-200 opacity-75'}`}>
                 {item.imageUrl && (
                   <div className="h-32 w-full bg-gray-200">
                     <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                   </div>
                 )}
                 <div className="p-5">
                   <div className="flex justify-between items-start mb-2">
                     <h3 className={`font-semibold ${!item.isAvailable && 'line-through text-gray-500'}`}>{item.name}</h3>
                     <span className="font-bold text-green-600">${item.price}</span>
                   </div>
                   <p className="text-gray-500 text-sm mb-4">{item.description}</p>
                   <div className="pt-3 border-t flex justify-between text-sm">
                     <button onClick={() => handleToggleAvailability(item._id, item.isAvailable)} className={item.isAvailable ? "text-green-600 font-medium" : "text-gray-600 font-medium"}>
                       {item.isAvailable ? "● In Stock" : "○ Out of Stock"}
                     </button>
                     <button onClick={() => handleDeleteMenu(item._id)} className="text-red-500 hover:underline">Delete</button>
                   </div>
                 </div>
               </div>
             ))}
           </div>
         </div>
        )}
      </div>
    </div>
  );
}