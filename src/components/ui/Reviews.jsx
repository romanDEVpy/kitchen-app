'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Star, StarHalf, ChevronLeft, ChevronRight, Play } from 'lucide-react';

function getRutubeEmbedUrl(url) {
  if (!url) return null;
  const isRutube = /rutube\.ru/i.test(url);
  if (!isRutube) return null;

  const match = url.match(/(?:video|play\/embed|video\/private)\/([a-zA-Z0-9]+)/i);
  if (match && match[1]) {
    const id = match[1];
    let embedUrl = `https://rutube.ru/play/embed/${id}/`;
    try {
      const urlObj = new URL(url);
      const pParam = urlObj.searchParams.get('p');
      if (pParam) {
        embedUrl += `?p=${pParam}`;
      }
    } catch (e) {}
    return embedUrl;
  }
  return null;
}

function ReviewVideoPlayer({ videoUrl, thumbnailUrl }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const rutubeEmbedUrl = getRutubeEmbedUrl(videoUrl);

  if (!isPlaying) {
    return (
      <div 
        onClick={() => setIsPlaying(true)}
        className="mt-4 rounded-2xl overflow-hidden border border-neutral-200 aspect-video bg-neutral-900 shadow-inner relative group/video cursor-pointer flex items-center justify-center pointer-events-auto"
      >
        {/* Thumbnail overlay */}
        {thumbnailUrl ? (
          <img 
            src={thumbnailUrl} 
            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover/video:scale-105 transition-transform duration-500" 
            alt="Превью отзыва" 
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-tr from-neutral-950 to-neutral-850 opacity-80" />
        )}
        
        {/* Glowing Play Button */}
        <div className="relative z-10 w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-lg group-hover/video:scale-110 transition-all duration-300">
          <Play className="w-5 h-5 fill-current translate-x-0.5" />
        </div>
        
        <span className="absolute bottom-4 left-4 z-10 text-[9px] uppercase tracking-widest text-neutral-300 font-bold bg-neutral-950/40 backdrop-blur-sm px-2.5 py-1 rounded-md border border-white/10">
          Смотреть отзыв
        </span>
      </div>
    );
  }

  if (rutubeEmbedUrl) {
    return (
      <div className="mt-4 rounded-2xl overflow-hidden border border-neutral-200 aspect-video bg-neutral-950 shadow-inner relative group/video pointer-events-auto">
        <iframe
          src={rutubeEmbedUrl}
          frameBorder="0"
          allow="clipboard-write; autoplay"
          webkitallowfullscreen="true"
          mozallowfullscreen="true"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-2xl overflow-hidden border border-neutral-200 aspect-video bg-neutral-950 shadow-inner relative group/video pointer-events-auto">
      <video 
        src={videoUrl} 
        controls 
        autoPlay 
        playsInline
        className="w-full h-full object-cover"
      />
    </div>
  );
}

export default function Reviews({ reviews }) {
  const [visibleCount, setVisibleCount] = useState(3);
  
  // Adjust visible count on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleCount(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(2);
      } else {
        setVisibleCount(3);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const len = reviews.length;
  
  // State for index. We start at `len` because we pre-pend one full copy of reviews
  const [currentIndex, setCurrentIndex] = useState(len);
  const [isTransitionActive, setIsTransitionActive] = useState(true);
  const [isAutoScrollDisabled, setIsAutoScrollDisabled] = useState(false);
  const autoScrollTimer = useRef(null);
  const isTransitioningRef = useRef(false);

  // Triple the array to allow infinite scrolling in both directions
  const tripleReviews = React.useMemo(() => {
    if (reviews.length === 0) return [];
    return [...reviews, ...reviews, ...reviews];
  }, [reviews]);

  // Handle seamless index wrap
  const handleTransitionEnd = () => {
    isTransitioningRef.current = false;
    
    // If we scrolled past the second copy, wrap back to the second copy seamlessly
    if (currentIndex >= 2 * len) {
      setIsTransitionActive(false);
      setCurrentIndex(currentIndex - len);
    } 
    // If we scrolled before the second copy, wrap forward to the second copy seamlessly
    else if (currentIndex < len) {
      setIsTransitionActive(false);
      setCurrentIndex(currentIndex + len);
    }
  };

  // Re-enable transition after resetting index
  useEffect(() => {
    if (!isTransitionActive) {
      const timer = setTimeout(() => {
        setIsTransitionActive(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isTransitionActive]);

  // Auto-scroll loop
  useEffect(() => {
    if (reviews.length <= visibleCount || isAutoScrollDisabled) return;

    autoScrollTimer.current = setInterval(() => {
      if (isTransitioningRef.current) return;
      isTransitioningRef.current = true;
      setCurrentIndex((prev) => prev + 1);
      setTimeout(() => {
        isTransitioningRef.current = false;
      }, 800);
    }, 4000); // 4 seconds delay

    return () => {
      if (autoScrollTimer.current) clearInterval(autoScrollTimer.current);
    };
  }, [reviews.length, visibleCount, len, isAutoScrollDisabled]);

  const handlePrev = () => {
    if (isTransitioningRef.current) return;
    setIsAutoScrollDisabled(true);
    isTransitioningRef.current = true;
    setCurrentIndex((prev) => prev - 1);
    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 800);
  };

  const handleNext = () => {
    if (isTransitioningRef.current) return;
    setIsAutoScrollDisabled(true);
    isTransitioningRef.current = true;
    setCurrentIndex((prev) => prev + 1);
    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 800);
  };

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-12 text-neutral-400">
        Отзывов пока нет. Будьте первыми!
      </div>
    );
  }

  // If there aren't enough reviews to slide, just render them in a normal grid
  const showSlider = reviews.length > visibleCount;
  const activeDot = ((currentIndex - len) % len + len) % len;

  return (
    <div className="relative w-full">
      {showSlider ? (
        <>
          {/* Viewport container with overflow-hidden */}
          <div className="w-full overflow-hidden px-1 py-4">
            {/* Slide Track */}
            <div 
              className="flex gap-6"
              onTransitionEnd={handleTransitionEnd}
              style={{
                transform: `translateX(calc(-${currentIndex} * (100% + 24px) / ${visibleCount}))`,
                transition: isTransitionActive ? 'transform 700ms ease-in-out' : 'none',
              }}
            >
              {tripleReviews.map((review, index) => (
                <div 
                  key={`${review.id}-${index}`}
                  className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] flex-shrink-0 bg-white border border-neutral-200/80 rounded-3xl p-8 relative flex flex-col justify-between hover:border-neutral-350 hover:shadow-md transition-all shadow-sm min-h-[380px]"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="max-w-[70%]">
                        <h4 className="font-bold text-neutral-900 text-base">{review.title || 'Отзыв о кухне'}</h4>
                        <span className="text-[10px] text-neutral-500 block mt-0.5">Автор: {review.author}</span>
                      </div>
                      <div className="flex space-x-0.5 text-red-500 shrink-0">
                        {Array.from({ length: 5 }).map((_, i) => {
                          const starIndex = i + 1;
                          if (review.rating >= starIndex) {
                            return <Star key={i} className="w-3.5 h-3.5 fill-red-500 text-red-500" />;
                          } else if (review.rating >= starIndex - 0.5) {
                            return <StarHalf key={i} className="w-3.5 h-3.5 fill-red-500 text-red-500" />;
                          } else {
                            return <Star key={i} className="w-3.5 h-3.5 text-neutral-300" />;
                          }
                        })}
                      </div>
                    </div>
                    
                    <p className="text-xs text-neutral-600 leading-relaxed italic line-clamp-6">
                      &quot;{review.text}&quot;
                    </p>

                    {/* Inline Photo Gallery */}
                    {review.imageUrl && (
                      <div className="mt-4 flex gap-2 flex-wrap">
                        {review.imageUrl.split(',').filter(Boolean).map((url, imgIdx) => (
                          <img 
                            key={imgIdx}
                            src={url} 
                            alt={`${review.author} - фото ${imgIdx + 1}`}
                            className="w-20 h-20 object-cover rounded-xl border border-neutral-200 hover:scale-105 transition-transform cursor-pointer shadow-sm"
                          />
                        ))}
                      </div>
                    )}

                    {/* Inline Video Player */}
                    {review.videoUrl && (
                      <ReviewVideoPlayer 
                        videoUrl={review.videoUrl} 
                        thumbnailUrl={review.imageUrl ? review.imageUrl.split(',')[0] : null} 
                      />
                    )}
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-500">
                    <span className="flex items-center space-x-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Проверенный отзыв Цветков Мебель</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Navigation indicators */}
          <div className="flex justify-center space-x-2 mt-8">
            {reviews.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (isTransitioningRef.current) return;
                  setIsAutoScrollDisabled(true);
                  isTransitioningRef.current = true;
                  setCurrentIndex(len + idx);
                  setTimeout(() => {
                    isTransitioningRef.current = false;
                  }, 800);
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeDot === idx ? 'w-6 bg-red-600' : 'w-2 bg-neutral-200 hover:bg-neutral-300'
                }`}
              />
            ))}
          </div>

          {/* Redesigned Premium Floating Arrow Buttons */}
          <button
            onClick={handlePrev}
            className="absolute left-0 md:-left-6 top-[40%] -translate-y-1/2 bg-white border border-neutral-200 hover:border-neutral-350 w-12 h-12 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.1)] text-neutral-700 hover:text-red-650 transition-all z-25 cursor-pointer hidden md:flex items-center justify-center active:scale-90"
            title="Назад"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-0 md:-right-6 top-[40%] -translate-y-1/2 bg-white border border-neutral-200 hover:border-neutral-350 w-12 h-12 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.1)] text-neutral-700 hover:text-red-650 transition-all z-25 cursor-pointer hidden md:flex items-center justify-center active:scale-90"
            title="Вперед"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      ) : (
        /* Standard centered grid if not enough reviews to slide */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
          {reviews.map((review) => (
            <div 
              key={review.id}
              className="bg-white border border-neutral-200/80 rounded-3xl p-8 relative flex flex-col justify-between hover:border-neutral-350 hover:shadow-md transition-all shadow-sm min-h-[350px]"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="max-w-[70%]">
                    <h4 className="font-bold text-neutral-900 text-base">{review.title || 'Отзыв о кухне'}</h4>
                    <span className="text-[10px] text-neutral-500 block mt-0.5">Автор: {review.author}</span>
                  </div>
                  <div className="flex space-x-0.5 text-red-500 shrink-0">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const starIndex = i + 1;
                      if (review.rating >= starIndex) {
                        return <Star key={i} className="w-3.5 h-3.5 fill-red-500 text-red-500" />;
                      } else if (review.rating >= starIndex - 0.5) {
                        return <StarHalf key={i} className="w-3.5 h-3.5 fill-red-500 text-red-500" />;
                      } else {
                        return <Star key={i} className="w-3.5 h-3.5 text-neutral-300" />;
                      }
                    })}
                  </div>
                </div>
                
                <p className="text-xs text-neutral-600 leading-relaxed italic line-clamp-6">
                  &quot;{review.text}&quot;
                </p>

                {/* Inline Photo Gallery */}
                {review.imageUrl && (
                  <div className="mt-4 flex gap-2 flex-wrap">
                    {review.imageUrl.split(',').filter(Boolean).map((url, imgIdx) => (
                      <img 
                        key={imgIdx}
                        src={url} 
                        alt={`${review.author} - фото ${imgIdx + 1}`}
                        className="w-20 h-20 object-cover rounded-xl border border-neutral-200 hover:scale-105 transition-transform cursor-pointer shadow-sm"
                      />
                    ))}
                  </div>
                )}

                {/* Inline Video Player */}
                {review.videoUrl && (
                  <ReviewVideoPlayer 
                    videoUrl={review.videoUrl} 
                    thumbnailUrl={review.imageUrl ? review.imageUrl.split(',')[0] : null} 
                  />
                )}
              </div>
              
              <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-500">
                <span className="flex items-center space-x-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Проверенный отзыв Цветков Мебель</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
