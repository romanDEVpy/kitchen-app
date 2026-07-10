import React from 'react';
import Catalog from '@/components/ui/Catalog';
import { ArrowLeft, PhoneCall } from 'lucide-react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const metadata = {
  title: "Каталог кухонь на заказ в Москве - Цены и фото кухонь",
  description: "Полноценный каталог дизайнерских кухонь от Цветков Мебель. Фильтруйте по форме кухонь и материалам фасадов: Alvic, AGT, Fenix, эмали и пластику.",
};

export default async function CatalogPage() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
  return (
    <div className="w-full bg-neutral-50 min-h-screen text-neutral-900">
      {/* Hide global site layout header/nav on this page */}
      <style dangerouslySetInnerHTML={{__html: `
        header.w-full.bg-neutral-50 { display: none !important; }
        nav.sticky.top-0.z-40 { display: none !important; }
      `}} />

      {/* Sticky Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-neutral-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-neutral-600 hover:text-red-600 transition-colors text-xs font-bold uppercase tracking-wider group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>На главную</span>
          </Link>
          <Link href="/" className="text-sm font-black text-neutral-900 uppercase tracking-wider">
            Цветков Мебель
          </Link>
          <a
            href="tel:84951359293"
            className="inline-flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl text-[10px] uppercase tracking-wider transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">8 (495) 135-92-93</span>
            <span className="sm:hidden">Позвонить</span>
          </a>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 text-center mb-8 pt-12">
        <span className="text-red-500 font-bold uppercase tracking-wider text-xs">Выполненные работы</span>
        <h1 className="text-4xl font-black text-neutral-900 mt-1 uppercase">Каталог кухонь</h1>
        <p className="text-neutral-600 text-sm mt-3 max-w-xl mx-auto">
          Ознакомьтесь с нашими выполненными проектами кухонь. Вы можете отфильтровать их по форме планировки и используемым фасадам.
        </p>
      </div>

      {/* Filterable Catalog Grid */}
      <Catalog initialProducts={products} />
    </div>
  );
}
