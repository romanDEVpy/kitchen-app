'use client';

import React from 'react';

export default function ConsultationButton({ className, children, detail = 'Консультация дизайнера' }) {
  return (
    <button 
      onClick={() => {
        window.dispatchEvent(new CustomEvent('open-consultation', { detail }));
      }}
      className={className}
    >
      {children}
    </button>
  );
}
