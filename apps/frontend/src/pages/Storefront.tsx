import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Menu, Star, ChevronRight, BookOpen, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { BooksApi } from '../lib/api.js';
import { useCartStore } from '../lib/useCartStore.js';

import audacityOfFaith from "@/assets/books/audacity-of-faith.jpg";
import roadToBestseller from "@/assets/books/road-to-bestseller.jpg";
import expectedEnd from "@/assets/books/expected-end.jpg";
import princesshood from "@/assets/books/princesshood.jpg";
import bloom from "@/assets/books/bloom.jpg";
import selfLeadership from "@/assets/books/self-leadership.jpg";
import calledToCarryMen from "@/assets/books/called-to-carry-men.jpg";

const staticBooks = [
  { _id: 'sw1', title: "Audacity of Faith", author: "Apostle Femi Lazarus", description: "A compelling work that teaches that faith produces more than results but largely shapes character.", price: 5000, rating: 4.9, reviews: 142, coverUrl: audacityOfFaith, purchaseLinks: { amazon: "https://www.instagram.com/thefemilazarusbooks?igsh=bjZleGR5bXJzc3Vy" } },
  { _id: 'sw2', title: "Road to Bestseller", author: "Grace Akowe Apara", description: "A practical roadmap for aspiring writers.", price: 4500, rating: 4.8, reviews: 95, coverUrl: roadToBestseller, purchaseLinks: { amazon: "http://graceapara.com/books" } },
  { _id: 'sw3', title: "Expected End", author: "Barrister Peace Aaron", description: "A heartfelt memoir chronicling her life journey with honesty and inspiring vulnerability.", price: 4000, rating: 4.7, reviews: 63, coverUrl: expectedEnd },
  { _id: 'sw4', title: "Princesshood", author: "Sharon Adetola", description: "A powerful and inspiring book that explores the value of women in God's eyes.", price: 3500, rating: 4.8, reviews: 110, coverUrl: princesshood },
  { _id: 'sw5', title: "Bloom", author: "Margaret Ogbolu", description: "The Courage to Grow Beyond Survival.", price: 4000, rating: 4.6, reviews: 88, coverUrl: bloom },
  { _id: 'sw6', title: "This Thing Called Self-Leadership", author: "Grace Akowe Apara", description: "A compelling guide to self-discovery, responsibility, and purposeful living.", price: 4500, rating: 4.9, reviews: 210, coverUrl: selfLeadership, purchaseLinks: { amazon: "http://graceapara.com/books" } },
  { _id: 'sw7', title: "Called to Carry Men", author: "Femi Lazarus", description: "The Work, The Weight, The Discipline and The Wisdom of Pastoral Leadership.", price: 5500, rating: 5.0, reviews: 340, coverUrl: calledToCarryMen },
];

