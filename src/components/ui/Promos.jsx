'use client';

import React from 'react';

export default function Promos({ promos }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {promos.map(promo => (
        <div 
          key={promo.id}
          className="bg-white border border-neutral-200/80 rounded-3xl p-6 relative overflow-hidden group flex flex-col justify-between hover:border-neutral-350 hover:shadow-md transition-all shadow-sm"
        >
          <div className="space-y-4">
            <div className="px-4 h-14 min-w-[56px] w-fit bg-red-50 rounded-2xl flex items-center justify-center border border-red-200/50 text-red-600 font-black text-xs whitespace-nowrap uppercase tracking-wider">
              {promo.discount}
            </div>
            <h3 className="text-lg font-bold text-neutral-900 group-hover:text-red-600 transition-colors">{promo.title}</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">{promo.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
