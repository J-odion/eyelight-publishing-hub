import React, { useState } from 'react';
import { useCartStore } from '../lib/useCartStore.js';
import { payWithPaystack } from '../lib/paystack.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  ShoppingCart,
  Trash2,
  ArrowLeft,
  Plus,
  Minus,
  Lock,
  Loader2,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Cart() {
  const { items, removeItem, updateQuantity, getCartTotal, clearCart } = useCartStore();
  const navigate = useNavigate();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    shippingAddress: '',
  });

  const handleOpenCheckout = () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    setIsCheckoutOpen(true);
  };

  const handlePaystackCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      toast.error('Please fill in your name, email, and phone number.');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      payWithPaystack({
        amount: getCartTotal(),
        email: form.email.trim(),
        purpose: `Eyelight Bookstore (${items.length} book${items.length > 1 ? 's' : ''})`,
        customerName: form.name.trim(),
        customerPhone: form.phone.trim(),
        metadata: {
          type: 'store',
          customerName: form.name.trim(),
          customerPhone: form.phone.trim(),
          shippingAddress: form.shippingAddress.trim(),
          items: items.map((item) => ({
            _id: item._id,
            title: item.title,
            price: item.price || 4000,
            quantity: item.quantity,
          })),
        },
        onSuccess: (reference) => {
          setIsSubmitting(false);
          setIsCheckoutOpen(false);
          window.location.href = `/payment/callback?reference=${reference}&type=store`;
        },
        onClose: () => {
          setIsSubmitting(false);
        },
      });
    } catch (err: any) {
      console.error('Paystack cart checkout error:', err);
      setIsSubmitting(false);
      toast.error('Failed to open Paystack checkout. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-[#131921] text-white py-4 px-6 flex items-center justify-between sticky top-0 z-50">
        <div
          className="text-2xl font-bold tracking-tight cursor-pointer"
          onClick={() => navigate('/')}
        >
          eyelight<span className="text-accent">.</span> store
        </div>
        <button
          onClick={() => navigate('/store')}
          className="text-sm hover:underline flex items-center gap-1"
        >
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
            <h2 className="text-2xl font-semibold text-slate-700 mb-2">
              Your Eyelight Cart is empty
            </h2>
            <p className="text-slate-500 mb-8">
              Looks like you haven't added any books to your cart yet.
            </p>
            <Button
              onClick={() => navigate('/store')}
              className="bg-[#ffd814] hover:bg-[#f7ca00] text-slate-900 font-medium px-8 h-12 rounded-full"
            >
              Shop Now
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-6 items-start sm:items-center"
                >
                  <div className="w-24 h-36 bg-slate-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {item.coverUrl ? (
                      <img
                        src={item.coverUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ShoppingCart className="w-8 h-8 text-slate-300" />
                    )}
                  </div>

                  <div className="flex-1 w-full">
                    <h3 className="text-xl font-bold text-slate-900 mb-1 leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-600 mb-4">{item.author}</p>

                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center border border-slate-200 rounded-full bg-slate-50 p-1">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-600 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-10 text-center font-medium text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-600 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-900">
                          ₦{((item.price || 4000) * item.quantity).toLocaleString()}
                        </p>
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
                  <span className="text-slate-500 font-medium">Free standard shipping</span>
                </div>
                <hr className="border-slate-200" />
                <div className="flex justify-between text-xl font-bold text-slate-900">
                  <span>Total</span>
                  <span className="text-[#b12704]">₦{getCartTotal().toLocaleString()}</span>
                </div>
              </div>

              <Button
                onClick={handleOpenCheckout}
                className="w-full bg-[#ffa41c] hover:bg-[#fa8900] text-slate-900 font-bold h-12 rounded-full mb-4 shadow-sm"
              >
                <CreditCard className="w-4 h-4 mr-2" /> Pay with Paystack
              </Button>

              <div className="text-center space-y-1">
                <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Secured & encrypted by Paystack
                </p>
                <p className="text-[11px] text-slate-400">
                  Accepts Cards, Bank Transfer, USSD & Apple Pay
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Paystack Checkout Modal */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-600" /> Checkout Details
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-sm">
              Please enter your contact and delivery information to complete your order with Paystack.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePaystackCheckout} className="space-y-4">
            <div>
              <Label className="text-xs font-semibold text-slate-700">Full Name *</Label>
              <Input
                type="text"
                required
                placeholder="e.g. Chimamanda Adichie"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-700">Email Address *</Label>
              <Input
                type="email"
                required
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1"
              />
              <p className="text-[11px] text-slate-400 mt-0.5">
                Paystack receipt will be delivered to this email.
              </p>
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-700">Phone Number *</Label>
              <Input
                type="tel"
                required
                placeholder="+234 814 000 0000"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-700">
                Delivery / Shipping Address
              </Label>
              <Input
                type="text"
                placeholder="Street address, City, State"
                value={form.shippingAddress}
                onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })}
                className="mt-1"
              />
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between text-sm">
              <span className="text-slate-600 font-medium">Total Amount:</span>
              <span className="font-bold text-lg text-slate-900 font-mono">
                ₦{getCartTotal().toLocaleString()}
              </span>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#ffa41c] hover:bg-[#fa8900] text-slate-900 font-bold h-12 rounded-xl text-base shadow-md disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Connecting to Paystack...
                </>
              ) : (
                <>
                  Pay ₦{getCartTotal().toLocaleString()} with Paystack
                </>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
