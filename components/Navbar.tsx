
import React, { useState } from 'react';
import { ShoppingCart, Search, Menu, Zap, Heart, Banknote, User as UserIcon, LogOut, X, Home, Moon, Sun, ChevronDown } from 'lucide-react';
import { APP_NAME } from '../constants';
import { ViewState, Currency, User } from '../types';

interface NavbarProps {
  cartCount: number;
  favoritesCount: number;
  onCartClick: () => void;
  onFavoritesClick: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  currency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  currentUser: User | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  cartCount, 
  favoritesCount,
  onCartClick, 
  onFavoritesClick,
  searchTerm, 
  onSearchChange,
  currentView,
  onNavigate,
  currency,
  onCurrencyChange,
  currentUser,
  onLoginClick,
  onLogoutClick,
  isDarkMode,
  onToggleTheme
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileNavigate = (view: ViewState) => {
    onNavigate(view);
    setIsMobileMenuOpen(false);
  };

  const currencies: { code: Currency; label: string; symbol: string }[] = [
      { code: 'SAR', label: 'ريال سعودي', symbol: 'ر.س' },
      { code: 'USD', label: 'دولار أمريكي', symbol: '$' },
      { code: 'YER', label: 'ريال يمني', symbol: 'ر.ي' },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex-shrink-0 flex items-center gap-2 cursor-pointer"
            onClick={() => onNavigate(ViewState.HOME)}
          >
            <div className="bg-primary p-1.5 rounded-lg">
                <Zap className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight hidden sm:block">{APP_NAME}</span>
          </div>

          {/* Search Bar - Only show in Home view or Favorites */}
          <div className={`flex-1 max-w-lg mx-4 transition-opacity duration-200 ${currentView === ViewState.ADMIN ? 'opacity-0 pointer-events-none hidden md:block' : 'opacity-100 hidden md:block'}`}>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="text"
                className="block w-full pr-10 pl-3 py-2 border border-gray-300 dark:border-gray-700 rounded-full leading-5 bg-gray-50 dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm text-gray-900 dark:text-white transition-all duration-150 ease-in-out"
                placeholder="ابحث عن منتج..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                disabled={currentView === ViewState.ADMIN}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
             
             {/* Currency Dropdown */}
             <div className="relative group z-50">
                <button
                  className="flex items-center gap-1 px-2 py-2 rounded-full text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title="تغيير العملة"
                >
                  <Banknote className="w-5 h-5" />
                  <span className="mx-1">{currency}</span>
                  <ChevronDown className="w-3 h-3 opacity-70" />
                </button>
                <div className="absolute top-full left-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 hidden group-hover:block p-1 animate-fade-in">
                    {currencies.map((c) => (
                        <button
                            key={c.code}
                            onClick={() => onCurrencyChange(c.code)}
                            className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                                currency === c.code 
                                ? 'bg-primary/10 text-primary dark:bg-primary/20' 
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                        >
                            <span>{c.label}</span>
                            <span className="text-xs font-mono opacity-70">{c.code}</span>
                        </button>
                    ))}
                </div>
             </div>

             {/* Theme Toggle */}
             <button
                onClick={onToggleTheme}
                className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none"
                title={isDarkMode ? 'وضع النهار' : 'وضع الليل'}
             >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
             </button>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2 hidden sm:block"></div>

            {/* Favorites Button */}
            <button
              onClick={onFavoritesClick}
              className={`relative p-2 rounded-full transition-colors focus:outline-none ${
                currentView === ViewState.FAVORITES 
                ? 'text-red-500 bg-red-50 dark:bg-red-900/20' 
                : 'text-gray-600 dark:text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-gray-800'
              }`}
              aria-label="المفضلة"
            >
              <Heart className={`h-6 w-6 ${currentView === ViewState.FAVORITES ? 'fill-current' : ''}`} />
              {favoritesCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full min-w-[18px]">
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={onCartClick}
              className="relative p-2 rounded-full text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors focus:outline-none"
              aria-label="عربة التسوق"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-primary rounded-full">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Login/Profile */}
            {currentUser ? (
              <div className="relative group hidden sm:block">
                <button 
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title={currentUser.name}
                >
                   <div className="w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {currentUser.name.charAt(0).toUpperCase()}
                   </div>
                   <span className="text-xs font-bold text-gray-700 dark:text-gray-300 max-w-[80px] truncate hidden sm:block">{currentUser.name}</span>
                </button>
                {/* Dropdown for Logout */}
                <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 hidden group-hover:block animate-fade-in p-1">
                   <div className="p-3 border-b border-gray-50 dark:border-gray-700 mb-1">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{currentUser.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{currentUser.email}</p>
                   </div>
                   <button
                      onClick={() => onNavigate(ViewState.PROFILE)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                   >
                      <UserIcon className="w-4 h-4" />
                      ملفي الشخصي
                   </button>
                   <button 
                      onClick={onLogoutClick}
                      className="w-full flex items-center gap-2 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                   >
                      <LogOut className="w-4 h-4" />
                      تسجيل الخروج
                   </button>
                </div>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-primary dark:hover:bg-gray-200 transition-colors text-sm font-bold shadow-sm hidden sm:flex"
              >
                <UserIcon className="h-4 w-4" />
                <span className="hidden sm:inline">دخول</span>
              </button>
            )}
            
            <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="sm:hidden p-2 rounded-md text-gray-400 dark:text-gray-300 hover:text-gray-500 focus:outline-none"
            >
                <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden sm:hidden">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="absolute inset-y-0 right-0 max-w-xs w-full bg-white dark:bg-gray-900 shadow-xl flex flex-col transform transition-transform duration-300 animate-slide-in-left">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">القائمة</span>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-4 flex-1 overflow-y-auto space-y-2">
                    <button onClick={() => handleMobileNavigate(ViewState.HOME)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-200 font-medium">
                        <Home className="w-5 h-5 text-gray-400" />
                        الرئيسية
                    </button>
                    {currentUser && (
                        <button onClick={() => handleMobileNavigate(ViewState.PROFILE)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-200 font-medium">
                            <UserIcon className="w-5 h-5 text-gray-400" />
                            ملفي الشخصي
                        </button>
                    )}
                    <button onClick={() => handleMobileNavigate(ViewState.FAVORITES)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-200 font-medium">
                        <Heart className="w-5 h-5 text-gray-400" />
                        المفضلة
                    </button>
                    
                    <div className="border-t border-gray-100 dark:border-gray-800 my-2 pt-2 space-y-2">
                        <div className="p-2">
                            <p className="text-xs font-bold text-gray-400 mb-2 px-1">العملة</p>
                            <div className="grid grid-cols-3 gap-2">
                                {currencies.map((c) => (
                                    <button
                                        key={c.code}
                                        onClick={() => {
                                            onCurrencyChange(c.code);
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className={`px-2 py-2 rounded-lg text-sm font-bold text-center border transition-all ${
                                            currency === c.code 
                                            ? 'bg-primary text-white border-primary' 
                                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                                        }`}
                                    >
                                        {c.code}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button onClick={onToggleTheme} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-200 font-medium">
                            {isDarkMode ? <Sun className="w-5 h-5 text-gray-400" /> : <Moon className="w-5 h-5 text-gray-400" />}
                            الوضع: {isDarkMode ? 'النهاري' : 'الليلي'}
                        </button>
                    </div>
                </div>
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
                    {currentUser ? (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                                    {currentUser.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">{currentUser.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">{currentUser.email}</p>
                                </div>
                            </div>
                            <button onClick={onLogoutClick} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={() => {
                                onLoginClick();
                                setIsMobileMenuOpen(false);
                            }}
                            className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3 rounded-xl font-bold"
                        >
                            تسجيل الدخول
                        </button>
                    )}
                </div>
            </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
