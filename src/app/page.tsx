"use client";
import { useState, useEffect } from "react";

export default function CustomerMenu() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [cart, setCart] = useState<any[]>([]);
  const [tableNumber, setTableNumber] = useState("");
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      const res = await fetch("/api/menu");
      const data = await res.json();
      if (data.success) {
        const availableItems = data.data.filter((item: any) => item.isAvailable);
        setItems(availableItems);
      }
      setLoading(false);
    };
    fetchItems();
  }, []);

  const addToCart = (dish: any) => {
    setCart((prev) => {
      const existingItem = prev.find((item) => item.name === dish.name);
      if (existingItem) {
        return prev.map((item) => item.name === dish.name ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { name: dish.name, price: dish.price, quantity: 1 }];
    });
  };

  const removeFromCart = (dish: any) => {
    setCart((prev) => {
      const existingItem = prev.find((item) => item.name === dish.name);
      if (!existingItem) return prev;
      if (existingItem.quantity === 1) {
        return prev.filter((item) => item.name !== dish.name);
      }
      return prev.map((item) => item.name === dish.name ? { ...item, quantity: item.quantity - 1 } : item);
    });
  };

  const getQuantity = (dishName: string) => {
    const item = cart.find(item => item.name === dishName);
    return item ? item.quantity : 0;
  };

  const totalAmount = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const handlePlaceOrder = async () => {
    if (!tableNumber) {
      alert("Please enter your Table Number!");
      return;
    }
    
    setIsOrdering(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tableNumber, items: cart, totalAmount }),
    });

    if (res.ok) {
      setOrderSuccess(true);
      setCart([]); 
    }
    setIsOrdering(false);
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-gray-400">Loading Menu...</div>;

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-3xl font-bold mb-2">Order Placed!</h2>
        <p className="text-gray-400">Your food is being prepared. It will be served at Table {tableNumber}.</p>
        <button onClick={() => setOrderSuccess(false)} className="mt-8 bg-white text-black px-6 py-2 rounded-lg font-bold">
          Order More
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans p-4 sm:p-6 pb-40">
      <div className="max-w-lg mx-auto">
        <header className="text-center mb-8 mt-6">
          <h1 className="text-4xl font-bold tracking-tight mb-1 text-white">The Brew Bar</h1>
          <p className="text-gray-400 text-sm tracking-widest uppercase">Digital Menu</p>
        </header>

        <div className="space-y-4">
          {items.length === 0 ? (
            <p className="text-center text-gray-500 py-10">Menu is empty...</p>
          ) : (
            items.map((item) => {
              const qty = getQuantity(item.name);
              return (
                <div key={item._id} className="bg-gray-900 p-4 rounded-2xl border border-gray-800 shadow-lg flex gap-4 items-center">
                  
                  {/* NAYA: Zomato/Swiggy style Image Thumbnail */}
                  {item.imageUrl && (
                    <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 bg-gray-800 rounded-xl overflow-hidden shadow-inner">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="flex-1 py-1">
                    <h3 className="text-lg font-semibold tracking-wide leading-tight mb-1">{item.name}</h3>
                    <p className="text-gray-400 text-xs sm:text-sm mb-2 line-clamp-2">{item.description}</p>
                    <span className="font-bold text-amber-500">${item.price}</span>
                  </div>
                  
                  <div className="flex-shrink-0">
                    {qty > 0 ? (
                      <div className="flex items-center bg-amber-500 text-black rounded-full h-9 w-20 sm:w-24 justify-between font-bold overflow-hidden shadow-md">
                        <button onClick={() => removeFromCart(item)} className="w-1/3 h-full flex items-center justify-center active:bg-amber-600">-</button>
                        <span className="text-sm">{qty}</span>
                        <button onClick={() => addToCart(item)} className="w-1/3 h-full flex items-center justify-center active:bg-amber-600">+</button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => addToCart(item)}
                        className="bg-gray-800 text-amber-500 border border-gray-700 h-9 px-4 rounded-full font-bold text-sm flex items-center justify-center active:scale-95 transition-transform hover:bg-gray-700 shadow-sm"
                      >
                        ADD
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-5 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] rounded-t-3xl z-50">
          <div className="max-w-lg mx-auto">
            <div className="flex justify-between items-center mb-4 px-2">
              <span className="text-gray-300 font-medium">Total ({cart.length} items):</span>
              <span className="text-2xl font-bold text-amber-500">${totalAmount.toFixed(2)}</span>
            </div>
            
            <div className="flex gap-3">
              <input 
                type="text" 
                placeholder="Table No." 
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="w-1/3 bg-black border border-gray-700 rounded-xl px-4 text-center text-white font-bold focus:outline-none focus:border-amber-500"
              />
              <button 
                onClick={handlePlaceOrder}
                disabled={isOrdering}
                className="w-2/3 bg-amber-500 text-black font-bold py-3.5 rounded-xl hover:bg-amber-400 disabled:opacity-50 transition-colors text-lg"
              >
                {isOrdering ? "Placing..." : "Place Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}