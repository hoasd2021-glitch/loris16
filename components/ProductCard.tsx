
import React from 'react';
import { Plus, Heart, Star, ShoppingCart, XCircle } from 'lucide-react';
import { Product, Currency, ExchangeRates } from '../types';

interface ProductCardProps {
  product: Product;
  isFavorite: boolean;
  onAddToCart: (product: Product) => void;
  onToggleFavorite: (id: number) => void;
  currency: Currency;
  exchangeRates: ExchangeRates;
  onClick?: (product: Product) => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  isFavorite, 
  onAddToCart, 
  onToggleFavorite,
  currency,
  exchangeRates,
  onClick,
  onShowToast
}) => {
  const isOutOfStock = product.stock === 0;
  const rating = product.rating || 0;

  const getDisplayPrice = () => {
      if (currency === 'SAR') return product.price;
      if (currency === 'USD') return (product.price / exchangeRates.USD).toFixed(2);
      if (currency === 'YER') return Math.round(product.price * exchangeRates.YER);
      return product.price;
  };

  const getCurrencySymbol = () => {
      if (currency === 'SAR') return 'ر.س';
      if (currency === 'USD') return '$';
      if (currency === 'YER') return 'ر.ي';
      return 'ر.س';
  };

  return (
    <div 
        onClick={() => onClick && onClick(product)}
        className={`group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col h-full relative cursor-pointer ${isOutOfStock ? 'opacity-75' : ''}`}
    >
      
      {/* Favorite Button (Floating) */}
      <button 
        onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(product.id);
            onShowToast(isFavorite ? 'تمت الإزالة من المفضلة' : 'تمت الإضافة للمفضلة', 'info');
        }}
        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm hover:bg-white dark:hover:bg-gray-700 transition-all transform hover:scale-110 active:scale-95 group/fav"
        title={isFavorite ? "إزالة من المفضلة" : "إضافة للمفضلة"}
      >
        <Heart className={`w-5 h-5 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400 dark:text-gray-500 group-hover/fav:text-red-500'}`} />
      </button>

      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
        <img
          src={product.images[0]}
          alt={product.name}
          className={`w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 ${isOutOfStock ? 'grayscale' : ''}`}
        />
        
        {/* Out of Stock Overlay */}
        {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                <span className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg transform -rotate-12 border-2 border-white">
                    نفذت الكمية
                </span>
            </div>
        )}

        <div className="absolute top-3 left-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-semibold text-gray-700 dark:text-gray-300 shadow-sm z-10">
          {product.category}
        </div>
        
        {product.images.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-white shadow-sm z-10">
                +{product.images.length - 1}
            </div>
        )}
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-primary transition-colors" title={product.name}>{product.name}</h3>
        </div>
        
        <div className="flex items-center gap-2 mb-2">
            <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                    <Star 
                        key={i} 
                        className={`w-3 h-3 ${i < Math.round(rating) ? 'fill-current' : 'text-gray-200 dark:text-gray-600 fill-gray-200 dark:fill-gray-600'}`} 
                    />
                ))}
            </div>
            {product.brand && <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 border-r border-gray-200 dark:border-gray-700 pr-2 mr-2">{product.brand}</span>}
            <span className="text-xs text-gray-400 dark:text-gray-500">({product.reviewsCount || 0})</span>
        </div>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1">
            {product.description}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50 dark:border-gray-700">
            <div className="flex flex-col">
                <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">السعر</span>
                <span className="text-lg font-black text-gray-900 dark:text-white dir-ltr">{getCurrencySymbol()} {getDisplayPrice()}</span>
            </div>
            
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    if (!isOutOfStock) onAddToCart(product);
                }}
                disabled={isOutOfStock}
                className={`p-3 rounded-xl transition-all shadow-sm flex items-center justify-center ${
                    isOutOfStock 
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                    : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-primary dark:hover:bg-primary dark:hover:text-white active:scale-95 hover:shadow-lg'
                }`}
                title="أضف للسلة"
            >
                {isOutOfStock ? <XCircle className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
