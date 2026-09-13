import React, { useState, useEffect } from 'react';
import { BooksApi } from '../lib/api.js';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { BookOpen, ShoppingCart } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function BookCatalogue() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<any>(null);

  useEffect(() => {
    BooksApi.getAll()
      .then(r => setBooks(r.data))
      .catch(() => toast.error('Failed to load books'))
      .finally(() => setLoading(false));
  }, []);

  if (selectedBook) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-16">
          <button onClick={() => setSelectedBook(null)} className="text-sm text-muted-foreground hover:text-accent mb-6 inline-block">
            ← Back to Catalogue
          </button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Cover */}
            <div>
              {selectedBook.coverUrl ? (
                <img src={selectedBook.coverUrl} alt={selectedBook.title} className="w-full rounded-xl shadow-lg" />
              ) : (
                <div className="w-full aspect-[2/3] bg-muted rounded-xl flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-muted-foreground/30" />
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold">{selectedBook.title}</h1>
                <p className="text-lg text-muted-foreground mt-1">by {selectedBook.author}</p>
              </div>

              {selectedBook.description && (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Description</h3>
                  <p className="text-sm leading-relaxed">{selectedBook.description}</p>
                </div>
              )}

              {selectedBook.targetAudience && (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Who This Book Is For</h3>
                  <p className="text-sm">{selectedBook.targetAudience}</p>
                </div>
              )}

              {selectedBook.aboutAuthor && (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">About the Author</h3>
                  <p className="text-sm">{selectedBook.aboutAuthor}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-sm">
                {selectedBook.genre && <div><span className="text-muted-foreground">Genre:</span> {selectedBook.genre}</div>}
                {selectedBook.pages && <div><span className="text-muted-foreground">Pages:</span> {selectedBook.pages}</div>}
                {selectedBook.isbn && <div><span className="text-muted-foreground">ISBN:</span> {selectedBook.isbn}</div>}
                {selectedBook.formats?.length > 0 && <div><span className="text-muted-foreground">Formats:</span> {selectedBook.formats.join(', ')}</div>}
                {selectedBook.publicationDate && <div><span className="text-muted-foreground">Published:</span> {format(new Date(selectedBook.publicationDate), 'PP')}</div>}
              </div>

              {selectedBook.price && (
                <p className="text-2xl font-bold">₦{selectedBook.price.toLocaleString()}</p>
              )}

              {/* Purchase Links */}
              {selectedBook.purchaseLinks && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Where to Buy</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedBook.purchaseLinks.amazon && (
                      <a href={selectedBook.purchaseLinks.amazon} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-accent text-accent-foreground rounded-full text-sm font-semibold hover:opacity-90 inline-flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4" /> Amazon
                      </a>
                    )}
                    {selectedBook.purchaseLinks.eyelightStore && (
                      <a href={selectedBook.purchaseLinks.eyelightStore} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-accent text-accent-foreground rounded-full text-sm font-semibold hover:opacity-90 inline-flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4" /> Eyelight Store
                      </a>
                    )}
                    {selectedBook.purchaseLinks.jumia && (
                      <a href={selectedBook.purchaseLinks.jumia} target="_blank" rel="noopener noreferrer" className="px-4 py-2 border rounded-full text-sm font-semibold hover:bg-muted inline-flex items-center gap-2">
                        Jumia
                      </a>
                    )}
                    {selectedBook.purchaseLinks.selar && (
                      <a href={selectedBook.purchaseLinks.selar} target="_blank" rel="noopener noreferrer" className="px-4 py-2 border rounded-full text-sm font-semibold hover:bg-muted inline-flex items-center gap-2">
                        Selar
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold">Eyelight <span className="text-accent">Book Catalogue</span></h1>
          <p className="text-muted-foreground mt-2">Explore the works published by Eyelight Publishing.</p>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground py-20">Loading catalogue...</p>
        ) : books.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">No books published yet. Check back soon!</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((book: any) => (
              <button
                key={book._id}
                onClick={() => setSelectedBook(book)}
                className="text-left group"
              >
                {book.coverUrl ? (
                  <img src={book.coverUrl} alt={book.title} className="w-full aspect-[2/3] object-cover rounded-xl shadow-md group-hover:shadow-xl transition-shadow" />
                ) : (
                  <div className="w-full aspect-[2/3] bg-muted rounded-xl flex items-center justify-center">
                    <BookOpen className="w-10 h-10 text-muted-foreground/30" />
                  </div>
                )}
                <h3 className="font-semibold mt-3 group-hover:text-accent transition-colors line-clamp-1">{book.title}</h3>
                <p className="text-sm text-muted-foreground">{book.author}</p>
                {book.price && <p className="text-sm font-semibold mt-1">₦{book.price.toLocaleString()}</p>}
              </button>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
