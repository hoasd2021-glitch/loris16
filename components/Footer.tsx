
import React from 'react';
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Store } from 'lucide-react';
import { ViewState } from '../types';
import { APP_NAME } from '../constants';

interface FooterProps {
  onNavigate: (view: ViewState) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-xl">
               <div className="bg-primary p-1.5 rounded-lg">
                  <Store className="h-6 w-6 text-white" />
               </div>
               {APP_NAME}
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              وجهتك الأولى للتسوق الإلكتروني. نقدم أفضل المنتجات بأسعار تنافسية وجودة عالية.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-primary transition-colors"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="hover:text-primary transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="hover:text-primary transition-colors"><Instagram className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-6">روابط سريعة</h3>
            <ul className="space-y-3 text-sm">
              <li><button onClick={() => onNavigate(ViewState.HOME)} className="hover:text-primary transition-colors">الرئيسية</button></li>
              <li><button onClick={() => onNavigate(ViewState.ABOUT)} className="hover:text-primary transition-colors">من نحن</button></li>
              <li><button onClick={() => onNavigate(ViewState.CONTACT)} className="hover:text-primary transition-colors">اتصل بنا</button></li>
              <li><button onClick={() => onNavigate(ViewState.FAQ)} className="hover:text-primary transition-colors">الأسئلة الشائعة</button></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white font-bold mb-6">خدمة العملاء</h3>
            <ul className="space-y-3 text-sm">
              <li><button onClick={() => onNavigate(ViewState.TRACK_ORDER)} className="hover:text-primary transition-colors">تتبع الطلب</button></li>
              <li><button onClick={() => onNavigate(ViewState.FAQ)} className="hover:text-primary transition-colors">سياسة الاسترجاع</button></li>
              <li><button onClick={() => onNavigate(ViewState.ABOUT)} className="hover:text-primary transition-colors">الشروط والأحكام</button></li>
              <li><button onClick={() => onNavigate(ViewState.ABOUT)} className="hover:text-primary transition-colors">سياسة الخصوصية</button></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-bold mb-6">تواصل معنا</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                <span>صنعاء ـ الجمهورية اليمنية -حده</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="dir-ltr">+967 774889095</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <span>hossams@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} {APP_NAME}. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
