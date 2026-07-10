'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowLeft, ArrowRight, Upload, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';
import { getApiErrorMessage, parseApiResponse } from '@/lib/clientApi';

const STEPS = [
  {
    id: 1,
    progress: 0,
    title: 'Какой тип кухни интересует',
    type: 'choice',
    field: 'kitchenType',
    options: [
      { value: 'Прямая', label: 'Прямая', svg: 'straight' },
      { value: 'Угловая', label: 'Угловая', svg: 'l_shape' },
      { value: 'П-образная', label: 'П-образная', svg: 'u_shape' },
      { value: 'С островом', label: 'С островом', svg: 'island' },
      { value: 'Другое', label: 'Другое / Свой вариант', svg: 'custom' }
    ],
    hint: 'Нажмите на картинку, выбрав тип кухни под Ваше помещение.'
  },
  {
    id: 2,
    progress: 17,
    title: 'Когда планируете установку кухни?',
    type: 'choice_list',
    field: 'installTime',
    options: [
      'В течение 1 - 2х месяцев',
      'В течение 3 - 4х месяцев',
      'В течение 5 - 6и месяцев',
      'Через полгода или более'
    ],
    hint: 'Выберите, в течение какого времени вы планируете установку кухни. Мы производим кухни от 7 рабочих дней.'
  },
  {
    id: 3,
    progress: 33,
    title: 'Укажите примерную длину кухонного гарнитура',
    type: 'text',
    field: 'kitchenLength',
    placeholder: 'Пример: 2м или 1,5м на 3м.',
    canSkip: true,
    hint: '10-30 см погрешности на первоначальный расчет не повлияют. Если Вам нужен замер, можете пропустить этот вопрос. Мы уточним детали позже.'
  },
  {
    id: 4,
    progress: 50,
    title: 'В какой бюджет планируете уложиться?',
    type: 'choice_list',
    field: 'budget',
    options: [
      'От 150 до 250 тыс. ₽',
      'От 250 до 350 тыс. ₽',
      'От 350 до 500 тыс. ₽',
      'От 500 тыс. ₽'
    ],
    canSkip: true,
    hint: 'Помогу Вам уложиться в Ваш бюджет. Если вопрос на данном этапе для Вас некорректен, можете пропустить его.'
  },
  {
    id: 5,
    progress: 67,
    title: 'В какой город планируется доставка?',
    type: 'choice_list',
    field: 'city',
    options: [
      'Москва',
      'Московская область'
    ],
    hint: 'Все работы производим под ключ. Доставка, монтаж, комплектация техникой – все в одном месте. Вы уже в нескольких шагах от кухни своей мечты!'
  },
  {
    id: 6,
    progress: 83,
    title: 'У меня есть свой проект (Вы можете загрузить понравившиеся вам картинки из интернета)',
    type: 'file',
    field: 'projectFile',
    canSkip: true,
    hint: 'Загрузите данные о своем проекте, если имеется. И заполните контактную форму на следующем шаге.'
  },
  {
    id: 7,
    progress: 95,
    title: 'Осталось только узнать, как нам с Вами связаться.',
    type: 'final'
  }
];

