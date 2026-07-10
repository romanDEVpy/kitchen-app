'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPolicy() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-neutral-50 py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white border border-neutral-200/80 p-8 sm:p-12 rounded-3xl shadow-sm space-y-8">
        
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center space-x-2 text-neutral-500 hover:text-red-655 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Назад</span>
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 border-b border-neutral-100 pb-6">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center border border-red-100 shadow-sm shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900 leading-tight">
              Политика конфиденциальности
            </h1>
            <p className="text-[10px] text-neutral-450 uppercase font-bold tracking-wider mt-1">
              В соответствии с Федеральным законом № 152-ФЗ «О персональных данных»
            </p>
          </div>
        </div>

        {/* Document Content */}
        <div className="text-xs sm:text-sm text-neutral-700 space-y-6 leading-relaxed font-light">
          <section className="space-y-2">
            <h2 className="text-sm font-black text-neutral-900 uppercase tracking-wide">1. Общие положения</h2>
            <p>
              Настоящая политика конфиденциальности персональных данных (далее — Политика) действует в отношении всей информации, которую сайт «Цветков Мебель» (далее — Оператор) может получить о Пользователе во время использования сайта и заполнения лид-форм.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-black text-neutral-900 uppercase tracking-wide">2. Состав собираемых данных</h2>
            <p>
              Оператор осуществляет обработку персональных данных Пользователя, которые предоставляются добровольно при заполнении интерактивных форм расчета стоимости кухни (квиз-калькулятора):
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Имя пользователя;</li>
              <li>Контактный номер телефона;</li>
              <li>Параметры и пожелания к заказу мебели (тип планировки, размеры кухонного гарнитура, город доставки, примерный бюджет).</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-black text-neutral-900 uppercase tracking-wide">3. Цели обработки данных</h2>
            <p>
              Персональные данные Пользователя обрабатываются исключительно в целях:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Расчета стоимости изготовления кухонного гарнитура по индивидуальным параметрам;</li>
              <li>Связи с Пользователем для предоставления консультации, презентации дизайн-проекта и согласования деталей выезда замерщика;</li>
              <li>Обеспечения обратной связи и повышения качества обслуживания клиентов.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-black text-neutral-900 uppercase tracking-wide">4. Условия обработки и передачи данных</h2>
            <p>
              Оператор обязуется соблюдать конфиденциальность в отношении предоставленных персональных данных, не передавать их третьим лицам без согласия Пользователя, за исключением случаев, предусмотренных действующим законодательством Российской Федерации.
            </p>
            <p>
              Хранение персональных данных осуществляется в защищенной базе данных Оператора. Обработка данных прекращается по достижении целей обработки или по запросу Пользователя.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-black text-neutral-900 uppercase tracking-wide">5. Защита персональных данных</h2>
            <p>
              Оператор применяет необходимые организационные и технические меры для защиты персональных данных Пользователя от неправомерного или случайного доступа, уничтожения, изменения, блокирования, копирования, распространения, а также от иных неправомерных действий третьих лиц.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-black text-neutral-900 uppercase tracking-wide">6. Контакты и обратная связь</h2>
            <p>
              Пользователь вправе в любой момент отозвать свое согласие на обработку персональных данных, направив соответствующее заявление Оператору.
            </p>
            <p>
              Оператор: Цветков Мебель. По всем вопросам, связанным с обработкой персональных данных, вы можете обращаться по электронной почте или по телефонам, указанным на главной странице сайта.
            </p>
          </section>
        </div>

        {/* Footer info */}
        <div className="border-t border-neutral-100 pt-6 text-[10px] text-neutral-400 text-center font-medium">
          Последнее обновление: Июль 2026 г. • Цветков Мебель
        </div>

      </div>
    </div>
  );
}
