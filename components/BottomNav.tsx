
import React from 'react';
import { Store, Heart, ShoppingCart, User } from 'lucide-react';
import { ViewState } from '../types';

interface BottomNavProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  onCartClick: () => void;
  onProfileClick: () => void;
  cartCount: number;
  favoritesCount: number;
}

const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  onNavigate,
  onCartClick,
  onProfileClick,
  cartCount,
  favoritesCount
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-2 z-40 safe-area-bottom shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="flex justify-between items-end">
        <button
          onClick={() => onNavigate(ViewState.HOME)}
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${
            currentView === ViewState.HOME ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Store className={`w-6 h-6 ${currentView === ViewState.HOME ? 'fill-current' : ''}`} />
          <span className="text-[10px] font-bold">الرئيسية</span>
        </button>

        <button
          onClick={() => onNavigate(ViewState.FAVORITES)}
          className={`flex flex-col items-center gap-1 p-2 transition-colors relative ${
            currentView === ViewState.FAVORITES ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Heart className={`w-6 h-6 ${currentView === ViewState.FAVORITES ? 'fill-current' : ''}`} />
          <span className="text-[10px] font-bold">المفضلة</span>
          {favoritesCount > 0 && (
            <span className="absolute top-1 left-2 min-w-[16px] h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white px-0.5">
              {favoritesCount}
            </span>
          )}
        </button>

        <button
          onClick={onCartClick}
          className="flex flex-col items-center gap-1 p-2 -mt-8 group"
        >
          <div className="w-14 h-14 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-lg group-active:scale-95 transition-all relative border-4 border-gray-50">
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold flex items-center justify-center rounded-full border-2 border-white">
                {cartCount}
                </span>
            )}
          </div>
          <span className="text-[10px] font-bold text-gray-500">السلة</span>
        </button>

        <button
          onClick={onProfileClick}
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${
            currentView === ViewState.PROFILE ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <User className={`w-6 h-6 ${currentView === ViewState.PROFILE ? 'fill-current' : ''}`} />
          <span className="text-[10px] font-bold">حسابي</span>
        </button>
      </div>
    </div>
  );
};

export default BottomNav;
