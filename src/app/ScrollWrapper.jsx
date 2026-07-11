'use client';

import React, { useRef, useState, useEffect } from 'react';
import KitchenCanvas from '@/components/3d/KitchenCanvas';
import ScrollModel from '@/components/3d/ScrollModel';
import { ArrowDown, Sparkles } from 'lucide-react';

const STAGE_CONTENT = {
  1: {
    title: "Этап 1: Лазерный замер и 3D-проект",
    desc: "Любая кухня начинается с лазерного замера помещения нашим дизайнером-технологом. Мы оцениваем углы, перепады стен и выводы коммуникаций с точностью до 1 мм. Это гарантирует, что готовый гарнитур встанет идеально ровно без зазоров и переделок при установке."
  },
  2: {
    title: "Этап 2: Влагостойкий эко-каркас E0.5",
    desc: "Сборка несущих корпусов из сертифицированного ЛДСП класса эмиссии E0.5 (одобрен для медицинских и детских учреждений). Все скрытые торцы деталей обрабатываются влагостойкой полиуретановой (PUR) кромкой для защиты от пара и разбухания."
  },
  3: {
    title: "Этап 3: Каменная столешница и мойка",
    desc: "Укладка столешницы из искусственного камня с бесшовным соединением стыков. Мойка монтируется подстольным методом с полимерной гидроизоляцией — это исключает скопление влаги, появление плесени и грязи на границах примыкания."
  },
  4: {
    title: "Этап 4: Монтаж техники и фасадов AGT/Alvic",
    desc: "Интеграция встроенной техники (духовой шкаф, плита, вытяжка) с соблюдением тепловых зазоров. Навеска фасадов и выравнивание зазоров по лазерному нивелиру. Мы выставляем швы шириной ровно 2.2 мм по всему периметру."
  },
  5: {
    title: "Этап 5: Фурнитура Blum с пожизненной гарантией",
    desc: "Тонкая регулировка австрийских скрытых петель и направляющих Blum/Hettich. Выдвижные ящики и дверцы открываются бесшумно, выдерживают нагрузку до 40 кг на ящик и плавно закрываются от легкого касания пальца."
  }
};

