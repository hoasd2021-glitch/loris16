
import React, { useState } from 'react';
import { User, UserOrder, Currency, Address, ViewState } from '../types';
import { 
  Package, Clock, CheckCircle, Truck, XCircle, LogOut, 
  MapPin, Plus, Trash2, Wallet, CreditCard, Award, ArrowRight, Home, Briefcase
} from 'lucide-react';

interface UserProfileProps {
  user: User;
  orders: UserOrder[];
  currency: Currency;
  exchangeRate: number;
  onLogout: () => void;
  onAddAddress?: (address: Omit<Address, 'id'>) => void;
  onDeleteAddress?: (id: string) => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onNavigate: (view: ViewState) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ 
  user, 
  orders, 
  currency, 
  exchangeRate, 
  onLogout,
  onAddAddress,
  onDeleteAddress,
  onShowToast,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'wallet'>('orders');
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    type: 'المنزل',
    recipientName: user.name,
    phone: '',
    city: '',
    street: '',
    isDefault: false
  });

  const formatPrice = (price: number) => {
    if (currency === 'SAR') return `${price.toFixed(2)} ر.س`;
    if (currency === 'USD') return `${(price / exchangeRate).toFixed(2)} $`;
    if (currency === 'YER') return `${Math.round(price * 145)} ر.ي`;
    return `${price} ر.س`;
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending': return { color: 'bg-amber-100 text-amber-700', icon: Clock, label: 'قيد الانتظار' };
      case 'processing': return { color: 'bg-blue-100 text-blue-700', icon: Package, label: 'قيد التجهيز' };
      case 'shipped': return { color: 'bg-indigo-100 text-indigo-700', icon: Truck, label: 'تم الشحن' };
      case 'delivered': return { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'تم التوصيل' };
      default: return { color: 'bg-gray-100 text-gray-700', icon: XCircle, label: status };
    }
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddAddress) {
      onAddAddress(newAddress);
      setIsAddingAddress(false);
      setNewAddress({
        type: 'المنزل',
        recipientName: user.name,
        phone: '',
        city: '',
        street: '',
        isDefault: false
      });
      onShowToast('تم إضافة العنوان بنجاح', 'success');
    }
  };

  const handleDelete = (id: string) => {
      if (onDeleteAddress) {
          onDeleteAddress(id);
          onShowToast('تم حذف العنوان', 'info');
      }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 text-center">
            <div className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4 shadow-lg border-4 border-white relative">
              {user.name.charAt(0).toUpperCase()}
              <div className="absolute bottom-0 right-0 bg-green-500 border-2 border-white w-6 h-6 rounded-full"></div>
            </div>
            <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-gray-500 text-sm mb-6">{user.email}</p>
            
            <div className="space-y-2 mb-6">
                <button 
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === 'orders' ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    <Package className="w-5 h-5" />
                    طلباتي
                </button>
                <button 
                  onClick={() => setActiveTab('addresses')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === 'addresses' ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    <MapPin className="w-5 h-5" />
                    العناوين المحفوظة
                </button>
                <button 
                  onClick={() => setActiveTab('wallet')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === 'wallet' ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    <Wallet className="w-5 h-5" />
                    المحفظة والنقاط
                </button>
            </div>
            
            <button 
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3 rounded-xl font-bold hover:bg-red-100 transition-colors"
            >
                <LogOut className="w-5 h-5" />
                تسجيل الخروج
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          
          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-6 h-6 text-primary" />
                طلباتي السابقة
              </h2>

              {orders.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
                    <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">لا توجد طلبات حتى الآن</h3>
                    <p className="text-gray-500 mb-6">ابدأ التسوق الآن واستمتع بأفضل العروض!</p>
                    <button 
                        onClick={() => onNavigate(ViewState.HOME)}
                        className="bg-primary hover:bg-secondary text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95"
                    >
                        تصفح المنتجات
                    </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const statusConfig = getStatusConfig(order.status);
                    const StatusIcon = statusConfig.icon;
                    return (
                      <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                        <div className="bg-gray-50 px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100">
                          <div className="flex items-center gap-4">
                            <span className="font-mono font-bold text-gray-500">#{order.id.slice(-6)}</span>
                            <div className="flex items-center gap-1 text-xs text-gray-500 bg-white px-2 py-1 rounded-md border border-gray-200">
                                <Clock className="w-3 h-3" />
                                <span className="dir-ltr">{new Date(order.date).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusConfig.color}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusConfig.label}
                          </div>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-4 overflow-x-auto pb-2">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="relative group flex-shrink-0">
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                            <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <span className="absolute -top-2 -right-2 bg-gray-900 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border border-white">
                                            {item.quantity}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                <span className="text-gray-500 text-sm">الإجمالي</span>
                                <span className="text-xl font-bold text-primary dir-ltr">{formatPrice(order.total)}</span>
                            </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ADDRESS BOOK TAB */}
          {activeTab === 'addresses' && (
             <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <MapPin className="w-6 h-6 text-primary" />
                        دفتر العناوين
                    </h2>
                    <button 
                        onClick={() => setIsAddingAddress(!isAddingAddress)}
                        className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
                    >
                        {isAddingAddress ? <XCircle className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        {isAddingAddress ? 'إلغاء' : 'إضافة عنوان'}
                    </button>
                </div>

                {isAddingAddress && (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-fade-in-up">
                        <h3 className="font-bold text-gray-900 mb-4">عنوان جديد</h3>
                        <form onSubmit={handleAddressSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">نوع العنوان</label>
                                    <select 
                                        value={newAddress.type}
                                        onChange={(e) => setNewAddress({...newAddress, type: e.target.value})}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-white text-sm"
                                    >
                                        <option value="المنزل">المنزل</option>
                                        <option value="العمل">العمل</option>
                                        <option value="آخر">آخر</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">اسم المستلم</label>
                                    <input 
                                        type="text" required
                                        value={newAddress.recipientName}
                                        onChange={(e) => setNewAddress({...newAddress, recipientName: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">المدينة</label>
                                    <input 
                                        type="text" required
                                        value={newAddress.city}
                                        onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">رقم الجوال</label>
                                    <input 
                                        type="tel" required
                                        value={newAddress.phone}
                                        onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 mb-1">العنوان بالتفصيل (الحي، الشارع)</label>
                                    <input 
                                        type="text" required
                                        value={newAddress.street}
                                        onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                                    />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-gray-900 text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors">حفظ العنوان</button>
                        </form>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.addresses && user.addresses.length > 0 ? (
                        user.addresses.map((address) => (
                            <div key={address.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative group hover:border-primary/30 transition-all">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-blue-50 text-primary rounded-lg">
                                            {address.type === 'العمل' ? <Briefcase className="w-4 h-4" /> : <Home className="w-4 h-4" />}
                                        </div>
                                        <span className="font-bold text-gray-900">{address.type}</span>
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(address.id)}
                                        className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-1 text-sm text-gray-600">
                                    <p className="font-bold text-gray-800">{address.recipientName}</p>
                                    <p>{address.phone}</p>
                                    <p>{address.city}، {address.street}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-10 text-center text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                            <MapPin className="w-12 h-12 mx-auto mb-2 opacity-20" />
                            <p>لا توجد عناوين محفوظة.</p>
                        </div>
                    )}
                </div>
             </div>
          )}

          {/* WALLET & POINTS TAB */}
          {activeTab === 'wallet' && (
             <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Wallet className="w-6 h-6 text-primary" />
                    المحفظة والنقاط
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Digital Card */}
                    <div className="relative h-56 rounded-3xl overflow-hidden shadow-2xl text-white p-8 flex flex-col justify-between bg-gradient-to-br from-gray-900 via-gray-800 to-black">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
                        
                        <div className="relative z-10 flex justify-between items-start">
                            <div className="flex items-center gap-2">
                                <CreditCard className="w-6 h-6" />
                                <span className="font-bold tracking-wider">FUTURE PAY</span>
                            </div>
                            <span className="text-xl font-black italic opacity-50">PREMIUM</span>
                        </div>

                        <div className="relative z-10">
                            <p className="text-sm text-gray-300 mb-1">الرصيد الحالي</p>
                            <h3 className="text-4xl font-bold dir-ltr">{formatPrice(user.walletBalance || 0)}</h3>
                        </div>

                        <div className="relative z-10 flex justify-between items-end">
                            <div>
                                <p className="text-xs text-gray-400 mb-1">صاحب البطاقة</p>
                                <p className="font-medium tracking-wide uppercase">{user.name}</p>
                            </div>
                            <div className="flex gap-2">
                                <div className="w-8 h-8 rounded-full bg-red-500/80"></div>
                                <div className="w-8 h-8 rounded-full bg-yellow-500/80 -ml-4"></div>
                            </div>
                        </div>
                    </div>

                    {/* Loyalty Points */}
                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-50 rounded-full blur-3xl"></div>
                        <div className="relative z-10 w-16 h-16 bg-yellow-100 text-yellow-600 rounded-2xl flex items-center justify-center mb-4 transform rotate-3">
                            <Award className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">نقاط الولاء</h3>
                        <p className="text-4xl font-black text-yellow-500 mb-2">{user.loyaltyPoints || 0}</p>
                        <p className="text-sm text-gray-500 mb-6">نقطة مكتسبة من مشترياتك</p>
                        
                        <div className="w-full bg-gray-100 rounded-full h-2 mb-2 overflow-hidden">
                            <div className="bg-yellow-500 h-full rounded-full w-[45%]"></div>
                        </div>
                        <p className="text-xs text-gray-400">باقي 500 نقطة للوصول للمستوى التالي</p>
                    </div>
                </div>

                {/* Recent Transactions Mockup */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900">سجل العمليات</h3>
                        <button className="text-primary text-sm font-bold flex items-center gap-1">عرض الكل <ArrowRight className="w-4 h-4 rtl:rotate-180" /></button>
                    </div>
                    <div className="divide-y divide-gray-50">
                        <div className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                                    <Plus className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">شحن رصيد</p>
                                    <p className="text-xs text-gray-400">12 مارس 2024</p>
                                </div>
                            </div>
                            <span className="font-bold text-green-600 dir-ltr">{formatPrice(500)}</span>
                        </div>
                         <div className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                                    <ArrowRight className="w-5 h-5 -rotate-45" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">شراء منتجات (ORD-8823)</p>
                                    <p className="text-xs text-gray-400">10 مارس 2024</p>
                                </div>
                            </div>
                            <span className="font-bold text-gray-900 dir-ltr">- {formatPrice(120.50)}</span>
                        </div>
                    </div>
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
