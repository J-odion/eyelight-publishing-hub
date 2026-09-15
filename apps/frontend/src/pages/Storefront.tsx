import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Menu, Star, ChevronRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const MOCK_BOOKS = [
  { id: 1, title: 'The Silent Patient', author: 'Alex Michaelides', price: 4500, rating: 4.8, reviews: 120, cover: 'https://via.placeholder.com/150x220?text=Silent+Patient' },
  { id: 2, title: 'Atomic Habits', author: 'James Clear', price: 6000, rating: 4.9, reviews: 340, cover: 'https://via.placeholder.com/150x220?text=Atomic+Habits' },
  { id: 3, title: 'Things Fall Apart', author: 'Chinua Achebe', price: 3500, rating: 4.7, reviews: 89, cover: 'https://via.placeholder.com/150x220?text=Things+Fall+Apart' },
  { id: 4, title: 'Sapiens', author: 'Yuval Noah Harari', price: 5500, rating: 4.6, reviews: 210, cover: 'https://via.placeholder.com/150x220?text=Sapiens' },
];

export default function Storefront() {
  const [books, setBooks] = useState(MOCK_BOOKS);
  const [cart, setCart] = useState<any[]>([]);
  const navigate = useNavigate();

  const addToCart = (book: any) => {
    setCart([...cart, book]);
    toast.success(`${book.title} added to cart!`);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return toast.error('Your cart is empty');
    // Mock Paystack integration
    toast.loading('Redirecting to Paystack securely...');
    setTimeout(() => {
      toast.dismiss();
      toast.success('Payment Successful! Redirecting to orders...', { duration: 4000 });
      setCart([]);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#eaeded] flex flex-col font-sans">
      {/* Amazon-style Header */}
      <header className="bg-[#131921] text-white py-3 px-4 flex items-center gap-6 sticky top-0 z-50">
        <div className="text-xl font-bold tracking-tight cursor-pointer" onClick={() => navigate('/')}>
          eyelight<span className="text-accent">.</span> store
        </div>
        
        <div className="flex-1 flex items-center max-w-4xl">
          <div className="bg-gray-100 text-gray-700 px-3 py-2 rounded-l-md text-sm font-medium border-r border-gray-300">All</div>
          <Input 
            className="flex-1 rounded-none border-0 focus-visible:ring-0 h-10 text-black bg-white" 
            placeholder="Search for books, authors, or genres" 
          />
          <button className="bg-[#febd69] hover:bg-[#f3a847] px-4 h-10 rounded-r-md transition-colors flex items-center justify-center">
            <Search className="w-5 h-5 text-gray-900" />
          </button>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-sm cursor-pointer hover:underline">
            <p className="text-gray-300 text-xs">Hello, Sign in</p>
            <p className="font-bold">Account & Lists</p>
          </div>
          <div className="text-sm cursor-pointer hover:underline">
            <p className="text-gray-300 text-xs">Returns</p>
            <p className="font-bold">& Orders</p>
          </div>
          <div className="flex items-end cursor-pointer hover:text-[#febd69]" onClick={handleCheckout}>
            <div className="relative">
              <ShoppingCart className="w-8 h-8" />
              <span className="absolute -top-1 left-3.5 text-[#f08804] font-bold text-sm bg-[#131921] px-1 rounded-full">{cart.length}</span>
            </div>
            <span className="font-bold text-sm mb-1 hidden md:block">Cart</span>
          </div>
        </div>
      </header>

      {/* Sub Header */}
      <div className="bg-[#232f3e] text-white px-4 py-1.5 flex items-center gap-4 text-sm font-medium">
        <button className="flex items-center gap-1 hover:border border-transparent hover:border-white p-1"><Menu className="w-4 h-4"/> All</button>
        <button className="hover:underline">Best Sellers</button>
        <button className="hover:underline">New Releases</button>
        <button className="hover:underline">Fiction</button>
        <button className="hover:underline">Non-Fiction</button>
        <button className="hover:underline">African Literature</button>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-[1500px] mx-auto w-full p-4 lg:p-8">
        {/* Hero Banner */}
        <div className="w-full h-64 bg-gradient-to-r from-blue-900 to-indigo-800 rounded-lg mb-8 flex items-center px-12 shadow-lg relative overflow-hidden">
          <div className="relative z-10 text-white max-w-xl">
            <h1 className="text-4xl font-bold mb-4">Discover the Best African Literature</h1>
            <p className="text-lg mb-6">Explore our curated selection of award-winning books.</p>
            <Button className="bg-[#febd69] text-gray-900 hover:bg-[#f3a847] font-bold rounded-full">Shop Now</Button>
          </div>
          <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-1/4 translate-y-1/4">
            <BookOpen className="w-96 h-96" />
          </div>
        </div>

        {/* Product Grid */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Recommended for you</h2>
          <a href="#" className="text-sm text-blue-600 hover:underline flex items-center">See all <ChevronRight className="w-4 h-4" /></a>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {books.map(book => (
            <div key={book.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col h-full group">
              <div className="bg-gray-100 flex-1 rounded-lg mb-4 flex items-center justify-center p-4 min-h-[220px]">
                <img src={book.cover} alt={book.title} className="max-w-full h-auto drop-shadow-md group-hover:scale-105 transition-transform duration-300" />
              </div>
              <h3 className="font-semibold text-lg leading-tight line-clamp-2 hover:text-blue-600 cursor-pointer">{book.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{book.author}</p>
              
              <div className="flex items-center gap-1 mt-2">
                {[1,2,3,4,5].map(star => (
                  <Star key={star} className={`w-4 h-4 ${star <= Math.round(book.rating) ? 'text-[#ffa41c] fill-[#ffa41c]' : 'text-gray-300'}`} />
                ))}
                <span className="text-xs text-blue-600 hover:underline cursor-pointer ml-1">{book.reviews}</span>
              </div>
              
              <div className="text-xl font-bold mt-3 mb-4 text-gray-900">
                <span className="text-sm font-normal align-top">₦</span>{book.price.toLocaleString()}
              </div>
              
              <Button 
                onClick={() => addToCart(book)}
                className="w-full mt-auto bg-[#ffd814] hover:bg-[#f7ca00] text-gray-900 font-medium rounded-full"
              >
                Add to Cart
              </Button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
