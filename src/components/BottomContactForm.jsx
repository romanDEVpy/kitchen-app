'use client';

import React, { useState } from 'react';
import { CheckCircle2, ShieldAlert } from 'lucide-react';
import { getApiErrorMessage, parseApiResponse } from '@/lib/clientApi';

export default function BottomContactForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !phone) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          kitchenLength: comments // Save comments in kitchenLength field
        })
      });

      await parseApiResponse(res);
      setSuccess(true);
      setName('');
      setPhone('');
      setComments('');
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err, 'Could not send the request. Try again.'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-neutral-50 border border-neutral-250 p-8 rounded-3xl space-y-6 shadow-sm text-center py-16 animate-fade-in">
        <div className="mx-auto w-12 h-12 bg-green-50 border border-green-200 rounded-full flex items-center justify-center shadow-sm">
          <CheckCircle2 className="w-7 h-7 text-green-600" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-neutral-900 uppercase">Заявка отправлена!</h3>
          <p className="text-xs text-neutral-600 leading-relaxed font-light">
            Спасибо! Мы свяжемся с вами в течение 15 минут для согласования деталей расчета.
          </p>
        </div>
        <button
          onClick={() => setSuccess(false)}
          className="text-xs font-bold text-red-600 hover:text-red-700 uppercase tracking-wider"
        >
          Отправить еще одну
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-neutral-50 border border-neutral-250 p-8 rounded-3xl space-y-6 shadow-sm">
      <h3 className="text-lg font-bold text-neutral-900">Заявка на расчет стоимости</h3>
      
      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">Имя</label>
          <input 
            type="text" 
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Иван" 
            className="w-full bg-white border border-neutral-250 rounded-xl px-4 py-3 text-xs text-neutral-900 placeholder-neutral-450 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-500/20"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">Телефон</label>
          <input 
            type="tel" 
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+7 (999) 000-00-00" 
            className="w-full bg-white border border-neutral-250 rounded-xl px-4 py-3 text-xs text-neutral-900 placeholder-neutral-450 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-500/20"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">Размеры кухни (пожелания)</label>
          <textarea 
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Прямая кухня 3.6 метра..." 
            rows={3} 
            className="w-full bg-white border border-neutral-250 rounded-xl px-4 py-3 text-xs text-neutral-900 placeholder-neutral-450 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-500/20 resize-none"
          />
        </div>
      </div>
      
      <button 
        type="submit"
        disabled={loading}
        className="w-full bg-red-600 hover:bg-red-700 disabled:bg-neutral-350 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider hover:shadow-lg transition-all cursor-pointer"
      >
        {loading ? 'Отправка...' : 'Отправить заявку'}
      </button>
    </form>
  );
}
