export const dynamic = 'force-dynamic';

import React from 'react';
import { prisma } from '@/lib/prisma';
import Catalog from '@/components/ui/Catalog';
import Promos from '@/components/ui/Promos';
import Reviews from '@/components/ui/Reviews';
import FAQAccordion from '@/components/ui/FAQAccordion';
import ScrollWrapper from './ScrollWrapper'; // Client-side state container
import ContactForm from '@/components/ContactForm';
import ConsultationButton from '@/components/ui/ConsultationButton';
import { 
  ShieldCheck, 
  Clock, 
  Calculator, 
  HelpCircle, 
  PhoneCall, 
  MapPin,
  Sparkles,
  CheckCircle2,
  Share2
} from 'lucide-react';

// Dynamic SEO metadata generation
export async function generateMetadata() {
  return {
    title: "Цветков Мебель | Кухни на заказ в Москве и области",
    description: "Изготовление качественных кухонь на заказ от 7 дней в Москве. Собственное производство, рассрочка до 18 месяцев, гарантия до 5 лет.",
  };
}

// Fetch database records on server
async function getLandingData() {
  try {
    const promos = await prisma.promo.findMany({ orderBy: { createdAt: 'desc' } });
    const reviews = await prisma.review.findMany({ orderBy: { createdAt: 'desc' } });
    const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
    return { promos, reviews, products };
  } catch (error) {
    console.error('Landing page data fetch failed:', error);
    return { promos: [], reviews: [], products: [] };
  }
}

