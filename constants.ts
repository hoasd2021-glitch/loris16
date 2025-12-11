
import { Product, ShippingOption } from './types';

export const APP_NAME = "متجر الحسام";

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "سماعات رأس بلوتوث عازلة للضوضاء",
    price: 350,
    category: "إلكترونيات",
    brand: "Sony",
    description: "سماعات رأس لاسلكية مع تقنية إلغاء الضوضاء النشطة وعمر بطارية يصل إلى 30 ساعة.",
    detailedDescription: "استمتع بتجربة صوتية غامرة مع سماعات الرأس اللاسلكية هذه. تتميز بتقنية إلغاء الضوضاء الرائدة في الصناعة، مما يتيح لك الاستمتاع بموسيقاك دون تشتيت. توفر البطارية طويلة الأمد استماعًا متواصلاً طوال اليوم، بينما يضمن التصميم المريح ملاءمة مثالية.",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=1000&auto=format&fit=crop"
    ],
    stock: 15,
    colors: ["أسود", "فضي"],
    rating: 4.8,
    reviewsCount: 124
  },
  {
    id: 2,
    name: "ساعة ذكية رياضية - الجيل الخامس",
    price: 450,
    category: "إلكترونيات",
    brand: "Apple",
    description: "ساعة ذكية متطورة لتتبع اللياقة البدنية، مراقبة نبضات القلب، ومقاومة للماء.",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1000&auto=format&fit=crop"
    ],
    stock: 8,
    colors: ["أسود", "وردي", "أبيض"],
    rating: 4.9,
    reviewsCount: 85
  },
  {
    id: 3,
    name: "حذاء رياضي للجري",
    price: 299,
    category: "أزياء",
    brand: "Nike",
    description: "حذاء جري مريح وخفيف الوزن، مثالي للتدريبات اليومية والمسافات الطويلة.",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=1000&auto=format&fit=crop"
    ],
    stock: 20,
    sizes: ["40", "41", "42", "43", "44", "45"],
    colors: ["أحمر", "أزرق"],
    rating: 4.5,
    reviewsCount: 42
  },
  {
    id: 4,
    name: "عطر رجالي فاخر - عود ملكي",
    price: 550,
    category: "عطور",
    brand: "Arabian Oud",
    description: "عطر شرقي فاخر يجمع بين رائحة العود الأصيل ولمسات من العنبر والمسك.",
    images: [
      "https://images.unsplash.com/photo-1523293188086-b51292955f2c?q=80&w=1000&auto=format&fit=crop"
    ],
    stock: 5,
    rating: 5.0,
    reviewsCount: 18
  },
  {
    id: 5,
    name: "حقيبة جلدية كلاسيكية",
    price: 180,
    category: "أزياء",
    brand: "Generic",
    description: "حقيبة يد نسائية مصنوعة من الجلد الصناعي عالي الجودة، تصميم أنيق وعصري.",
    images: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1000&auto=format&fit=crop"
    ],
    stock: 12,
    colors: ["بني", "بيج"],
    rating: 4.2,
    reviewsCount: 30
  },
  {
    id: 6,
    name: "كاميرا احترافية DSLR",
    price: 3200,
    category: "إلكترونيات",
    brand: "Canon",
    description: "كاميرا رقمية احترافية بدقة 24 ميجابكسل، مع عدسة 18-55 مم وتصوير فيديو 4K.",
    images: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop"
    ],
    stock: 3,
    rating: 4.7,
    reviewsCount: 56
  },
  {
    id: 7,
    name: "نظارة شمسية أفياتور",
    price: 120,
    category: "أزياء",
    brand: "Ray-Ban",
    description: "نظارة شمسية كلاسيكية بتصميم أفياتور، توفر حماية 100% من الأشعة فوق البنفسجية.",
    images: [
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=1000&auto=format&fit=crop"
    ],
    stock: 25,
    colors: ["ذهبي", "أسود"],
    rating: 4.6,
    reviewsCount: 88
  },
  {
    id: 8,
    name: "مجموعة العناية بالبشرة",
    price: 210,
    category: "تجميل",
    brand: "L'Oreal",
    description: "مجموعة متكاملة للعناية بالبشرة تتضمن غسول، تونر، ومرطب للبشرة الحساسة.",
    images: [
      "https://images.unsplash.com/photo-1571781926291-28b46c54908d?q=80&w=1000&auto=format&fit=crop"
    ],
    stock: 0,
    rating: 4.3,
    reviewsCount: 22
  },
  {
    id: 9,
    name: "كرسي مكتب مريح",
    price: 650,
    category: "أثاث",
    brand: "IKEA",
    description: "كرسي مكتب بتصميم مريح للظهر، قابل للتعديل والدوران، مثالي للعمل الطويل.",
    images: [
      "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?q=80&w=1000&auto=format&fit=crop"
    ],
    stock: 7,
    colors: ["رمادي", "أسود"],
    rating: 4.4,
    reviewsCount: 15
  },
  {
    id: 10,
    name: "لابتوب فائق النحافة",
    price: 4500,
    category: "إلكترونيات",
    brand: "Dell",
    description: "كمبيوتر محمول خفيف الوزن بمعالج قوي وشاشة عالية الدقة، مناسب للأعمال والتصميم.",
    images: [
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1000&auto=format&fit=crop"
    ],
    stock: 4,
    rating: 4.8,
    reviewsCount: 34
  }
];

export const SHIPPING_OPTIONS: ShippingOption[] = [
  {
    id: 'standard',
    name: 'شحن قياسي',
    price: 25,
    description: 'توصيل اقتصادي وموثوق',
    estimatedDays: '3-5 أيام عمل'
  },
  {
    id: 'express',
    name: 'شحن سريع',
    price: 50,
    description: 'الأفضل للطلبات المستعجلة',
    estimatedDays: '1-2 يوم عمل'
  },
  {
    id: 'pickup',
    name: 'استلام من الفرع',
    price: 0,
    description: 'استلم طلبك من أقرب فرع',
    estimatedDays: 'جاهز خلال ساعتين'
  }
];
