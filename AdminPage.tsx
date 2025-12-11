import React, { useState } from 'react';
import { Product } from '../types';
import { 
  Plus, Edit2, Trash2, X, Search, Image as ImageIcon, LayoutGrid, 
  Package, ArrowUpDown, ArrowUp, ArrowDown, AlertTriangle, 
  SlidersHorizontal, RefreshCcw, Tags, Layers, Palette, Ruler, Briefcase, ArrowRight,
  LayoutDashboard, BarChart3, Download, Bell, TrendingUp, DollarSign, Activity, FileSpreadsheet
} from 'lucide-react';

interface AdminPageProps {
  products: Product[];
  categories: string[];
  brands: string[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: number) => void;
  onAddCategory: (category: string) => void;
  onUpdateCategory: (oldCategory: string, newCategory: string) => void;
  onDeleteCategory: (category: string) => void;
  onAddBrand: (brand: string) => void;
  onUpdateBrand: (oldBrand: string, newBrand: string) => void;
  onDeleteBrand: (brand: string) => void;
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
type ActiveTab = 'dashboard' | 'products' | 'categories' | 'brands';

const SortIcon: React.FC<{ field: SortField; currentSortField: SortField | null; sortDirection: SortDirection }> = ({
  field,
  currentSortField,
  sortDirection
}) => {
  if (field !== currentSortField) return <ArrowUpDown className="w-4 h-4 text-gray-400 opacity-50 group-hover:opacity-100" />;
  if (sortDirection === 'asc') return <ArrowUp className="w-4 h-4 text-primary" />;
  return <ArrowDown className="w-4 h-4 text-primary" />;
};

const StockBadge: React.FC<{ stock: number }> = ({ stock }) => {
  if (stock === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
        نفذت الكمية
      </span>
    );
  }
  if (stock <= 5) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
        منخفض ({stock})
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
      متوفر ({stock})
    </span>
  );
};

