import React, { useState } from 'react';
import { UserOrder } from '../types';
import { Search, Package, CheckCircle, Clock, Truck, MapPin, Phone, Mail, ChevronDown, ChevronUp } from 'lucide-react';

// Track Order Page
export const TrackOrderPage: React.FC<{ orders: UserOrder[] }> = ({ orders }) => {
    const [orderId, setOrderId] = useState('');
    const [foundOrder, setFoundOrder] = useState<UserOrder | null>(null);
    const [error, setError] = useState('');

    const handleSearch = () => {
        setError('');
        const order = orders.find(o => o.id === orderId.trim());
        if (order) {
            setFoundOrder(order);
        } else {
            setFoundOrder(null);
            setError('لم يتم العثور على طلب بهذا الرقم');
        }
    };

    const getStatusStep = (status: string) => {
        switch (status) {
            case 'pending': return 1;
            case 'processing': return 2;
            case 'shipped': return 3;
            case 'delivered': return 4;
            default: return 0;
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-12 animate-fade-in">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">تتبع طلبك</h2>
                <p className="text-gray-500 dark:text-gray-400">أدخل رقم الطلب لمعرفة حالته الحالية</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            value={orderId}
                            onChange={(e) => setOrderId(e.target.value)}
                            placeholder="رقم الطلب (مثال: ORD-123...)"
                            className="w-full pr-12 pl-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-gray-900 dark:text-white"
                        />
                    </div>
                    <button 
                        onClick={handleSearch}
                        className="bg-primary hover:bg-secondary text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-lg"
                    >
                        تتبع
                    </button>
                </div>
                {error && <p className="text-red-500 mt-4 text-sm font-medium">{error}</p>}
            </div>

            {foundOrder && (
                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 animate-fade-in-up">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h3 className="font-bold text-xl text-gray-900 dark:text-white">تفاصيل الطلب</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">تم الطلب في {new Date(foundOrder.date).toLocaleDateString()}</p>
                        </div>
                        <span className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-mono font-bold text-gray-700 dark:text-gray-300">
                            {foundOrder.id}
                        </span>
                    </div>

                    <div className="relative">
                        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-100 dark:bg-gray-700 -translate-y-1/2 hidden md:block"></div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
                            {[
                                { status: 'pending', icon: Clock, label: 'قيد الانتظار' },
                                { status: 'processing', icon: Package, label: 'قيد التجهيز' },
                                { status: 'shipped', icon: Truck, label: 'تم الشحن' },
                                { status: 'delivered', icon: CheckCircle, label: 'تم التوصيل' }
                            ].map((step, idx) => {
                                const currentStep = getStatusStep(foundOrder.status);
                                const isCompleted = currentStep > idx;
                                const isCurrent = currentStep === idx + 1;
                                
                                return (
                                    <div key={idx} className={`flex flex-col items-center text-center gap-3 ${isCompleted || isCurrent ? 'opacity-100' : 'opacity-40'}`}>
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all ${
                                            isCompleted ? 'bg-green-500 border-green-500 text-white' : 
                                            isCurrent ? 'bg-white dark:bg-gray-800 border-primary text-primary' : 
                                            'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-400'
                                        }`}>
                                            <step.icon className="w-5 h-5" />
                                        </div>
                                        <span className="font-bold text-sm text-gray-800 dark:text-gray-200">{step.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// About Page
export const AboutPage = () => (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
        <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">من نحن</h2>
            <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                نحن في متجر الحسام نؤمن بأن التسوق يجب أن يكون تجربة ممتعة، سهلة، وآمنة.
            </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
                <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop" alt="Our Store" className="rounded-3xl shadow-lg" />
            </div>
            <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">رؤيتنا</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    نسعى لأن نكون الوجهة الأولى للتسوق الإلكتروني في المنطقة، من خلال تقديم منتجات عالية الجودة وخدمة عملاء استثنائية.
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">رسالتنا</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    توفير تشكيلة واسعة من المنتجات العصرية التي تلبي احتياجات عملائنا، مع ضمان أفضل الأسعار وتجربة تسوق سلسة.
                </p>
            </div>
        </div>
    </div>
);

// Contact Page
export const ContactPage = () => (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
        <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">اتصل بنا</h2>
            <p className="text-gray-500 dark:text-gray-400">نحن هنا لمساعدتك. تواصل معنا عبر أي من القنوات التالية</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/30 text-primary rounded-full mb-4">
                    <Phone className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">اتصل بنا</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm dir-ltr">+967 774889095</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/30 text-primary rounded-full mb-4">
                    <Mail className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">البريد الإلكتروني</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">hossams@gmail.com</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/30 text-primary rounded-full mb-4">
                    <MapPin className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">الموقع</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">صنعاء ـ الجمهورية اليمنية -حده</p>
            </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">أرسل لنا رسالة</h3>
            <form className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <input type="text" placeholder="الاسم" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-gray-900 dark:text-white" />
                    <input type="email" placeholder="البريد الإلكتروني" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-gray-900 dark:text-white" />
                </div>
                <input type="text" placeholder="الموضوع" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-gray-900 dark:text-white" />
                <textarea rows={5} placeholder="الرسالة" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 resize-none text-gray-900 dark:text-white"></textarea>
                <button className="bg-primary hover:bg-secondary text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-lg w-full md:w-auto">
                    إرسال الرسالة
                </button>
            </form>
        </div>
    </div>
);

// FAQ Page
export const FAQPage = () => {
    const faqs = [
        { q: "كم تستغرق عملية التوصيل؟", a: "تستغرق عملية التوصيل عادة من 3 إلى 5 أيام عمل داخل المدن الرئيسية، ومن 5 إلى 7 أيام في المناطق الأخرى." },
        { q: "ما هي طرق الدفع المتاحة؟", a: "نوفر خيارات دفع متعددة تشمل البطاقات الائتمانية (فيزا، ماستركارد)، مدى، والدفع عند الاستلام." },
        { q: "هل يمكنني إرجاع المنتج؟", a: "نعم، يمكنك إرجاع المنتج خلال 14 يوم من تاريخ الاستلام بشرط أن يكون في حالته الأصلية." },
        { q: "كيف يمكنني تتبع طلبي؟", a: "يمكنك تتبع طلبك عن طريق صفحة 'تتبع الطلب' باستخدام رقم الطلب الذي تم إرساله إليك." }
    ];

    return (
        <div className="max-w-3xl mx-auto px-4 py-12 animate-fade-in">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">الأسئلة الشائعة</h2>
                <p className="text-gray-500 dark:text-gray-400">إجابات على الأسئلة الأكثر شيوعاً</p>
            </div>

            <div className="space-y-4">
                {faqs.map((faq, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <details className="group">
                            <summary className="flex justify-between items-center p-6 cursor-pointer list-none">
                                <span className="font-bold text-gray-900 dark:text-white">{faq.q}</span>
                                <span className="transition group-open:rotate-180">
                                    <ChevronDown className="w-5 h-5 text-gray-500" />
                                </span>
                            </summary>
                            <div className="px-6 pb-6 text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-50 dark:border-gray-700 pt-4">
                                {faq.a}
                            </div>
                        </details>
                    </div>
                ))}
            </div>
        </div>
    );
};