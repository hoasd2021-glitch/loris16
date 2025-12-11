
import React, { useState } from 'react';
import { Product, User, UserOrder, Coupon, ExchangeRates } from '../types';
import { 
  Plus, Edit2, Trash2, X, Search, Image as ImageIcon, LayoutGrid, 
  Package, ArrowUpDown, ArrowUp, ArrowDown, AlertTriangle, 
  SlidersHorizontal, RefreshCcw, Tags, Layers, Palette, Ruler, Briefcase, ArrowRight,
  BarChart3, Download, Bell, TrendingUp, DollarSign, Activity,
  Users, ShoppingBag, Clock, MapPin, CreditCard, CheckCircle, Truck, XCircle, Mail, Phone, LayoutDashboard, LogOut,
  MessageSquare, Star, Ticket, Settings, Save, Power, Globe, Facebook, Twitter, Instagram, ShieldCheck, UserPlus, Store, Printer, Eye, Upload, FileSpreadsheet, Banknote, Info,
  FileText
} from 'lucide-react';

interface AdminPageProps {
  products: Product[];
  categories: string[];
  brands: string[];
  orders: UserOrder[];
  users: User[];
  coupons: Coupon[];
  exchangeRates: ExchangeRates;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: number) => void;
  onAddCategory: (category: string) => void;
  onUpdateCategory: (oldCategory: string, newCategory: string) => void;
  onDeleteCategory: (category: string) => void;
  onAddBrand: (brand: string) => void;
  onUpdateBrand: (oldBrand: string, newBrand: string) => void;
  onDeleteBrand: (brand: string) => void;
  onUpdateOrderStatus: (orderId: string, newStatus: UserOrder['status']) => void;
  onDeleteOrder: (orderId: string) => void;
  onDeleteUser: (userId: string) => void;
  onDeleteReview: (productId: number, reviewId: string) => void;
  onAddAdmin: (admin: Omit<User, 'id' | 'joinDate' | 'walletBalance' | 'loyaltyPoints' | 'addresses'>) => void;
  onUpdateAdmin: (admin: User) => void;
  onDeleteAdmin: (id: string) => void;
  onAddCoupon: (coupon: Omit<Coupon, 'id' | 'usageCount'>) => void;
  onUpdateCoupon: (coupon: Coupon) => void;
  onDeleteCoupon: (id: string) => void;
  onUpdateExchangeRates: (rates: ExchangeRates) => void;
  onLogout: () => void;
  onGoHome?: () => void;
  currentUserEmail?: string;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const emptyProduct: Omit<Product, 'id'> = {
  name: '',
  price: 0,
  category: '',
  brand: '',
  description: '',
  detailedDescription: '',
  images: [],
  stock: 0,
  colors: [],
  sizes: []
};

type SortField = 'name' | 'price' | 'category' | 'stock';
type SortDirection = 'asc' | 'desc';
type StockStatus = 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';
type ActiveTab = 'dashboard' | 'reports' | 'products' | 'categories' | 'brands' | 'orders' | 'customers' | 'admins' | 'reviews' | 'coupons' | 'currencies' | 'settings';

const PERMISSIONS = [
  { id: 'manage_products', label: 'إدارة المنتجات' },
  { id: 'manage_orders', label: 'إدارة الطلبات' },
  { id: 'manage_users', label: 'إدارة العملاء' },
  { id: 'manage_admins', label: 'إدارة المشرفين' },
  { id: 'manage_reviews', label: 'إدارة التقييمات' },
  { id: 'manage_settings', label: 'إعدادات المتجر' },
];

const SortIcon: React.FC<{ field: SortField; currentSortField: SortField | null; sortDirection: SortDirection }> = ({
  field,
  currentSortField,
  sortDirection
}) => {
  if (field !== currentSortField) return <ArrowUpDown className="w-4 h-4 text-gray-400 opacity-50 group-hover:opacity-100" />;
  if (sortDirection === 'asc') return <ArrowUp className="w-4 h-4 text-primary" />;
  return <ArrowDown className="w-4 h-4 text-primary" />;
};

const StockBadge: React.FC<{ stock: number; threshold?: number }> = ({ stock, threshold = 5 }) => {
  if (stock === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
        نفذت الكمية
      </span>
    );
  }
  if (stock <= threshold) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
        منخفض ({stock})
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
      متوفر ({stock})
    </span>
  );
};

const OrderStatusBadge: React.FC<{ status: UserOrder['status'] }> = ({ status }) => {
  const config = {
    pending: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock, label: 'قيد الانتظار' },
    processing: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Package, label: 'قيد التجهيز' },
    shipped: { color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400', icon: Truck, label: 'تم الشحن' },
    delivered: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle, label: 'تم التوصيل' },
    cancelled: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle, label: 'ملغي' },
  }[status];

  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${config.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
};

