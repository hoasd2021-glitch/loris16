
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import ProductDetails from './components/ProductDetails';
import CartDrawer from './components/CartDrawer';
import AIChatBot from './components/AIChatBot';
import AdminPage from './components/AdminPage';
import AdminLogin from './components/AdminLogin';
import UserLogin from './components/UserLogin';
import CheckoutModal from './components/CheckoutModal';
import UserProfile from './components/UserProfile';
import HeroCarousel from './components/HeroCarousel';
import { FeaturesSection, CategoriesSection, SpecialOfferSection, BrandsSection, NewsletterSection } from './components/HomeSections';
import { PRODUCTS, SHIPPING_OPTIONS } from './constants';
import { updateAIProducts } from './services/geminiService';
import { Product, CartItem, ViewState, Currency, User, Review, UserOrder, ExchangeRates } from './types';
import { Filter, XCircle, Heart, ArrowLeft, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

const EXCHANGE_RATE_SAR_TO_USD = 3.75;

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

function App() {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [orders, setOrders] = useState<UserOrder[]>(() => {
    try {
      const saved = localStorage.getItem('orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('users');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(PRODUCTS);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.HOME);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currency, setCurrency] = useState<Currency>('SAR');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const [toasts, setToasts] = useState<Toast[]>([]);

  // User Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isUserLoginOpen, setIsUserLoginOpen] = useState(false);
  
  // Shipping State
  const [selectedShippingId, setSelectedShippingId] = useState<string>(SHIPPING_OPTIONS?.[0]?.id || '');

  // Categories State
  const [categories, setCategories] = useState<string[]>(() => {
    return Array.from<string>(new Set(PRODUCTS.map(p => p.category))).sort();
  });

  // Brands State
  const [brands, setBrands] = useState<string[]>(() => {
    return Array.from<string>(new Set(PRODUCTS.map(p => p.brand || 'عام').filter((b): b is string => !!b))).sort();
  });

  // Price Filter State
  const [priceRange, setPriceRange] = useState<{min: number, max: number}>({ min: 0, max: 10000 });

  const exchangeRates: ExchangeRates = { USD: 3.75, YER: 145 };

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  // Filter products
  useEffect(() => {
    const results = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;
      
      return matchesSearch && matchesPrice;
    });
    setFilteredProducts(results);
  }, [searchTerm, products, priceRange]);

  // Update AI context
  useEffect(() => {
    updateAIProducts(products);
  }, [products]);

  // Toast Helpers
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: number) => {
      setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleAddToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
    showToast('تمت الإضافة للسلة بنجاح', 'success');
  };

  const handleRemoveFromCart = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleUpdateQuantity = (id: number, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const toggleFavorite = (id: number) => {
    const isFav = favorites.includes(id);
    setFavorites(prev => 
      isFav ? prev.filter(favId => favId !== id) : [...prev, id]
    );
    showToast(isFav ? 'تمت الإزالة من المفضلة' : 'تمت الإضافة للمفضلة', 'info');
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // -- Checkout Logic --
  const handleCheckoutClick = () => {
    if (!currentUser) {
      setIsUserLoginOpen(true);
      return;
    }
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handlePlaceOrder = async (address: string, paymentMethod: string) => {
    if (!currentUser) return;

    const selectedShipping = SHIPPING_OPTIONS.find(opt => opt.id === selectedShippingId) || SHIPPING_OPTIONS[0];
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = subtotal + selectedShipping.price;

    const newOrder: UserOrder = {
      id: `ORD-${Date.now()}`,
      userId: currentUser.id,
      items: [...cartItems],
      total: total,
      currency: currency,
      date: new Date().toISOString(),
      status: 'pending',
      shippingAddress: address,
      paymentMethod: paymentMethod
    };

    setOrders(prev => [newOrder, ...prev]);
    setCartItems([]);
    
    // Reduce Stock
    setProducts(prev => prev.map(p => {
        const cartItem = cartItems.find(item => item.id === p.id);
        if (cartItem) {
            return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
        }
        return p;
    }));
  };

  // -- User Auth Actions --
  const handleUserLogin = (user: User) => {
    const existingUser = users.find(u => u.email === user.email);
    if (existingUser) {
        setCurrentUser(existingUser);
    } else {
        setUsers(prev => [...prev, user]);
        setCurrentUser(user);
    }
    setIsUserLoginOpen(false);
    showToast(`مرحباً بك مجدداً، ${user.name}`, 'success');
  };

  const handleUserLogout = () => {
    setCurrentUser(null);
    setCurrentView(ViewState.HOME);
    showToast('تم تسجيل الخروج بنجاح', 'info');
  };

  // -- Review Action --
  const handleAddReview = (productId: number, reviewData: { rating: number, comment: string }) => {
    setProducts(prevProducts => prevProducts.map(product => {
      if (product.id === productId) {
        const newReview: Review = {
          id: Date.now().toString(),
          userId: currentUser?.id || 'guest',
          userName: currentUser?.name || 'زائر',
          rating: reviewData.rating,
          comment: reviewData.comment,
          date: new Date().toISOString().split('T')[0]
        };
        
        const currentReviews = product.reviews || [];
        const updatedReviews = [newReview, ...currentReviews];
        
        const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
        const newAverageRating = Number((totalRating / updatedReviews.length).toFixed(1));

        if (selectedProduct?.id === productId) {
            setSelectedProduct({
                ...product,
                reviews: updatedReviews,
                reviewsCount: updatedReviews.length,
                rating: newAverageRating
            });
        }

        return {
          ...product,
          reviews: updatedReviews,
          reviewsCount: updatedReviews.length,
          rating: newAverageRating
        };
      }
      return product;
    }));
  };

  // -- Admin Actions --
  const handleAddProduct = (newProductData: Omit<Product, 'id'>) => {
    const newId = Math.max(...products.map(p => p.id), 0) + 1;
    const newProduct = { ...newProductData, id: newId };
    setProducts(prev => [...prev, newProduct]);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const handleDeleteProduct = (id: number) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    setCartItems(prev => prev.filter(item => item.id !== id));
    setFavorites(prev => prev.filter(favId => favId !== id));
  };

  // -- Category Actions --
  const handleAddCategory = (category: string) => {
    if (!category.trim()) return;
    setCategories(prev => {
      if (prev.includes(category)) return prev;
      return [...prev, category].sort();
    });
  };

  const handleUpdateCategory = (oldCategory: string, newCategory: string) => {
    if (!newCategory.trim()) return;
    setCategories(prev => prev.map(c => c === oldCategory ? newCategory : c).sort());
    setProducts(prev => prev.map(p => p.category === oldCategory ? { ...p, category: newCategory } : p));
  };

  const handleDeleteCategory = (category: string) => {
    setCategories(prev => prev.filter(c => c !== category));
  };

  // -- Brand Actions --
  const handleAddBrand = (brand: string) => {
    if (!brand.trim()) return;
    setBrands(prev => {
      if (prev.includes(brand)) return prev;
      return [...prev, brand].sort();
    });
  };

  const handleUpdateBrand = (oldBrand: string, newBrand: string) => {
    if (!newBrand.trim()) return;
    setBrands(prev => prev.map(b => b === oldBrand ? newBrand : b).sort());
    setProducts(prev => prev.map(p => p.brand === oldBrand ? { ...p, brand: newBrand } : p));
  };

  const handleDeleteBrand = (brand: string) => {
    setBrands(prev => prev.filter(b => b !== brand));
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: UserOrder['status']) => {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  const handleCategorySelect = (category: string) => {
      setSearchTerm(category);
      setCurrentView(ViewState.HOME);
      setTimeout(() => {
        document.getElementById('products-grid')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
  };

  const handleProductClick = (product: Product) => {
      setSelectedProduct(product);
      setCurrentView(ViewState.PRODUCT_DETAILS);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Global Toasts */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
            <div 
                key={toast.id} 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white transform transition-all duration-300 animate-slide-in-right pointer-events-auto min-w-[300px] ${
                    toast.type === 'success' ? 'bg-green-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
                }`}
            >
                {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : toast.type === 'error' ? <AlertTriangle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                <span className="text-sm font-medium flex-1">{toast.message}</span>
                <button onClick={() => removeToast(toast.id)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>
        ))}
      </div>

      <Navbar
        cartCount={cartCount}
        favoritesCount={favorites.length}
        onCartClick={() => setIsCartOpen(true)}
        onFavoritesClick={() => setCurrentView(ViewState.FAVORITES)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        currentView={currentView}
        onNavigate={setCurrentView}
        currency={currency}
        onCurrencyChange={setCurrency}
        currentUser={currentUser}
        onLoginClick={() => setIsUserLoginOpen(true)}
        onLogoutClick={handleUserLogout}
        isDarkMode={false}
        onToggleTheme={() => {}}
      />

      <main className="flex-1 w-full bg-gray-50/50">
        {currentView === ViewState.ADMIN ? (
          isAuthenticated ? (
            <AdminPage 
              products={products}
              categories={categories}
              brands={brands}
              orders={orders}
              users={users}
              coupons={[]}
              exchangeRates={exchangeRates}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              onAddCategory={handleAddCategory}
              onUpdateCategory={handleUpdateCategory}
              onDeleteCategory={handleDeleteCategory}
              onAddBrand={handleAddBrand}
              onUpdateBrand={handleUpdateBrand}
              onDeleteBrand={handleDeleteBrand}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onDeleteOrder={() => {}}
              onDeleteUser={() => {}}
              onDeleteReview={() => {}}
              onAddAdmin={() => {}}
              onUpdateAdmin={() => {}}
              onDeleteAdmin={() => {}}
              onAddCoupon={() => {}}
              onUpdateCoupon={() => {}}
              onDeleteCoupon={() => {}}
              onUpdateExchangeRates={() => {}}
              onLogout={() => {
                  setIsAuthenticated(false);
                  setCurrentView(ViewState.HOME);
                  showToast('تم تسجيل الخروج من لوحة المشرف', 'info');
              }}
              onShowToast={showToast}
            />
          ) : (
            <AdminLogin 
              onLogin={() => {
                  setIsAuthenticated(true);
                  showToast('تم تسجيل الدخول كمشرف بنجاح');
              }}
              onCancel={() => setCurrentView(ViewState.HOME)}
              onUserLoginClick={() => {
                  setCurrentView(ViewState.HOME);
                  setIsUserLoginOpen(true);
              }}
            />
          )
        ) : currentView === ViewState.PRODUCT_DETAILS && selectedProduct ? (
            <ProductDetails 
                product={selectedProduct}
                onBack={() => setCurrentView(ViewState.HOME)}
                onAddToCart={handleAddToCart}
                isFavorite={favorites.includes(selectedProduct.id)}
                onToggleFavorite={toggleFavorite}
                currency={currency}
                exchangeRates={exchangeRates}
                relatedProducts={products.filter(p => p.category === selectedProduct.category && p.id !== selectedProduct.id)}
                onProductClick={handleProductClick}
                currentUser={currentUser}
                onAddReview={handleAddReview}
                onLoginClick={() => setIsUserLoginOpen(true)}
                onShowToast={showToast}
            />
        ) : currentView === ViewState.PROFILE && currentUser ? (
            <UserProfile 
                user={currentUser}
                orders={orders.filter(o => o.userId === currentUser.id)}
                currency={currency}
                exchangeRate={exchangeRates.USD}
                onLogout={handleUserLogout}
                onShowToast={showToast}
                onNavigate={setCurrentView}
            />
        ) : currentView === ViewState.FAVORITES ? (
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
              <div className="flex items-center gap-4 mb-8">
                  <button 
                    onClick={() => setCurrentView(ViewState.HOME)}
                    className="p-2 rounded-full hover:bg-white hover:shadow-sm transition-all text-gray-500 hover:text-primary"
                  >
                      <ArrowLeft className="w-6 h-6 rtl:rotate-180" />
                  </button>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <Heart className="w-7 h-7 text-red-500 fill-red-500" />
                      المنتجات المفضلة
                      <span className="text-sm font-normal text-gray-500 mr-2">({favorites.length})</span>
                  </h1>
              </div>

              {favorites.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 text-center">
                      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                          <Heart className="w-10 h-10 text-red-300" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2">قائمة المفضلة فارغة</h2>
                      <p className="text-gray-500 mb-6 max-w-md">لم تقم بإضافة أي منتجات إلى المفضلة بعد. تصفح المتجر واضغط على رمز القلب لحفظ المنتجات التي تعجبك.</p>
                      <button 
                        onClick={() => setCurrentView(ViewState.HOME)}
                        className="bg-primary hover:bg-secondary text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95"
                      >
                          تصفح المنتجات
                      </button>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {products.filter(p => favorites.includes(p.id)).map(product => (
                          <ProductCard
                              key={product.id}
                              product={product}
                              isFavorite={true}
                              onAddToCart={handleAddToCart}
                              onToggleFavorite={toggleFavorite}
                              currency={currency}
                              exchangeRates={exchangeRates}
                              onClick={handleProductClick}
                              onShowToast={showToast}
                          />
                      ))}
                  </div>
              )}
           </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {!searchTerm && (
                <>
                    <HeroCarousel onCtaClick={(cat) => handleCategorySelect(cat || '')} />
                    <FeaturesSection />
                    <SpecialOfferSection />
                    <CategoriesSection categories={categories} onSelectCategory={handleCategorySelect} />
                </>
            )}

            <div id="products-grid" className="space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  {searchTerm ? (
                      <>
                        <span>نتائج البحث عن "{searchTerm}"</span>
                        <button 
                            onClick={() => setSearchTerm('')} 
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-full transition-colors"
                            title="إلغاء البحث"
                        >
                            <XCircle className="w-5 h-5" />
                        </button>
                      </>
                  ) : 'أحدث المنتجات'}
                </h2>
                
                <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-2xl shadow-sm border border-gray-100 animate-fade-in">
                    <div className="flex items-center gap-2 text-gray-700 pl-4 border-l border-gray-100">
                        <Filter className="w-4 h-4 text-primary" />
                        <span className="text-sm font-bold">تصفية حسب السعر (SAR)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">من</span>
                        <input
                            type="number"
                            min="0"
                            value={priceRange.min}
                            onChange={(e) => setPriceRange(prev => ({...prev, min: Number(e.target.value) || 0}))}
                            className="w-20 sm:w-24 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none bg-gray-50 focus:bg-white transition-colors"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">إلى</span>
                         <input
                            type="number"
                            min="0"
                            value={priceRange.max}
                            onChange={(e) => setPriceRange(prev => ({...prev, max: Number(e.target.value) || 0}))}
                            className="w-20 sm:w-24 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none bg-gray-50 focus:bg-white transition-colors"
                        />
                        <span className="text-sm text-gray-500 pr-1">ر.س</span>
                    </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500 text-sm">{filteredProducts.length} منتج</span>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                  <p className="text-gray-500 text-lg">لم يتم العثور على منتجات تطابق بحثك.</p>
                  <button 
                    onClick={() => {
                        setSearchTerm('');
                        setPriceRange({min: 0, max: 10000});
                    }} 
                    className="mt-4 text-primary hover:underline font-medium"
                  >
                    عرض كل المنتجات
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isFavorite={favorites.includes(product.id)}
                      onAddToCart={handleAddToCart}
                      onToggleFavorite={toggleFavorite}
                      currency={currency}
                      exchangeRates={exchangeRates}
                      onClick={handleProductClick}
                      onShowToast={showToast}
                    />
                  ))}
                </div>
              )}
            </div>

            {!searchTerm && (
                <>
                    <BrandsSection brands={brands} />
                    <NewsletterSection />
                </>
            )}
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} متجر المستقبل. جميع الحقوق محفوظة.</p>
          <p className="mt-2">تم التطوير باستخدام React, Tailwind & Gemini AI</p>
        </div>
      </footer>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onRemoveItem={handleRemoveFromCart}
        onUpdateQuantity={handleUpdateQuantity}
        currency={currency}
        exchangeRates={exchangeRates}
        shippingOptions={SHIPPING_OPTIONS}
        selectedShippingId={selectedShippingId}
        onSelectShipping={setSelectedShippingId}
        onCheckout={handleCheckoutClick}
        onNavigate={setCurrentView}
      />

      <AIChatBot />

      {isUserLoginOpen && (
        <UserLogin 
            onLogin={handleUserLogin}
            onCancel={() => setIsUserLoginOpen(false)}
            onAdminLoginClick={() => {
                setIsUserLoginOpen(false);
                setCurrentView(ViewState.ADMIN);
            }}
        />
      )}

      {isCheckoutOpen && (
        <CheckoutModal 
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
            cartItems={cartItems}
            totalAmount={cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0) + (SHIPPING_OPTIONS.find(o => o.id === selectedShippingId)?.price || 0)}
            currency={currency}
            exchangeRates={exchangeRates}
            shippingOption={SHIPPING_OPTIONS.find(o => o.id === selectedShippingId) || SHIPPING_OPTIONS[0]}
            onPlaceOrder={handlePlaceOrder}
        />
      )}
    </div>
  );
}

export default App;
