'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Eye, X, Calculator, ChevronLeft, ChevronRight, Check, ChevronDown } from 'lucide-react';
import SidebarFilters from './SidebarFilters';
import { getApiErrorMessage, parseApiResponse } from '@/lib/clientApi';

// Beautiful custom multi-select dropdown component
function CustomMultiSelect({ label, options, selected, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = (option) => {
    if (selected.includes(option)) {
      if (selected.length > 1) {
        onChange(selected.filter(item => item !== option));
      }
    } else {
      onChange([...selected, option]);
    }
  };

  const displayText = selected.join(', ');

  return (
    <div className="space-y-1.5 relative w-full" ref={containerRef}>
      <label className="text-[10px] font-bold uppercase text-neutral-400 tracking-wider block">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white hover:bg-neutral-50 border border-neutral-200/80 rounded-xl px-4 py-3 text-xs text-neutral-800 text-left flex justify-between items-center transition-all focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-500 hover:shadow-sm h-[44px]"
      >
        <span className="truncate pr-4 font-semibold text-neutral-900">{displayText || 'Выберите варианты'}</span>
        <ChevronDown 
          className="w-4 h-4 text-neutral-400 transition-transform duration-300 ease-out"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 bg-white/95 backdrop-blur-md border border-neutral-100 rounded-2xl shadow-xl z-30 max-h-60 overflow-y-auto py-2 transition-all duration-300 transform origin-top scale-100 ease-out">
          {options.map((opt) => {
            const isChecked = selected.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => handleToggle(opt)}
                className="w-full text-left px-4 py-3 text-xs text-neutral-800 hover:bg-red-50/40 hover:text-red-700 flex items-center justify-between transition-all group"
              >
                <span className={`transition-transform duration-200 group-hover:translate-x-1 ${isChecked ? 'font-bold text-red-600' : 'text-neutral-600'}`}>
                  {opt}
                </span>
                <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                  isChecked ? 'bg-red-600 border-red-600 text-white scale-105 shadow-sm shadow-red-500/25' : 'border-neutral-300 bg-white group-hover:border-neutral-400'
                }`}>
                  {isChecked && <Check className="w-2.5 h-2.5 stroke-[3.5]" />}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Catalog({ onOpenConsultation, limit = null, hideFilters = false, showFeaturedOnly = false, initialProducts = null }) {
  const [products, setProducts] = useState(initialProducts || []);
  const [filteredProducts, setFilteredProducts] = useState(initialProducts || []);
  const [loading, setLoading] = useState(!initialProducts);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filters State
  const [selectedShape, setSelectedShape] = useState('Все');
  const [selectedFronts, setSelectedFronts] = useState({});

  // Modal spec state
  const [activeProduct, setActiveProduct] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [selectedFacades, setSelectedFacades] = useState([]);
  const [selectedHardwares, setSelectedHardwares] = useState([]);
  const [selectedCountertops, setSelectedCountertops] = useState([]);

  // Lock body scroll when product detail modal is active
  useEffect(() => {
    if (activeProduct) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeProduct]);

  // Dynamically extract lists based on database data (so custom items appear immediately)
  const FRONT_TYPES_LIST = React.useMemo(() => {
    const set = new Set(['AGT', 'Alvic', 'Fenix', 'ЛДСП', 'ЛДСП EGGER', 'МДФ ПВХ', 'МДФ эмаль', 'Пластик']);
    products.forEach(p => {
      if (p.frontType) set.add(p.frontType);
    });
    return Array.from(set);
  }, [products]);

  const HARDWARE_LIST = React.useMemo(() => {
    const set = new Set(['Blum (Австрия)', 'Hettich (Германия)', 'Boyard (Россия)', 'DTC (Китай)']);
    products.forEach(p => {
      if (p.hardware) {
        p.hardware.split(',').forEach(h => set.add(h.trim()));
      }
    });
    return Array.from(set);
  }, [products]);

  const COUNTERTOP_LIST = React.useMemo(() => {
    const set = new Set(['ЛЮКСФОРМ (Пластик HPL)', 'Искусственный камень (Акрил)', 'Кварцевый агломерат', 'Керамогранит', 'Массив дерева']);
    products.forEach(p => {
      if (p.materials) {
        p.materials.split(',').forEach(m => set.add(m.trim()));
      }
    });
    return Array.from(set);
  }, [products]);

  useEffect(() => {
    if (initialProducts) return;
    async function fetchProducts() {
      try {
        const res = await fetch('/api/products');
        const data = await parseApiResponse(res);
        setProducts(data);
        setFilteredProducts(data);
      } catch (err) {
        console.error('Catalog fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [initialProducts]);

  const handleFrontToggle = (front) => {
    setSelectedFronts(prev => ({
      ...prev,
      [front]: !prev[front]
    }));
  };

  // Sync filters
  useEffect(() => {
    let result = products;

    if (showFeaturedOnly) {
      result = result.filter(p => p.showOnMain);
    }

    if (selectedShape !== 'Все') {
      result = result.filter(p => p.shape === selectedShape);
    }

    const activeFronts = Object.entries(selectedFronts)
      .filter(([_, checked]) => checked)
      .map(([name]) => name);

    if (activeFronts.length > 0) {
      result = result.filter(p => activeFronts.includes(p.frontType));
    }

    setFilteredProducts(result);
  }, [selectedShape, selectedFronts, products, showFeaturedOnly]);

  const openProduct = (product) => {
    setActiveProduct(product);
    setActiveImageIndex(0);

    // Set initial choices in arrays
    setSelectedFacades(product.frontType ? [product.frontType] : ['ЛДСП']);
    
    // Extract hardware options
    const hardwareVal = product.hardware || 'Blum';
    const parsedHardwares = hardwareVal.split(',').map(s => s.trim()).filter(Boolean);
    setSelectedHardwares(parsedHardwares.length > 0 ? parsedHardwares : ['Blum (Австрия)']);

    // Countertop default
    const materialsVal = product.materials || 'ЛЮКСФОРМ (Пластик HPL)';
    const parsedCountertops = materialsVal.split(',').map(s => s.trim()).filter(Boolean);
    setSelectedCountertops(parsedCountertops.length > 0 ? parsedCountertops : ['ЛЮКСФОРМ (Пластик HPL)']);
  };

  // Generate thumbnail set for slider
  const getProductImages = (prod) => {
    if (!prod) return [];
    return [
      prod.imageUrl ? prod.imageUrl.split(',')[0] : '/images/kitchen-default.jpg',
      '/images/kitchen1_thumb1.jpg',
      '/images/kitchen1_thumb2.jpg',
      '/images/kitchen1_thumb3.jpg'
    ].filter(Boolean);
  };

  const productImages = getProductImages(activeProduct);
  const touchStartXRef = useRef(0);

  const handlePrevImage = () => {
    setActiveImageIndex(prev => (prev === 0 ? productImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex(prev => (prev === productImages.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchStartXRef.current - touchEndX;

    // Minimum distance of 50px to trigger swipe
    if (deltaX > 50) {
      handleNextImage();
    } else if (deltaX < -50) {
      handlePrevImage();
    }
  };

  const displayedProducts = limit ? filteredProducts.slice(0, limit) : filteredProducts;

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-6">
      <div className={hideFilters ? "" : "flex flex-col lg:flex-row gap-8"}>
        
        {/* Filters Sidebar */}
        {!hideFilters && (
          <SidebarFilters
            selectedShape={selectedShape}
            setSelectedShape={setSelectedShape}
            selectedFronts={selectedFronts}
            onFrontToggle={handleFrontToggle}
            frontTypes={FRONT_TYPES_LIST}
          />
        )}

        {/* Products Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : displayedProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center h-96 bg-white border border-neutral-200 rounded-2xl p-8 shadow-sm">
              <p className="text-neutral-500 text-lg">Работы с выбранными фасадами или формами не найдены.</p>
              <button
                onClick={() => {
                  setSelectedShape('Все');
                  setSelectedFronts({});
                }}
                className="mt-4 text-xs font-bold tracking-wider uppercase text-red-500 hover:underline"
              >
                Сбросить фильтры
              </button>
            </div>
          ) : (
            <div>
              <div className={hideFilters ? "flex flex-wrap justify-center gap-6" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
                {displayedProducts.map(product => {
                  const images = product.imageUrl ? product.imageUrl.split(',') : [];
                  const coverImage = images[0] || '/images/kitchen-default.jpg';
                  return (
                    <div 
                      key={product.id}
                      onClick={() => openProduct(product)}
                      className={`${
                        hideFilters 
                          ? "w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] max-w-[370px] flex-shrink-0" 
                          : "w-full"
                      } bg-white border border-neutral-200/80 rounded-2xl overflow-hidden flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-lg hover:border-neutral-300 group cursor-pointer shadow-sm`}
                    >
                      <div className="relative aspect-[4/3] bg-neutral-50 overflow-hidden">
                        <img 
                          src={coverImage} 
                          alt={product.title} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute top-4 left-4 bg-red-600/90 text-white text-[9px] uppercase font-black px-2 py-0.5 rounded tracking-wider shadow-sm">
                          {product.frontType.split(',')[0]}
                        </div>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] text-neutral-500 uppercase tracking-widest block font-bold">{product.shape} кухня</span>
                          <h3 className="text-base font-bold text-neutral-900 mt-1">{product.title}</h3>
                          <p className="text-xs text-neutral-500 mt-2 line-clamp-2 leading-relaxed">{product.description}</p>
                        </div>

                        <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between">
                          <div>
                            <span className="text-[9px] text-neutral-400 block uppercase font-bold">Цена от</span>
                            <span className="text-sm font-black text-neutral-900">{product.price.toLocaleString('ru-RU')} ₽</span>
                          </div>
                          <div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (typeof onOpenConsultation === 'function') {
                                  onOpenConsultation(product.title);
                                } else {
                                  window.dispatchEvent(new CustomEvent('open-consultation', { detail: product.title }));
                                }
                              }}
                              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors uppercase shadow-sm"
                            >
                              Расчет
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Centered Premium Link to Full Catalog */}
              {limit && filteredProducts.length > limit && (
                <div className="text-center mt-12">
                  <a 
                    href="/catalog" 
                    className="inline-flex items-center justify-center bg-red-600 hover:bg-red-750 text-white font-black text-xs uppercase tracking-wider px-8 py-4 rounded-2xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                  >
                    Смотреть полный каталог
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal (Карточка товара в соответствии с оригиналом) */}
      {activeProduct && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-5xl bg-white text-neutral-900 border border-neutral-200 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[92vh] overflow-y-auto p-6 md:p-8 gap-8">
            
            {/* Close button top right */}
            <button
              onClick={() => setActiveProduct(null)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-900 z-10 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Left Column: Product Image Slider and Thumbnails */}
            <div className="flex-1 flex flex-col">
              {/* Slider Main View */}
              <div 
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="relative aspect-[4/3] bg-neutral-100 rounded-2xl overflow-hidden group shadow-sm touch-pan-y"
              >
                {/* Slide Track */}
                <div 
                  className="w-full h-full flex"
                  style={{
                    transform: `translateX(-${activeImageIndex * 100}%)`,
                    transition: 'transform 450ms cubic-bezier(0.25, 1, 0.5, 1)'
                  }}
                >
                  {productImages.map((img, idx) => (
                    <div key={idx} className="w-full h-full flex-shrink-0">
                      <img 
                        src={img} 
                        alt={activeProduct.title} 
                        className="w-full h-full object-cover select-none"
                        draggable="false"
                      />
                    </div>
                  ))}
                </div>

                {/* Arrow navigation */}
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-neutral-800 hidden md:flex items-center justify-center shadow hover:scale-105 active:scale-95 transition-all z-10"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-neutral-800 hidden md:flex items-center justify-center shadow hover:scale-105 active:scale-95 transition-all z-10"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Thumbnails row below */}
              <div className="flex space-x-3 mt-4 overflow-x-auto pb-2">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                      activeImageIndex === idx ? 'border-red-600 scale-95 shadow-sm' : 'border-transparent hover:border-neutral-300'
                    }`}
                  >
                    <img src={img} alt="Миниатюра" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: Spec Selector Panel */}
            <div className="flex-1 flex flex-col justify-between space-y-6">
              
              {/* Title & Article */}
              <div>
                <h2 className="text-2xl font-black text-neutral-900 tracking-tight">{activeProduct.title}</h2>
              </div>

              {/* Select Options Custom Multi-Select Dropdowns */}
              <div className="grid grid-cols-1 gap-4">
                <CustomMultiSelect 
                  label="Фасады"
                  options={FRONT_TYPES_LIST}
                  selected={selectedFacades}
                  onChange={setSelectedFacades}
                />
                
                <CustomMultiSelect 
                  label="Столешница"
                  options={COUNTERTOP_LIST}
                  selected={selectedCountertops}
                  onChange={setSelectedCountertops}
                />

                <CustomMultiSelect 
                  label="Фурнитура"
                  options={HARDWARE_LIST}
                  selected={selectedHardwares}
                  onChange={setSelectedHardwares}
                />
              </div>

              {/* Call to Action Button */}
              <div>
                <button
                  onClick={() => {
                    const title = activeProduct.title;
                    setActiveProduct(null);
                    if (typeof onOpenConsultation === 'function') {
                      onOpenConsultation(title);
                    } else {
                      window.dispatchEvent(new CustomEvent('open-consultation', { detail: title }));
                    }
                  }}
                  className="w-full bg-[#d32f2f] hover:bg-[#b71c1c] text-white text-xs font-bold py-4 rounded-xl uppercase tracking-wider transition-colors text-center shadow-lg shadow-red-900/10 flex items-center justify-center space-x-2"
                >
                  <Calculator className="w-4 h-4" />
                  <span>Заказать расчет</span>
                </button>
              </div>

              {/* Spec parameters list (Exact layout matches screenshot) */}
              <div className="space-y-2 text-xs text-neutral-700 leading-relaxed pt-2 border-t border-neutral-100">
                <div>Высота: <span className="font-semibold text-neutral-900">{activeProduct.height || 2500}</span></div>
                <div>Ширина: <span className="font-semibold text-neutral-900">{activeProduct.width || 4800}</span></div>
                <div>Глубина: <span className="font-semibold text-neutral-900">{activeProduct.depth || 1600}</span></div>
                <div>Фасады: <span className="font-semibold text-neutral-900">{selectedFacades.join(', ')}</span></div>
                <div>Столешница: <span className="font-semibold text-neutral-900">{selectedCountertops.join(', ')}</span></div>
                <div>Фурнитура: <span className="font-semibold text-neutral-900">{selectedHardwares.join(', ')}</span></div>
                <div>Подсветка: <span className="font-semibold text-neutral-900">{activeProduct.backlight || 'Диодная - теплая'}</span></div>
                <div>Сушка + лоток для столовых приборов</div>
                <div>Метраж: <span className="font-semibold text-neutral-900">{(activeProduct.width ? (activeProduct.width / 1000 + (activeProduct.depth ? activeProduct.depth / 1000 : 0)).toFixed(1) : 6)} погонных метров</span></div>
              </div>

            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