const AdminPage: React.FC<AdminPageProps> = ({ 
  products, 
  categories, 
  brands,
  orders,
  users,
  coupons,
  exchangeRates,
  onAddProduct, 
  onUpdateProduct, 
  onDeleteProduct,
  onAddCategory, 
  onUpdateCategory, 
  onDeleteCategory,
  onAddBrand,
  onUpdateBrand,
  onDeleteBrand,
  onUpdateOrderStatus,
  onDeleteOrder,
  onDeleteUser,
  onDeleteReview,
  onAddAdmin,
  onUpdateAdmin,
  onDeleteAdmin,
  onAddCoupon,
  onUpdateCoupon,
  onDeleteCoupon,
  onUpdateExchangeRates,
  onLogout,
  onGoHome,
  currentUserEmail,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  
  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productFormData, setProductFormData] = useState<Omit<Product, 'id'>>(emptyProduct);
  const [newImageUrl, setNewImageUrl] = useState('');
  
  // Confirmation state
  const [pendingProductChanges, setPendingProductChanges] = useState<{
    original: Product;
    newData: Omit<Product, 'id'>;
    changes: string[];
  } | null>(null);
  
  // Helper state for array inputs
  const [colorsInput, setColorsInput] = useState('');
  const [sizesInput, setSizesInput] = useState('');
  
  // Category/Brand Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [categoryFormData, setCategoryFormData] = useState('');

  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<string | null>(null);
  const [brandFormData, setBrandFormData] = useState('');
  
  // Admin Modal State
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<User | null>(null);
  const [adminFormData, setAdminFormData] = useState({ name: '', email: '', permissions: [] as string[] });

  // Search & Filter State
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [searchId, setSearchId] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [stockStatus, setStockStatus] = useState<StockStatus>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const lowStockThreshold = 5;
  
  // Delete Confirmation State
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<number | null>(null);
  const [deleteCategoryConfirmation, setDeleteCategoryConfirmation] = useState<string | null>(null);
  const [deleteBrandConfirmation, setDeleteBrandConfirmation] = useState<string | null>(null);
  const [deleteAdminConfirmation, setDeleteAdminConfirmation] = useState<string | null>(null);
  const [deleteOrderConfirmation, setDeleteOrderConfirmation] = useState<string | null>(null);
  const [deleteUserConfirmation, setDeleteUserConfirmation] = useState<string | null>(null);
  
  // Sorting State
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Coupons State
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [couponFormData, setCouponFormData] = useState({ code: '', discount: 0, expiryDate: '' });

  // Exchange Rates State
  const [tempRates, setTempRates] = useState<ExchangeRates>(exchangeRates);

  // Store Settings State
  const [storeSettings, setStoreSettings] = useState({
      storeName: 'متجر الحسام',
      email: 'hossams@gmail.com',
      phone: '+967 774889095',
      currency: 'SAR',
      taxRate: 15,
      shippingFee: 25,
      description: 'وجهتك الأولى للتسوق الإلكتروني.',
      maintenanceMode: false,
      primaryColor: '#2563eb',
      secondaryColor: '#1e40af',
      facebook: '',
      twitter: '',
      instagram: '',
      logo: '',
      // Feature Toggles
      enableOrdering: true,
      enableRegistration: true,
      enableReviews: true,
      enableCoupons: true,
      enableChat: true,
      enableLoyalty: true
  });

  // --- Helper Functions ---

  const simulateLoading = async (action: () => void) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 600)); 
    action();
    setIsLoading(false);
  };

  const handleExportCSV = () => {
      const headers = ['ID', 'اسم المنتج', 'السعر', 'المخزون', 'التصنيف', 'العلامة التجارية'];
      const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
        + headers.join(",") + "\n"
        + products.map(p => `${p.id},"${p.name}",${p.price},${p.stock},"${p.category}","${p.brand || ''}"`).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "products_export.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handlePrintReport = () => {
      window.print();
  };

  const getCustomerStats = (userId: string) => {
    const userOrders = orders.filter(o => o.userId === userId);
    return {
      orderCount: userOrders.length,
      totalSpent: userOrders.reduce((acc, order) => acc + order.total, 0)
    };
  };

  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
  
  const getCategoryProductCount = (cat: string) => products.filter(p => p.category === cat).length;
  const getBrandProductCount = (brand: string) => products.filter(p => p.brand === brand).length;

  // --- Filtering Logic ---
  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesId = searchId ? p.id.toString().includes(searchId) : true;
    const matchesMinPrice = minPrice ? p.price >= Number(minPrice) : true;
    const matchesMaxPrice = maxPrice ? p.price <= Number(maxPrice) : true;
    let matchesStock = true;
    if (stockStatus === 'in_stock') matchesStock = p.stock > lowStockThreshold;
    if (stockStatus === 'low_stock') matchesStock = p.stock > 0 && p.stock <= lowStockThreshold;
    if (stockStatus === 'out_of_stock') matchesStock = p.stock === 0;
    const matchesCategory = selectedCategory === 'all' ? true : p.category === selectedCategory;
    return matchesSearch && matchesId && matchesMinPrice && matchesMaxPrice && matchesStock && matchesCategory;
  });

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
    users.find(u => u.id === o.userId)?.name.toLowerCase().includes(orderSearchTerm.toLowerCase())
  );

  const adminUsers = users.filter(u => u.role === 'admin');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!sortField) return 0;
    const aValue = a[sortField];
    const bValue = b[sortField];
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' ? aValue.localeCompare(bValue, 'ar') : bValue.localeCompare(aValue, 'ar');
    }
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    return 0;
  });

  // --- CRUD Handlers ---
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductFormData({...emptyProduct, images: [`https://picsum.photos/400/400?random=${Math.floor(Math.random() * 1000)}`]});
    setNewImageUrl(''); setColorsInput(''); setSizesInput(''); 
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductFormData({
      name: product.name, price: product.price, category: product.category, brand: product.brand || '',
      description: product.description, detailedDescription: product.detailedDescription || '',
      images: [...product.images], stock: product.stock, colors: product.colors || [], sizes: product.sizes || []
    });
    setNewImageUrl(''); setColorsInput(product.colors?.join(', ') || ''); setSizesInput(product.sizes?.join(', ') || '');
    setIsProductModalOpen(true);
  };

  const handleAddImage = () => { if (!newImageUrl.trim()) return; setProductFormData(prev => ({ ...prev, images: [...prev.images, newImageUrl.trim()] })); setNewImageUrl(''); };
  const handleAddRandomImage = () => { const randomUrl = `https://picsum.photos/400/400?random=${Math.floor(Math.random() * 1000)}`; setProductFormData(prev => ({ ...prev, images: [...prev.images, randomUrl] })); };
  
  // Image Upload Handler (FileReader)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = () => {
          const base64String = reader.result as string;
          setProductFormData(prev => ({
              ...prev,
              images: [...prev.images, base64String]
          }));
      };
      reader.readAsDataURL(file);
      // Reset input so same file can be selected again
      e.target.value = '';
  };

  const handleRemoveImage = (index: number) => { setProductFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) })); };
  const handleMoveImage = (index: number, direction: 'up' | 'down') => {
      setProductFormData(prev => {
          const newImages = [...prev.images];
          if (direction === 'up' && index > 0) [newImages[index], newImages[index - 1]] = [newImages[index - 1], newImages[index]];
          else if (direction === 'down' && index < newImages.length - 1) [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
          return { ...prev, images: newImages };
      });
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const colors = colorsInput.split(',').map(s => s.trim()).filter(s => s !== '');
    const sizes = sizesInput.split(',').map(s => s.trim()).filter(s => s !== '');
    const finalProductData = { ...productFormData, colors, sizes };
    
    if (finalProductData.category && !categories.includes(finalProductData.category)) {
        onAddCategory(finalProductData.category);
    }
    if (finalProductData.brand && !brands.includes(finalProductData.brand)) {
        onAddBrand(finalProductData.brand);
    }

    if (editingProduct) {
      const changes: string[] = [];
      if (editingProduct.stock !== finalProductData.stock) changes.push('stock');
      if (editingProduct.category !== finalProductData.category) changes.push('category');
      if (editingProduct.brand !== finalProductData.brand) changes.push('brand');

      if (changes.length > 0) {
        setPendingProductChanges({ original: editingProduct, newData: finalProductData, changes });
        return;
      }
      simulateLoading(() => { 
          onUpdateProduct({ ...finalProductData, id: editingProduct.id }); 
          setIsProductModalOpen(false); 
          onShowToast('تم تحديث المنتج بنجاح', 'success');
      });
    } else {
      simulateLoading(() => { 
          onAddProduct(finalProductData); 
          setIsProductModalOpen(false); 
          onShowToast('تم إضافة المنتج بنجاح', 'success');
      });
    }
  };

  const confirmProductChanges = () => { if (pendingProductChanges) { simulateLoading(() => { onUpdateProduct({ ...pendingProductChanges.newData, id: pendingProductChanges.original.id }); setPendingProductChanges(null); setIsProductModalOpen(false); onShowToast('تم تحديث المنتج بنجاح', 'success'); }); } };
  const handleConfirmDeleteProduct = () => { if (deleteConfirmationId !== null) simulateLoading(() => { onDeleteProduct(deleteConfirmationId); setDeleteConfirmationId(null); onShowToast('تم حذف المنتج', 'info'); }); };
  
  const handleOpenAddCategory = () => { setEditingCategory(null); setCategoryFormData(''); setIsCategoryModalOpen(true); };
  const handleOpenEditCategory = (cat: string) => { setEditingCategory(cat); setCategoryFormData(cat); setIsCategoryModalOpen(true); };
  const handleCategorySubmit = (e: React.FormEvent) => { e.preventDefault(); simulateLoading(() => { if (editingCategory) {onUpdateCategory(editingCategory, categoryFormData); onShowToast('تم تحديث التصنيف', 'success');} else {onAddCategory(categoryFormData); onShowToast('تم إضافة التصنيف', 'success');} setIsCategoryModalOpen(false); }); };
  const handleConfirmDeleteCategory = () => { if (deleteCategoryConfirmation !== null) simulateLoading(() => { onDeleteCategory(deleteCategoryConfirmation); setDeleteCategoryConfirmation(null); onShowToast('تم حذف التصنيف', 'info'); }); };

  const handleOpenAddBrand = () => { setEditingBrand(null); setBrandFormData(''); setIsBrandModalOpen(true); };
  const handleOpenEditBrand = (brand: string) => { setEditingBrand(brand); setBrandFormData(brand); setIsBrandModalOpen(true); };
  const handleBrandSubmit = (e: React.FormEvent) => { e.preventDefault(); simulateLoading(() => { if (editingBrand) {onUpdateBrand(editingBrand, brandFormData); onShowToast('تم تحديث العلامة التجارية', 'success');} else {onAddBrand(brandFormData); onShowToast('تم إضافة العلامة التجارية', 'success');} setIsBrandModalOpen(false); }); };
  const handleConfirmDeleteBrand = () => { if (deleteBrandConfirmation !== null) simulateLoading(() => { onDeleteBrand(deleteBrandConfirmation); setDeleteBrandConfirmation(null); onShowToast('تم حذف العلامة التجارية', 'info'); }); };

  const handleOpenAddAdmin = () => { 
      setEditingAdmin(null); 
      setAdminFormData({ name: '', email: '', permissions: [] }); 
      setIsAdminModalOpen(true); 
  };
  const handleOpenEditAdmin = (admin: User) => { 
      setEditingAdmin(admin); 
      setAdminFormData({ name: admin.name, email: admin.email, permissions: admin.permissions || [] }); 
      setIsAdminModalOpen(true); 
  };
  
  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    simulateLoading(() => {
        if (editingAdmin) {
            onUpdateAdmin({ ...editingAdmin, name: adminFormData.name, email: adminFormData.email, permissions: adminFormData.permissions });
            onShowToast('تم تحديث بيانات المشرف', 'success');
        } else {
            onAddAdmin({ name: adminFormData.name, email: adminFormData.email, role: 'admin', permissions: adminFormData.permissions });
            onShowToast('تم إضافة مشرف جديد', 'success');
        }
        setIsAdminModalOpen(false);
    });
  };

  const togglePermission = (permissionId: string) => {
      setAdminFormData(prev => {
          const newPermissions = prev.permissions?.includes(permissionId)
              ? prev.permissions.filter(p => p !== permissionId)
              : [...(prev.permissions || []), permissionId];
          return { ...prev, permissions: newPermissions };
      });
  };

  const selectAllPermissions = () => {
      if (adminFormData.permissions?.length === PERMISSIONS.length) {
          setAdminFormData(prev => ({ ...prev, permissions: [] }));
      } else {
          setAdminFormData(prev => ({ ...prev, permissions: PERMISSIONS.map(p => p.id) }));
      }
  };

  const handleConfirmDeleteAdmin = () => {
      if (deleteAdminConfirmation) {
          simulateLoading(() => {
            onDeleteAdmin(deleteAdminConfirmation);
            setDeleteAdminConfirmation(null);
            onShowToast('تم حذف المشرف', 'info');
          });
      }
  };

  const handleConfirmDeleteOrder = () => {
      if (deleteOrderConfirmation) {
          simulateLoading(() => {
            onDeleteOrder(deleteOrderConfirmation);
            setDeleteOrderConfirmation(null);
          });
      }
  };

  const handleConfirmDeleteUser = () => {
      if (deleteUserConfirmation) {
          simulateLoading(() => {
              onDeleteUser(deleteUserConfirmation);
              setDeleteUserConfirmation(null);
          });
      }
  };

  const handleOpenAddCoupon = () => {
      setEditingCoupon(null);
      setCouponFormData({ code: '', discount: 0, expiryDate: '' });
      setIsCouponModalOpen(true);
  };

  const handleOpenEditCoupon = (coupon: Coupon) => {
      setEditingCoupon(coupon);
      setCouponFormData({ 
          code: coupon.code, 
          discount: coupon.discount, 
          expiryDate: coupon.expiryDate 
      });
      setIsCouponModalOpen(true);
  };

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    simulateLoading(() => {
        if (editingCoupon) {
            onUpdateCoupon({
                ...editingCoupon,
                code: couponFormData.code.toUpperCase(),
                discount: couponFormData.discount,
                expiryDate: couponFormData.expiryDate
            });
            onShowToast('تم تحديث الكوبون بنجاح', 'success');
        } else {
            onAddCoupon({
                code: couponFormData.code.toUpperCase(),
                discount: couponFormData.discount,
                expiryDate: couponFormData.expiryDate,
                isActive: true
            });
            onShowToast('تم إضافة الكوبون بنجاح', 'success');
        }
        setIsCouponModalOpen(false);
        setCouponFormData({ code: '', discount: 0, expiryDate: '' });
    });
  };

  const toggleCouponStatus = (id: string) => {
      const coupon = coupons.find(c => c.id === id);
      if (coupon) {
          onUpdateCoupon({ ...coupon, isActive: !coupon.isActive });
          onShowToast('تم تغيير حالة الكوبون', 'info');
      }
  };

  const deleteCoupon = (id: string) => {
      onDeleteCoupon(id);
      onShowToast('تم حذف الكوبون', 'info');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    simulateLoading(() => {
        onShowToast('تم حفظ إعدادات المتجر بنجاح', 'success');
    });
  };

  const handleSaveExchangeRates = (e: React.FormEvent) => {
      e.preventDefault();
      simulateLoading(() => {
          onUpdateExchangeRates(tempRates);
          onShowToast('تم تحديث أسعار الصرف بنجاح', 'success');
      });
  };

  const renderAttributePreview = (input: string, isColor: boolean) => {
    const items = input.split(',').map(i => i.trim()).filter(i => i);
    if (items.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-1 mt-2 animate-fade-in">
        {items.map((item, idx) => (
          <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-white border border-gray-200 text-gray-600 shadow-sm">
            {isColor && (
              <span className="w-2 h-2 rounded-full ml-1 border border-gray-100"
                style={{ backgroundColor: ['white', 'أبيض'].includes(item) ? '#fff' : ['black', 'أسود'].includes(item) ? '#000' : item }}
              />
            )}
            {item}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in relative print:p-0 print:max-w-none">
      
      {/* Loading Bar */}
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 h-1.5 bg-blue-100 z-[100] overflow-hidden print:hidden">
            <div className="h-full bg-primary animate-progress origin-left w-full"></div>
             <style>{`@keyframes progress { 0% { transform: translateX(-100%); } 50% { transform: translateX(0); } 100% { transform: translateX(100%); } } .animate-progress { animation: progress 1.5s infinite linear; }`}</style>
        </div>
      )}

      {/* Header - Hidden on Print */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <LayoutDashboard className="text-primary w-8 h-8" />
            لوحة التحكم
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">نظرة عامة وإدارة المتجر والطلبات</p>
        </div>
        
        <div className="flex items-center gap-3">
             {/* Back to Store Button */}
             {onGoHome && (
                 <button
                    onClick={onGoHome}
                    className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-bold shadow-sm"
                 >
                    <Store className="w-4 h-4" />
                    <span className="hidden sm:inline">المتجر</span>
                 </button>
             )}
             <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-bold shadow-sm"
             >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">تصدير CSV</span>
             </button>
             <button
                onClick={onLogout}
                className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900 text-red-600 dark:text-red-400 px-4 py-2.5 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors text-sm font-bold shadow-sm"
             >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">خروج</span>
             </button>
        </div>
      </div>

      {/* Navigation Tabs - Hidden on Print */}
      <div className="mb-8 border-b border-gray-200 dark:border-gray-700 overflow-x-auto print:hidden">
        <nav className="flex -mb-px gap-6 min-w-max px-2">
          {[
            { id: 'dashboard', label: 'نظرة عامة', icon: LayoutGrid },
            { id: 'reports', label: 'التقارير', icon: FileText },
            { id: 'orders', label: 'الطلبات', icon: ShoppingBag },
            { id: 'customers', label: 'العملاء', icon: Users },
            { id: 'admins', label: 'المشرفين', icon: ShieldCheck },
            { id: 'products', label: 'المنتجات', icon: Package },
            { id: 'categories', label: 'التصنيفات', icon: Tags },
            { id: 'brands', label: 'العلامات التجارية', icon: Briefcase },
            { id: 'reviews', label: 'التقييمات', icon: MessageSquare },
            { id: 'coupons', label: 'القسائم', icon: Ticket },
            { id: 'currencies', label: 'العملات', icon: Banknote },
            { id: 'settings', label: 'الإعدادات', icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              className={`
                whitespace-nowrap pb-4 px-1 border-b-2 font-bold text-sm flex items-center gap-2 transition-all
                ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'}
              `}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in-up">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl"><DollarSign className="w-6 h-6" /></div>
                      <div><p className="text-xs text-gray-500 dark:text-gray-400 font-bold mb-1">إجمالي المبيعات</p><p className="text-xl font-black text-gray-900 dark:text-white dir-ltr">{totalRevenue.toLocaleString()} ر.س</p></div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                      <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl"><ShoppingBag className="w-6 h-6" /></div>
                      <div><p className="text-xs text-gray-500 dark:text-gray-400 font-bold mb-1">عدد الطلبات</p><p className="text-xl font-black text-gray-900 dark:text-white">{orders.length}</p></div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                      <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl"><Users className="w-6 h-6" /></div>
                      <div><p className="text-xs text-gray-500 dark:text-gray-400 font-bold mb-1">العملاء المسجلين</p><p className="text-xl font-black text-gray-900 dark:text-white">{users.filter(u => u.role === 'customer').length}</p></div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                      <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl"><Package className="w-6 h-6" /></div>
                      <div><p className="text-xs text-gray-500 dark:text-gray-400 font-bold mb-1">المنتجات</p><p className="text-xl font-black text-gray-900 dark:text-white">{products.length}</p></div>
                  </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Chart / Stats - Placeholder */}
                  <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-6">
                          <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                              <BarChart3 className="w-5 h-5 text-gray-400" />
                              توزيع المنتجات حسب التصنيف
                          </h3>
                      </div>
                      <div className="space-y-4">
                          {categories.map((cat, idx) => {
                              const count = getCategoryProductCount(cat);
                              const percentage = Math.round((count / products.length) * 100) || 0;
                              return (
                                  <div key={idx}>
                                      <div className="flex justify-between text-sm mb-1">
                                          <span className="font-medium text-gray-700 dark:text-gray-300">{cat}</span>
                                          <span className="text-gray-500 dark:text-gray-400">{count} منتج ({percentage}%)</span>
                                      </div>
                                      <div className="h-2.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                          <div 
                                            className="h-full bg-primary rounded-full transition-all duration-1000"
                                            style={{ width: `${percentage}%` }}
                                          ></div>
                                      </div>
                                  </div>
                              );
                          })}
                      </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-6">
                      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                          <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                              <Activity className="w-5 h-5 text-gray-400" />
                              إجراءات سريعة
                          </h3>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              <button 
                                onClick={() => { setActiveTab('products'); setTimeout(handleOpenAddProduct, 100); }}
                                className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-primary hover:text-white dark:hover:bg-primary transition-all text-center flex flex-col items-center gap-2 group"
                              >
                                  <Plus className="w-6 h-6 text-gray-500 dark:text-gray-400 group-hover:text-white" />
                                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 group-hover:text-white">إضافة منتج</span>
                              </button>
                              <button 
                                onClick={() => { setActiveTab('categories'); setTimeout(handleOpenAddCategory, 100); }}
                                className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-primary hover:text-white dark:hover:bg-primary transition-all text-center flex flex-col items-center gap-2 group"
                              >
                                  <Tags className="w-6 h-6 text-gray-500 dark:text-gray-400 group-hover:text-white" />
                                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 group-hover:text-white">إضافة تصنيف</span>
                              </button>
                              <button 
                                onClick={() => { setActiveTab('brands'); setTimeout(handleOpenAddBrand, 100); }}
                                className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-primary hover:text-white dark:hover:bg-primary transition-all text-center flex flex-col items-center gap-2 group"
                              >
                                  <Briefcase className="w-6 h-6 text-gray-500 dark:text-gray-400 group-hover:text-white" />
                                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 group-hover:text-white">إضافة ماركة</span>
                              </button>
                              <button 
                                onClick={() => { setActiveTab('coupons'); setTimeout(handleOpenAddCoupon, 100); }}
                                className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-primary hover:text-white dark:hover:bg-primary transition-all text-center flex flex-col items-center gap-2 group"
                              >
                                  <Ticket className="w-6 h-6 text-gray-500 dark:text-gray-400 group-hover:text-white" />
                                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 group-hover:text-white">إضافة كوبون</span>
                              </button>
                              <button 
                                onClick={() => { setActiveTab('admins'); setTimeout(handleOpenAddAdmin, 100); }}
                                className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-primary hover:text-white dark:hover:bg-primary transition-all text-center flex flex-col items-center gap-2 group"
                              >
                                  <UserPlus className="w-6 h-6 text-gray-500 dark:text-gray-400 group-hover:text-white" />
                                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 group-hover:text-white">إضافة مشرف</span>
                              </button>
                               <button 
                                onClick={handleExportCSV}
                                className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-green-600 hover:text-white transition-all text-center flex flex-col items-center gap-2 group"
                              >
                                  <FileSpreadsheet className="w-6 h-6 text-gray-500 dark:text-gray-400 group-hover:text-white" />
                                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 group-hover:text-white">تصدير Excel</span>
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* --- REPORTS TAB --- */}
      {activeTab === 'reports' && (
          <div className="max-w-5xl mx-auto animate-fade-in-up">
              <div className="flex justify-between items-center mb-8 print:mb-4">
                  <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">تقرير أداء المتجر</h2>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">تاريخ التقرير: {new Date().toLocaleDateString()}</p>
                  </div>
                  <button 
                      onClick={handlePrintReport}
                      className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-2.5 rounded-xl font-bold shadow-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-all print:hidden"
                  >
                      <Printer className="w-5 h-5" />
                      طباعة التقرير
                  </button>
              </div>

              {/* Financial Summary */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8 print:shadow-none print:border-gray-300">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">الملخص المالي</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                          <p className="text-xs font-bold text-green-600 dark:text-green-400 mb-1">إجمالي المبيعات</p>
                          <p className="text-2xl font-black text-gray-900 dark:text-white dir-ltr">{totalRevenue.toLocaleString()} ر.س</p>
                      </div>
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                          <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">عدد الطلبات</p>
                          <p className="text-2xl font-black text-gray-900 dark:text-white">{orders.length}</p>
                      </div>
                      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                          <p className="text-xs font-bold text-purple-600 dark:text-purple-400 mb-1">متوسط الطلب</p>
                          <p className="text-2xl font-black text-gray-900 dark:text-white dir-ltr">
                              {orders.length > 0 ? (totalRevenue / orders.length).toFixed(0) : 0} ر.س
                          </p>
                      </div>
                      <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                          <p className="text-xs font-bold text-orange-600 dark:text-orange-400 mb-1">العملاء النشطين</p>
                          <p className="text-2xl font-black text-gray-900 dark:text-white">{users.filter(u => u.role === 'customer').length}</p>
                      </div>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Inventory Status */}
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 print:shadow-none print:border-gray-300">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">حالة المخزون</h3>
                      <div className="space-y-4">
                          <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">إجمالي المنتجات</span>
                              <span className="font-bold text-gray-900 dark:text-white">{products.length}</span>
                          </div>
                          <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">منتجات منخفضة المخزون</span>
                              <span className="font-bold text-amber-600">{products.filter(p => p.stock > 0 && p.stock <= 5).length}</span>
                          </div>
                          <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">منتجات نفذت</span>
                              <span className="font-bold text-red-600">{products.filter(p => p.stock === 0).length}</span>
                          </div>
                          <div className="pt-2">
                              <p className="text-xs font-bold text-gray-500 mb-2">توزيع التصنيفات</p>
                              <div className="flex gap-1 h-3 rounded-full overflow-hidden">
                                  {categories.slice(0, 4).map((cat, idx) => (
                                      <div 
                                          key={cat} 
                                          className={`bg-primary opacity-${100 - (idx * 20)} flex-1`}
                                          title={cat}
                                      ></div>
                                  ))}
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Orders Analysis */}
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 print:shadow-none print:border-gray-300">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">تحليل الطلبات</h3>
                      <div className="space-y-4">
                          {[
                              { label: 'قيد الانتظار', status: 'pending', color: 'bg-amber-100 text-amber-800' },
                              { label: 'قيد التجهيز', status: 'processing', color: 'bg-blue-100 text-blue-800' },
                              { label: 'تم التوصيل', status: 'delivered', color: 'bg-green-100 text-green-800' },
                              { label: 'ملغي', status: 'cancelled', color: 'bg-red-100 text-red-800' },
                          ].map(stat => (
                              <div key={stat.status} className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                      <span className={`w-3 h-3 rounded-full ${stat.color.split(' ')[0].replace('100', '500')}`}></span>
                                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{stat.label}</span>
                                  </div>
                                  <span className="font-bold text-gray-900 dark:text-white">
                                      {orders.filter(o => o.status === stat.status).length}
                                  </span>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-gray-500 text-sm print:block hidden">
                  <p>تم استخراج هذا التقرير من لوحة تحكم متجر الحسام</p>
                  <p>Hossam Store System © {new Date().getFullYear()}</p>
              </div>
          </div>
      )}

      {/* Products View */}
      {activeTab === 'products' && (
        <div className="animate-fade-in-up">
            <div className="flex justify-end mb-4">
                 <button
                    onClick={handleOpenAddProduct}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 bg-primary hover:bg-secondary text-white px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-5 h-5" />
                    إضافة منتج جديد
                  </button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in-up">
                <div className="overflow-x-auto">
                <table className="w-full text-right min-w-[800px]">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-20">ID</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">المنتج</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">السعر</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">المخزون</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">التصنيف</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left">إجراءات</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {sortedProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm font-mono">#{product.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0 relative border border-gray-200 dark:border-gray-600">
                                <img className="h-full w-full object-cover" src={product.images[0]} alt="" />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white truncate max-w-[150px]">{product.name}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white font-bold">{product.price} ر.س</td>
                        <td className="px-6 py-4 whitespace-nowrap"><StockBadge stock={product.stock} /></td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">{product.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-left">
                            <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleOpenEditProduct(product)} className="p-2 text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => setDeleteConfirmationId(product.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            </div>
        </div>
      )}

      {/* Categories View */}
      {activeTab === 'categories' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in-up">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-end">
                   <button onClick={handleOpenAddCategory} disabled={isLoading} className="flex items-center justify-center gap-2 bg-primary hover:bg-secondary text-white px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"><Plus className="w-5 h-5" /> إضافة تصنيف</button>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-right min-w-[600px]">
                      <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                          <tr>
                              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">اسم التصنيف</th>
                              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">عدد المنتجات</th>
                              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase text-left">إجراءات</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                          {categories.map((category) => (
                              <tr key={category} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                                  <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900 dark:text-white">{category}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">{getCategoryProductCount(category)} منتجات</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-left">
                                      <div className="flex items-center justify-end gap-2">
                                          <button onClick={() => handleOpenEditCategory(category)} className="p-2 text-gray-400 hover:text-primary dark:hover:text-primary"><Edit2 className="w-4 h-4" /></button>
                                          <button onClick={() => setDeleteCategoryConfirmation(category)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                      </div>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {/* Brands View */}
      {activeTab === 'brands' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in-up">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-end">
                   <button onClick={handleOpenAddBrand} disabled={isLoading} className="flex items-center justify-center gap-2 bg-primary hover:bg-secondary text-white px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"><Plus className="w-5 h-5" /> إضافة علامة تجارية</button>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-right min-w-[600px]">
                      <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                          <tr>
                              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">العلامة التجارية</th>
                              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">عدد المنتجات</th>
                              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase text-left">إجراءات</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                          {brands.map((brand) => (
                              <tr key={brand} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                                  <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900 dark:text-white">{brand}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">{getBrandProductCount(brand)} منتجات</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-left">
                                      <div className="flex items-center justify-end gap-2">
                                          <button onClick={() => handleOpenEditBrand(brand)} className="p-2 text-gray-400 hover:text-primary dark:hover:text-primary"><Edit2 className="w-4 h-4" /></button>
                                          <button onClick={() => setDeleteBrandConfirmation(brand)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                      </div>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {activeTab === 'orders' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in-up">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                  <input type="text" placeholder="بحث برقم الطلب..." value={orderSearchTerm} onChange={(e) => setOrderSearchTerm(e.target.value)} className="w-full sm:w-64 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-right min-w-[900px]">
                      <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                          <tr>
                              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">رقم الطلب</th>
                              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">العميل</th>
                              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">التاريخ</th>
                              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">الإجمالي</th>
                              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">الحالة</th>
                              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase text-left">إجراءات</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                          {filteredOrders.map((order) => {
                              const user = users.find(u => u.id === order.userId);
                              return (
                                  <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                                      <td className="px-6 py-4 whitespace-nowrap font-mono text-gray-600 dark:text-gray-300 text-sm">#{order.id.slice(-6)}</td>
                                      <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900 dark:text-white">{user?.name || 'زائر'}</td>
                                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400 dir-ltr text-sm">{new Date(order.date).toLocaleDateString()}</td>
                                      <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900 dark:text-white dir-ltr">{order.total} {order.currency}</td>
                                      <td className="px-6 py-4 whitespace-nowrap"><OrderStatusBadge status={order.status} /></td>
                                      <td className="px-6 py-4 whitespace-nowrap text-left">
                                          <div className="flex items-center justify-end gap-2">
                                              <select 
                                                  value={order.status} 
                                                  onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as UserOrder['status'])}
                                                  className="text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 outline-none"
                                              >
                                                  <option value="pending">قيد الانتظار</option>
                                                  <option value="processing">قيد التجهيز</option>
                                                  <option value="shipped">تم الشحن</option>
                                                  <option value="delivered">تم التوصيل</option>
                                                  <option value="cancelled">ملغي</option>
                                              </select>
                                              <button onClick={() => setDeleteOrderConfirmation(order.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                          </div>
                                      </td>
                                  </tr>
                              );
                          })}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {activeTab === 'customers' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in-up">
              <div className="overflow-x-auto">
                  <table className="w-full text-right min-w-[800px]">
                      <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                          <tr>
                              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">العميل</th>
                              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">البريد الإلكتروني</th>
                              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">تاريخ الانضمام</th>
                              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">إجمالي الطلبات</th>
                              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase text-left">إجراءات</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                          {users.filter(u => u.role === 'customer').map(user => {
                              const stats = getCustomerStats(user.id);
                              return (
                                  <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                                      <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900 dark:text-white">{user.name}</td>
                                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{user.email}</td>
                                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400 dir-ltr">{user.joinDate || '-'}</td>
                                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{stats.orderCount} طلبات ({stats.totalSpent} SAR)</td>
                                      <td className="px-6 py-4 whitespace-nowrap text-left">
                                          <button onClick={() => setDeleteUserConfirmation(user.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                      </td>
                                  </tr>
                              );
                          })}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {activeTab === 'admins' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in-up">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-end">
                   <button onClick={handleOpenAddAdmin} className="flex items-center justify-center gap-2 bg-primary hover:bg-secondary text-white px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95"><UserPlus className="w-5 h-5" /> إضافة مشرف</button>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-right min-w-[700px]">
                      <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                          <tr>
                              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">الاسم</th>
                              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">البريد الإلكتروني</th>
                              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">الصلاحيات</th>
                              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase text-left">إجراءات</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                          {adminUsers.map(admin => (
                              <tr key={admin.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                                  <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900 dark:text-white">{admin.name}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{admin.email}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                      {admin.permissions?.length ? admin.permissions.length + ' صلاحيات' : 'كامل الصلاحيات'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-left">
                                      <div className="flex items-center justify-end gap-2">
                                          <button onClick={() => handleOpenEditAdmin(admin)} className="p-2 text-gray-400 hover:text-primary dark:hover:text-primary"><Edit2 className="w-4 h-4" /></button>
                                          <button onClick={() => setDeleteAdminConfirmation(admin.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                      </div>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {activeTab === 'coupons' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in-up">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-end">
                   <button onClick={handleOpenAddCoupon} className="flex items-center justify-center gap-2 bg-primary hover:bg-secondary text-white px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95"><Plus className="w-5 h-5" /> كوبون جديد</button>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-right min-w-[700px]">
                      <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                          <tr>
                              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">الكود</th>
                              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">الخصم</th>
                              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">الانتهاء</th>
                              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">الحالة</th>
                              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase text-left">إجراءات</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                          {coupons.map(coupon => (
                              <tr key={coupon.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                                  <td className="px-6 py-4 whitespace-nowrap font-mono font-bold text-gray-900 dark:text-white">{coupon.code}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-green-600 font-bold">{coupon.discount}%</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400 dir-ltr">{coupon.expiryDate}</td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                          {coupon.isActive ? 'نشط' : 'غير نشط'}
                                      </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-left">
                                      <div className="flex items-center justify-end gap-2">
                                          <button onClick={() => toggleCouponStatus(coupon.id)} className="p-2 text-gray-400 hover:text-blue-500"><Power className="w-4 h-4" /></button>
                                          <button onClick={() => handleOpenEditCoupon(coupon)} className="p-2 text-gray-400 hover:text-primary dark:hover:text-primary"><Edit2 className="w-4 h-4" /></button>
                                          <button onClick={() => deleteCoupon(coupon.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                      </div>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {activeTab === 'reviews' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in-up">
              <div className="overflow-x-auto">
                  <table className="w-full text-right min-w-[700px]">
                      <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                          <tr>
                              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">المنتج</th>
                              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">العميل</th>
                              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">التقييم</th>
                              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">التعليق</th>
                              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase text-left">إجراءات</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                          {products.flatMap(p => p.reviews?.map(r => ({ ...r, productName: p.name, productId: p.id })) || []).map((review) => (
                              <tr key={review.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-bold">{review.productName}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">{review.userName}</td>
                                  <td className="px-6 py-4 whitespace-nowrap flex text-amber-400">
                                      {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-gray-300 dark:text-gray-600'}`} />)}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">{review.comment}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-left">
                                      <button onClick={() => onDeleteReview(review.productId, review.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {/* --- CURRENCIES TAB --- */}
      {activeTab === 'currencies' && (
          <div className="max-w-4xl mx-auto animate-fade-in-up">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">إدارة أسعار صرف العملات</h2>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-6 flex items-start gap-3">
                      <Info className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                          <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-1">معلومات هامة</h4>
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                              يتم تحديد سعر المنتج الأساسي بالريال السعودي (SAR).<br/>
                              - للتحويل إلى الدولار (USD): يتم قسمة السعر على القيمة المدخلة.<br/>
                              - للتحويل إلى الريال اليمني (YER): يتم ضرب السعر في القيمة المدخلة.
                          </p>
                      </div>
                  </div>

                  <form onSubmit={handleSaveExchangeRates} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div>
                              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                  سعر صرف الدولار (USD)
                                  <span className="text-xs font-normal text-gray-500 mr-2">(1 دولار = ؟ ريال سعودي)</span>
                              </label>
                              <div className="relative">
                                  <input 
                                      type="number" 
                                      step="0.01"
                                      min="0.1"
                                      value={tempRates.USD} 
                                      onChange={e => setTempRates({...tempRates, USD: parseFloat(e.target.value)})} 
                                      className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white dir-ltr text-left" 
                                  />
                                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                      <span className="text-gray-500 font-bold">SAR</span>
                                  </div>
                              </div>
                              <p className="text-xs text-gray-500 mt-2 dir-ltr">Example: 100 SAR / {tempRates.USD} = ${(100/tempRates.USD).toFixed(2)}</p>
                          </div>

                          <div>
                              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                  سعر صرف الريال اليمني (YER)
                                  <span className="text-xs font-normal text-gray-500 mr-2">(1 ريال سعودي = ؟ ريال يمني)</span>
                              </label>
                              <div className="relative">
                                  <input 
                                      type="number" 
                                      step="1"
                                      min="1"
                                      value={tempRates.YER} 
                                      onChange={e => setTempRates({...tempRates, YER: parseFloat(e.target.value)})} 
                                      className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white dir-ltr text-left" 
                                  />
                                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                      <span className="text-gray-500 font-bold">YER</span>
                                  </div>
                              </div>
                              <p className="text-xs text-gray-500 mt-2 dir-ltr">Example: 100 SAR * {tempRates.YER} = {100 * tempRates.YER} YER</p>
                          </div>
                      </div>

                      <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
                          <button 
                              type="submit" 
                              disabled={isLoading}
                              className="flex items-center gap-2 bg-primary hover:bg-secondary text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all active:scale-95 disabled:opacity-70"
                          >
                              {isLoading ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                              حفظ الأسعار
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* --- SETTINGS TAB --- */}
      {activeTab === 'settings' && (
          <div className="max-w-4xl mx-auto animate-fade-in-up">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">إعدادات المتجر</h2>
              <form onSubmit={handleSaveSettings} className="space-y-8">
                  {/* General Info */}
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                      <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
                          <Store className="w-5 h-5 text-primary" />
                          معلومات المتجر الأساسية
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اسم المتجر</label>
                              <input type="text" value={storeSettings.storeName} onChange={e => setStoreSettings({...storeSettings, storeName: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-primary outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">البريد الإلكتروني الرسمي</label>
                              <input type="email" value={storeSettings.email} onChange={e => setStoreSettings({...storeSettings, email: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-primary outline-none dir-ltr bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">رقم الهاتف</label>
                              <input type="text" value={storeSettings.phone} onChange={e => setStoreSettings({...storeSettings, phone: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-primary outline-none dir-ltr bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">العملة الافتراضية</label>
                              <select value={storeSettings.currency} onChange={e => setStoreSettings({...storeSettings, currency: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-primary outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                  <option value="SAR">ريال سعودي (SAR)</option>
                                  <option value="USD">دولار أمريكي (USD)</option>
                              </select>
                          </div>
                          <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">وصف المتجر (SEO)</label>
                              <textarea rows={3} value={storeSettings.description} onChange={e => setStoreSettings({...storeSettings, description: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-primary outline-none resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                          </div>
                      </div>
                  </div>

                  {/* Financial & Shipping */}
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                      <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
                          <DollarSign className="w-5 h-5 text-green-600" />
                          الإعدادات المالية والشحن
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نسبة الضريبة (%)</label>
                              <input type="number" value={storeSettings.taxRate} onChange={e => setStoreSettings({...storeSettings, taxRate: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-primary outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">تكلفة الشحن القياسي</label>
                              <input type="number" value={storeSettings.shippingFee} onChange={e => setStoreSettings({...storeSettings, shippingFee: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-primary outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                          </div>
                      </div>
                  </div>

                  {/* Features Toggles */}
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                      <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
                          <Power className="w-5 h-5 text-red-500" />
                          تفعيل الخصائص
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {[
                              { key: 'enableOrdering', label: 'استقبال الطلبات' },
                              { key: 'enableRegistration', label: 'تسجيل العملاء' },
                              { key: 'enableReviews', label: 'نظام التقييمات' },
                              { key: 'enableCoupons', label: 'نظام الكوبونات' },
                              { key: 'enableChat', label: 'المساعد الذكي (Chatbot)' },
                              { key: 'enableLoyalty', label: 'نقاط الولاء' },
                          ].map((feature) => (
                              <div key={feature.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{feature.label}</span>
                                  <button
                                      type="button"
                                      onClick={() => setStoreSettings({ ...storeSettings, [feature.key]: !storeSettings[feature.key as keyof typeof storeSettings] })}
                                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${storeSettings[feature.key as keyof typeof storeSettings] ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                  >
                                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${storeSettings[feature.key as keyof typeof storeSettings] ? 'translate-x-1' : 'translate-x-6'}`} />
                                  </button>
                              </div>
                          ))}
                      </div>
                  </div>

                  {/* Social Links */}
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                      <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
                          <Globe className="w-5 h-5 text-blue-500" />
                          روابط التواصل الاجتماعي
                      </h3>
                      <div className="space-y-4">
                          <div className="flex items-center gap-2">
                              <Facebook className="w-5 h-5 text-blue-600" />
                              <input type="text" placeholder="رابط فيسبوك" value={storeSettings.facebook} onChange={e => setStoreSettings({...storeSettings, facebook: e.target.value})} className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:border-primary outline-none dir-ltr bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                          </div>
                          <div className="flex items-center gap-2">
                              <Twitter className="w-5 h-5 text-sky-500" />
                              <input type="text" placeholder="رابط تويتر/إكس" value={storeSettings.twitter} onChange={e => setStoreSettings({...storeSettings, twitter: e.target.value})} className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:border-primary outline-none dir-ltr bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                          </div>
                          <div className="flex items-center gap-2">
                              <Instagram className="w-5 h-5 text-pink-600" />
                              <input type="text" placeholder="رابط انستقرام" value={storeSettings.instagram} onChange={e => setStoreSettings({...storeSettings, instagram: e.target.value})} className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:border-primary outline-none dir-ltr bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                          </div>
                      </div>
                  </div>

                  <div className="flex justify-end pt-4">
                      <button 
                          type="submit" 
                          disabled={isLoading}
                          className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-all active:scale-95 disabled:opacity-70"
                      >
                          {isLoading ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                          حفظ الإعدادات
                      </button>
                  </div>
              </form>
          </div>
      )}
      
      {/* ... Modals Section (Keep existing modals) ... */}
      {/* Add/Edit Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => !isLoading && setIsProductModalOpen(false)}>
              <div className="absolute inset-0 bg-gray-900/75 backdrop-blur-sm"></div>
            </div>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-lg leading-6 font-bold text-gray-900 dark:text-white">
                    {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
                  </h3>
                  <button onClick={() => setIsProductModalOpen(false)} disabled={isLoading} className="text-gray-400 hover:text-gray-500 disabled:opacity-50">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <form id="productForm" onSubmit={handleProductSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اسم المنتج</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={productFormData.name}
                      onChange={e => setProductFormData({...productFormData, name: e.target.value})}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">السعر (ر.س)</label>
                      <input
                        type="number"
                        required
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        value={productFormData.price}
                        onChange={e => setProductFormData({...productFormData, price: Number(e.target.value)})}
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الكمية في المخزون</label>
                      <input
                        type="number"
                        required
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        value={productFormData.stock}
                        onChange={e => setProductFormData({...productFormData, stock: Number(e.target.value)})}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">التصنيف</label>
                        <div className="relative">
                            <select
                                required
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none"
                                value={productFormData.category}
                                onChange={e => setProductFormData({...productFormData, category: e.target.value})}
                                disabled={isLoading}
                            >
                                <option value="">اختر التصنيف</option>
                                {categories.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                <ArrowUpDown className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">العلامة التجارية</label>
                        <div className="relative">
                            <select
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none"
                                value={productFormData.brand}
                                onChange={e => setProductFormData({...productFormData, brand: e.target.value})}
                                disabled={isLoading}
                            >
                                <option value="">اختر العلامة</option>
                                {brands.map(b => (
                                    <option key={b} value={b}>{b}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                <ArrowUpDown className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                  </div>

                  {/* Attributes Section */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                      <div>
                          <label className="flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 mb-1.5">
                              <Palette className="w-3.5 h-3.5" />
                              الألوان المتاحة (افصل بفاصلة)
                          </label>
                          <input
                            type="text"
                            placeholder="مثال: أحمر, أزرق, أسود"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            value={colorsInput}
                            onChange={e => setColorsInput(e.target.value)}
                            disabled={isLoading}
                          />
                          {renderAttributePreview(colorsInput, true)}
                      </div>
                      <div>
                          <label className="flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 mb-1.5">
                              <Ruler className="w-3.5 h-3.5" />
                              المقاسات المتاحة (افصل بفاصلة)
                          </label>
                           <input
                            type="text"
                            placeholder="مثال: S, M, L, XL"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            value={sizesInput}
                            onChange={e => setSizesInput(e.target.value)}
                            disabled={isLoading}
                          />
                          {renderAttributePreview(sizesInput, false)}
                      </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">وصف مختصر</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="وصف قصير يظهر في البطاقة..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={productFormData.description}
                      onChange={e => setProductFormData({...productFormData, description: e.target.value})}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">وصف تفصيلي (التفاصيل الكاملة)</label>
                    <textarea
                      rows={4}
                      placeholder="اكتب وصفاً مفصلاً للمنتج هنا..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={productFormData.detailedDescription}
                      onChange={e => setProductFormData({...productFormData, detailedDescription: e.target.value})}
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">صور المنتج</label>
                    
                    {/* Add Image Input */}
                    <div className="flex gap-2 mb-3">
                        <input
                            type="text"
                            placeholder="رابط الصورة (https://...)"
                            value={newImageUrl}
                            onChange={e => setNewImageUrl(e.target.value)}
                            onKeyDown={(e) => {
                                if(e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddImage();
                                }
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-left dir-ltr bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            dir="ltr"
                            disabled={isLoading}
                        />
                        <button 
                            type="button" 
                            onClick={handleAddImage}
                            disabled={isLoading}
                            className="px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 flex items-center gap-1 disabled:opacity-50"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                        
                        {/* File Upload Button */}
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="image-upload"
                            onChange={handleImageUpload}
                            disabled={isLoading}
                        />
                        <label
                            htmlFor="image-upload"
                            className={`px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer flex items-center justify-center ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title="رفع صورة من الجهاز"
                        >
                            <Upload className="w-5 h-5" />
                        </label>

                        <button 
                            type="button" 
                            onClick={handleAddRandomImage}
                            disabled={isLoading}
                            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
                            title="توليد صورة عشوائية"
                        >
                            <ImageIcon className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Images List */}
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {productFormData.images.length === 0 && (
                            <div className="text-center py-4 bg-gray-50 dark:bg-gray-700/50 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-400 text-sm">
                                لا توجد صور مضافة
                            </div>
                        )}
                        {productFormData.images.map((img, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50 group hover:bg-white dark:hover:bg-gray-700 transition-colors">
                                <div className="w-10 h-10 rounded-md bg-white border border-gray-200 overflow-hidden flex-shrink-0">
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate dir-ltr font-mono">{img.startsWith('data:') ? 'تم رفع الصورة' : img}</p>
                                </div>
                                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        type="button"
                                        onClick={() => handleMoveImage(idx, 'up')}
                                        disabled={idx === 0 || isLoading}
                                        className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                      <ArrowUp className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleMoveImage(idx, 'down')}
                                        disabled={idx === productFormData.images.length - 1 || isLoading}
                                        className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <ArrowDown className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveImage(idx)}
                                        disabled={isLoading}
                                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-secondary focus:outline-none sm:col-start-2 sm:text-sm disabled:opacity-50"
                    >
                      {isLoading ? 'جاري الحفظ...' : 'حفظ'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsProductModalOpen(false)}
                      disabled={isLoading}
                      className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none sm:mt-0 sm:col-start-1 sm:text-sm"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Category Modal */}
      {isCategoryModalOpen && (
           <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <div className="fixed inset-0 transition-opacity" onClick={() => !isLoading && setIsCategoryModalOpen(false)}>
                        <div className="absolute inset-0 bg-gray-900/75 backdrop-blur-sm"></div>
                    </div>
                    <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md w-full">
                        <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="flex justify-between items-center mb-5">
                                <h3 className="text-lg leading-6 font-bold text-gray-900 dark:text-white">
                                    {editingCategory ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
                                </h3>
                                <button onClick={() => setIsCategoryModalOpen(false)} disabled={isLoading} className="text-gray-400 hover:text-gray-500 disabled:opacity-50">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleCategorySubmit}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اسم التصنيف</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        value={categoryFormData}
                                        onChange={e => setCategoryFormData(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-secondary focus:outline-none sm:col-start-2 sm:text-sm disabled:opacity-50"
                                    >
                                        {isLoading ? 'جاري الحفظ...' : 'حفظ'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsCategoryModalOpen(false)}
                                        disabled={isLoading}
                                        className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none sm:mt-0 sm:col-start-1 sm:text-sm"
                                    >
                                        إلغاء
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
           </div>
      )}

      {/* Brand Modal */}
      {isBrandModalOpen && (
           <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <div className="fixed inset-0 transition-opacity" onClick={() => !isLoading && setIsBrandModalOpen(false)}>
                        <div className="absolute inset-0 bg-gray-900/75 backdrop-blur-sm"></div>
                    </div>
                    <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md w-full">
                        <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="flex justify-between items-center mb-5">
                                <h3 className="text-lg leading-6 font-bold text-gray-900 dark:text-white">
                                    {editingBrand ? 'تعديل العلامة التجارية' : 'إضافة علامة تجارية'}
                                </h3>
                                <button onClick={() => setIsBrandModalOpen(false)} disabled={isLoading} className="text-gray-400 hover:text-gray-500 disabled:opacity-50">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleBrandSubmit}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اسم العلامة التجارية</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        value={brandFormData}
                                        onChange={e => setBrandFormData(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-secondary focus:outline-none sm:col-start-2 sm:text-sm disabled:opacity-50"
                                    >
                                        {isLoading ? 'جاري الحفظ...' : 'حفظ'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsBrandModalOpen(false)}
                                        disabled={isLoading}
                                        className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none sm:mt-0 sm:col-start-1 sm:text-sm"
                                    >
                                        إلغاء
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
           </div>
      )}

      {/* Admin Modal */}
      {isAdminModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                  <div className="fixed inset-0 transition-opacity" onClick={() => !isLoading && setIsAdminModalOpen(false)}>
                      <div className="absolute inset-0 bg-gray-900/75 backdrop-blur-sm"></div>
                  </div>
                  <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                      <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                          <div className="flex justify-between items-center mb-5">
                              <h3 className="text-lg leading-6 font-bold text-gray-900 dark:text-white">{editingAdmin ? 'تعديل بيانات المشرف' : 'إضافة مشرف جديد'}</h3>
                              <button onClick={() => setIsAdminModalOpen(false)} className="text-gray-400 hover:text-gray-500"><X className="w-5 h-5" /></button>
                          </div>
                          <form onSubmit={handleAdminSubmit} className="space-y-4">
                              <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الاسم الكامل</label>
                                  <input type="text" required value={adminFormData.name} onChange={e => setAdminFormData({...adminFormData, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">البريد الإلكتروني</label>
                                  <input type="email" required value={adminFormData.email} onChange={e => setAdminFormData({...adminFormData, email: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white dir-ltr" />
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الصلاحيات</label>
                                  <div className="space-y-2">
                                      <button type="button" onClick={selectAllPermissions} className="text-xs text-primary hover:underline mb-2">تحديد الكل / إلغاء التحديد</button>
                                      <div className="grid grid-cols-2 gap-2">
                                          {PERMISSIONS.map(perm => (
                                              <label key={perm.id} className="flex items-center gap-2 cursor-pointer p-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                                                  <input type="checkbox" checked={adminFormData.permissions.includes(perm.id)} onChange={() => togglePermission(perm.id)} className="rounded text-primary focus:ring-primary" />
                                                  <span className="text-sm text-gray-700 dark:text-gray-300">{perm.label}</span>
                                              </label>
                                          ))}
                                      </div>
                                  </div>
                              </div>
                              <button type="submit" disabled={isLoading} className="w-full bg-primary text-white py-2 rounded-xl font-bold hover:bg-secondary mt-4">{isLoading ? 'جاري الحفظ...' : 'حفظ'}</button>
                          </form>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Coupon Modal */}
      {isCouponModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                  <div className="fixed inset-0 transition-opacity" onClick={() => !isLoading && setIsCouponModalOpen(false)}>
                      <div className="absolute inset-0 bg-gray-900/75 backdrop-blur-sm"></div>
                  </div>
                  <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md w-full">
                      <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                          <div className="flex justify-between items-center mb-5">
                              <h3 className="text-lg leading-6 font-bold text-gray-900 dark:text-white">{editingCoupon ? 'تعديل الكوبون' : 'إضافة كوبون جديد'}</h3>
                              <button onClick={() => setIsCouponModalOpen(false)} className="text-gray-400 hover:text-gray-500"><X className="w-5 h-5" /></button>
                          </div>
                          <form onSubmit={handleCouponSubmit} className="space-y-4">
                              <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">كود الخصم</label>
                                  <input type="text" required value={couponFormData.code} onChange={e => setCouponFormData({...couponFormData, code: e.target.value.toUpperCase()})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none uppercase font-mono bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="SALE20" />
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نسبة الخصم (%)</label>
                                  <input type="number" min="1" max="100" required value={couponFormData.discount} onChange={e => setCouponFormData({...couponFormData, discount: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">تاريخ الانتهاء</label>
                                  <input type="date" required value={couponFormData.expiryDate} onChange={e => setCouponFormData({...couponFormData, expiryDate: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                              </div>
                              <button type="submit" disabled={isLoading} className="w-full bg-primary text-white py-2 rounded-xl font-bold hover:bg-secondary mt-4">{isLoading ? 'جاري الحفظ...' : 'حفظ'}</button>
                          </form>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Delete Confirmation Modal */}
      {(deleteConfirmationId !== null || deleteCategoryConfirmation !== null || deleteBrandConfirmation !== null || deleteAdminConfirmation !== null || deleteOrderConfirmation !== null || deleteUserConfirmation !== null) && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => {
                if (!isLoading) {
                    setDeleteConfirmationId(null);
                    setDeleteCategoryConfirmation(null);
                    setDeleteBrandConfirmation(null);
                    setDeleteAdminConfirmation(null);
                    setDeleteOrderConfirmation(null);
                    setDeleteUserConfirmation(null);
                }
            }}>
                <div className="absolute inset-0 bg-gray-900/75 backdrop-blur-sm"></div>
            </div>
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 sm:mx-0 sm:h-10 sm:w-10">
                            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="mt-3 text-center sm:mt-0 sm:mr-4 sm:text-right">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                                تأكيد الحذف
                            </h3>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    هل أنت متأكد من رغبتك في حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/30 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => {
                            if (deleteConfirmationId) handleConfirmDeleteProduct();
                            else if (deleteCategoryConfirmation) handleConfirmDeleteCategory();
                            else if (deleteBrandConfirmation) handleConfirmDeleteBrand();
                            else if (deleteAdminConfirmation) handleConfirmDeleteAdmin();
                            else if (deleteOrderConfirmation) handleConfirmDeleteOrder();
                            else if (deleteUserConfirmation) handleConfirmDeleteUser();
                        }}
                        className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                    >
                        {isLoading ? 'جاري الحذف...' : 'حذف'}
                    </button>
                    <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => {
                            setDeleteConfirmationId(null);
                            setDeleteCategoryConfirmation(null);
                            setDeleteBrandConfirmation(null);
                            setDeleteAdminConfirmation(null);
                            setDeleteOrderConfirmation(null);
                            setDeleteUserConfirmation(null);
                        }}
                        className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                        إلغاء
                    </button>
                </div>
            </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
