
import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ArrowRight, User as UserIcon } from 'lucide-react';

interface AdminLoginProps {
  onLogin: () => void;
  onCancel: () => void;
  onUserLoginClick: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onCancel, onUserLoginClick }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Hardcoded credentials for demonstration
    if (username === 'admin' && password === 'admin123') {
      onLogin();
    } else {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-secondary p-8 text-center">
            <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-sm mb-4">
                <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">تسجيل دخول المشرف</h2>
            <p className="text-blue-100 mt-2 text-sm">الرجاء إدخال بيانات الاعتماد للمتابعة</p>
        </div>

        <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-medium border border-red-100">
                        {error}
                    </div>
                )}
                
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 block">اسم المستخدم</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="block w-full pr-10 pl-3 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            placeholder="اسم المستخدم"
                            dir="ltr"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 block">كلمة المرور</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full pr-10 pl-10 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            placeholder="••••••••"
                            dir="ltr"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                <div className="pt-4 flex gap-3">
                    <button
                        type="submit"
                        className="flex-1 bg-primary hover:bg-secondary text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <span>دخول</span>
                        <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                    >
                        إلغاء
                    </button>
                </div>
            </form>
            
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                 <button
                  onClick={onUserLoginClick}
                  className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <UserIcon className="w-4 h-4" />
                  دخول الأعضاء (العملاء)
                </button>
                <p className="text-xs text-gray-400 mt-4">بيانات تجريبية: admin / admin123</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
