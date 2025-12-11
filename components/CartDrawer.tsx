
import React, { useMemo } from 'react';
import { X, Trash2, ShoppingBag, Truck } from 'lucide-react';
import { CartItem, Currency, ShippingOption, ExchangeRates, ViewState } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemoveItem: (id: number) => void;
  onUpdateQuantity: (id: number, delta: number) => void;
  currency: Currency;
  exchangeRates: ExchangeRates;
  shippingOptions: ShippingOption[];
  selectedShippingId: string;
  onSelectShipping: (id: string) => void;
  onCheckout: () => void;
  onNavigate: (view: ViewState) => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onUpdateQuantity,
  currency,
  exchangeRates,
  shippingOptions,
  selectedShippingId,
  onSelectShipping,
  onCheckout,
  onNavigate
}) => {
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const selectedShipping = shippingOptions.find(opt => opt.id === selectedShippingId) || shippingOptions[0];
  const shippingCost = selectedShipping.price;
  const total = subtotal + shippingCost;

  const formatPrice = (priceInSar: number) => {
    if (currency === 'SAR') {
        return `${priceInSar} ر.س`;
    }
    if (currency === 'USD') {
        return `$${(priceInSar / exchangeRates.USD).toFixed(2)}`;
    }
    // YER
    return `${Math.round(priceInSar * exchangeRates.YER)} ر.ي`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="fixed inset-y-0 left-0 max-w-md w-full flex">
        <div className="w-full bg-white dark:bg-gray-900 shadow-2xl flex flex-col h-full transform transition-transform duration-300 ease-in-out animate-slide-in-right">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              سلة المشتريات
              <span className="bg-primary/10 dark:bg-primary/20 text-primary text-xs px-2 py-1 rounded-full">{items.length} منتجات</span>
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400 space-y-4">
                <ShoppingBag className="w-16 h-16 opacity-20" />
                <p className="text-lg font-medium">سلتك فارغة حالياً</p>
                <button 
                    onClick={() => {
                        onClose();
                        onNavigate(ViewState.HOME);
                    }}
                    className="text-primary hover:underline"
                >
                    تصفح المنتجات
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex gap-4 animate-fade-in">
                  <div className="w-20 h-20 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white line-clamp-1">{item.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.category}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-lg p-1">
                        <button
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 rounded shadow-sm text-gray-600 dark:text-gray-300 hover:text-primary disabled:opacity-50"
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="text-sm font-medium w-4 text-center text-gray-900 dark:text-white">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 rounded shadow-sm text-gray-600 dark:text-gray-300 hover:text-primary"
                        >
                          +
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-900 dark:text-white dir-ltr">{formatPrice(item.price * item.quantity)}</span>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Shipping and Total */}
          {items.length > 0 && (
            <div className="border-t border-gray-100 dark:border-gray-800 p-6 bg-gray-50 dark:bg-gray-800/50 space-y-6">
              
              {/* Shipping Options */}
              <div>
                <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-primary" />
                  طريقة الشحن
                </h3>
                <div className="space-y-2">
                  {shippingOptions.map((option) => (
                    <div 
                      key={option.id}
                      onClick={() => onSelectShipping(option.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        selectedShippingId === option.id 
                          ? 'border-primary bg-primary/5 dark:bg-primary/20 ring-1 ring-primary' 
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                         <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedShippingId === option.id ? 'border-primary' : 'border-gray-300 dark:border-gray-600'}`}>
                            {selectedShippingId === option.id && <div className="w-2 h-2 rounded-full bg-primary"></div>}
                         </div>
                         <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{option.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{option.description} ({option.estimatedDays})</p>
                         </div>
                      </div>
                      <span className="text-sm font-bold text-primary dir-ltr">
                        {option.price === 0 ? 'مجاناً' : formatPrice(option.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                   <span>المجموع الفرعي</span>
                   <span className="dir-ltr">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                   <span>الشحن</span>
                   <span className="dir-ltr text-primary">
                      {shippingCost === 0 ? 'مجاناً' : formatPrice(shippingCost)}
                   </span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span>الإجمالي الكلي</span>
                  <span className="dir-ltr">{formatPrice(total)}</span>
                </div>
              </div>

              <button 
                onClick={onCheckout}
                className="w-full bg-primary hover:bg-secondary text-white py-3.5 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-[0.99]"
              >
                إتمام الشراء
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