export default function Storefront() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { items: cart, addItem, getCartCount } = useCartStore();
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    BooksApi.getAll()
      .then(r => setBooks([...staticBooks, ...r.data]))
      .catch(() => {
        setBooks(staticBooks);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = (book: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    addItem(book);
    toast.success(`${book.title} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-[#eaeded] flex flex-col font-sans">
      {/* Amazon-style Header */}
      <header className="bg-[#131921] text-white py-3 px-4 flex items-center gap-6 sticky top-0 z-50">
        <div className="text-xl font-bold tracking-tight cursor-pointer" onClick={() => navigate('/')}>
          eyelight<span className="text-accent">.</span> store
        </div>
        
        <div className="flex-1 flex items-center max-w-4xl hidden sm:flex">
          <div className="bg-gray-100 text-gray-700 px-3 py-2 rounded-l-md text-sm font-medium border-r border-gray-300">All</div>
          <Input 
            className="flex-1 rounded-none border-0 focus-visible:ring-0 h-10 text-black bg-white" 
            placeholder="Search for books, authors, or genres" 
          />
          <button className="bg-[#febd69] hover:bg-[#f3a847] px-4 h-10 rounded-r-md transition-colors flex items-center justify-center">
            <Search className="w-5 h-5 text-gray-900" />
          </button>
        </div>

        <div className="flex items-center gap-4 md:gap-6 ml-auto sm:ml-0">
          <div className="text-sm cursor-pointer hover:underline hidden md:block">
            <p className="text-gray-300 text-xs">Hello, Sign in</p>
            <p className="font-bold">Account & Lists</p>
          </div>
          <div className="text-sm cursor-pointer hover:underline hidden md:block">
            <p className="text-gray-300 text-xs">Returns</p>
            <p className="font-bold">& Orders</p>
          </div>
          <div className="flex items-end cursor-pointer hover:text-[#febd69]" onClick={() => navigate('/cart')}>
            <div className="relative">
              <ShoppingCart className="w-8 h-8" />
              <span className="absolute -top-1 left-3.5 text-[#f08804] font-bold text-sm bg-[#131921] px-1 rounded-full">{getCartCount()}</span>
            </div>
            <span className="font-bold text-sm mb-1 hidden md:block">Cart</span>
          </div>
        </div>
      </header>

      {/* Sub Header */}
      <div className="bg-[#232f3e] text-white px-4 py-1.5 flex items-center gap-4 text-sm font-medium overflow-x-auto whitespace-nowrap">
        <button className="flex items-center gap-1 hover:border border-transparent hover:border-white p-1"><Menu className="w-4 h-4"/> All</button>
        <button className="hover:underline">Best Sellers</button>
        <button className="hover:underline">New Releases</button>
        <button className="hover:underline">Christian Literature</button>
        <button className="hover:underline">Non-Fiction</button>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-[1500px] mx-auto w-full p-4 lg:p-8">
        {selectedBook ? (
          <div className="bg-white p-6 md:p-10 rounded-xl shadow-sm border border-gray-200">
            <button onClick={() => setSelectedBook(null)} className="flex items-center text-sm text-blue-600 hover:underline mb-6">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to results
            </button>
            <div className="grid md:grid-cols-2 gap-10">
              <div className="flex justify-center bg-gray-50 p-8 rounded-xl">
                {selectedBook.coverUrl ? (
                  <img src={selectedBook.coverUrl} alt={selectedBook.title} className="w-full max-w-sm rounded-lg shadow-xl" />
                ) : (
                  <div className="w-full max-w-sm aspect-[2/3] bg-gray-200 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 leading-tight">{selectedBook.title}</h1>
                <p className="text-lg text-blue-600 mt-2 hover:underline cursor-pointer">{selectedBook.author}</p>
                
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex">
                    {[1,2,3,4,5].map(star => (
                      <Star key={star} className={`w-5 h-5 ${star <= Math.round(selectedBook.rating || 5) ? 'text-[#ffa41c] fill-[#ffa41c]' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="text-sm text-blue-600 hover:underline cursor-pointer">{selectedBook.reviews || 0} ratings</span>
                </div>
                
                <hr className="my-6 border-gray-200" />
                
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-1">Price</p>
                  <p className="text-3xl font-bold text-[#B12704]">
                    ₦{(selectedBook.price || 4000).toLocaleString()}
                  </p>
                </div>
                
                <div className="prose prose-sm max-w-none text-gray-700 mb-8">
                  <p>{selectedBook.description}</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    onClick={() => handleAddToCart(selectedBook)}
                    className="flex-1 bg-[#ffd814] hover:bg-[#f7ca00] text-gray-900 font-medium rounded-full h-12"
                  >
                    Add to Cart
                  </Button>
                  <Button 
                    onClick={() => { handleAddToCart(selectedBook); navigate('/cart'); }}
                    className="flex-1 bg-[#ffa41c] hover:bg-[#fa8900] text-gray-900 font-medium rounded-full h-12"
                  >
                    Buy Now
                  </Button>
                </div>
                
                {selectedBook.purchaseLinks && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <p className="text-sm font-semibold text-gray-900 mb-3">Also available on:</p>
                    <div className="flex gap-3">
                      {selectedBook.purchaseLinks.amazon && (
                        <a href={selectedBook.purchaseLinks.amazon} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50">
                          Amazon
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Hero Banner */}
            <div className="w-full h-48 md:h-64 bg-gradient-to-r from-blue-900 to-indigo-800 rounded-lg mb-8 flex items-center px-6 md:px-12 shadow-lg relative overflow-hidden">
              <div className="relative z-10 text-white max-w-xl">
                <h1 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">Discover the Best Books</h1>
                <p className="text-sm md:text-lg mb-4 md:mb-6">Explore our curated selection of published titles.</p>
              </div>
              <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-1/4 translate-y-1/4">
                <BookOpen className="w-64 h-64 md:w-96 md:h-96" />
              </div>
            </div>

            {/* Product Grid */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Recommended for you</h2>
            </div>
            
            {loading ? (
              <p className="text-center py-20 text-gray-500">Loading store...</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {books.map(book => (
                  <div key={book._id} onClick={() => setSelectedBook(book)} className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col h-full group cursor-pointer">
                    <div className="bg-gray-50 flex-1 rounded-lg mb-3 md:mb-4 flex items-center justify-center p-2 min-h-[160px] md:min-h-[220px]">
                      {book.coverUrl ? (
                        <img src={book.coverUrl} alt={book.title} className="max-w-full max-h-[200px] object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <BookOpen className="w-12 h-12 text-gray-300" />
                      )}
                    </div>
                    <h3 className="font-semibold text-sm md:text-base leading-tight line-clamp-2 hover:text-blue-600">{book.title}</h3>
                    <p className="text-xs md:text-sm text-gray-600 mt-1">{book.author}</p>
                    
                    <div className="flex items-center gap-1 mt-1 md:mt-2">
                      {[1,2,3,4,5].map(star => (
                        <Star key={star} className={`w-3 h-3 md:w-4 md:h-4 ${star <= Math.round(book.rating || 5) ? 'text-[#ffa41c] fill-[#ffa41c]' : 'text-gray-300'}`} />
                      ))}
                      <span className="text-[10px] md:text-xs text-blue-600 ml-1">{book.reviews || 0}</span>
                    </div>
                    
                    <div className="text-lg md:text-xl font-bold mt-2 mb-3 text-gray-900">
                      <span className="text-xs font-normal align-top">₦</span>{(book.price || 4000).toLocaleString()}
                    </div>
                    
                    <Button 
                      onClick={(e) => handleAddToCart(book, e)}
                      className="w-full mt-auto bg-[#ffd814] hover:bg-[#f7ca00] text-gray-900 font-medium rounded-full text-xs md:text-sm h-8 md:h-10"
                    >
                      Add to Cart
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
