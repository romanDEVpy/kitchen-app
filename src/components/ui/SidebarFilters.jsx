'use client';

import React from 'react';
import { SlidersHorizontal } from 'lucide-react';

const SHAPES = ['Все', 'угловая', 'П-образная', 'прямая', 'с островом'];

export default function SidebarFilters({
  selectedShape,
  setSelectedShape,
  selectedFronts,
  onFrontToggle,
  frontTypes = []
}) {
  return (
    <div className="w-full lg:w-64 shrink-0 bg-white border border-neutral-200/80 p-6 rounded-2xl h-fit shadow-sm">
      <div className="flex items-center space-x-2 pb-4 mb-6 border-b border-neutral-100">
        <SlidersHorizontal className="w-4 h-4 text-red-500" />
        <h2 className="font-bold text-lg text-neutral-900">Фильтры</h2>
      </div>

      {/* Shapes Filter */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
          Форма кухни
        </h3>
        <div className="space-y-1">
          {SHAPES.map(shape => (
            <button
              key={shape}
              onClick={() => setSelectedShape(shape)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all capitalize ${
                selectedShape === shape
                  ? 'bg-red-600 text-white font-semibold shadow-sm'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
              }`}
            >
              {shape === 'Все' ? 'Все кухни' : `${shape} кухня`}
            </button>
          ))}
        </div>
      </div>

      {/* Facades Filter */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
          Тип фасадов
        </h3>
        <div className="space-y-2">
          {frontTypes.map(front => (
            <label 
              key={front}
              className="flex items-center space-x-3 cursor-pointer text-sm text-neutral-600 hover:text-neutral-900 group select-none"
            >
              <input
                type="checkbox"
                checked={!!selectedFronts[front]}
                onChange={() => onFrontToggle(front)}
                className="w-4 h-4 rounded border-neutral-300 bg-neutral-50 text-red-600 focus:ring-red-500 focus:ring-offset-white focus:ring-2 cursor-pointer transition-colors"
              />
              <span className="group-hover:translate-x-0.5 transition-transform">{front}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
