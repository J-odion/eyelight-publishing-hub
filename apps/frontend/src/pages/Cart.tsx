import React from 'react';
import { useCartStore } from '../lib/useCartStore.js';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Trash2, ArrowLeft, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Cart() {
  const { items, removeItem, updateQuantity, getCartTotal, clearCart } = useCartStore();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (items.length === 0) return toast.error('Your cart is empty');
    
    toast.loading('Redirecting to secure checkout...');
    setTimeout(() => {
      toast.dismiss();
      toast.success('Payment flow initiated!', { duration: 4000 });
      clearCart();
      navigate('/store');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-[#131921] text-white py-4 px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="text-2xl font-bold tracking-tight cursor-pointer" onClick={() => navigate('/')}>
          eyelight<span className="text-accent">.</span> store
        </div>
        <button onClick={() => navigate('/store')} className="text-sm hover:underline flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Continue Shopping
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3">
          <ShoppingCart className="w-8 h-8" /> Shopping Cart
        </h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <ShoppingCart className="w-20 h-20 text-slate-200 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-slate-700 mb-2">Your Eyelight Cart is empty</h2>
            <p className="text-slate-500 mb-8">Looks like you haven't added any books to your cart yet.</p>
            <Button onClick={() => navigate('/store')} className="bg-[#ffd814] hover:bg-[#f7ca00] text-slate-900 font-medium px-8 h-12 rounded-full">
              Shop Now
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item._id} className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                  <div className="w-24 h-36 bg-slate-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {item.coverUrl ? (
                      <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingCart className="w-8 h-8 text-slate-300" />
                    )}
                  </div>
                  
                  <div className="flex-1 w-full">
                    <h3 className="text-xl font-bold text-slate-900 mb-1 leading-tight">{item.title}</h3>
                    <p className="text-sm text-slate-600 mb-4">{item.author}</p>
                    
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center border border-slate-200 rounded-full bg-slate-50 p-1">
                        <button 
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-600 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-10 text-center font-medium text-sm">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-600 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-900">₦{((item.price || 4000) * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => removeItem(item._id)}
                    className="sm:self-start p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 sticky top-24">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal ({items.reduce((a, b) => a + b.quantity, 0)} items)</span>
                  <span>₦{getCartTotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span className="text-slate-400 italic">Calculated at checkout</span>
                </div>
                <hr className="border-slate-200" />
                <div className="flex justify-between text-xl font-bold text-slate-900">
                  <span>Total</span>
                  <span>₦{getCartTotal().toLocaleString()}</span>
                </div>
              </div>
              
              <Button 
                onClick={handleCheckout}
                className="w-full bg-[#ffa41c] hover:bg-[#fa8900] text-slate-900 font-medium h-12 rounded-full mb-4"
              >
                Proceed to Checkout
              </Button>
              
              <div className="text-center">
                <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
                  Secure checkout powered by Eyelight
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
