import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, ArrowRight } from 'lucide-react';

const slides = [
  {
    id: 1,
    title: "اكتشف مستقبل التسوق",
    description: "أحدث المنتجات الإلكترونية والعصرية بأسعار تنافسية مع مساعد ذكي يساعدك في الاختيار.",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop",
    cta: "تسوق الآن",
    color: "from-blue-600 to-blue-900"
  },
  {
    id: 2,
    title: "أناقة بلا حدود",
    description: "تشكيلة جديدة من الأزياء والإكسسوارات العصرية التي تناسب جميع مناسباتك.",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop",
    cta: "تصفح الأزياء",
    category: "موضة",
    color: "from-amber-600 to-orange-900"
  },
  {
    id: 3,
    title: "تقنيات متطورة",
    description: "عش تجربة التكنولوجيا مع أحدث الأجهزة الذكية وسماعات الرأس الاحترافية.",
    image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=2001&auto=format&fit=crop",
    cta: "عروض الإلكترونيات",
    category: "إلكترونيات",
    color: "from-purple-600 to-indigo-900"
  }
];

interface HeroCarouselProps {
    onCtaClick: (category?: string) => void;
}

const HeroCarousel: React.FC<HeroCarouselProps> = ({ onCtaClick }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-3xl shadow-xl mb-12 group">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <img 
                src={slide.image} 
                alt={slide.title} 
                className="w-full h-full object-cover transition-transform duration-[10000ms] ease-linear transform scale-100 group-hover:scale-105"
            />
            {/* Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.color} opacity-80 mix-blend-multiply`}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          </div>

          {/* Content */}
          <div className="relative z-20 h-full flex items-center max-w-7xl mx-auto px-6 sm:px-12">
            <div className="max-w-xl text-white space-y-6 animate-fade-in-up">
              <h2 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
                {slide.title}
              </h2>
              <p className="text-lg md:text-xl text-gray-100 font-light leading-relaxed">
                {slide.description}
              </p>
              <button
                onClick={() => onCtaClick(slide.category)}
                className="bg-white text-gray-900 px-8 py-3.5 rounded-full font-bold hover:bg-gray-100 transition-all shadow-lg active:scale-95 flex items-center gap-2 group/btn"
              >
                {slide.cta}
                <ArrowRight className="w-5 h-5 rtl:rotate-180 group-hover/btn:translate-x-1 rtl:group-hover/btn:-translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronLeft className="w-8 h-8 rtl:rotate-180" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronRight className="w-8 h-8 rtl:rotate-180" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'bg-white w-8' : 'bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;