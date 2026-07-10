'use client';

import React, { useState } from 'react';

export default function FAQAccordion({ items }) {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggle = (idx) => {
    setActiveIndex(prev => prev === idx ? null : idx);
  };

  return (
    <div className="space-y-4">
      {items.map((item, idx) => {
        const isOpen = activeIndex === idx;
        return (
          <div
            key={idx}
            className="group bg-white border border-neutral-200/80 rounded-2xl p-5 cursor-pointer select-none transition-all duration-300 hover:border-neutral-350 shadow-sm"
            onClick={() => toggle(idx)}
          >
            <div className="flex items-center justify-between">
              <h3 className={`font-bold text-sm transition-colors duration-350 ${
                isOpen ? 'text-red-600' : 'text-neutral-900 group-hover:text-red-600'
              }`}>
                {item.q}
              </h3>
              <span className={`shrink-0 ml-1.5 p-1.5 rounded-full bg-neutral-50 border border-neutral-200 text-neutral-400 transition-all duration-500 ${
                isOpen ? 'rotate-180 text-red-600 border-red-200 bg-red-50/50' : 'group-hover:text-red-600'
              }`}>
                ▼
              </span>
            </div>
            
            {/* Liquid-Smooth CSS Grid Auto-Height Accordion Transition */}
            <div
              className={`grid transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isOpen 
                  ? 'grid-rows-[1fr] opacity-100 mt-4' 
                  : 'grid-rows-[0fr] opacity-0 mt-0'
              }`}
            >
              <div className="overflow-hidden">
                <p className="text-xs text-neutral-600 leading-relaxed font-light border-t border-neutral-100 pt-4">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
