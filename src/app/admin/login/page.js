'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, AlertCircle, Sparkles, Eye, EyeOff } from 'lucide-react';
import { getApiErrorMessage, parseApiResponse } from '@/lib/clientApi';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Hide site headers and footers
  useEffect(() => {
    const header = document.querySelector('nav');
    const topInfo = document.querySelector('header');
    const footer = document.querySelector('footer');
    
    if (header) header.style.display = 'none';
    if (topInfo) topInfo.style.display = 'none';
    if (footer) footer.style.display = 'none';
    
    return () => {
      if (header) header.style.display = '';
      if (topInfo) topInfo.style.display = '';
      if (footer) footer.style.display = '';
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      await parseApiResponse(res);
      router.push('/admin');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Login failed. Try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-neutral-200/80 p-8 rounded-3xl shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 bg-red-50 border border-red-200/60 px-3 py-1 rounded-full text-red-600 text-[10px] uppercase font-black tracking-widest">
            <Sparkles className="w-3 h-3" />
            <span>Панель управления</span>
          </div>
          <h1 className="text-2xl font-black text-neutral-900 uppercase">Цветков Мебель</h1>
          <p className="text-neutral-500 text-xs font-light">Введите учетные данные для доступа к админке</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-xs flex items-center space-x-2 animate-pulse">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">Пользователь</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input 
                type="text" 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin" 
                className="w-full bg-white border border-neutral-200 rounded-xl pl-10 pr-4 py-3 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-red-650"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">Пароль</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input 
                type={showPassword ? 'text' : 'password'} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-white border border-neutral-200 rounded-xl pl-10 pr-10 py-3 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-red-650"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-neutral-900 hover:bg-red-600 disabled:bg-neutral-400 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex justify-center items-center"
          >
            {loading ? 'Вход...' : 'Войти в панель'}
          </button>
        </form>
      </div>
    </div>
  );
}
