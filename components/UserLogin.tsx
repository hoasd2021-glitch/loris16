
import React, { useState } from 'react';
import { Lock, Mail, User as UserIcon, X, ArrowRight, Loader2 } from 'lucide-react';
import { User } from '../types';

interface UserLoginProps {
  onLogin: (user: User) => void;
  onCancel: () => void;
}

const UserLogin: React.FC<UserLoginProps> = ({ onLogin, onCancel }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    identifier: '', // Can be email or username
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (!formData.identifier || !formData.password) {
      setError('الرجاء تعبئة جميع الحقول المطلوبة');
      setIsLoading(false);
      return;
    }

    if (isRegistering && !formData.name) {
      setError('الرجاء إدخال الاسم الكامل');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      setIsLoading(false);
      return;
    }

    // Mock successful login/register
    // In a real app, backend would validate credentials
    const isEmail = formData.identifier.includes('@');
    const user: User = {
      id: Date.now().toString(),
      name: isRegistering ? formData.name : (isEmail ? formData.identifier.split('@')[0] : formData.identifier),
      email: isEmail ? formData.identifier : `${formData.identifier}@example.com`, // Mock email if username used
      role: 'customer',
      joinDate: new Date().toISOString().split('T')[0]
    };

    onLogin(user);
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative">
        <button 
          onClick={onCancel}
          className="absolute top-4 left-4 p-2 bg-white/10 hover:bg-black/5 rounded-full text-gray-500 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="bg-gradient-to-br from-primary via-blue-600 to-secondary p-8 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <div className="mx-auto bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center backdrop-blur-md mb-4 shadow-lg rotate-3 border border-white/30">
                <UserIcon className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold">{isRegistering ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}</h2>
            <p className="text-blue-100 mt-2 text-sm">استمتع بتجربة تسوق كاملة ومميزات حصرية</p>
        </div>

        <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center font-medium border border-red-100 flex items-center justify-center gap-2 animate-pulse">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                        {error}
                    </div>
                )}
                
                {isRegistering && (
                  <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-600 mr-1">الاسم الكامل</label>
                      <div className="relative group">
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <UserIcon className="h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                          </div>
                          <input
                              type="text"
                              value={formData.name}
                              onChange={(e) => setFormData({...formData, name: e.target.value})}
                              className="block w-full pr-10 pl-3 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                              placeholder="الاسم الكامل"
                          />
                      </div>
                  </div>
                )}

                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 mr-1">اسم المستخدم أو البريد الإلكتروني</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <Mail className="h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                        </div>
                        <input
                            type="text"
                            value={formData.identifier}
                            onChange={(e) => setFormData({...formData, identifier: e.target.value})}
                            className="block w-full pr-10 pl-3 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                            placeholder="username / example@mail.com"
                            dir="ltr"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 mr-1">كلمة المرور</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <Lock className="h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                        </div>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            className="block w-full pr-10 pl-3 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                            placeholder="••••••••"
                            dir="ltr"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-secondary text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <span>{isRegistering ? 'إنشاء الحساب' : 'تسجيل الدخول'}</span>
                        <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                      </>
                    )}
                </button>
            </form>
            
            <div className="mt-6 text-center space-y-4">
                <p className="text-sm text-gray-500">
                    {isRegistering ? 'لديك حساب بالفعل؟' : 'ليس لديك حساب؟'}
                    <button 
                      onClick={() => {
                        setIsRegistering(!isRegistering);
                        setError('');
                        setFormData({ name: '', identifier: '', password: '' });
                      }}
                      className="text-primary font-bold hover:underline mr-1"
                    >
                        {isRegistering ? 'سجل دخولك' : 'أنشئ حساباً جديداً'}
                    </button>
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
