
import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import ProductCard from './ProductCard';
import ProductDetails from './ProductDetails';
import CartDrawer from './CartDrawer';
import AIChatBot from './AIChatBot';
import AdminPage from './AdminPage';
import AdminLogin from './AdminLogin';
import UserLogin from './UserLogin';
import CheckoutModal from './CheckoutModal';
import UserProfile from './UserProfile';
import HeroCarousel from './HeroCarousel';
import BottomNav from './BottomNav';
import { FeaturesSection, CategoriesSection, SpecialOfferSection, BrandsSection, NewsletterSection } from './HomeSections';
import { TrackOrderPage, AboutPage, ContactPage, FAQPage } from './StaticPages';
import { PRODUCTS, SHIPPING_OPTIONS } from '../constants';
import { updateAIProducts } from '../services/geminiService';
import { Product, CartItem, ViewState, Currency, User, Review, UserOrder, Coupon, ExchangeRates } from '../types';
import { Filter, XCircle, Heart, ArrowLeft, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

function App() {
  // --- STATE INITIALIZATION WITH AUTO-LOAD ---
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('products');
      return saved ? JSON.parse(saved) : PRODUCTS;
    } catch {
      return PRODUCTS;
    }
  });
  
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
      try {
          const saved = localStorage.getItem('cartItems');
          return saved ? JSON.parse(saved) : [];
      } catch { return []; }
  });

  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('favorites');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [orders, setOrders] = useState<UserOrder[]>(() => {
    try {
      const saved = localStorage.getItem('orders');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('users');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
      try {
          const saved = localStorage.getItem('coupons');
          return saved ? JSON.parse(saved) : [
            { id: '1', code: 'WELCOME20', discount: 20, expiryDate: '2025-12-31', isActive: true, usageCount: 15 },
            { id: '2', code: 'SUMMER', discount: 15, expiryDate: '2024-08-30', isActive: false, usageCount: 42 }
          ];
      } catch { return []; }
  });

  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>(() => {
      try {
          const saved = localStorage.getItem('exchangeRates');
          return saved ? JSON.parse(saved) : { USD: 3.75, YER: 145 }; // Default Rates
      } catch {
          return { USD: 3.75, YER: 145 };
      }
  });

  // --- UI STATE ---
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  
  // Persist Current View with URL Handling
  const [currentView, setCurrentView] = useState<ViewState>(() => {
      // 1. Priority: Check URL param for Admin Mode
      if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          if (params.get('mode') === 'admin') {
              return ViewState.ADMIN;
          }
      }
      
      // 2. Fallback: LocalStorage (But ensure we don't get stuck in Admin if URL param is missing)
      try {
          const savedView = localStorage.getItem('currentView') as ViewState;
          // If stored view is ADMIN but URL doesn't have ?mode=admin, revert to HOME to separate them
          if (savedView === ViewState.ADMIN) {
              return ViewState.HOME;
          }
          return savedView || ViewState.HOME;
      } catch {
          return ViewState.HOME;
      }
  });
  
  // Initialize authenticated state from localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return localStorage.getItem('isAdminAuthenticated') === 'true';
    } catch {
      return false;
    }
  });

  const [currency, setCurrency] = useState<Currency>('SAR');
  
  // Persist Selected Product (for Refresh on Product Details page)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(() => {
      try {
          const saved = localStorage.getItem('selectedProduct');
          return saved ? JSON.parse(saved) : null;
      } catch {
          return null;
      }
  });

  const [isUserLoginOpen, setIsUserLoginOpen] = useState(false); 
  
  // Persist Current User
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
        const saved = localStorage.getItem('currentUser');
        return saved ? JSON.parse(saved) : null;
    } catch {
        return null;
    }
  });

  const [selectedShippingId, setSelectedShippingId] = useState<string>(SHIPPING_OPTIONS?.[0]?.id || '');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [categories, setCategories] = useState<string[]>(() => Array.from(new Set(products.map(p => p.category))).sort());
  const [brands, setBrands] = useState<string[]>(() => Array.from(new Set(products.map(p => p.brand || 'عام').filter((b): b is string => !!b))).sort());
  const [priceRange, setPriceRange] = useState<{min: number, max: number}>({ min: 0, max: 10000 });

  // --- AUTO-SAVE EFFECTS ---
  useEffect(() => { localStorage.setItem('products', JSON.stringify(products)); updateAIProducts(products); }, [products]);
  useEffect(() => { localStorage.setItem('cartItems', JSON.stringify(cartItems)); }, [cartItems]);
  useEffect(() => { localStorage.setItem('favorites', JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { localStorage.setItem('orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('coupons', JSON.stringify(coupons)); }, [coupons]);
  useEffect(() => { localStorage.setItem('exchangeRates', JSON.stringify(exchangeRates)); }, [exchangeRates]);
  
  // Save Auth & Navigation States & Sync URL
  useEffect(() => { localStorage.setItem('isAdminAuthenticated', String(isAuthenticated)); }, [isAuthenticated]);
  
  useEffect(() => { 
      localStorage.setItem('currentView', currentView);
      
      // Sync URL with ViewState
      if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          if (currentView === ViewState.ADMIN) {
              if (url.searchParams.get('mode') !== 'admin') {
                  url.searchParams.set('mode', 'admin');
                  window.history.pushState({}, '', url);
              }
          } else {
              if (url.searchParams.get('mode') === 'admin') {
                  url.searchParams.delete('mode');
                  window.history.pushState({}, '', url);
              }
          }
      }
  }, [currentView]);

  useEffect(() => { 
      if (selectedProduct) localStorage.setItem('selectedProduct', JSON.stringify(selectedProduct));
      else localStorage.removeItem('selectedProduct');
  }, [selectedProduct]);
  
  useEffect(() => {
      if (currentUser) {
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
      } else {
          localStorage.removeItem('currentUser');
      }
  }, [currentUser]);
  
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Update categories/brands when products change
  useEffect(() => {
      setCategories(Array.from(new Set(products.map(p => p.category))).sort());
      setBrands(Array.from(new Set(products.map(p => p.brand || 'عام').filter((b): b is string => !!b))).sort());
  }, [products]);

  // Filter products Logic
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

  // --- HELPER FUNCTIONS ---
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };
  const removeToast = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));
  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  
  const handleCurrencyChange = (newCurrency: Currency) => {
      setCurrency(newCurrency);
  };

  // --- CORE ACTIONS ---
  const handleAddToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
    showToast('تمت الإضافة للسلة بنجاح', 'success');
  };

  const handleRemoveFromCart = (id: number) => setCartItems(prev => prev.filter(item => item.id !== id));
  
  const handleUpdateQuantity = (id: number, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) return { ...item, quantity: Math.max(1, item.quantity + delta) };
      return item;
    }));
  };

  const toggleFavorite = (id: number) => {
    const isFav = favorites.includes(id);
    setFavorites(prev => isFav ? prev.filter(favId => favId !== id) : [...prev, id]);
    showToast(isFav ? 'تمت الإزالة من المفضلة' : 'تمت الإضافة للمفضلة', 'info');
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // --- CHECKOUT & ORDERS ---
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
    setProducts(prev => prev.map(p => {
        const cartItem = cartItems.find(item => item.id === p.id);
        if (cartItem) return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
        return p;
    }));
  };

  // --- AUTHENTICATION ---
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

  const handleProfileClick = () => {
    if (currentUser) {
        setCurrentView(ViewState.PROFILE);
    } else {
        setIsUserLoginOpen(true);
    }
  };

  // --- REVIEWS ---
  const handleAddReview = (productId: number, reviewData: { rating: number, comment: string }) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const newReview: Review = {
          id: Date.now().toString(),
          userId: currentUser?.id || 'guest',
          userName: currentUser?.name || 'زائر',
          rating: reviewData.rating,
          comment: reviewData.comment,
          date: new Date().toISOString().split('T')[0]
        };
        const updatedReviews = [newReview, ...(p.reviews || [])];
        const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
        return {
          ...p,
          reviews: updatedReviews,
          reviewsCount: updatedReviews.length,
          rating: Number((totalRating / updatedReviews.length).toFixed(1))
        };
      }
      return p;
    }));
  };

  // --- ADMIN ACTIONS ---
  const handleAddProduct = (p: Omit<Product, 'id'>) => setProducts(prev => [...prev, { ...p, id: Math.max(...products.map(p => p.id), 0) + 1 }]);
  const handleUpdateProduct = (p: Product) => setProducts(prev => prev.map(prod => prod.id === p.id ? p : prod));
  const handleDeleteProduct = (id: number) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    setCartItems(prev => prev.filter(item => item.id !== id));
    setFavorites(prev => prev.filter(favId => favId !== id));
  };
  const handleAddCategory = (c: string) => setCategories(prev => [...prev, c].sort());
  const handleUpdateCategory = (o: string, n: string) => {
      setCategories(prev => prev.map(c => c === o ? n : c).sort());
      setProducts(prev => prev.map(p => p.category === o ? { ...p, category: n } : p));
  };
  const handleDeleteCategory = (c: string) => setCategories(prev => prev.filter(cat => cat !== c));
  const handleAddBrand = (b: string) => setBrands(prev => [...prev, b].sort());
  const handleUpdateBrand = (o: string, n: string) => {
      setBrands(prev => prev.map(b => b === o ? n : b).sort());
      setProducts(prev => prev.map(p => p.brand === o ? { ...p, brand: n } : p));
  };
  const handleDeleteBrand = (b: string) => setBrands(prev => prev.filter(brand => brand !== b));
  const handleUpdateOrderStatus = (id: string, s: UserOrder['status']) => setOrders(prev => prev.map(o => o.id === id ? { ...o, status: s } : o));
  const handleDeleteOrder = (id: string) => setOrders(prev => prev.filter(o => o.id !== id));
  const handleDeleteUser = (id: string) => setUsers(prev => prev.filter(u => u.id !== id));
  const onDeleteReview = (pid: number, rid: string) => setProducts(prev => prev.map(p => p.id === pid ? { ...p, reviews: p.reviews?.filter(r => r.id !== rid), reviewsCount: (p.reviewsCount || 1) - 1 } : p));
  const handleAddAdmin = (a: Omit<User, 'id' | 'joinDate' | 'walletBalance' | 'loyaltyPoints' | 'addresses'>) => setUsers(prev => [...prev, { ...a, id: Date.now().toString(), joinDate: new Date().toISOString().split('T')[0], role: 'admin' }]);
  const handleUpdateAdmin = (a: User) => setUsers(prev => prev.map(u => u.id === a.id ? a : u));
  const handleDeleteAdmin = (id: string) => setUsers(prev => prev.filter(u => u.id !== id));
  
  // Coupon & Currency Actions
  const handleAddCoupon = (c: Omit<Coupon, 'id' | 'usageCount'>) => setCoupons(prev => [...prev, { ...c, id: Date.now().toString(), usageCount: 0 }]);
  const handleUpdateCoupon = (c: Coupon) => setCoupons(prev => prev.map(cp => cp.id === c.id ? c : cp));
  const handleDeleteCoupon = (id: string) => setCoupons(prev => prev.filter(c => c.id !== id));
  const handleUpdateExchangeRates = (rates: ExchangeRates) => setExchangeRates(rates);

  const handleCategorySelect = (category: string) => {
      setSearchTerm(category);
      setCurrentView(ViewState.HOME);
      setTimeout(() => document.getElementById('products-grid')?.scrollIntoView({ behavior: 'smooth' }), 100);
  };
  
  const handleProductClick = (product: Product) => { 
      setSelectedProduct(product); 
      setCurrentView(ViewState.PRODUCT_DETAILS); 
      window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  // --- RENDER HELPERS ---
  const renderToasts = () => (
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
  );

  // --- SEPARATE ADMIN VIEW ---
  if (currentView === ViewState.ADMIN) {
      return (
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 dir-rtl font-sans text-right relative">
              {renderToasts()}
              {isAuthenticated ? (
                  <AdminPage 
                      products={products}
                      categories={categories}
                      brands={brands}
                      orders={orders}
                      users={users}
                      coupons={coupons}
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
                      onDeleteOrder={handleDeleteOrder}
                      onDeleteUser={handleDeleteUser}
                      onDeleteReview={onDeleteReview}
                      onAddAdmin={handleAddAdmin}
                      onUpdateAdmin={handleUpdateAdmin}
                      onDeleteAdmin={handleDeleteAdmin}
                      onAddCoupon={handleAddCoupon}
                      onUpdateCoupon={handleUpdateCoupon}
                      onDeleteCoupon={handleDeleteCoupon}
                      onUpdateExchangeRates={handleUpdateExchangeRates}
                      onLogout={() => { setIsAuthenticated(false); setCurrentView(ViewState.HOME); showToast('تم تسجيل الخروج من لوحة المشرف'); }}
                      onGoHome={() => setCurrentView(ViewState.HOME)}
                      currentUserEmail={currentUser?.email}
                      onShowToast={showToast}
                  />
              ) : (
                  <AdminLogin 
                      onLogin={() => { setIsAuthenticated(true); showToast('تم تسجيل الدخول كمشرف بنجاح'); }}
                      onCancel={() => setCurrentView(ViewState.HOME)}
                      onUserLoginClick={() => { setCurrentView(ViewState.HOME); setIsUserLoginOpen(true); }}
                  />
              )}
          </div>
      );
  }

  // --- CUSTOMER VIEW ---
  return (
    <div className="min-h-screen flex flex-col relative bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {renderToasts()}

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
        onCurrencyChange={handleCurrencyChange}
        currentUser={currentUser}
        onLoginClick={() => setIsUserLoginOpen(true)}
        onLogoutClick={handleUserLogout}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
      />

      <main className="flex-1 w-full">
        {currentView === ViewState.PRODUCT_DETAILS && selectedProduct ? (
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
                onAddAddress={(addr) => {
                    const updatedUser = { ...currentUser, addresses: [...(currentUser.addresses || []), { ...addr, id: Date.now().toString() }] };
                    setCurrentUser(updatedUser);
                    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
                }}
                onDeleteAddress={(id) => {
                    const updatedUser = { ...currentUser, addresses: currentUser.addresses?.filter(a => a.id !== id) };
                    setCurrentUser(updatedUser);
                    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
                }}
                onShowToast={showToast}
                onNavigate={setCurrentView}
            />
        ) : currentView === ViewState.TRACK_ORDER ? (
            <TrackOrderPage orders={orders} />
        ) : currentView === ViewState.ABOUT ? (
            <AboutPage />
        ) : currentView === ViewState.CONTACT ? (
            <ContactPage />
        ) : currentView === ViewState.FAQ ? (
            <FAQPage />
        ) : currentView === ViewState.FAVORITES ? (
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
              <div className="flex items-center gap-4 mb-8">
                  <button 
                    onClick={() => setCurrentView(ViewState.HOME)}
                    className="p-2 rounded-full hover:bg-white hover:shadow-sm dark:hover:bg-gray-800 transition-all text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
                  >
                      <ArrowLeft className="w-6 h-6 rtl:rotate-180" />
                  </button>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Heart className="w-7 h-7 text-red-500 fill-red-500" />
                      المنتجات المفضلة
                      <span className="text-sm font-normal text-gray-500 dark:text-gray-400 mr-2">({favorites.length})</span>
                  </h1>
              </div>

              {favorites.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 text-center transition-colors">
                      <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
                          <Heart className="w-10 h-10 text-red-300 dark:text-red-500" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">قائمة المفضلة فارغة</h2>
                      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">لم تقم بإضافة أي منتجات إلى المفضلة بعد. تصفح المتجر واضغط على رمز القلب لحفظ المنتجات التي تعجبك.</p>
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
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  {searchTerm ? (
                      <>
                        <span>نتائج البحث عن "{searchTerm}"</span>
                        <button 
                            onClick={() => setSearchTerm('')} 
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 p-1 rounded-full transition-colors"
                            title="إلغاء البحث"
                        >
                            <XCircle className="w-5 h-5" />
                        </button>
                      </>
                  ) : 'أحدث المنتجات'}
                </h2>
                
                <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 animate-fade-in transition-colors">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 pl-4 border-l border-gray-100 dark:border-gray-700">
                        <Filter className="w-4 h-4 text-primary" />
                        <span className="text-sm font-bold">تصفية حسب السعر (SAR)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">من</span>
                        <input
                            type="number"
                            min="0"
                            value={priceRange.min}
                            onChange={(e) => setPriceRange(prev => ({...prev, min: Number(e.target.value) || 0}))}
                            className="w-20 sm:w-24 px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 text-gray-900 dark:text-white transition-colors"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">إلى</span>
                         <input
                            type="number"
                            min="0"
                            value={priceRange.max}
                            onChange={(e) => setPriceRange(prev => ({...prev, max: Number(e.target.value) || 0}))}
                            className="w-20 sm:w-24 px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 text-gray-900 dark:text-white transition-colors"
                        />
                        <span className="text-sm text-gray-500 dark:text-gray-400 pr-1">ر.س</span>
                    </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">{filteredProducts.length} منتج</span>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
                  <p className="text-gray-500 dark:text-gray-400 text-lg">لم يتم العثور على منتجات تطابق بحثك.</p>
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

      <Footer onNavigate={setCurrentView} />

      {/* Spacer for bottom navigation on mobile */}
      <div className="h-20 md:hidden"></div>

      <BottomNav 
        currentView={currentView}
        onNavigate={setCurrentView}
        onCartClick={() => setIsCartOpen(true)}
        onProfileClick={handleProfileClick}
        cartCount={cartCount}
        favoritesCount={favorites.length}
      />

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
            savedAddresses={currentUser?.addresses || []}
            coupons={coupons}
        />
      )}
    </div>
  );
}

export default App;
