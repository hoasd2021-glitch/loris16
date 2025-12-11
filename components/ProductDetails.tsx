
import React, { useState, useEffect } from 'react';
import { Product, Currency, User, ExchangeRates } from '../types';
import { 
  Star, ShoppingCart, Heart, ArrowLeft, Truck, ShieldCheck, 
  RotateCcw, Share2, MessageCircle, Send, User as UserIcon
} from 'lucide-react';

interface ProductDetailsProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
  currency: Currency;
  exchangeRates: ExchangeRates;
  relatedProducts: Product[];
  onProductClick: (product: Product) => void;
  currentUser: User | null;
  onAddReview: (productId: number, review: { rating: number, comment: string }) => void;
  onLoginClick: () => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({
  product,
  onBack,
  onAddToCart,
  isFavorite,
  onToggleFavorite,
  currency,
  exchangeRates,
  relatedProducts,
  onProductClick,
  currentUser,
  onAddReview,
  onLoginClick,
  onShowToast
}) => {
  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  const [selectedColor, setSelectedColor] = useState<string | null>(product.colors && product.colors.length > 0 ? product.colors[0] : null);
  const [selectedSize, setSelectedSize] = useState<string | null>(product.sizes && product.sizes.length > 0 ? product.sizes[0] : null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');
  
  // Review Form State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Sync state when product changes (e.g., clicking related product)
  useEffect(() => {
    setSelectedImage(product.images[0]);
    setSelectedColor(product.colors && product.colors.length > 0 ? product.colors[0] : null);
    setSelectedSize(product.sizes && product.sizes.length > 0 ? product.sizes[0] : null);
    setQuantity(1);
    setActiveTab('description'); // Reset tab
    setReviewRating(5);
    setReviewComment('');
  }, [product]);

  const getDisplayPrice = (p: Product) => {
      if (currency === 'SAR') return p.price;
      if (currency === 'USD') return (p.price / exchangeRates.USD).toFixed(2);
      if (currency === 'YER') return Math.round(p.price * exchangeRates.YER);
      return p.price;
  };

  const getCurrencySymbol = () => {
      if (currency === 'SAR') return 'ر.س';
      if (currency === 'USD') return '$';
      if (currency === 'YER') return 'ر.ي';
      return 'ر.س';
  };

  const rating = product.rating || 0;
  const reviewsCount = product.reviewsCount || 0;

  const handleAddToCart = () => {
    // In a real app, you would pass selectedColor and selectedSize to the cart
    onAddToCart({ ...product });
    onShowToast('تمت الإضافة للسلة بنجاح', 'success');
  };

  const handleToggleFav = () => {
      onToggleFavorite(product.id);
      onShowToast(isFavorite ? 'تمت الإزالة من المفضلة' : 'تمت الإضافة للمفضلة', 'info');
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    
    setIsSubmittingReview(true);
    // Simulate network delay
    setTimeout(() => {
        onAddReview(product.id, { rating: reviewRating, comment: reviewComment });
        setReviewComment('');
        setReviewRating(5);
        setIsSubmittingReview(false);
        onShowToast('تم إضافة تقييمك بنجاح', 'success');
    }, 600);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Breadcrumb & Back */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={onBack}
          className="p-2 rounded-full hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm transition-all text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
        >
          <ArrowLeft className="w-6 h-6 rtl:rotate-180" />
        </button>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>الرئيسية</span>
            <span className="text-gray-300 dark:text-gray-600">/</span>
            <span>{product.category}</span>
            <span className="text-gray-300 dark:text-gray-600">/</span>
            <span className="font-bold text-gray-900 dark:text-white">{product.name}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Gallery Section */}
        <div className="space-y-4">
          <div className="aspect-square bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 relative group">
             <img 
              src={selectedImage} 
              alt={product.name} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="bg-red-600 text-white px-6 py-2 rounded-xl text-xl font-bold border-2 border-white transform -rotate-12">نفذت الكمية</span>
                </div>
            )}
            <button 
                onClick={handleToggleFav}
                className="absolute top-4 right-4 p-3 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur shadow-sm hover:bg-white dark:hover:bg-gray-700 transition-all transform hover:scale-110"
            >
                <Heart className={`w-6 h-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400 dark:text-gray-500'}`} />
            </button>
          </div>
          
          {product.images.length > 1 && (
             <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {product.images.map((img, idx) => (
                    <button
                        key={idx}
                        onClick={() => setSelectedImage(img)}
                        className={`w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === img ? 'border-primary ring-2 ring-primary/20' : 'border-transparent opacity-70 hover:opacity-100'}`}
                    >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                ))}
             </div>
          )}
        </div>

        {/* Info Section */}
        <div className="flex flex-col">
           <div className="mb-6">
                {product.brand && (
                    <span className="text-sm font-bold text-primary bg-primary/5 dark:bg-primary/20 px-3 py-1 rounded-full mb-3 inline-block">
                        {product.brand}
                    </span>
                )}
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{product.name}</h1>
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-amber-400">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-bold text-gray-900 dark:text-white">{rating}</span>
                        <span className="text-gray-400 dark:text-gray-500 font-normal">({reviewsCount} تقييم)</span>
                    </div>
                    <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                    <span className={`font-medium ${product.stock > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {product.stock > 0 ? `متوفر (${product.stock} قطعة)` : 'نفذت الكمية'}
                    </span>
                </div>
           </div>

           <div className="text-3xl font-bold text-gray-900 dark:text-white mb-8 dir-ltr flex items-center justify-end sm:justify-start gap-1">
                {getCurrencySymbol()} {getDisplayPrice(product)}
           </div>

           <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
               {product.description}
           </p>

           <div className="space-y-6 mb-8 flex-1">
                {/* Colors */}
                {product.colors && product.colors.length > 0 && (
                    <div>
                        <span className="block text-sm font-bold text-gray-900 dark:text-white mb-3">اللون المختار: <span className="text-primary font-normal">{selectedColor}</span></span>
                        <div className="flex flex-wrap gap-3">
                            {product.colors.map((color) => (
                                <button
                                    key={color}
                                    onClick={() => setSelectedColor(color)}
                                    className={`h-10 px-4 rounded-xl border flex items-center gap-2 transition-all ${
                                        selectedColor === color 
                                        ? 'border-primary bg-primary/5 dark:bg-primary/20 text-primary ring-1 ring-primary' 
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-300'
                                    }`}
                                >
                                    <span className="w-4 h-4 rounded-full border border-gray-200" style={{backgroundColor: ['أبيض', 'white'].includes(color) ? '#fff' : ['أسود', 'black'].includes(color) ? '#000' : color}}></span>
                                    <span className="text-sm font-medium">{color}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Sizes */}
                {product.sizes && product.sizes.length > 0 && (
                    <div>
                        <span className="block text-sm font-bold text-gray-900 dark:text-white mb-3">المقاس: <span className="text-primary font-normal">{selectedSize}</span></span>
                        <div className="flex flex-wrap gap-3">
                            {product.sizes.map((size) => (
                                <button
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={`h-10 min-w-[3rem] px-3 rounded-xl border flex items-center justify-center transition-all ${
                                        selectedSize === size 
                                        ? 'border-primary bg-primary text-white shadow-md' 
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800'
                                    }`}
                                >
                                    <span className="text-sm font-medium">{size}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
           </div>

           {/* Actions */}
           <div className="flex items-center gap-4 py-6 border-t border-gray-100 dark:border-gray-700 mt-auto">
                <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl h-12 bg-white dark:bg-gray-800">
                    <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-12 h-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-primary transition-colors text-lg"
                    >
                        -
                    </button>
                    <span className="w-12 text-center font-bold text-gray-900 dark:text-white">{quantity}</span>
                    <button 
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="w-12 h-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-primary transition-colors text-lg"
                        disabled={quantity >= product.stock}
                    >
                        +
                    </button>
                </div>
                <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className={`flex-1 h-12 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95 ${
                        product.stock === 0 
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                        : 'bg-gray-900 dark:bg-white hover:bg-primary dark:hover:bg-primary text-white dark:text-gray-900 dark:hover:text-white'
                    }`}
                >
                    <ShoppingCart className="w-5 h-5" />
                    {product.stock === 0 ? 'غير متوفر' : 'أضف إلى السلة'}
                </button>
                <button className="h-12 w-12 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-primary hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors">
                    <Share2 className="w-5 h-5" />
                </button>
           </div>
           
           <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-4 px-2">
                <div className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4" />
                    <span>توصيل مجاني</span>
                </div>
                 <div className="flex items-center gap-1.5">
                    <RotateCcw className="w-4 h-4" />
                    <span>إرجاع مجاني 14 يوم</span>
                </div>
                 <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>ضمان سنة</span>
                </div>
           </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mb-16">
          <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
              <nav className="flex gap-8">
                  <button
                    onClick={() => setActiveTab('description')}
                    className={`pb-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'description' ? 'border-primary text-primary' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                  >
                      تفاصيل المنتج
                  </button>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`pb-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'reviews' ? 'border-primary text-primary' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                  >
                      التقييمات ({reviewsCount})
                  </button>
              </nav>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 min-h-[200px]">
              {activeTab === 'description' ? (
                  <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 leading-loose whitespace-pre-line">
                      {product.detailedDescription || product.description || "لا يوجد وصف تفصيلي لهذا المنتج."}
                      <ul className="list-disc list-inside mt-4 space-y-2">
                          <li>جودة تصنيع عالية ومواد ممتازة</li>
                          <li>تصميم عصري يناسب جميع الأذواق</li>
                          <li>ضمان شامل لمدة عام كامل</li>
                      </ul>
                  </div>
              ) : (
                  <div className="space-y-12">
                      {/* Add Review Form */}
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                          <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                              <MessageCircle className="w-5 h-5 text-primary" />
                              أضف تقييمك
                          </h3>
                          {currentUser ? (
                              <form onSubmit={handleSubmitReview} className="space-y-4">
                                  <div className="flex items-center gap-2 mb-2">
                                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300 ml-2">تقييمك:</span>
                                      {[1, 2, 3, 4, 5].map((star) => (
                                          <button
                                              key={star}
                                              type="button"
                                              onClick={() => setReviewRating(star)}
                                              className="focus:outline-none transition-transform hover:scale-110"
                                          >
                                              <Star 
                                                  className={`w-6 h-6 ${star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'}`} 
                                              />
                                          </button>
                                      ))}
                                  </div>
                                  <div className="relative">
                                      <textarea
                                          value={reviewComment}
                                          onChange={(e) => setReviewComment(e.target.value)}
                                          placeholder="اكتب تعليقك هنا..."
                                          rows={3}
                                          className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                          required
                                      />
                                      <button 
                                          type="submit"
                                          disabled={!reviewComment.trim() || isSubmittingReview}
                                          className="absolute bottom-3 left-3 p-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                          {isSubmittingReview ? (
                                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                          ) : (
                                              <Send className="w-5 h-5 rtl:rotate-180" />
                                          )}
                                      </button>
                                  </div>
                              </form>
                          ) : (
                              <div className="text-center py-6">
                                  <p className="text-gray-500 dark:text-gray-400 mb-4">يرجى تسجيل الدخول لتتمكن من إضافة تقييم.</p>
                                  <button 
                                      onClick={onLoginClick}
                                      className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2 rounded-full font-bold text-sm hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-lg"
                                  >
                                      تسجيل الدخول
                                  </button>
                              </div>
                          )}
                      </div>

                      {/* Reviews List */}
                      <div className="space-y-8">
                          {(!product.reviews || product.reviews.length === 0) ? (
                              <div className="text-center text-gray-400 dark:text-gray-600 py-8">
                                  <Star className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                  <p>لا توجد تقييمات بعد. كن أول من يقيم هذا المنتج!</p>
                              </div>
                          ) : (
                              product.reviews.map((review) => (
                                  <div key={review.id} className="flex gap-4 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
                                      <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center font-bold text-primary border border-blue-100 dark:border-blue-800 flex-shrink-0">
                                          {review.userName.charAt(0)}
                                      </div>
                                      <div className="flex-1">
                                          <div className="flex justify-between items-start mb-1">
                                              <h4 className="font-bold text-gray-900 dark:text-white">{review.userName}</h4>
                                              <span className="text-xs text-gray-400">{review.date}</span>
                                          </div>
                                          <div className="flex text-amber-400 mb-2">
                                              {[...Array(5)].map((_, i) => (
                                                  <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-current' : 'text-gray-200 dark:text-gray-600'}`} />
                                              ))}
                                          </div>
                                          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{review.comment}</p>
                                      </div>
                                  </div>
                              ))
                          )}
                      </div>
                  </div>
              )}
          </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
          <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">منتجات قد تعجبك</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 {relatedProducts.slice(0, 4).map(prod => (
                      <div 
                        key={prod.id} 
                        onClick={() => onProductClick(prod)}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden cursor-pointer hover:shadow-lg transition-all group"
                      >
                           <div className="aspect-square bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
                                <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                           </div>
                           <div className="p-4">
                                <h3 className="font-bold text-gray-900 dark:text-white truncate">{prod.name}</h3>
                                <p className="text-primary font-bold mt-2 dir-ltr">
                                    {getCurrencySymbol()} {getDisplayPrice(prod)}
                                </p>
                           </div>
                      </div>
                 ))}
              </div>
          </div>
      )}
    </div>
  );
};

export default ProductDetails;
