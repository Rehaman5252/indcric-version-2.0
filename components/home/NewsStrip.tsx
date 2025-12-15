'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getActiveNews, logNewsClick } from '@/lib/news-service';
import type { News } from '@/types/news';
import { useAuth } from '@/context/AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Newspaper, X, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function NewsStrip() {
  const { user } = useAuth();
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedNewsForModal, setSelectedNewsForModal] = useState<News | null>(null);

  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true);
        const activeNews = await getActiveNews();
        setNews(activeNews);
      } catch (error) {
        console.error('Error loading news:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, []);

  const handleNewsClick = async (newsItem: News, e?: React.MouseEvent) => {
    if (e?.target === e?.currentTarget) {
      if (user?.uid) {
        try {
          await logNewsClick(newsItem.id, user.uid);
        } catch (error) {
          console.error('Error logging click:', error);
        }
      }

      if (newsItem.redirectUrl.startsWith('http')) {
        window.open(newsItem.redirectUrl, '_blank');
      } else {
        window.location.href = newsItem.redirectUrl;
      }
    }
  };

  const handleReadMore = (e: React.MouseEvent, newsItem: News) => {
    e.stopPropagation();
    setSelectedNewsForModal(newsItem);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? Math.max(0, news.length - 4) : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === Math.max(0, news.length - 4) ? 0 : prev + 1));
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div className="h-12 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-2xl" />
          ))}
        </div>
      </motion.div>
    );
  }

  if (news.length === 0) {
    return null;
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg shadow-yellow-500/30">
              <Newspaper className="h-6 w-6 text-black font-bold" />
            </div>

            {/* Title */}
            <div>
              <h2 className="text-3xl font-black bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
                Dressing Room Banter
              </h2>
              <p className="text-sm text-gray-400 font-medium">Latest cricket news & highlights</p>
            </div>
          </div>

          {/* Navigation Buttons */}
          {news.length > 4 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                className="h-10 w-10 p-0 border-yellow-500/40 hover:border-yellow-500 hover:bg-yellow-500/20 transition-all rounded-lg"
              >
                <ChevronLeft className="h-5 w-5 text-yellow-500 font-bold" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                className="h-10 w-10 p-0 border-yellow-500/40 hover:border-yellow-500 hover:bg-yellow-500/20 transition-all rounded-lg"
              >
                <ChevronRight className="h-5 w-5 text-yellow-500 font-bold" />
              </Button>
            </div>
          )}
        </div>

        {/* News Grid - 4 Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 overflow-hidden">
          {news.slice(currentIndex, currentIndex + 4).map((newsItem, index) => (
            <motion.div
              key={newsItem.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.08 }}
              onClick={(e) => handleNewsClick(newsItem, e)}
              className="group cursor-pointer relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-500/20 hover:border-yellow-500/60 transition-all duration-400 hover:shadow-2xl hover:shadow-yellow-500/30 active:scale-95"
            >
              {/* Image Container */}
              <Image
                src={newsItem.imageUrl}
                alt={newsItem.title}
                fill
                className="object-cover group-hover:scale-125 transition-transform duration-700 ease-out"
              />

              {/* Base Dark Overlay - Always visible */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />

              {/* Enhanced Overlay on Hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

              {/* Content Container - Flexbox Layout */}
              <div className="absolute inset-0 flex flex-col justify-between p-4 z-10">
                {/* Top - Corner Accent */}
                <div className="flex justify-end">
                  <div className="w-2 h-2 rounded-full bg-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-lg shadow-yellow-400/50" />
                </div>

                {/* Bottom - Content */}
                <div className="space-y-2">
                  {/* Title - Always visible */}
                  <p className="text-white text-sm sm:text-base font-black line-clamp-2 leading-tight">
                    {newsItem.title}
                  </p>

                  {/* Description + Button Container - Only on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 space-y-2">
                    {/* Description */}
                    <p className="text-yellow-300 text-xs sm:text-sm font-semibold line-clamp-2">
                      {newsItem.description}
                    </p>

                    {/* Read More Button - Positioned clearly */}
                    <button
                      onClick={(e) => handleReadMore(e, newsItem)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black text-xs font-bold rounded-lg transition-all hover:shadow-lg hover:shadow-yellow-500/50 active:scale-95"
                    >
                      <BookOpen className="h-3 w-3" />
                      Read More
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pagination Dots */}
        {news.length > 4 && (
          <div className="flex justify-center items-center gap-2 pt-2">
            {Array.from({ length: Math.ceil(news.length / 4) }).map((_, i) => (
              <motion.button
                key={i}
                animate={{
                  width: currentIndex === i * 4 ? 32 : 10,
                  backgroundColor: currentIndex === i * 4 ? '#FBBF24' : '#4B5563',
                }}
                className="h-2 rounded-full transition-all cursor-pointer hover:brightness-125"
                onClick={() => setCurrentIndex(i * 4)}
                title={`Go to page ${i + 1}`}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Read More Modal */}
      <AnimatePresence>
        {selectedNewsForModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNewsForModal(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border-2 border-yellow-500/40 shadow-2xl shadow-yellow-500/20 max-w-2xl max-h-[85vh] overflow-y-auto w-full"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="sticky top-0 bg-gradient-to-r from-gray-900 to-black border-b border-yellow-500/20 p-6 flex items-center justify-between z-10">
                  <h3 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent line-clamp-2">
                    {selectedNewsForModal.title}
                  </h3>
                  <button
                    onClick={() => setSelectedNewsForModal(null)}
                    className="p-2 hover:bg-yellow-500/20 rounded-lg transition-all flex-shrink-0"
                  >
                    <X className="h-6 w-6 text-yellow-400" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-6">
                  {/* Image */}
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-yellow-500/30 shadow-lg">
                    <Image
                      src={selectedNewsForModal.imageUrl}
                      alt={selectedNewsForModal.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Description Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-yellow-400" />
                      <h4 className="text-lg font-bold text-yellow-400">Full Story</h4>
                    </div>
                    <p className="text-gray-100 leading-relaxed text-base whitespace-pre-wrap break-words bg-black/40 p-4 rounded-lg border border-yellow-500/20">
                      {selectedNewsForModal.description}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-yellow-500/20">
                    <Button
                      onClick={() => {
                        setSelectedNewsForModal(null);
                        if (selectedNewsForModal.redirectUrl.startsWith('http')) {
                          window.open(selectedNewsForModal.redirectUrl, '_blank');
                        } else {
                          window.location.href = selectedNewsForModal.redirectUrl;
                        }
                      }}
                      className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold text-base py-2.5 rounded-lg transition-all"
                    >
                      Read Full Article →
                    </Button>
                    <Button
                      onClick={() => setSelectedNewsForModal(null)}
                      variant="outline"
                      className="sm:px-6 border-2 border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10 font-semibold"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
