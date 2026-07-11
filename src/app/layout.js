export const dynamic = 'force-dynamic';

import "./globals.css";
import Link from "next/link";
import { Phone, MapPin, Send, MessageSquare } from "lucide-react";
import ContactForm from "@/components/ContactForm";
import FetchPatch from "@/components/FetchPatch";

export const metadata = {
  title: "Цветков Мебель | Кухни на заказ в Москве и области",
  description: "Изготовление качественных кухонь на заказ от 7 дней в Москве. Собственное производство, рассрочка до 18 месяцев, гарантия до 5 лет.",
  metadataBase: new URL('https://tsvetkovmebel.ru'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Цветков Мебель | Кухни на заказ в Москве и области",
    description: "Изготовление качественных кухонь на заказ от 7 дней в Москве. Собственное производство, рассрочка до 18 месяцев, гарантия до 5 лет.",
    url: 'https://tsvetkovmebel.ru',
    siteName: 'Цветков Мебель',
    locale: 'ru_RU',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru" className="h-full scroll-smooth">
      <body className="min-h-full flex flex-col bg-white text-neutral-800 font-sans selection:bg-red-650 selection:text-white">
        <FetchPatch />
        {/* Header Top Info Bar */}
        <header className="hidden md:block w-full bg-neutral-50 border-b border-neutral-200 text-xs text-neutral-600 py-2.5 px-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-red-500" />
                <span>Москва и область | Без выходных</span>
              </span>
            </div>
            
            <div className="flex items-center space-x-6">
              <a href="tel:84951359293" className="hover:text-red-650 transition-colors font-semibold">
                8 (495) 135-92-93
              </a>
              <a href="tel:89260404792" className="hover:text-red-650 transition-colors font-semibold">
                8 (926) 040-47-92
              </a>
              <div className="flex items-center space-x-2 border-l border-neutral-200 pl-4">
                <a href="https://t.me/tsvetkovmebel" target="_blank" rel="noopener noreferrer" className="p-1 hover:text-neutral-900 transition-colors" title="Telegram">
                  <Send className="w-3.5 h-3.5 text-sky-500" />
                </a>
                <a href="https://wa.me/79260404792" target="_blank" rel="noopener noreferrer" className="p-1 hover:text-neutral-900 transition-colors" title="WhatsApp">
                  <MessageSquare className="w-3.5 h-3.5 text-green-500" />
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Bar */}
        <nav className="hidden md:block sticky top-0 z-40 w-full bg-white/85 backdrop-blur-md border-b border-neutral-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="flex space-x-0.5">
                <span className="w-2.5 h-7 bg-red-600 block rounded-sm transform -skew-x-12"></span>
                <span className="w-2.5 h-7 bg-neutral-500 block rounded-sm transform -skew-x-12"></span>
                <span className="w-2.5 h-7 bg-neutral-300 block rounded-sm transform -skew-x-12"></span>
              </div>
              <div className="flex flex-col">
                <span className="font-black text-lg tracking-wider text-neutral-900 group-hover:text-red-650 transition-colors uppercase leading-none">
                  Цветков Мебель
                </span>
                <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-medium leading-none mt-1">
                  мебель для всей семьи
                </span>
              </div>
            </Link>

            {/* Menu Links */}
            <div className="hidden lg:flex items-center space-x-8 text-xs font-bold uppercase tracking-widest text-neutral-600">
              <Link href="/#about-section" className="hover:text-red-500 transition-colors">О нас</Link>
              <Link href="/#catalog-section" className="hover:text-red-500 transition-colors">Кухни</Link>
              <Link href="/#promos-section" className="hover:text-red-500 transition-colors">Акции</Link>
              <Link href="/#installment-section" className="hover:text-red-500 transition-colors">Рассрочка</Link>
              <Link href="/#reviews-section" className="hover:text-red-500 transition-colors">Отзывы</Link>
              <Link href="/#faq-section" className="hover:text-red-500 transition-colors">Вопрос-ответ</Link>
              <Link href="/#contacts-section" className="hover:text-red-500 transition-colors">Контакты</Link>
            </div>

            {/* Call to Action */}
            <div className="flex items-center space-x-3">
              <Link
                href="/#contacts-section"
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:shadow-lg transition-all shadow-sm"
              >
                Вызвать дизайнера
              </Link>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <main className="flex-1 flex flex-col">{children}</main>

        {/* Footer */}
        <footer className="w-full bg-neutral-50 border-t border-neutral-200 px-6 py-12 text-sm text-neutral-600">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Column 1: Logo & Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex space-x-0.5">
                  <span className="w-2.5 h-7 bg-red-600 block rounded-sm transform -skew-x-12"></span>
                  <span className="w-2.5 h-7 bg-neutral-500 block rounded-sm transform -skew-x-12"></span>
                  <span className="w-2.5 h-7 bg-neutral-300 block rounded-sm transform -skew-x-12"></span>
                </div>
                <span className="font-black text-lg tracking-wider text-neutral-900 uppercase">Цветков Мебель</span>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Собственное производство мебели по индивидуальным проектам. Воплощаем уют и комфорт в вашем доме на протяжении 15 лет.
              </p>
              <p className="text-[10px] text-neutral-400">
                © {new Date().getFullYear()} Цветков Мебель. Все права защищены.
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h3 className="font-bold text-xs uppercase tracking-widest text-neutral-950 mb-4">Навигация</h3>
              <ul className="space-y-2.5 text-xs">
                <li><Link href="/#about-section" className="hover:text-red-500 transition-colors">О нашей компании</Link></li>
                <li><Link href="/#catalog-section" className="hover:text-red-500 transition-colors">Каталог кухонь</Link></li>
                <li><Link href="/#promos-section" className="hover:text-red-500 transition-colors">Наши спецпредложения</Link></li>
                <li><Link href="/#installment-section" className="hover:text-red-500 transition-colors">Рассрочка без переплат</Link></li>
              </ul>
            </div>

            {/* Column 3: Legal Info */}
            <div>
              <h3 className="font-bold text-xs uppercase tracking-widest text-neutral-950 mb-4">Контакты и реквизиты</h3>
              <ul className="space-y-2.5 text-xs">
                <li>ИП Блескина Яна Геннадьевна</li>
                <li>ИНН: 330701328943</li>
                <li>ОГРН: 310333403300019</li>
                <li>Email: <a href="mailto:Tsvetkov-mebel@mail.ru" className="hover:text-red-500 transition-colors">Tsvetkov-mebel@mail.ru</a></li>
              </ul>
            </div>

            {/* Column 4: Warning / Disclaimer */}
            <div className="space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-widest text-neutral-950 mb-4">Оферта</h3>
              <p className="text-[10px] text-neutral-450 leading-relaxed font-light">
                * Вся представленная на сайте информация, касающаяся стоимости товаров, носит информационный характер и ни при каких условиях не является публичной офертой, определяемой положениями Статьи 437(2) Гражданского кодекса РФ.
              </p>
            </div>
          </div>
        </footer>
        
        {/* Global multi-step kitchen calculator / consultation configurator */}
        <ContactForm />
      </body>
    </html>
  );
}
