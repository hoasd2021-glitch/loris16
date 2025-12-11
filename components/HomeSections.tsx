import React, { useState, useEffect } from 'react';
import { Truck, ShieldCheck, Headset, CreditCard, LayoutGrid, ArrowLeft, Send, Timer, Star } from 'lucide-react';
import { Product } from '../types';

export const FeaturesSection = () => {
  const features = [
    { icon: <Truck className="w-8 h-8 text-primary" />, title: "شحن سريع", desc: "توصيل لجميع المناطق" },
    { icon: <ShieldCheck className="w-8 h-8 text-primary" />, title: "دفع آمن", desc: "100% حماية للمدفوعات" },
    { icon: <Headset className="w-8 h-8 text-primary" />, title: "دعم 24/7", desc: "دعم فني على مدار الساعة" },
    { icon: <CreditCard className="w-8 h-8 text-primary" />, title: "أسعار تنافسية", desc: "أفضل العروض والخصومات" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 animate-fade-in-up">
      {features.map((feature, idx) => (
        <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow group">
          <div className="mb-4 p-3 bg-blue-50 rounded-full group-hover:scale-110 transition-transform duration-300">
            {feature.icon}
          </div>
          <h3 className="font-bold text-gray-900 mb-1">{feature.title}</h3>
          <p className="text-xs text-gray-500">{feature.desc}</p>
        </div>
      ))}
    </div>
  );
};

export const CategoriesSection = ({ categories, onSelectCategory }: { categories: string[], onSelectCategory: (c: string) => void }) => {
    const getCategoryIcon = (cat: string) => {
        return cat.charAt(0);
    };

    return (
        <div className="mb-16 animate-fade-in-up delay-100">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <LayoutGrid className="w-6 h-6 text-primary" />
                    تسوق حسب التصنيف
                </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {categories.map((cat, idx) => (
                    <button
                        key={idx}
                        onClick={() => onSelectCategory(cat)}
                        className="group bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:border-primary hover:shadow-md transition-all text-center flex flex-col items-center gap-3"
                    >
                        <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center text-xl font-bold text-gray-400 group-hover:bg-primary group-hover:text-white transition-colors shadow-inner">
                            {getCategoryIcon(cat)}
                        </div>
                        <span className="font-medium text-gray-700 group-hover:text-primary transition-colors">{cat}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export const SpecialOfferSection = () => {
    // Simple countdown logic
    const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 45, seconds: 30 });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                let { hours, minutes, seconds } = prev;
                if (seconds > 0) seconds--;
                else {
                    seconds = 59;
                    if (minutes > 0) minutes--;
                    else {
                        minutes = 59;
                        if (hours > 0) hours--;
                        else clearInterval(timer);
                    }
                }
                return { hours, minutes, seconds };
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="mb-16 rounded-3xl overflow-hidden shadow-xl bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white relative animate-fade-in-up delay-200">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl transform -translate-y-1/2 translate-x-1/2"></div>
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl transform translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="grid md:grid-cols-2 gap-8 items-center p-8 md:p-12 relative z-10">
                <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                        <Timer className="w-3 h-3" />
                        عرض لفترة محدودة
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold leading-tight">سماعات الرأس الاحترافية <span className="text-primary">بخصم 50%</span></h2>
                    <p className="text-gray-300 leading-relaxed">استمتع بتجربة صوتية لا مثيل لها مع تقنية إلغاء الضوضاء وعمر بطارية يدوم طويلاً. العرض سارٍ حتى نفاذ الكمية.</p>
                    
                    {/* Timer */}
                    <div className="flex gap-4">
                        {Object.entries(timeLeft).map(([unit, value], i) => (
                            <div key={i} className="flex flex-col items-center">
                                <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-2xl font-bold border border-white/10">
                                    {String(value).padStart(2, '0')}
                                </div>
                                <span className="text-xs text-gray-400 mt-2">
                                    {unit === 'hours' ? 'ساعة' : unit === 'minutes' ? 'دقيقة' : 'ثانية'}
                                </span>
                            </div>
                        ))}
                    </div>

                    <button className="bg-white text-gray-900 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all shadow-lg active:scale-95 flex items-center gap-2">
                        تسوق العرض الآن
                        <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
                    </button>
                </div>
                <div className="relative h-64 md:h-96">
                    <img 
                        src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop" 
                        alt="Special Offer" 
                        className="w-full h-full object-contain drop-shadow-2xl transform hover:scale-105 transition-transform duration-500"
                    />
                     <div className="absolute -top-4 -right-4 bg-accent text-white w-24 h-24 rounded-full flex items-center justify-center font-bold text-xl rotate-12 shadow-lg border-4 border-gray-900 z-20">
                        -50%
                    </div>
                </div>
            </div>
        </div>
    );
};

export const BrandsSection = ({ brands }: { brands: string[] }) => {
    return (
        <div className="mb-16 border-t border-b border-gray-100 py-12 bg-white">
            <h3 className="text-center text-gray-500 font-bold mb-8">شركاء النجاح والعلامات التجارية</h3>
            <div className="flex justify-center flex-wrap gap-8 md:gap-16 opacity-60">
                {brands.slice(0, 6).map((brand, idx) => (
                    <div key={idx} className="text-2xl font-black text-gray-300 uppercase tracking-widest hover:text-primary transition-colors cursor-pointer">
                        {brand}
                    </div>
                ))}
            </div>
        </div>
    );
};

export const NewsletterSection = () => {
    return (
        <div className="bg-primary/5 rounded-3xl p-8 md:p-16 text-center relative overflow-hidden mb-12">
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary mb-4">
                    <Send className="w-8 h-8 transform -rotate-12 translate-x-1" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">اشترك في نشرتنا البريدية</h2>
                <p className="text-gray-600">كن أول من يعرف عن المنتجات الجديدة، العروض الحصرية، والخصومات الخاصة.</p>
                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                    <input 
                        type="email" 
                        placeholder="البريد الإلكتروني" 
                        className="flex-1 px-6 py-4 rounded-xl border-0 shadow-sm focus:ring-2 focus:ring-primary outline-none text-right"
                    />
                    <button className="bg-gray-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-primary transition-colors shadow-lg">
                        اشترك
                    </button>
                </div>
                <p className="text-xs text-gray-400">نحن نحترم خصوصيتك. لا رسائل مزعجة.</p>
            </div>
        </div>
    );
};