const AdminPage: React.FC<AdminPageProps> = ({ 
  products, 
  categories, 
  brands,
  onAddProduct, 
  onUpdateProduct, 
  onDeleteProduct,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onAddBrand,
  onUpdateBrand,
  onDeleteBrand
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  
  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productFormData, setProductFormData] = useState<Omit<Product, 'id'>>(emptyProduct);
  const [newImageUrl, setNewImageUrl] = useState('');
  
  // Confirmation state for sensitive updates
  const [pendingProductChanges, setPendingProductChanges] = useState<{
    original: Product;
    newData: Omit<Product, 'id'>;
    changes: string[];
  } | null>(null);
  
  // Helper state for array inputs (colors/sizes) as strings
  const [colorsInput, setColorsInput] = useState('');
  const [sizesInput, setSizesInput] = useState('');
  
  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [categoryFormData, setCategoryFormData] = useState('');

  // Brand Modal State
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<string | null>(null);
  const [brandFormData, setBrandFormData] = useState('');
  
  // Search & Filter State
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchId, setSearchId] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [stockStatus, setStockStatus] = useState<StockStatus>('all');
  
  // Delete Confirmation State
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<number | null>(null);
  const [deleteCategoryConfirmation, setDeleteCategoryConfirmation] = useState<string | null>(null);
  const [deleteBrandConfirmation, setDeleteBrandConfirmation] = useState<string | null>(null);
  
  // Sorting State
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Notifications State
  const [showNotifications, setShowNotifications] = useState(false);

  // Helper to simulate loading
  const simulateLoading = async (action: () => void) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800)); // 800ms simulated delay
    action();
    setIsLoading(false);
  };

  // Export to CSV
  const handleExportCSV = () => {
      const headers = ['ID', 'اسم المنتج', 'السعر', 'المخزون', 'التصنيف', 'العلامة التجارية'];
      const csvContent = "data:text/csv;charset=utf-8,\uFEFF" // Add BOM for Arabic support
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

  // Dashboard Statistics
  const totalInventoryValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
  const lowStockProducts = products.filter(p => p.stock <= 5);
  const outOfStockCount = products.filter(p => p.stock === 0).length;
  
  const categoryStats = categories.map(cat => ({
    name: cat,
    count: products.filter(p => p.category === cat).length,
    percentage: Math.round((products.filter(p => p.category === cat).length / products.length) * 100) || 0
  })).sort((a, b) => b.count - a.count);

  // Filter Logic
  const filteredProducts = products.filter(p => {
    // Text Search
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // ID Search
    const matchesId = searchId ? p.id.toString().includes(searchId) : true;

    // Price Range
    const matchesMinPrice = minPrice ? p.price >= Number(minPrice) : true;
    const matchesMaxPrice = maxPrice ? p.price <= Number(maxPrice) : true;

    // Stock Status
    let matchesStock = true;
    if (stockStatus === 'in_stock') matchesStock = p.stock > 5;
    if (stockStatus === 'low_stock') matchesStock = p.stock > 0 && p.stock <= 5;
    if (stockStatus === 'out_of_stock') matchesStock = p.stock === 0;

    return matchesSearch && matchesId && matchesMinPrice && matchesMaxPrice && matchesStock;
  });

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
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue, 'ar') 
        : bValue.localeCompare(aValue, 'ar');
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' 
        ? aValue - bValue 
        : bValue - aValue;
    }
    
    return 0;
  });

  const resetFilters = () => {
    setSearchTerm('');
    setSearchId('');
    setMinPrice('');
    setMaxPrice('');
    setStockStatus('all');
  };

  // Product Handlers
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductFormData({
        ...emptyProduct,
        images: [`https://picsum.photos/400/400?random=${Math.floor(Math.random() * 1000)}`]
    });
    setNewImageUrl('');
    setColorsInput('');
    setSizesInput('');
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductFormData({
      name: product.name,
      price: product.price,
      category: product.category,
      brand: product.brand || '',
      description: product.description,
      detailedDescription: product.detailedDescription || '',
      images: [...product.images],
      stock: product.stock,
      colors: product.colors || [],
      sizes: product.sizes || []
    });
    setNewImageUrl('');
    setColorsInput(product.colors?.join(', ') || '');
    setSizesInput(product.sizes?.join(', ') || '');
    setIsProductModalOpen(true);
  };

  // Image Management Handlers
  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setProductFormData(prev => ({
        ...prev,
        images: [...prev.images, newImageUrl.trim()]
    }));
    setNewImageUrl('');
  };

  const handleAddRandomImage = () => {
      const randomUrl = `https://picsum.photos/400/400?random=${Math.floor(Math.random() * 1000)}`;
      setProductFormData(prev => ({
        ...prev,
        images: [...prev.images, randomUrl]
    }));
  };

  const handleRemoveImage = (index: number) => {
      setProductFormData(prev => ({
          ...prev,
          images: prev.images.filter((_, i) => i !== index)
      }));
  };

  const handleMoveImage = (index: number, direction: 'up' | 'down') => {
      setProductFormData(prev => {
          const newImages = [...prev.images];
          if (direction === 'up' && index > 0) {
              [newImages[index], newImages[index - 1]] = [newImages[index - 1], newImages[index]];
          } else if (direction === 'down' && index < newImages.length - 1) {
              [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
          }
          return { ...prev, images: newImages };
      });
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse colors and sizes from inputs
    const colors = colorsInput.split(',').map(s => s.trim()).filter(s => s !== '');
    const sizes = sizesInput.split(',').map(s => s.trim()).filter(s => s !== '');

    const finalProductData = {
        ...productFormData,
        colors,
        sizes
    };

    if (editingProduct) {
      // Check for sensitive changes
      const changes: string[] = [];
      if (editingProduct.stock !== finalProductData.stock) changes.push('stock');
      if (editingProduct.category !== finalProductData.category) changes.push('category');
      if (editingProduct.brand !== finalProductData.brand) changes.push('brand');

      if (changes.length > 0) {
        setPendingProductChanges({
          original: editingProduct,
          newData: finalProductData,
          changes
        });
        return;
      }
      
      // Update directly if no sensitive changes
      simulateLoading(() => {
          onUpdateProduct({ ...finalProductData, id: editingProduct.id });
          setIsProductModalOpen(false);
      });
    } else {
      // Add Product
      simulateLoading(() => {
          onAddProduct(finalProductData);
          setIsProductModalOpen(false);
      });
    }
  };

  const confirmProductChanges = () => {
    if (pendingProductChanges) {
        simulateLoading(() => {
            onUpdateProduct({ ...pendingProductChanges.newData, id: pendingProductChanges.original.id });
            setPendingProductChanges(null);
            setIsProductModalOpen(false);
        });
    }
  };

  const handleConfirmDeleteProduct = () => {
    if (deleteConfirmationId !== null) {
      simulateLoading(() => {
          onDeleteProduct(deleteConfirmationId);
          setDeleteConfirmationId(null);
      });
    }
  };

  // Category Handlers
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryFormData('');
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (category: string) => {
    setEditingCategory(category);
    setCategoryFormData(category);
    setIsCategoryModalOpen(true);
  };

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    simulateLoading(() => {
        if (editingCategory) {
            onUpdateCategory(editingCategory, categoryFormData);
        } else {
            onAddCategory(categoryFormData);
        }
        setIsCategoryModalOpen(false);
    });
  };

  const handleConfirmDeleteCategory = () => {
    if (deleteCategoryConfirmation !== null) {
        simulateLoading(() => {
            onDeleteCategory(deleteCategoryConfirmation);
            setDeleteCategoryConfirmation(null);
        });
    }
  };

  const getCategoryProductCount = (category: string) => {
    return products.filter(p => p.category === category).length;
  };

  // Brand Handlers
  const handleOpenAddBrand = () => {
    setEditingBrand(null);
    setBrandFormData('');
    setIsBrandModalOpen(true);
  };

  const handleOpenEditBrand = (brand: string) => {
    setEditingBrand(brand);
    setBrandFormData(brand);
    setIsBrandModalOpen(true);
  };

  const handleBrandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    simulateLoading(() => {
        if (editingBrand) {
            onUpdateBrand(editingBrand, brandFormData);
        } else {
            onAddBrand(brandFormData);
        }
        setIsBrandModalOpen(false);
    });
  };

  const handleConfirmDeleteBrand = () => {
    if (deleteBrandConfirmation !== null) {
        simulateLoading(() => {
            onDeleteBrand(deleteBrandConfirmation);
            setDeleteBrandConfirmation(null);
        });
    }
  };

  const getBrandProductCount = (brand: string) => {
    return products.filter(p => p.brand === brand).length;
  };


  // Helper to render preview badges
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in relative">
      
      {/* Loading Progress Bar */}
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 h-1.5 bg-blue-100 z-[100] overflow-hidden">
            <div className="h-full bg-primary animate-progress origin-left w-full"></div>
             <style>{`
                @keyframes progress {
                    0% { transform: translateX(-100%); }
                    50% { transform: translateX(0); }
                    100% { transform: translateX(100%); }
                }
                .animate-progress {
                    animation: progress 1.5s infinite linear;
                }
            `}</style>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <LayoutDashboard className="text-primary w-8 h-8" />
            لوحة التحكم
          </h1>
          <p className="text-gray-500 text-sm mt-1">نظرة عامة وإدارة المتجر</p>
        </div>
        
        <div className="flex items-center gap-3">
             {/* Notification Bell */}
             <div className="relative">
                <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors relative"
                >
                    <Bell className="w-5 h-5" />
                    {lowStockProducts.length > 0 && (
                        <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                    )}
                </button>
                {showNotifications && (
                    <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-fade-in-up">
                        <div className="p-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-sm text-gray-900">التنبيهات</h3>
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{lowStockProducts.length}</span>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                            {lowStockProducts.length === 0 ? (
                                <div className="p-4 text-center text-gray-500 text-sm">لا توجد تنبيهات حالياً</div>
                            ) : (
                                lowStockProducts.map(p => (
                                    <div key={p.id} className="p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 flex gap-3">
                                        <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0 text-red-500">
                                            <AlertTriangle className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-800 line-clamp-1">{p.name}</p>
                                            <p className="text-xs text-red-500">
                                                {p.stock === 0 ? 'نفذت الكمية!' : `متبقي ${p.stock} فقط`}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
             </div>

             {/* Export Button */}
             <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm font-bold shadow-sm"
             >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">تصدير CSV</span>
             </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8 border-b border-gray-200 overflow-x-auto">
        <nav className="flex -mb-px gap-8 min-w-max px-2" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`
              whitespace-nowrap pb-4 px-1 border-b-2 font-bold text-sm flex items-center gap-2 transition-all
              ${activeTab === 'dashboard'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            <LayoutGrid className="w-4 h-4" />
            نظرة عامة
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`
              whitespace-nowrap pb-4 px-1 border-b-2 font-bold text-sm flex items-center gap-2 transition-all
              ${activeTab === 'products'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            <Package className="w-4 h-4" />
            المنتجات
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`
              whitespace-nowrap pb-4 px-1 border-b-2 font-bold text-sm flex items-center gap-2 transition-all
              ${activeTab === 'categories'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            <Tags className="w-4 h-4" />
            التصنيفات
          </button>
          <button
            onClick={() => setActiveTab('brands')}
            className={`
              whitespace-nowrap pb-4 px-1 border-b-2 font-bold text-sm flex items-center gap-2 transition-all
              ${activeTab === 'brands'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            <Briefcase className="w-4 h-4" />
            العلامات التجارية
          </button>
        </nav>
      </div>

      {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in-up">
              {/* Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                          <DollarSign className="w-6 h-6" />
                      </div>
                      <div>
                          <p className="text-xs text-gray-500 font-bold mb-1">قيمة المخزون</p>
                          <p className="text-xl font-black text-gray-900 dir-ltr">{totalInventoryValue.toLocaleString()} SAR</p>
                      </div>
                  </div>
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                          <Package className="w-6 h-6" />
                      </div>
                      <div>
                          <p className="text-xs text-gray-500 font-bold mb-1">إجمالي المنتجات</p>
                          <p className="text-xl font-black text-gray-900">{products.length}</p>
                      </div>
                  </div>
                   <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                      <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                          <AlertTriangle className="w-6 h-6" />
                      </div>
                      <div>
                          <p className="text-xs text-gray-500 font-bold mb-1">تنبيهات المخزون</p>
                          <p className="text-xl font-black text-gray-900">{lowStockProducts.length}</p>
                      </div>
                  </div>
                   <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                      <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                          <Briefcase className="w-6 h-6" />
                      </div>
                      <div>
                          <p className="text-xs text-gray-500 font-bold mb-1">العلامات التجارية</p>
                          <p className="text-xl font-black text-gray-900">{brands.length}</p>
                      </div>
                  </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Chart / Stats */}
                  <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-6">
                          <h3 className="font-bold text-gray-900 flex items-center gap-2">
                              <BarChart3 className="w-5 h-5 text-gray-400" />
                              توزيع المنتجات حسب التصنيف
                          </h3>
                      </div>
                      <div className="space-y-4">
                          {categoryStats.map((cat, idx) => (
                              <div key={idx}>
                                  <div className="flex justify-between text-sm mb-1">
                                      <span className="font-medium text-gray-700">{cat.name}</span>
                                      <span className="text-gray-500">{cat.count} منتج ({cat.percentage}%)</span>
                                  </div>
                                  <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-primary rounded-full transition-all duration-1000"
                                        style={{ width: `${cat.percentage}%` }}
                                      ></div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>

                  {/* Quick Actions & Activity */}
                  <div className="space-y-6">
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                              <Activity className="w-5 h-5 text-gray-400" />
                              إجراءات سريعة
                          </h3>
                          <div className="grid grid-cols-2 gap-3">
                              <button 
                                onClick={() => { setActiveTab('products'); setTimeout(handleOpenAddProduct, 100); }}
                                className="p-4 bg-gray-50 rounded-xl hover:bg-primary hover:text-white transition-all text-center flex flex-col items-center gap-2 group"
                              >
                                  <Plus className="w-6 h-6 text-gray-500 group-hover:text-white" />
                                  <span className="text-xs font-bold">إضافة منتج</span>
                              </button>
                               <button 
                                onClick={handleExportCSV}
                                className="p-4 bg-gray-50 rounded-xl hover:bg-green-600 hover:text-white transition-all text-center flex flex-col items-center gap-2 group"
                              >
                                  <FileSpreadsheet className="w-6 h-6 text-gray-500 group-hover:text-white" />
                                  <span className="text-xs font-bold">تصدير Excel</span>
                              </button>
                          </div>
                      </div>

                       <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                              <TrendingUp className="w-5 h-5 text-gray-400" />
                              نشاط حديث
                          </h3>
                          <div className="space-y-4">
                               {/* Mock Activity Data */}
                               <div className="flex gap-3 items-start">
                                    <div className="w-2 h-2 mt-1.5 rounded-full bg-green-500 flex-shrink-0"></div>
                                    <div>
                                        <p className="text-sm text-gray-800">تم بيع 3 قطع من "سماعات رأس لاسلكية"</p>
                                        <p className="text-xs text-gray-400">منذ 15 دقيقة</p>
                                    </div>
                               </div>
                               <div className="flex gap-3 items-start">
                                    <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 flex-shrink-0"></div>
                                    <div>
                                        <p className="text-sm text-gray-800">تم تحديث مخزون "ساعة ذكية"</p>
                                        <p className="text-xs text-gray-400">منذ ساعة</p>
                                    </div>
                               </div>
                               <div className="flex gap-3 items-start">
                                    <div className="w-2 h-2 mt-1.5 rounded-full bg-amber-500 flex-shrink-0"></div>
                                    <div>
                                        <p className="text-sm text-gray-800">مخزون منخفض: حقيبة ظهر عصرية</p>
                                        <p className="text-xs text-gray-400">منذ ساعتين</p>
                                    </div>
                               </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

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
            
            {/* Stats Cards for Products Tab */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <Package className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">إجمالي المنتجات</p>
                    <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                </div>
                </div>
                
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                    <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">منتجات نفذت/منخفضة</p>
                    <p className="text-2xl font-bold text-gray-900">
                    {lowStockProducts.length}
                    </p>
                </div>
                </div>
            </div>

            {/* Advanced Search & Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 w-full">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                    type="text" 
                    placeholder="بحث باسم المنتج، التصنيف، أو العلامة التجارية..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white"
                    />
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors ${
                    showFilters 
                        ? 'bg-primary/5 border-primary text-primary' 
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>تصفية متقدمة</span>
                    {(searchId || minPrice || maxPrice || stockStatus !== 'all') && (
                    <span className="flex h-2 w-2 rounded-full bg-primary"></span>
                    )}
                </button>
                </div>

                {/* Expandable Filter Panel */}
                <div className={`transition-all duration-300 ease-in-out ${showFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 bg-gray-50/30">
                    {/* Filter by ID */}
                    <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2">رقم المنتج (ID)</label>
                    <input
                        type="text"
                        placeholder="مثال: 5"
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none"
                    />
                    </div>

                    {/* Filter by Price */}
                    <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2">نطاق السعر</label>
                    <div className="flex gap-2">
                        <input
                        type="number"
                        placeholder="من"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none"
                        />
                        <input
                        type="number"
                        placeholder="إلى"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none"
                        />
                    </div>
                    </div>

                    {/* Filter by Stock */}
                    <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2">حالة المخزون</label>
                    <select
                        value={stockStatus}
                        onChange={(e) => setStockStatus(e.target.value as StockStatus)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none bg-white"
                    >
                        <option value="all">الكل</option>
                        <option value="in_stock">متوفر (&gt; 5)</option>
                        <option value="low_stock">منخفض (1-5)</option>
                        <option value="out_of_stock">نفذت الكمية (0)</option>
                    </select>
                    </div>

                    {/* Reset Actions */}
                    <div className="flex items-end">
                    <button
                        onClick={resetFilters}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm font-medium transition-colors"
                    >
                        <RefreshCcw className="w-4 h-4" />
                        إعادة تعيين
                    </button>
                    </div>
                </div>
                </div>
            </div>

            {/* Products List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
                <div className="overflow-x-auto">
                <table className="w-full text-right">
                    <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">ID</th>
                        <th 
                        className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group select-none"
                        onClick={() => handleSort('name')}
                        >
                        <div className="flex items-center gap-2">
                            المنتج
                            <SortIcon field="name" currentSortField={sortField} sortDirection={sortDirection} />
                        </div>
                        </th>
                        <th 
                        className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group select-none"
                        onClick={() => handleSort('price')}
                        >
                        <div className="flex items-center gap-2">
                            السعر
                            <SortIcon field="price" currentSortField={sortField} sortDirection={sortDirection} />
                        </div>
                        </th>
                        <th 
                        className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group select-none"
                        onClick={() => handleSort('stock')}
                        >
                        <div className="flex items-center gap-2">
                            المخزون
                            <SortIcon field="stock" currentSortField={sortField} sortDirection={sortDirection} />
                        </div>
                        </th>
                        <th 
                        className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell cursor-pointer hover:bg-gray-100 transition-colors group select-none"
                        onClick={() => handleSort('category')}
                        >
                        <div className="flex items-center gap-2">
                            التصنيف
                            <SortIcon field="category" currentSortField={sortField} sortDirection={sortDirection} />
                        </div>
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">إجراءات</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {sortedProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4 text-gray-500 text-sm font-mono">#{product.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0 relative">
                                <img className="h-full w-full object-cover" src={product.images[0]} alt="" />
                                {product.stock === 0 && <span className="absolute bottom-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-1 ring-white"></span>}
                                {product.stock > 0 && product.stock <= 5 && <span className="absolute bottom-1 right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse ring-1 ring-white"></span>}
                            </div>
                            <div className="flex flex-col max-w-[200px]">
                                <span className="font-medium text-gray-900 truncate flex items-center gap-2" title={product.name}>
                                    {product.name}
                                </span>
                                <div className="flex gap-2">
                                    <span className="text-xs text-gray-500 truncate sm:hidden">{product.category}</span>
                                    {product.brand && <span className="text-xs text-gray-400 border-r border-gray-300 pr-2 mr-2">{product.brand}</span>}
                                </div>
                            </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-bold text-gray-900">{product.price} ر.س</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <StockBadge stock={product.stock} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                            <div className="flex flex-col gap-1">
                                <span className="px-2.5 py-1 inline-flex w-fit text-xs leading-5 font-semibold rounded-full bg-blue-50 text-blue-700">
                                {product.category}
                                </span>
                                {product.brand && (
                                    <span className="px-2.5 py-0.5 inline-flex w-fit text-[10px] leading-4 font-medium rounded-full bg-gray-100 text-gray-600">
                                    {product.brand}
                                    </span>
                                )}
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-left">
                            <div className="flex items-center justify-end gap-2">
                            <button 
                                onClick={() => handleOpenEditProduct(product)}
                                className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors"
                                title="تعديل"
                                disabled={isLoading}
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => setDeleteConfirmationId(product.id)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="حذف"
                                disabled={isLoading}
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            </div>
                        </td>
                        </tr>
                    ))}
                    {sortedProducts.length === 0 && (
                        <tr>
                        <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                            <div className="flex flex-col items-center justify-center gap-2">
                                <Search className="w-8 h-8 text-gray-300" />
                                <p>لا توجد منتجات مطابقة لمعايير البحث الحالية.</p>
                                <button onClick={resetFilters} className="text-primary hover:underline text-sm font-medium">إعادة تعيين المرشحات</button>
                            </div>
                        </td>
                        </tr>
                    )}
                    </tbody>
                </table>
                </div>
            </div>
        </div>
      )}

      {activeTab === 'categories' && (
          /* Categories View */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
              <div className="p-4 border-b border-gray-100 flex justify-end">
                   <button
                    onClick={handleOpenAddCategory}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 bg-primary hover:bg-secondary text-white px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-5 h-5" />
                    إضافة تصنيف جديد
                  </button>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-right">
                      <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">اسم التصنيف</th>
                              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">عدد المنتجات</th>
                              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">إجراءات</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                          {categories.map((category) => (
                              <tr key={category} className="hover:bg-gray-50/50 transition-colors">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex items-center gap-3">
                                          <div className="p-2 bg-blue-50 text-primary rounded-lg">
                                              <Layers className="w-4 h-4" />
                                          </div>
                                          <span className="font-bold text-gray-900">{category}</span>
                                      </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                          {getCategoryProductCount(category)} منتجات
                                      </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-left">
                                      <div className="flex items-center justify-end gap-2">
                                          <button 
                                              onClick={() => handleOpenEditCategory(category)}
                                              className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors"
                                              title="تعديل"
                                              disabled={isLoading}
                                          >
                                              <Edit2 className="w-4 h-4" />
                                          </button>
                                          <button 
                                              onClick={() => setDeleteCategoryConfirmation(category)}
                                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                              title="حذف"
                                              disabled={isLoading}
                                          >
                                              <Trash2 className="w-4 h-4" />
                                          </button>
                                      </div>
                                  </td>
                              </tr>
                          ))}
                          {categories.length === 0 && (
                               <tr>
                                  <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                                      لا توجد تصنيفات حالياً.
                                  </td>
                              </tr>
                          )}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {activeTab === 'brands' && (
          /* Brands View */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
              <div className="p-4 border-b border-gray-100 flex justify-end">
                   <button
                    onClick={handleOpenAddBrand}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 bg-primary hover:bg-secondary text-white px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-5 h-5" />
                    إضافة علامة تجارية
                  </button>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-right">
                      <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">العلامة التجارية</th>
                              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">عدد المنتجات</th>
                              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">إجراءات</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                          {brands.map((brand) => (
                              <tr key={brand} className="hover:bg-gray-50/50 transition-colors">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex items-center gap-3">
                                          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                              <Briefcase className="w-4 h-4" />
                                          </div>
                                          <span className="font-bold text-gray-900">{brand}</span>
                                      </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                          {getBrandProductCount(brand)} منتجات
                                      </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-left">
                                      <div className="flex items-center justify-end gap-2">
                                          <button 
                                              onClick={() => handleOpenEditBrand(brand)}
                                              className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors"
                                              title="تعديل"
                                              disabled={isLoading}
                                          >
                                              <Edit2 className="w-4 h-4" />
                                          </button>
                                          <button 
                                              onClick={() => setDeleteBrandConfirmation(brand)}
                                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                              title="حذف"
                                              disabled={isLoading}
                                          >
                                              <Trash2 className="w-4 h-4" />
                                          </button>
                                      </div>
                                  </td>
                              </tr>
                          ))}
                          {brands.length === 0 && (
                               <tr>
                                  <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                                      لا توجد علامات تجارية حالياً.
                                  </td>
                              </tr>
                          )}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {/* Add/Edit Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => !isLoading && setIsProductModalOpen(false)}>
              <div className="absolute inset-0 bg-gray-900/75 backdrop-blur-sm"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-2xl text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-lg leading-6 font-bold text-gray-900">
                    {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
                  </h3>
                  <button onClick={() => setIsProductModalOpen(false)} disabled={isLoading} className="text-gray-400 hover:text-gray-500 disabled:opacity-50">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <form id="productForm" onSubmit={handleProductSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">اسم المنتج</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      value={productFormData.name}
                      onChange={e => setProductFormData({...productFormData, name: e.target.value})}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">السعر (ر.س)</label>
                      <input
                        type="number"
                        required
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        value={productFormData.price}
                        onChange={e => setProductFormData({...productFormData, price: Number(e.target.value)})}
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">الكمية في المخزون</label>
                      <input
                        type="number"
                        required
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        value={productFormData.stock}
                        onChange={e => setProductFormData({...productFormData, stock: Number(e.target.value)})}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">التصنيف</label>
                        <div className="relative">
                            <select
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white appearance-none"
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">العلامة التجارية</label>
                        <div className="relative">
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white appearance-none"
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <div>
                          <label className="flex items-center gap-1.5 text-xs font-bold text-gray-600 mb-1.5">
                              <Palette className="w-3.5 h-3.5" />
                              الألوان المتاحة (افصل بفاصلة)
                          </label>
                          <input
                            type="text"
                            placeholder="مثال: أحمر, أزرق, أسود"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            value={colorsInput}
                            onChange={e => setColorsInput(e.target.value)}
                            disabled={isLoading}
                          />
                          {renderAttributePreview(colorsInput, true)}
                      </div>
                      <div>
                          <label className="flex items-center gap-1.5 text-xs font-bold text-gray-600 mb-1.5">
                              <Ruler className="w-3.5 h-3.5" />
                              المقاسات المتاحة (افصل بفاصلة)
                          </label>
                           <input
                            type="text"
                            placeholder="مثال: S, M, L, XL"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            value={sizesInput}
                            onChange={e => setSizesInput(e.target.value)}
                            disabled={isLoading}
                          />
                          {renderAttributePreview(sizesInput, false)}
                      </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">وصف مختصر</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="وصف قصير يظهر في البطاقة..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                      value={productFormData.description}
                      onChange={e => setProductFormData({...productFormData, description: e.target.value})}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">وصف تفصيلي (التفاصيل الكاملة)</label>
                    <textarea
                      rows={4}
                      placeholder="اكتب وصفاً مفصلاً للمنتج هنا..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                      value={productFormData.detailedDescription}
                      onChange={e => setProductFormData({...productFormData, detailedDescription: e.target.value})}
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">صور المنتج</label>
                    
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
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-left dir-ltr"
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
                        <button 
                            type="button" 
                            onClick={handleAddRandomImage}
                            disabled={isLoading}
                            className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                            title="توليد صورة عشوائية"
                        >
                            <ImageIcon className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Images List */}
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {productFormData.images.length === 0 && (
                            <div className="text-center py-4 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-gray-400 text-sm">
                                لا توجد صور مضافة
                            </div>
                        )}
                        {productFormData.images.map((img, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-2 border border-gray-200 rounded-lg bg-gray-50 group hover:bg-white transition-colors">
                                <div className="w-10 h-10 rounded-md bg-white border border-gray-200 overflow-hidden flex-shrink-0">
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                    <p className="text-xs text-gray-500 truncate dir-ltr font-mono">{img}</p>
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
                      className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:col-start-1 sm:text-sm"
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

      {/* Sensitive Changes Confirmation Modal */}
      {pendingProductChanges && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
             <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" onClick={() => !isLoading && setPendingProductChanges(null)}>
                    <div className="absolute inset-0 bg-gray-900/75 backdrop-blur-sm"></div>
                </div>
                <div className="inline-block align-bottom bg-white rounded-2xl text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                     <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                             <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 sm:mx-0 sm:h-10 sm:w-10">
                                <AlertTriangle className="h-6 w-6 text-amber-600" />
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:mr-4 sm:text-right">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">تأكيد التعديلات الحساسة</h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500 mb-2">
                                        لقد قمت بإجراء تعديلات على الحقول التالية التي قد تؤثر على تجربة المستخدمين:
                                    </p>
                                    <ul className="list-disc list-inside text-sm text-amber-600 font-bold mb-4">
                                        {pendingProductChanges.changes.map(change => (
                                            <li key={change}>
                                                {change === 'stock' ? 'المخزون' : change === 'price' ? 'السعر' : change === 'category' ? 'التصنيف' : 'العلامة التجارية'}
                                            </li>
                                        ))}
                                    </ul>
                                    <p className="text-sm text-gray-500">
                                        هل أنت متأكد من رغبتك في تطبيق هذه التغييرات؟
                                    </p>
                                </div>
                            </div>
                        </div>
                     </div>
                      <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                         <button
                            type="button"
                            disabled={isLoading}
                            onClick={confirmProductChanges}
                            className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-amber-600 text-base font-medium text-white hover:bg-amber-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                        >
                            {isLoading ? 'جاري التطبيق...' : 'نعم، قم بالتعديل'}
                        </button>
                        <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => setPendingProductChanges(null)}
                            className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            إلغاء
                        </button>
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
                    <div className="inline-block align-bottom bg-white rounded-2xl text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md w-full">
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="flex justify-between items-center mb-5">
                                <h3 className="text-lg leading-6 font-bold text-gray-900">
                                    {editingCategory ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
                                </h3>
                                <button onClick={() => setIsCategoryModalOpen(false)} disabled={isLoading} className="text-gray-400 hover:text-gray-500 disabled:opacity-50">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleCategorySubmit}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">اسم التصنيف</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
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
                                        className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:col-start-1 sm:text-sm"
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
                    <div className="inline-block align-bottom bg-white rounded-2xl text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md w-full">
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="flex justify-between items-center mb-5">
                                <h3 className="text-lg leading-6 font-bold text-gray-900">
                                    {editingBrand ? 'تعديل العلامة التجارية' : 'إضافة علامة تجارية'}
                                </h3>
                                <button onClick={() => setIsBrandModalOpen(false)} disabled={isLoading} className="text-gray-400 hover:text-gray-500 disabled:opacity-50">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleBrandSubmit}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">اسم العلامة التجارية</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
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
                                        className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:col-start-1 sm:text-sm"
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

      {/* Delete Confirmation Modal */}
      {(deleteConfirmationId !== null || deleteCategoryConfirmation !== null || deleteBrandConfirmation !== null) && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => {
                if (!isLoading) {
                    setDeleteConfirmationId(null);
                    setDeleteCategoryConfirmation(null);
                    setDeleteBrandConfirmation(null);
                }
            }}>
                <div className="absolute inset-0 bg-gray-900/75 backdrop-blur-sm"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-2xl text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <div className="mt-3 text-center sm:mt-0 sm:mr-4 sm:text-right">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                {deleteConfirmationId ? 'حذف المنتج' : deleteCategoryConfirmation ? 'حذف التصنيف' : 'حذف العلامة التجارية'}
                            </h3>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500">
                                    {deleteConfirmationId 
                                        ? 'هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.' 
                                        : deleteCategoryConfirmation 
                                            ? `هل أنت متأكد من حذف تصنيف "${deleteCategoryConfirmation}"؟ سيتم إزالة التصنيف من جميع المنتجات المرتبطة.`
                                            : `هل أنت متأكد من حذف العلامة التجارية "${deleteBrandConfirmation}"؟ سيتم إزالتها من جميع المنتجات المرتبطة.`
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => {
                            if (deleteConfirmationId) handleConfirmDeleteProduct();
                            else if (deleteCategoryConfirmation) handleConfirmDeleteCategory();
                            else if (deleteBrandConfirmation) handleConfirmDeleteBrand();
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
                        }}
                        className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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