export default function ContactForm({ isOpen: propIsOpen, onClose, selectedKitchen = '', inline = false }) {
  const [isOpen, setIsOpen] = useState(inline ? true : (propIsOpen || false));
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [formData, setFormData] = useState({
    kitchenType: selectedKitchen || '',
    installTime: '',
    kitchenLength: '',
    budget: '',
    city: '',
    projectFile: '',
    name: '',
    phone: '',
    website: '',
    consent: true
  });

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentStep = STEPS[currentStepIdx];

  // Sync propIsOpen state changes
  useEffect(() => {
    if (inline) {
      setIsOpen(true);
    } else if (propIsOpen !== undefined) {
      setIsOpen(propIsOpen);
    }
  }, [propIsOpen, inline]);

  useEffect(() => {
    setAnimate(false);
    const timer = setTimeout(() => {
      setAnimate(true);
    }, 180);
    return () => clearTimeout(timer);
  }, [currentStepIdx]);

  // Global listeners for opening consultation and click interception (only for modal mode)
  useEffect(() => {
    if (inline) return;

    const handleOpen = (e) => {
      setIsOpen(true);
      setSubmitSuccess(false);
      setCurrentStepIdx(0);
      if (e.detail) {
        setFormData(prev => ({ ...prev, kitchenType: e.detail }));
      }
    };
    window.addEventListener('open-consultation', handleOpen);

    return () => {
      window.removeEventListener('open-consultation', handleOpen);
    };
  }, [inline]);

  // Lock body scroll when ContactForm is open as a modal
  useEffect(() => {
    if (!inline && isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, inline]);

  // Auto-scroll inside modal on step changes
  const modalContentRef = useRef(null);
  useEffect(() => {
    if (modalContentRef.current) {
      modalContentRef.current.scrollTop = 0;
    }
  }, [currentStepIdx]);

  // Handle Enter key for fast wizard submission
  useEffect(() => {
    if (!isOpen || submitSuccess) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        const activeEl = document.activeElement;
        if (activeEl && (activeEl.tagName === 'TEXTAREA' || activeEl.type === 'submit')) {
          return;
        }
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIdx, formData, submitSuccess]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (inline) return;
    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleNext = () => {
    if (currentStep.type === 'choice' && !formData[currentStep.field]) {
      return; 
    }
    if (currentStep.type === 'choice_list' && !formData[currentStep.field] && !currentStep.canSkip) {
      return;
    }

    if (currentStepIdx < STEPS.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(prev => prev - 1);
    }
  };

  const handleSelectOption = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTimeout(() => {
      setCurrentStepIdx(prev => Math.min(prev + 1, STEPS.length - 1));
    }, 150);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg('');

    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData
      });
      const data = await parseApiResponse(res);
      setFormData(prev => ({ ...prev, projectFile: data.url }));
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err, 'Could not upload the file. Try again.'));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.consent) return;

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      await parseApiResponse(res);
      setSubmitSuccess(true);
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err, 'Could not send the request. Try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  const resetQuiz = () => {
    setCurrentStepIdx(0);
    setFormData({
      kitchenType: selectedKitchen || '',
      installTime: '',
      kitchenLength: '',
      budget: '',
      city: '',
      projectFile: '',
      name: '',
      phone: '',
      website: '',
      consent: true
    });
    setSubmitSuccess(false);
  };

  const renderKitchenSVG = (style) => {
    const commonClass = "w-20 h-14 mx-auto transition-colors stroke-neutral-400 group-hover:stroke-red-500 fill-none";
    switch (style) {
      case 'straight':
        return (
          <svg viewBox="0 0 120 80" className={commonClass} strokeWidth="2.5">
            <rect x="10" y="25" width="100" height="24" rx="2" className="fill-neutral-50/50" />
            <rect x="25" y="30" width="18" height="14" rx="1" />
            <circle cx="75" cy="37" r="6" />
            <circle cx="85" cy="37" r="4" />
          </svg>
        );
      case 'l_shape':
        return (
          <svg viewBox="0 0 120 80" className={commonClass} strokeWidth="2.5">
            <path d="M15 15 h90 v22 h-68 v28 h-22 Z" className="fill-neutral-50/50" />
            <rect x="58" y="20" width="18" height="12" rx="1" />
            <circle cx="26" cy="48" r="5" />
          </svg>
        );
      case 'u_shape':
        return (
          <svg viewBox="0 0 120 80" className={commonClass} strokeWidth="2.5">
            <path d="M15 15 h90 v50 h-22 v-30 h-46 v30 h-22 Z" className="fill-neutral-50/50" />
            <rect x="51" y="20" width="18" height="12" rx="1" />
            <circle cx="26" cy="45" r="5" />
          </svg>
        );
      case 'island':
        return (
          <svg viewBox="0 0 120 80" className={commonClass} strokeWidth="2.5">
            <rect x="10" y="15" width="100" height="18" rx="1.5" className="fill-neutral-50/50" />
            <rect x="35" y="44" width="50" height="22" rx="2" className="fill-neutral-100" />
            <circle cx="60" cy="55" r="4" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 120 80" className={commonClass} strokeWidth="2.5">
            <rect x="15" y="15" width="90" height="50" rx="4" strokeDasharray="4 3" />
            <path d="M35 40 h50 M60 25 v30" />
          </svg>
        );
    }
  };

  const formContent = (
    <div className={`relative w-full bg-white rounded-3xl overflow-hidden flex flex-col md:flex-row border border-neutral-200/80 ${
      inline ? 'h-auto md:h-[620px] shadow-sm' : 'max-w-5xl shadow-2xl h-[95vh] md:h-[650px] overflow-y-auto md:overflow-hidden'
    }`}>
      
      {/* Close Button (only for modal - desktop) */}
      {!inline && (
        <button
          onClick={handleClose}
          className="hidden md:block absolute top-4 right-4 p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-900 transition-colors z-30 shadow-sm border border-neutral-200/40"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Success State */}
      {submitSuccess ? (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-white text-center space-y-5">
          <div className="w-16 h-16 bg-green-50 border border-green-200 rounded-full flex items-center justify-center shadow-sm">
            <CheckCircle2 className="w-10 h-10 text-green-600 animate-bounce" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-neutral-900 uppercase tracking-wide">Заявка принята!</h2>
            <p className="text-neutral-600 text-sm max-w-md mx-auto leading-relaxed">
              Спасибо за прохождение конфигуратора! Наш менеджер уже готовит расчет по вашим параметрам. Мы свяжемся с вами в течение 15 минут.
            </p>
          </div>
          <button
            onClick={inline ? resetQuiz : handleClose}
            className="px-8 py-3 bg-neutral-900 hover:bg-red-600 text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition-colors shadow-md"
          >
            {inline ? 'Пройти заново' : 'Закрыть'}
          </button>
        </div>
      ) : (
        <>
          {/* Left Column: Form Content */}
          <div ref={modalContentRef} className="flex-1 p-6 sm:p-10 md:overflow-y-auto flex flex-col justify-between h-auto md:h-full">
            
            {/* Header Title (Hidden on final step) */}
            {currentStep.type !== 'final' && (
              <div className="mb-6 border-b border-neutral-100 pb-3">
                <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest block">Калькулятор стоимости</span>
                <h3 className="text-xs font-semibold text-neutral-500 uppercase mt-0.5">Узнайте стоимость кухни на заказ</h3>
              </div>
            )}

            {/* Dynamic steps body */}
            <div 
              style={{
                transition: animate 
                  ? 'opacity 750ms cubic-bezier(0.16, 1, 0.3, 1), transform 750ms cubic-bezier(0.16, 1, 0.3, 1), filter 750ms cubic-bezier(0.16, 1, 0.3, 1)' 
                  : 'none',
                opacity: animate ? 1 : 0,
                transform: animate ? 'translateY(0)' : 'translateY(24px)',
                filter: animate ? 'blur(0)' : 'blur(4px)'
              }}
              className="flex-1 flex flex-col justify-center"
            >
              {currentStep.type === 'choice' && (
                <div className="space-y-6">
                  <h2 className="text-xl sm:text-2xl font-black text-neutral-900 leading-snug">{currentStep.title}</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {currentStep.options.map((opt) => {
                      const isSelected = formData[currentStep.field] === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleSelectOption(currentStep.field, opt.value)}
                          className={`group flex flex-col justify-between p-3 rounded-2xl border text-center transition-all duration-300 ${
                            isSelected 
                              ? 'border-red-600 bg-red-50/20 shadow-md shadow-red-500/5 ring-1 ring-red-500' 
                              : 'border-neutral-200 hover:border-neutral-300 bg-white hover:bg-neutral-50/50'
                          }`}
                        >
                          <div className="mb-2">
                            {renderKitchenSVG(opt.svg)}
                          </div>
                          <span className={`text-[11px] font-bold uppercase tracking-wider block ${
                            isSelected ? 'text-red-600' : 'text-neutral-600'
                          }`}>
                            {opt.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {currentStep.type === 'choice_list' && (
                <div className="space-y-6">
                  <h2 className="text-xl sm:text-2xl font-black text-neutral-900 leading-snug">{currentStep.title}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentStep.options.map((opt) => {
                      const isSelected = formData[currentStep.field] === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleSelectOption(currentStep.field, opt)}
                          className={`flex items-center p-4 rounded-2xl border text-left text-xs font-bold uppercase tracking-wide transition-all ${
                            isSelected
                              ? 'border-red-500 bg-red-50/20 shadow-md shadow-red-500/5 ring-1 ring-red-500 text-red-600'
                              : 'border-neutral-200 hover:border-neutral-300 bg-white hover:bg-neutral-50/50 text-neutral-600'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-red-600' : 'border-neutral-300'
                          }`}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-red-650" />}
                          </div>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {currentStep.type === 'text' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl sm:text-2xl font-black text-neutral-900 leading-snug">{currentStep.title}</h2>
                    {currentStep.canSkip && (
                      <button
                        type="button"
                        onClick={handleNext}
                        className="text-[10px] uppercase font-bold text-neutral-400 hover:text-neutral-650 transition-colors bg-neutral-100 px-3 py-1.5 rounded-lg border border-neutral-200/50"
                      >
                        можно пропустить
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData[currentStep.field]}
                      onChange={(e) => setFormData(prev => ({ ...prev, [currentStep.field]: e.target.value }))}
                      placeholder={currentStep.placeholder}
                      className="w-full bg-white border border-neutral-200 rounded-2xl px-5 py-4 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-red-655 shadow-sm"
                    />
                  </div>
                </div>
              )}

              {currentStep.type === 'file' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl sm:text-2xl font-black text-neutral-900 leading-snug">{currentStep.title}</h2>
                    {currentStep.canSkip && (
                      <button
                        type="button"
                        onClick={handleNext}
                        className="text-[10px] uppercase font-bold text-neutral-400 hover:text-neutral-650 transition-colors bg-neutral-100 px-3 py-1.5 rounded-lg border border-neutral-200/50"
                      >
                        можно пропустить
                      </button>
                    )}
                  </div>

                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-neutral-300 hover:border-red-600/40 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer bg-neutral-50/40 hover:bg-neutral-50 transition-colors"
                  >
                    <Upload className="w-10 h-10 text-neutral-400 mb-3" />
                    <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider text-center">
                      {uploading ? 'Загрузка...' : 'Нажмите, чтобы загрузить файл'}
                    </span>
                    <span className="text-[10px] text-neutral-400 mt-1">Или перетяните его из папки в это поле</span>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*,application/pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>

                  {formData.projectFile && (
                    <div className="flex items-center space-x-2 bg-green-50 border border-green-200/80 p-3.5 rounded-xl">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span className="text-xs text-green-800 font-medium">Проект успешно прикреплен!</span>
                    </div>
                  )}
                </div>
              )}

              {currentStep.type === 'final' && (
                <div className="flex flex-col lg:flex-row gap-8 items-center h-full">
                  
                  {/* Left Column in Step 7 */}
                  <div className="flex-1 space-y-4 text-center lg:text-left">
                    <div className="inline-flex items-center space-x-2 bg-red-50 border border-red-200/60 px-3 py-1 rounded-full text-red-600 text-[10px] uppercase font-black tracking-widest">
                      <Sparkles className="w-3 h-3" />
                      <span>Отлично. Последний шаг!</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 uppercase leading-tight">
                      ОСТАЛОСЬ ТОЛЬКО УЗНАТЬ, КАК НАМ С ВАМИ СВЯЗАТЬСЯ.
                    </h2>
                    <p className="text-neutral-600 text-xs font-light leading-relaxed max-w-sm">
                      Мы подберём для Вас лучшие предложения и расскажем о них по телефону. Обещаем, что Ваши контакты никому не передаются!
                    </p>
                  </div>

                  {/* Right Column in Step 7 */}
                  <form onSubmit={handleSubmit} className="w-full lg:w-[320px] space-y-4">
                    {/* Honeypot field for anti-spam/bot detection */}
                    <div style={{ display: 'none' }} aria-hidden="true">
                      <input
                        type="text"
                        name="website"
                        tabIndex={-1}
                        value={formData.website}
                        onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                        placeholder="Do not fill this if you are human"
                        autoComplete="off"
                      />
                    </div>

                    {errorMsg && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center space-x-2">
                        <ShieldAlert className="w-4 h-4 shrink-0" />
                        <span>{errorMsg}</span>
                      </div>
                    )}
                    
                    <div>
                      <label className="text-[9px] uppercase font-bold text-neutral-500 tracking-wider">Введите имя</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Имя"
                        className="w-full bg-white border border-neutral-250 rounded-xl px-4 py-3 text-xs text-neutral-900 placeholder-neutral-450 mt-1 focus:border-red-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] uppercase font-bold text-neutral-500 tracking-wider">Введите телефон</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+7 (999) 000-00-00"
                        className="w-full bg-white border border-neutral-250 rounded-xl px-4 py-3 text-xs text-neutral-900 placeholder-neutral-450 mt-1 focus:border-red-600 focus:outline-none"
                      />
                    </div>

                    <div className="flex items-start space-x-2 pt-1">
                      <input
                        type="checkbox"
                        id="consent"
                        checked={formData.consent}
                        onChange={(e) => setFormData(prev => ({ ...prev, consent: e.target.checked }))}
                        className="mt-0.5 accent-red-600"
                      />
                      <label htmlFor="consent" className="text-[9px] text-neutral-500 leading-tight font-medium">
                        Я соглашаюсь на обработку персональных данных согласно <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-red-600 transition-colors">политике конфиденциальности</a>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || !formData.consent}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-colors shadow-md shadow-red-500/10 cursor-pointer disabled:bg-neutral-300"
                    >
                      {submitting ? 'Отправка...' : 'Узнать стоимость'}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Bottom Actions and Progress bar */}
            <div className="border-t border-neutral-100 pt-6 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              
              {/* Progress Indicators */}
              <div className="flex items-center space-x-4 w-full sm:w-auto">
                <span className="text-[10px] font-black text-red-600 tracking-wide shrink-0">Готово: {currentStep.progress}%</span>
                <div className="w-full sm:w-48 h-1.5 bg-neutral-100 rounded-full overflow-hidden border border-neutral-200/40">
                  <div 
                    className="h-full bg-red-600 transition-all duration-500 ease-out"
                    style={{ width: `${currentStep.progress}%` }}
                  />
                </div>
              </div>

              {/* Navigation Buttons (Hidden on final step) */}
              {currentStep.type !== 'final' && (
                <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
                  
                  {/* Back Arrow */}
                  {currentStepIdx > 0 && (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="p-3 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors shadow-sm"
                      title="Назад"
                    >
                      <ArrowLeft className="w-4 h-4 text-neutral-600" />
                    </button>
                  )}

                  {/* Next Button */}
                  <div className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={handleNext}
                      className="inline-flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl text-xs uppercase tracking-wider transition-colors shadow-md shadow-red-500/10"
                    >
                      <span>{currentStepIdx === STEPS.length - 2 ? 'Последний шаг' : 'Далее'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <span className="text-[8px] text-neutral-400 mt-1 uppercase tracking-widest hidden sm:inline">или нажмите Enter</span>
                  </div>

                </div>
              )}

            </div>

          </div>

          {/* Right Column: Dynamic Side Panel (Hidden on final step) */}
          {currentStep.type !== 'final' && (
            <div className="w-full md:w-[280px] bg-neutral-50/50 border-t md:border-t-0 md:border-l border-neutral-200/60 p-6 sm:p-8 flex flex-col justify-end shrink-0 select-none h-auto md:h-full">
              
              {/* Manager Expert Box */}
              <div className="space-y-4">
                
                {/* Speech Bubble */}
                <div 
                  style={{
                    transition: animate 
                      ? 'opacity 600ms cubic-bezier(0.34, 1.56, 0.64, 1), transform 600ms cubic-bezier(0.34, 1.56, 0.64, 1)' 
                      : 'none',
                    opacity: animate ? 1 : 0,
                    transform: animate ? 'scale(1) translateY(0)' : 'scale(0.92) translateY(4px)',
                    transformOrigin: 'bottom left'
                  }}
                  className="relative bg-neutral-900 text-white p-3.5 rounded-2xl text-[10px] leading-relaxed shadow-sm font-light"
                >
                  {currentStep.hint}
                  {/* Speech bubble tail */}
                  <div className="absolute -bottom-1.5 left-6 w-3 h-3 bg-neutral-900 rotate-45" />
                </div>

                {/* Profile info */}
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-neutral-300 overflow-hidden border border-neutral-250">
                      <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-white text-[10px] font-bold uppercase tracking-wider">ЯБ</div>
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-neutral-800 block">Яна Блескина</span>
                    <span className="text-[8px] text-neutral-400 block font-medium">Руководитель компании</span>
                  </div>
                </div>

              </div>

            </div>
          )}
        </>
      )}

    </div>
  );

  if (inline) {
    return formContent;
  }

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-neutral-900/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      {!inline && (
        <button
          onClick={handleClose}
          className="block md:hidden fixed top-4 right-4 p-2 rounded-full bg-white hover:bg-neutral-100 text-neutral-600 transition-colors z-[10000] shadow-md border border-neutral-200/40"
        >
          <X className="w-5 h-5" />
        </button>
      )}
      {formContent}
    </div>,
    document.body
  );
}