export default async function Home() {
  const { promos, reviews, products } = await getLandingData();

  const faqItems = [
    {
      q: "Что такое замер?",
      a: "Дизайнер бесплатно выезжает на адрес, делает замер помещения под желаемое изделие. У него с собой образцы материалов, ноутбук. Он рисует с Вами дизайн-проект в программе, учитывая выбранные Вами материалы и все Ваши пожелания, рассчитывает стоимость."
    },
    {
      q: "Как можно записаться на замер?",
      a: "Вы можете оставить заявку на сайте, через «WhatsApp» или позвонить по номеру 8 (495) 135-92-93, 8 (926) 040-47-92, и мы запишем Вас на замер. Далее дизайнер свяжется с Вами для согласования удобной для Вас даты и времени встречи."
    },
    {
      q: "Мне трудно объяснить, какой дизайн я хочу. Мне смогут помочь?",
      a: "Благодаря профессионализму специалист сможет разработать для Вас любой дизайн-проект. Он учтет ваши пожелания, а также конструктивные особенности помещения."
    },
    {
      q: "На каком этапе будет известна точная стоимость кухни?",
      a: "Точную стоимость рассчитывает дизайнер после замера, выбора материалов и обсуждения всех нюансов изделия с учетом особенностей помещения."
    },
    {
      q: "Возможно ли у Вас купить встраиваемую технику?",
      a: "Да, у нас можно приобрести дополнительно технику для кухни и сэкономить до 30% от стоимости приборов. С каталогами и ценами вы ознакомитесь на встрече с дизайнером."
    }
  ];

  return (
    <div className="w-full flex flex-col bg-white">
      
      {/* 1. SCROLL-DRIVEN 3D HERO SECTION */}
      <ScrollWrapper />

      {/* 2. WHY CHOOSE US SECTION */}
      <section id="about-section" className="bg-neutral-50 py-20 px-6 border-b border-neutral-200 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-2">
            <span className="text-red-500 font-bold uppercase tracking-wider text-xs">Наши преимущества</span>
            <h2 className="text-3xl md:text-4xl font-black text-neutral-900 uppercase">ПОЧЕМУ КЛИЕНТЫ ЗАКАЗЫВАЮТ У НАС</h2>
            <p className="text-neutral-600 text-sm max-w-md mx-auto">Поможем вам избежать 99% возможных проблем при заказе кухни</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-3 border-l-2 border-red-600 pl-4 py-1">
              <h3 className="font-black text-neutral-900 text-lg">Более 12 лет</h3>
              <p className="text-neutral-600 text-xs leading-relaxed font-light">На мебельном рынке Москвы. Более 6000+ успешно выполненных работ и довольных семей.</p>
            </div>
            <div className="space-y-3 border-l-2 border-red-600 pl-4 py-1">
              <h3 className="font-black text-neutral-900 text-lg">Замер, 3D и доставка</h3>
              <p className="text-neutral-600 text-xs leading-relaxed font-light">Полный спектр услуг с выездом дизайнера-технолога по всей Москве и Московской области.</p>
            </div>
            <div className="space-y-3 border-l-2 border-red-600 pl-4 py-1">
              <h3 className="font-black text-neutral-900 text-lg">Европейское качество</h3>
              <p className="text-neutral-600 text-xs leading-relaxed font-light">Используем экологичные материалы класса E0.5 с европейскими сертификатами безопасности.</p>
            </div>
            <div className="space-y-3 border-l-2 border-red-600 pl-4 py-1">
              <h3 className="font-black text-neutral-900 text-lg">Качественная фурнитура</h3>
              <p className="text-neutral-600 text-xs leading-relaxed font-light">Используем петли и выдвижные механизмы Blum и Hettich, рассчитанные на 100 тыс. открываний.</p>
            </div>
            <div className="space-y-3 border-l-2 border-red-600 pl-4 py-1">
              <h3 className="font-black text-neutral-900 text-lg">Официальный договор</h3>
              <p className="text-neutral-600 text-xs leading-relaxed font-light">Все обязательства, сроки и финальная стоимость закрепляются письменно в договоре.</p>
            </div>
            <div className="space-y-3 border-l-2 border-red-600 pl-4 py-1">
              <h3 className="font-black text-neutral-900 text-lg">Бесплатный расчет</h3>
              <p className="text-neutral-600 text-xs leading-relaxed font-light">Получите точный расчет стоимости вашей кухни со всеми комплектующими в течение 1 часа.</p>
            </div>
            <div className="space-y-3 border-l-2 border-red-600 pl-4 py-1">
              <h3 className="font-black text-neutral-900 text-lg">Предоплата 30%</h3>
              <p className="text-neutral-600 text-xs leading-relaxed font-light">Остаток за мебель вы оплачиваете при доставке. Окончательный расчет за сборку — после установки.</p>
            </div>
            <div className="space-y-3 border-l-2 border-red-600 pl-4 py-1">
              <h3 className="font-black text-neutral-900 text-lg">Честная рассрочка</h3>
              <p className="text-neutral-600 text-xs leading-relaxed font-light">Без переплат, скрытых процентов и начисления комиссий. Оформление через банки-партнеры.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CATALOG SECTION */}
      <section id="catalog-section" className="bg-white py-20 border-b border-neutral-100 relative z-10">
        <div className="max-w-7xl mx-auto px-6 text-center mb-12">
          <span className="text-red-500 font-bold uppercase tracking-wider text-xs">Каталог моделей</span>
          <h2 className="text-3xl font-black text-neutral-900 mt-2 uppercase">ПОСМОТРЕТЬ НАШИ РАБОТЫ</h2>
          <p className="text-neutral-600 text-sm mt-3 max-w-xl mx-auto font-light">
            Ознакомьтесь с примерами наших выполненных проектов кухонь.
          </p>
        </div>
        <Catalog limit={9} hideFilters={true} showFeaturedOnly={true} initialProducts={products} />
        <div className="flex justify-center mt-12 px-6">
          <a
            href="/catalog"
            className="group inline-flex items-center space-x-3 bg-neutral-900 hover:bg-red-600 text-white font-bold py-4 px-10 rounded-2xl text-sm uppercase tracking-wider transition-all duration-300 hover:shadow-xl hover:shadow-red-600/20 hover:-translate-y-0.5"
          >
            <span>Смотреть весь каталог</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </section>

      {/* 4. PROMOS SECTION */}
      <section id="promos-section" className="bg-white py-20 px-6 border-b border-neutral-100 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-red-500 font-bold uppercase tracking-wider text-xs">Спецпредложения</span>
            <h2 className="text-3xl font-black text-neutral-900 mt-2 uppercase">АКЦИИ ИЮЛЯ</h2>
          </div>
          <Promos promos={promos} />
        </div>
      </section>

      {/* 5. INSTALLMENT SECTION */}
      <section id="installment-section" className="bg-neutral-50 py-20 px-6 border-b border-neutral-200 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto space-y-4 mb-16">
            <div className="inline-block bg-red-600 text-white font-black text-xs uppercase px-4 py-1.5 rounded-full tracking-wider shadow-sm shadow-red-500/10">
              рассрочка до 18 месяцев
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-neutral-900 uppercase">КУХНЯ СЕЙЧАС — ОПЛАТА ПОТОМ</h2>
            <p className="text-neutral-600 text-sm font-light">Приобретайте кухню по индивидуальным размерам на выгодных условиях без переплат.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border border-neutral-200/80 p-8 rounded-3xl space-y-4 shadow-sm">
              <CheckCircle2 className="w-10 h-10 text-red-500" />
              <h3 className="text-lg font-bold text-neutral-900">Без переплат</h3>
              <p className="text-xs text-neutral-600 leading-relaxed font-light">Стоимость приобретаемой кухни просто делится на равные части без начисления процентов.</p>
            </div>
            <div className="bg-white border border-neutral-200/80 p-8 rounded-3xl space-y-4 shadow-sm">
              <CheckCircle2 className="w-10 h-10 text-red-500" />
              <h3 className="text-lg font-bold text-neutral-900">Без первого взноса</h3>
              <p className="text-xs text-neutral-600 leading-relaxed font-light">Начало рассрочки без первоначального платежа до 6 месяцев на весь ассортимент материалов.</p>
            </div>
            <div className="bg-white border border-neutral-200/80 p-8 rounded-3xl space-y-4 shadow-sm">
              <CheckCircle2 className="w-10 h-10 text-red-500" />
              <h3 className="text-lg font-bold text-neutral-900">Без долгого ожидания</h3>
              <p className="text-xs text-neutral-600 leading-relaxed font-light">Одобрение заявки в течение 15 минут банками-партнерами при наличии паспорта РФ.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. REVIEWS SECTION */}
      <section id="reviews-section" className="bg-white py-20 px-6 border-b border-neutral-100 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-red-500 font-bold uppercase tracking-wider text-xs">Отзывы любимых клиентов</span>
            <h2 className="text-3xl font-black text-neutral-900 mt-2 uppercase">МЫ ДОРОЖИМ КАЖДЫМ ОТЗЫВОМ</h2>
          </div>
          <Reviews reviews={reviews} />
        </div>
      </section>

      {/* 7. FAQ SECTION */}
      <section id="faq-section" className="bg-neutral-50 py-20 px-6 border-b border-neutral-200 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-red-500 font-bold uppercase tracking-wider text-xs">Ответы на вопросы</span>
            <h2 className="text-3xl font-black text-neutral-900 mt-2 uppercase">ЧАСТО ЗАДАВАЕМЫЕ ВОПРОСЫ</h2>
          </div>

          <FAQAccordion items={faqItems} />
        </div>
      </section>

      {/* 8. OUR CONTACTS SECTION */}
      <section id="contacts-section" className="bg-gradient-to-b from-white to-neutral-50 py-24 px-6 md:px-12 border-t border-neutral-200/60 relative z-10 font-sans">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-16 space-y-3">
            <span className="text-red-500 font-bold uppercase tracking-wider text-xs block">Связаться с нами</span>
            <h2 className="text-3xl md:text-4xl font-black text-neutral-900 uppercase">НАШИ КОНТАКТЫ</h2>
            <p className="text-neutral-600 text-sm max-w-md mx-auto font-light leading-relaxed">
              Выберите наиболее удобный способ связи или посетите наш выставочный салон в Москве.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            
            {/* Card 1: Direct Contact */}
            <div className="bg-white border border-neutral-200/80 rounded-3xl p-8 flex flex-col justify-between shadow-sm hover:border-neutral-350 hover:shadow-md transition-all group duration-300">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center text-red-600 group-hover:scale-105 transition-transform duration-300">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">Позвонить нам</h3>
                  <p className="text-xs text-neutral-500 font-light mt-1">Ответим на любые вопросы по телефону</p>
                </div>
                <div className="space-y-2 pt-2">
                  <a href="tel:84951359293" className="block text-base font-extrabold text-neutral-900 hover:text-red-650 transition-colors">
                    8 (495) 135-92-93
                  </a>
                  <a href="tel:89260404792" className="block text-base font-extrabold text-neutral-900 hover:text-red-650 transition-colors">
                    8 (926) 040-47-92
                  </a>
                </div>
              </div>
              <div className="pt-6 border-t border-neutral-100 mt-6">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Электронная почта</span>
                <a href="mailto:Tsvetkov-mebel@mail.ru" className="text-xs font-semibold text-neutral-800 hover:text-red-650 transition-colors">
                  Tsvetkov-mebel@mail.ru
                </a>
              </div>
            </div>

            {/* Card 2: Messengers */}
            <div className="bg-white border border-neutral-200/80 rounded-3xl p-8 flex flex-col justify-between shadow-sm hover:border-neutral-350 hover:shadow-md transition-all group duration-300">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-green-50 border border-green-100 rounded-2xl flex items-center justify-center text-green-600 group-hover:scale-105 transition-transform duration-300">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.5-5.739-1.453L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.528 2.012 14.077.99 11.458.99c-5.44 0-9.863 4.37-9.867 9.8.001 1.83.5 3.609 1.445 5.176l-.999 3.649 3.784-.981z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">Написать в чат</h3>
                  <p className="text-xs text-neutral-500 font-light mt-1">Менеджеры онлайн, отвечают быстро</p>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <a 
                    href="https://api.whatsapp.com/send/?phone=79260404792&text&type=phone_number&app_absent=0"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-[#25d366] hover:bg-[#20ba5a] text-white text-[10px] font-bold uppercase tracking-widest rounded-xl text-center shadow-sm transition-all hover:scale-[1.02]"
                  >
                    WhatsApp
                  </a>
                  <a 
                    href="https://t.me/Tsvetkov_mebel"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-[#229ed9] hover:bg-[#1d8ac0] text-white text-[10px] font-bold uppercase tracking-widest rounded-xl text-center shadow-sm transition-all hover:scale-[1.02]"
                  >
                    Telegram
                  </a>
                  <a 
                    href="https://max.ru/u/f9LHodD0cOIZANO7LhRYJ3uGTanh9Mt8As_2izeN0pWjmyv5IsY5jFc5qbk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-[#5b51d8] hover:bg-[#4c42c2] text-white text-[10px] font-bold uppercase tracking-widest rounded-xl text-center shadow-sm transition-all hover:scale-[1.02]"
                  >
                    MAX
                  </a>
                </div>
              </div>
            </div>

            {/* Card 3: Socials */}
            <div className="bg-white border border-neutral-200/80 rounded-3xl p-8 flex flex-col justify-between shadow-sm hover:border-neutral-350 hover:shadow-md transition-all group duration-300">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform duration-300">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">Медиа и каналы</h3>
                  <p className="text-xs text-neutral-500 font-light mt-1">Наши сообщества и полезные блоги</p>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <a 
                    href="https://vk.com/optovik33" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-[#0077ff] hover:bg-[#0066dd] text-white text-[10px] font-bold uppercase tracking-widest rounded-xl text-center shadow-sm transition-all hover:scale-[1.02]"
                  >
                    Группа ВКонтакте
                  </a>
                  <a 
                    href="https://t.me/tsvetkovmebel" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-[#229ed9] hover:bg-[#1d8ac0] text-white text-[10px] font-bold uppercase tracking-widest rounded-xl text-center shadow-sm transition-all hover:scale-[1.02]"
                  >
                    Telegram Канал
                  </a>
                  <a 
                    href="https://max.ru/optovik33" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-[#5b51d8] hover:bg-[#4c42c2] text-white text-[10px] font-bold uppercase tracking-widest rounded-xl text-center shadow-sm transition-all hover:scale-[1.02]"
                  >
                    MAX Канал
                  </a>
                </div>
              </div>
            </div>

            {/* Card 4: Showroom */}
            <div className="bg-white border border-neutral-200/80 rounded-3xl p-8 flex flex-col justify-between shadow-sm hover:border-neutral-350 hover:shadow-md transition-all group duration-300">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center text-amber-600 group-hover:scale-105 transition-transform duration-300">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">Выставочный салон</h3>
                  <p className="text-xs text-neutral-500 font-light mt-1">Приезжайте посмотреть образцы</p>
                </div>
                <p className="text-xs text-neutral-700 font-medium leading-relaxed pt-2">
                  г. Москва, Солнцевский проспект, д. 13А.<br />
                  Бизнес-центр «Сфера», 2 этаж.
                </p>
              </div>
              <div className="pt-4 border-t border-neutral-100 mt-6">
                <span className="text-[10px] text-neutral-400 block font-light">Режим работы</span>
                <span className="text-xs font-bold text-neutral-800">Ежедневно с 10:00 до 20:00</span>
              </div>
            </div>

          </div>

          {/* Interactive CTA Banner */}
          <div className="bg-gradient-to-br from-red-50/50 via-white to-red-50/20 rounded-[36px] p-8 md:p-12 text-center relative overflow-hidden shadow-sm border border-red-100/80 max-w-4xl mx-auto">
            {/* Ambient background glows */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-red-100/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-orange-100/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />
            
            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
              <h3 className="text-xl md:text-2xl font-black text-neutral-900 uppercase tracking-wide">
                Хотите обсудить проект индивидуально?
              </h3>
              <p className="text-neutral-600 text-xs md:text-sm font-light leading-relaxed">
                Наш дизайнер-технолог составит 3D-проект вашей кухни и рассчитает стоимость с точностью до рубля совершенно бесплатно.
              </p>
              <div className="pt-4 flex justify-center">
                <ConsultationButton 
                  detail="Консультация дизайнера"
                  className="bg-red-600 hover:bg-red-700 text-white font-extrabold px-10 py-4 rounded-2xl shadow-lg hover:shadow-red-650/20 transition-all uppercase tracking-wider text-xs hover:-translate-y-0.5"
                >
                  Получить расчет стоимости и 3D-проект
                </ConsultationButton>
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