export default function ScrollWrapper() {
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [stage, setStage] = useState(1);
  const [displayedStage, setDisplayedStage] = useState(1);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const isLockedRef = useRef(false);
  const touchStartY = useRef(0);

  useEffect(() => {
    const checkDevice = () => {
      const ua = navigator.userAgent.toLowerCase();
      // Detect general mobile user agents
      const isMobileUA = /mobi|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
      // iPad Pro running iPadOS (identifies as Macintosh but supports touch points)
      const isIPadOS = (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      // Generic check for touch screen capability (Surface, Chromebook, Android tablets)
      const hasTouch = ('ontouchstart' in window || navigator.maxTouchPoints > 0);
      
      setIsMobileDevice(isMobileUA || isIPadOS || hasTouch);
    };
    checkDevice();
  }, []);

  const handleModelLoad = React.useCallback(() => {
    setIsLoaded(true);
  }, []);

  // Decouple stage from displayedStage to animate exit of old content
  useEffect(() => {
    if (stage !== displayedStage) {
      setIsFadingOut(true);
      const timer = setTimeout(() => {
        setDisplayedStage(stage);
        setIsFadingOut(false);
      }, 350); // Matches .stage-text-exit animation duration (0.35s)
      return () => clearTimeout(timer);
    }
  }, [stage, displayedStage]);

  useEffect(() => {
    const handleWheel = (e) => {
      if (isMobileDevice) return;
      if (window.innerWidth < 1024) return;
      if (!isLoaded) return;
      const isScrollAtTop = window.scrollY < 10;

      if (isScrollAtTop) {
        // Scroll Down (deltaY > 0)
        if (e.deltaY > 0) {
          if (stage < 5) {
            e.preventDefault();
            if (!isLockedRef.current) {
              isLockedRef.current = true;
              setStage(prev => Math.min(prev + 1, 5));
              setTimeout(() => { isLockedRef.current = false; }, 950); // 950ms lock cooldown
            }
          }
          // If we are at stage 5, do not call e.preventDefault(), letting page scroll down naturally
        }
        // Scroll Up (deltaY < 0)
        else if (e.deltaY < 0) {
          if (stage > 1) {
            e.preventDefault();
            if (!isLockedRef.current) {
              isLockedRef.current = true;
              setStage(prev => Math.max(prev - 1, 1));
              setTimeout(() => { isLockedRef.current = false; }, 950); // 950ms lock cooldown
            }
          }
        }
      } else {
        // If we are scrolled down, but the user scrolls up and hits window.scrollY === 0,
        // we lock the stage to 5 and intercept.
        if (window.scrollY <= 10 && e.deltaY < 0) {
          setStage(5);
        }
      }
    };

    const handleTouchStart = (e) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      if (isMobileDevice) return;
      if (window.innerWidth < 1024) return;
      if (!isLoaded) return;
      const isScrollAtTop = window.scrollY < 10;

      if (isScrollAtTop) {
        const deltaY = touchStartY.current - e.touches[0].clientY;

        if (deltaY > 30) {
          if (stage < 5) {
            if (e.cancelable) e.preventDefault();
            if (!isLockedRef.current) {
              isLockedRef.current = true;
              setStage(prev => Math.min(prev + 1, 5));
              setTimeout(() => { isLockedRef.current = false; }, 950);
            }
          }
        }
        else if (deltaY < -30) {
          if (stage > 1) {
            if (e.cancelable) e.preventDefault();
            if (!isLockedRef.current) {
              isLockedRef.current = true;
              setStage(prev => Math.max(prev - 1, 1));
              setTimeout(() => { isLockedRef.current = false; }, 950);
            }
          }
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [stage, isLoaded, isMobileDevice]);

  return (
    <>
      <div className={`w-full bg-neutral-900 text-white relative overflow-hidden ${isMobileDevice ? 'block' : 'block lg:hidden'}`}>
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40" 
          style={{ backgroundImage: "url('/images/kitchen1.webp')" }} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-900/80 to-neutral-950/90" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 md:py-28 flex flex-col justify-center min-h-[75vh] space-y-6">
          <div className="inline-flex items-center space-x-2 bg-red-650/95 text-white text-[9px] uppercase font-black px-3 py-1 rounded-full tracking-widest w-fit shadow-lg shadow-red-900/20">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>Цветков Мебель</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight uppercase">
            Кухни на заказ <br />
            <span className="text-red-500">в Москве и области</span>
          </h1>
          
          <p className="text-xs sm:text-sm text-neutral-300 max-w-xl font-light leading-relaxed">
            Собственное мебельное производство. Изготовление от 7 дней по индивидуальным размерам. Рассрочка 0% до 18 месяцев, гарантия до 5 лет. Замер и 3D-проект — бесплатно!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <a 
              href="#contacts-section" 
              className="bg-red-650 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider px-8 py-4 rounded-2xl text-center transition-all shadow-md active:scale-95"
            >
              Вызвать дизайнера
            </a>
            <a 
              href="#catalog-section" 
              className="bg-white/10 hover:bg-white/15 border border-white/20 text-white font-black text-xs uppercase tracking-wider px-8 py-4 rounded-2xl text-center transition-all backdrop-blur-sm active:scale-95"
            >
              Смотреть каталог
            </a>
          </div>
        </div>
      </div>

      {/* Desktop splitscreen 3D Showroom */}
      {!isMobileDevice && (
        <div 
          style={{ touchAction: (isLoaded && stage < 5) ? 'none' : 'auto' }} 
          className="hidden lg:block relative w-full h-screen overflow-hidden bg-white lg:bg-neutral-50"
        >
          {/* Sticky Splitscreen Layout */}
          <div className="w-full h-full flex flex-col lg:flex-row">
            {/* Left Side: Fading Information Cards */}
            <div className="w-full lg:w-1/3 h-[40vh] lg:h-full flex flex-col lg:justify-center justify-start pt-10 lg:pt-0 px-8 lg:px-12 bg-white lg:bg-gradient-to-r lg:from-neutral-50 lg:via-neutral-50/90 lg:to-transparent z-20 pointer-events-none select-none">
            <div className="space-y-4 lg:space-y-6 max-w-sm">
              <div className="inline-flex items-center space-x-2 bg-red-50 border border-red-200/60 px-3 py-1 rounded-full text-red-600 text-[10px] uppercase font-black tracking-widest stage-badge-reveal">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Шоурум сборки</span>
              </div>
              
              {/* Active Card Text Transitions - ONLY this wrapper plays the entry/exit animations */}
              {(() => {
                  const activeContent = STAGE_CONTENT[displayedStage] || STAGE_CONTENT[1];
                  return (
                    <div 
                      key={displayedStage} 
                      className={`lg:min-h-[160px] min-h-[130px] ${
                        isFadingOut ? 'stage-text-exit' : ''
                      }`}
                    >
                      <h1 className="text-2xl lg:text-3xl font-black text-neutral-900 leading-tight uppercase font-sans tracking-wide flex flex-wrap">
                        {activeContent.title.split(" ").map((word, idx) => (
                          <span key={idx} className="inline-block overflow-hidden mr-2 mb-1">
                            <span 
                              className="inline-block stage-word-reveal"
                              style={{ animationDelay: `${idx * 0.07}s` }}
                            >
                              {word}
                            </span>
                          </span>
                        ))}
                      </h1>
                      <p 
                        className="text-xs text-neutral-600 mt-4 leading-relaxed font-light stage-desc-fade"
                        style={{ animationDelay: '0.28s' }}
                      >
                        {activeContent.desc}
                      </p>
                    </div>
                  );
                })()}

              {/* Stage Progress Indicators (5 dots now) */}
              <div className="flex space-x-2 pt-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div
                    key={s}
                    onClick={() => !isLockedRef.current && setStage(s)}
                    className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer pointer-events-auto ${
                      stage === s ? 'w-8 bg-red-600' : 'w-2 bg-neutral-200 hover:bg-neutral-300'
                    }`}
                  />
                ))}
              </div>

              {/* Scroll Indicator */}
              <div className="flex items-center space-x-3 pt-4 text-neutral-500 text-[10px] font-bold uppercase tracking-wider">
                <ArrowDown className="w-3.5 h-3.5 animate-bounce text-red-500" />
                <span>
                  {stage === 5 ? "Листайте вниз к каталогу" : "Прокрутите для сборки"}
                </span>
              </div>
            </div>
          </div>

          {/* Right Side: R3F Canvas */}
          <div className="flex-1 h-[60vh] lg:h-full relative bg-white lg:bg-neutral-50">
            {/* Premium light studio vignette backdrop gradient */}
            <div className="absolute inset-0 bg-white lg:bg-[radial-gradient(circle_at_center,_#ffffff_0%,_#fafafa_60%,_#f3f3f3_100%)] pointer-events-none z-0" />
            
            <div className="w-full h-full relative z-10 pointer-events-none">
              <KitchenCanvas>
                <ScrollModel stage={stage} onLoad={handleModelLoad} />
              </KitchenCanvas>
            </div>

            {/* Absolute corner watermark details */}
            <div className="absolute bottom-6 right-6 z-20 bg-white/70 backdrop-blur-md border border-neutral-200 rounded-xl px-4 py-2 text-right shadow-sm">
              <span className="text-[10px] text-neutral-500 block font-medium">Цветков Мебель</span>
              <span className="text-xs font-black text-neutral-900 uppercase tracking-wider">Интерактивный 3D-рендер</span>
            </div>
          </div>

        </div>
      </div>
    )}
  </>
);
}
