import React, { useState, useEffect } from 'react';
import { PressApi } from '../lib/api.js';
import { toast } from 'sonner';
import { Download, Image, FileText, User, BookOpen, Briefcase, Newspaper } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const ASSET_TYPES = [
  { id: '', label: 'All', icon: Briefcase },
  { id: 'Press Release', label: 'Press Releases', icon: Newspaper },
  { id: 'Author Photo', label: 'Author Photos', icon: Image },
  { id: 'Book Cover', label: 'Book Covers', icon: BookOpen },
  { id: 'Author Bio', label: 'Author Bios', icon: User },
  { id: 'Media Kit', label: 'Media Kits', icon: Briefcase },
  { id: 'Brand Asset', label: 'Brand Assets', icon: FileText },
];

export default function PressRoom() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    PressApi.getAll(activeFilter || undefined)
      .then(r => setAssets(r.data))
      .catch(() => toast.error('Failed to load press assets'))
      .finally(() => setLoading(false));
  }, [activeFilter]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold">Press & <span className="text-accent">Media Room</span></h1>
          <p className="text-muted-foreground mt-2 max-w-xl">
            Download press releases, author photos, book covers, media kits, and brand assets for coverage and editorial use.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {ASSET_TYPES.map(type => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setActiveFilter(type.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors
                  ${activeFilter === type.id
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-card border text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {type.label}
              </button>
            );
          })}
        </div>

        {/* Assets Grid */}
        {loading ? (
          <p className="text-center text-muted-foreground py-20">Loading press assets...</p>
        ) : assets.length === 0 ? (
          <div className="text-center py-20">
            <Briefcase className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No press assets available{activeFilter ? ` for "${activeFilter}"` : ''} yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {assets.map((asset: any) => (
              <div key={asset._id} className="bg-card border rounded-xl overflow-hidden group hover:shadow-md transition-shadow">
                {/* Thumbnail */}
                {asset.thumbnailUrl ? (
                  <img src={asset.thumbnailUrl} alt={asset.title} className="w-full h-48 object-cover" />
                ) : (
                  <div className="w-full h-48 bg-muted flex items-center justify-center">
                    <FileText className="w-10 h-10 text-muted-foreground/30" />
                  </div>
                )}

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent">
                      {asset.type}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground line-clamp-1">{asset.title}</h3>
                  {asset.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{asset.description}</p>
                  )}
                  {(asset.authorName || asset.bookTitle) && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {asset.authorName && `Author: ${asset.authorName}`}
                      {asset.authorName && asset.bookTitle && ' · '}
                      {asset.bookTitle && `Book: ${asset.bookTitle}`}
                    </p>
                  )}

                  {/* Download Button */}
                  {asset.fileUrl && (
                    <a
                      href={asset.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
                    >
                      <Download className="w-4 h-4" /> Download
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contact Section */}
        <div className="mt-16 bg-card border rounded-xl p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Media Inquiries</h2>
          <p className="text-muted-foreground mb-4">
            For interview requests, review copies, or press inquiries, contact us at:
          </p>
          <a
            href="mailto:press@eyelightpublishing.com"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-full font-semibold hover:opacity-90 transition-opacity"
          >
            press@eyelightpublishing.com
          </a>
        </div>
      </div>
      <Footer />
    </div>
  );
}
