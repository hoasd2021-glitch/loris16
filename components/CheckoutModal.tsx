
import React, { useState, useEffect } from 'react';
import { X, CreditCard, MapPin, Phone, User, CheckCircle, Loader2, Banknote, Home, Briefcase, ChevronDown, Ticket, Plus, ArrowLeft, ArrowRight } from 'lucide-react';
import { CartItem, Currency, ShippingOption, Address, Coupon, ExchangeRates } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  totalAmount: number;
  currency: Currency;
  exchangeRates: ExchangeRates;
  shippingOption: ShippingOption;
  onPlaceOrder: (address: string, payment: string) => Promise<void>;
  savedAddresses?: Address[];
  coupons?: Coupon[];
}

const countryCodes = [
  // Arab Countries
  { code: 'SA', dial_code: '+966', flag: '🇸🇦', name: 'السعودية' },
  { code: 'AE', dial_code: '+971', flag: '🇦🇪', name: 'الإمارات' },
  { code: 'KW', dial_code: '+965', flag: '🇰🇼', name: 'الكويت' },
  { code: 'QA', dial_code: '+974', flag: '🇶🇦', name: 'قطر' },
  { code: 'BH', dial_code: '+973', flag: '🇧🇭', name: 'البحرين' },
  { code: 'OM', dial_code: '+968', flag: '🇴🇲', name: 'عمان' },
  { code: 'YE', dial_code: '+967', flag: '🇾🇪', name: 'اليمن' },
  { code: 'IQ', dial_code: '+964', flag: '🇮🇶', name: 'العراق' },
  { code: 'JO', dial_code: '+962', flag: '🇯🇴', name: 'الأردن' },
  { code: 'LB', dial_code: '+961', flag: '🇱🇧', name: 'لبنان' },
  { code: 'PS', dial_code: '+970', flag: '🇵🇸', name: 'فلسطين' },
  { code: 'SY', dial_code: '+963', flag: '🇸🇾', name: 'سوريا' },
  { code: 'EG', dial_code: '+20', flag: '🇪🇬', name: 'مصر' },
  { code: 'SD', dial_code: '+249', flag: '🇸🇩', name: 'السودان' },
  { code: 'LY', dial_code: '+218', flag: '🇱🇾', name: 'ليبيا' },
  { code: 'TN', dial_code: '+216', flag: '🇹🇳', name: 'تونس' },
  { code: 'DZ', dial_code: '+213', flag: '🇩🇿', name: 'الجزائر' },
  { code: 'MA', dial_code: '+212', flag: '🇲🇦', name: 'المغرب' },
  { code: 'MR', dial_code: '+222', flag: '🇲🇷', name: 'موريتانيا' },
  { code: 'SO', dial_code: '+252', flag: '🇸🇴', name: 'الصومال' },
  { code: 'DJ', dial_code: '+253', flag: '🇩🇯', name: 'جيبوتي' },
  { code: 'KM', dial_code: '+269', flag: '🇰🇲', name: 'جزر القمر' },

  // World Countries
  { code: 'AF', dial_code: '+93', flag: '🇦🇫', name: 'أفغانستان' },
  { code: 'AL', dial_code: '+355', flag: '🇦🇱', name: 'ألبانيا' },
  { code: 'DE', dial_code: '+49', flag: '🇩🇪', name: 'ألمانيا' },
  { code: 'US', dial_code: '+1', flag: '🇺🇸', name: 'أمريكا' },
  { code: 'AD', dial_code: '+376', flag: '🇦🇩', name: 'أندورا' },
  { code: 'AO', dial_code: '+244', flag: '🇦🇴', name: 'أنغولا' },
  { code: 'AI', dial_code: '+1264', flag: '🇦🇮', name: 'أنغويلا' },
  { code: 'AG', dial_code: '+1268', flag: '🇦🇬', name: 'أنتيغوا وباربودا' },
  { code: 'AR', dial_code: '+54', flag: '🇦🇷', name: 'الأرجنتين' },
  { code: 'AM', dial_code: '+374', flag: '🇦🇲', name: 'أرمينيا' },
  { code: 'AW', dial_code: '+297', flag: '🇦🇼', name: 'أروبا' },
  { code: 'AU', dial_code: '+61', flag: '🇦🇺', name: 'أستراليا' },
  { code: 'AT', dial_code: '+43', flag: '🇦🇹', name: 'النمسا' },
  { code: 'AZ', dial_code: '+994', flag: '🇦🇿', name: 'أذربيجان' },
  { code: 'BS', dial_code: '+1242', flag: '🇧🇸', name: 'الباهاما' },
  { code: 'BD', dial_code: '+880', flag: '🇧🇩', name: 'بنغلاديش' },
  { code: 'BB', dial_code: '+1246', flag: '🇧🇧', name: 'بربادوس' },
  { code: 'BY', dial_code: '+375', flag: '🇧🇾', name: 'بيلاروسيا' },
  { code: 'BE', dial_code: '+32', flag: '🇧🇪', name: 'بلجيكا' },
  { code: 'BZ', dial_code: '+501', flag: '🇧🇿', name: 'بليز' },
  { code: 'BJ', dial_code: '+229', flag: '🇧🇯', name: 'بنين' },
  { code: 'BM', dial_code: '+1441', flag: '🇧🇲', name: 'برمودا' },
  { code: 'BT', dial_code: '+975', flag: '🇧🇹', name: 'بوتان' },
  { code: 'BO', dial_code: '+591', flag: '🇧🇴', name: 'بوليفيا' },
  { code: 'BA', dial_code: '+387', flag: '🇧🇦', name: 'البوسنة والهرسك' },
  { code: 'BW', dial_code: '+267', flag: '🇧🇼', name: 'بوتسوانا' },
  { code: 'BR', dial_code: '+55', flag: '🇧🇷', name: 'البرازيل' },
  { code: 'BN', dial_code: '+673', flag: '🇧🇳', name: 'بروناي' },
  { code: 'BG', dial_code: '+359', flag: '🇧🇬', name: 'بلغاريا' },
  { code: 'BF', dial_code: '+226', flag: '🇧🇫', name: 'بوركينا فاسو' },
  { code: 'BI', dial_code: '+257', flag: '🇧🇮', name: 'بوروندي' },
  { code: 'KH', dial_code: '+855', flag: '🇰🇭', name: 'كمبوديا' },
  { code: 'CM', dial_code: '+237', flag: '🇨🇲', name: 'الكاميرون' },
  { code: 'CA', dial_code: '+1', flag: '🇨🇦', name: 'كندا' },
  { code: 'CV', dial_code: '+238', flag: '🇨🇻', name: 'الرأس الأخضر' },
  { code: 'KY', dial_code: '+1345', flag: '🇰🇾', name: 'جزر كايمان' },
  { code: 'CF', dial_code: '+236', flag: '🇨🇫', name: 'جمهورية أفريقيا الوسطى' },
  { code: 'TD', dial_code: '+235', flag: '🇹🇩', name: 'تشاد' },
  { code: 'CL', dial_code: '+56', flag: '🇨🇱', name: 'تشيلي' },
  { code: 'CN', dial_code: '+86', flag: '🇨🇳', name: 'الصين' },
  { code: 'CO', dial_code: '+57', flag: '🇨🇴', name: 'كولومبيا' },
  { code: 'CG', dial_code: '+242', flag: '🇨🇬', name: 'الكونغو - برازافيل' },
  { code: 'CD', dial_code: '+243', flag: '🇨🇩', name: 'الكونغو - كينشاسا' },
  { code: 'CK', dial_code: '+682', flag: '🇨🇰', name: 'جزر كوك' },
  { code: 'CR', dial_code: '+506', flag: '🇨🇷', name: 'كوستاريكا' },
  { code: 'HR', dial_code: '+385', flag: '🇭🇷', name: 'كرواتيا' },
  { code: 'CU', dial_code: '+53', flag: '🇨🇺', name: 'كوبا' },
  { code: 'CY', dial_code: '+357', flag: '🇨🇾', name: 'قبرص' },
  { code: 'CZ', dial_code: '+420', flag: '🇨🇿', name: 'التشيك' },
  { code: 'DK', dial_code: '+45', flag: '🇩🇰', name: 'الدانمارك' },
  { code: 'DM', dial_code: '+1767', flag: '🇩🇲', name: 'دومينيكا' },
  { code: 'DO', dial_code: '+1809', flag: '🇩🇴', name: 'جمهورية الدومينيكان' },
  { code: 'EC', dial_code: '+593', flag: '🇪🇨', name: 'الإكوادور' },
  { code: 'SV', dial_code: '+503', flag: '🇸🇻', name: 'السلفادور' },
  { code: 'GQ', dial_code: '+240', flag: '🇬🇶', name: 'غينيا الاستوائية' },
  { code: 'ER', dial_code: '+291', flag: '🇪🇷', name: 'إريتريا' },
  { code: 'EE', dial_code: '+372', flag: '🇪🇪', name: 'إستونيا' },
  { code: 'ET', dial_code: '+251', flag: '🇪🇹', name: 'إثيوبيا' },
  { code: 'FK', dial_code: '+500', flag: '🇫🇰', name: 'جزر فوكلاند' },
  { code: 'FO', dial_code: '+298', flag: '🇫🇴', name: 'جزر فارو' },
  { code: 'FJ', dial_code: '+679', flag: '🇫🇯', name: 'فيجي' },
  { code: 'FI', dial_code: '+358', flag: '🇫🇮', name: 'فنلندا' },
  { code: 'FR', dial_code: '+33', flag: '🇫🇷', name: 'فرنسا' },
  { code: 'GF', dial_code: '+594', flag: '🇬🇫', name: 'غويانا الفرنسية' },
  { code: 'PF', dial_code: '+689', flag: '🇵🇫', name: 'بولينيزيا الفرنسية' },
  { code: 'GA', dial_code: '+241', flag: '🇬🇦', name: 'الغابون' },
  { code: 'GM', dial_code: '+220', flag: '🇬🇲', name: 'غامبيا' },
  { code: 'GE', dial_code: '+995', flag: '🇬🇪', name: 'جورجيا' },
  { code: 'GH', dial_code: '+233', flag: '🇬🇭', name: 'غانا' },
  { code: 'GI', dial_code: '+350', flag: '🇬🇮', name: 'جبل طارق' },
  { code: 'GR', dial_code: '+30', flag: '🇬🇷', name: 'اليونان' },
  { code: 'GL', dial_code: '+299', flag: '🇬🇱', name: 'جرينلاند' },
  { code: 'GD', dial_code: '+1473', flag: '🇬🇩', name: 'غرينادا' },
  { code: 'GP', dial_code: '+590', flag: '🇬🇵', name: 'جوادلوب' },
  { code: 'GU', dial_code: '+1671', flag: '🇬🇺', name: 'غوام' },
  { code: 'GT', dial_code: '+502', flag: '🇬🇹', name: 'غواتيمالا' },
  { code: 'GN', dial_code: '+224', flag: '🇬🇳', name: 'غينيا' },
  { code: 'GW', dial_code: '+245', flag: '🇬🇼', name: 'غينيا بيساو' },
  { code: 'GY', dial_code: '+592', flag: '🇬🇾', name: 'غيانا' },
  { code: 'HT', dial_code: '+509', flag: '🇭🇹', name: 'هايتي' },
  { code: 'HN', dial_code: '+504', flag: '🇭🇳', name: 'هندوراس' },
  { code: 'HK', dial_code: '+852', flag: '🇭🇰', name: 'هونغ كونغ' },
  { code: 'HU', dial_code: '+36', flag: '🇭🇺', name: 'هنغاريا' },
  { code: 'IS', dial_code: '+354', flag: '🇮🇸', name: 'أيسلندا' },
  { code: 'IN', dial_code: '+91', flag: '🇮🇳', name: 'الهند' },
  { code: 'ID', dial_code: '+62', flag: '🇮🇩', name: 'إندونيسيا' },
  { code: 'IR', dial_code: '+98', flag: '🇮🇷', name: 'إيران' },
  { code: 'IE', dial_code: '+353', flag: '🇮🇪', name: 'أيرلندا' },
  { code: 'IT', dial_code: '+39', flag: '🇮🇹', name: 'إيطاليا' },
  { code: 'IV', dial_code: '+225', flag: '🇨🇮', name: 'ساحل العاج' },
  { code: 'JM', dial_code: '+1876', flag: '🇯🇲', name: 'جامايكا' },
  { code: 'JP', dial_code: '+81', flag: '🇯🇵', name: 'اليابان' },
  { code: 'KZ', dial_code: '+7', flag: '🇰🇿', name: 'كازاخستان' },
  { code: 'KE', dial_code: '+254', flag: '🇰🇪', name: 'كينيا' },
  { code: 'KI', dial_code: '+686', flag: '🇰🇮', name: 'كيريباتي' },
  { code: 'KP', dial_code: '+850', flag: '🇰🇵', name: 'كوريا الشمالية' },
  { code: 'KR', dial_code: '+82', flag: '🇰🇷', name: 'كوريا الجنوبية' },
  { code: 'KG', dial_code: '+996', flag: '🇰🇬', name: 'قرغيزستان' },
  { code: 'LA', dial_code: '+856', flag: '🇱🇦', name: 'لاوس' },
  { code: 'LV', dial_code: '+371', flag: '🇱🇻', name: 'لاتفيا' },
  { code: 'LS', dial_code: '+266', flag: '🇱🇸', name: 'ليسوتو' },
  { code: 'LR', dial_code: '+231', flag: '🇱🇷', name: 'ليبيريا' },
  { code: 'LI', dial_code: '+423', flag: '🇱🇮', name: 'ليختنشتاين' },
  { code: 'LT', dial_code: '+370', flag: '🇱🇹', name: 'ليتوانيا' },
  { code: 'LU', dial_code: '+352', flag: '🇱🇺', name: 'لوكسمبورغ' },
  { code: 'MO', dial_code: '+853', flag: '🇲🇴', name: 'ماكاو' },
  { code: 'MK', dial_code: '+389', flag: '🇲🇰', name: 'مقدونيا' },
  { code: 'MG', dial_code: '+261', flag: '🇲🇬', name: 'مدغشقر' },
  { code: 'MW', dial_code: '+265', flag: '🇲🇼', name: 'ملاوي' },
  { code: 'MY', dial_code: '+60', flag: '🇲🇾', name: 'ماليزيا' },
  { code: 'MV', dial_code: '+960', flag: '🇲🇻', name: 'المالديف' },
  { code: 'ML', dial_code: '+223', flag: '🇲🇱', name: 'مالي' },
  { code: 'MT', dial_code: '+356', flag: '🇲🇹', name: 'مالطا' },
  { code: 'MH', dial_code: '+692', flag: '🇲🇭', name: 'جزر مارشال' },
  { code: 'MQ', dial_code: '+596', flag: '🇲🇶', name: 'مارتينيك' },
  { code: 'MU', dial_code: '+230', flag: '🇲🇺', name: 'موريشيوس' },
  { code: 'YT', dial_code: '+262', flag: '🇾🇹', name: 'مايوت' },
  { code: 'MX', dial_code: '+52', flag: '🇲🇽', name: 'المكسيك' },
  { code: 'FM', dial_code: '+691', flag: '🇫🇲', name: 'ميكرونيزيا' },
  { code: 'MD', dial_code: '+373', flag: '🇲🇩', name: 'مولدوفا' },
  { code: 'MC', dial_code: '+377', flag: '🇲🇨', name: 'موناكو' },
  { code: 'MN', dial_code: '+976', flag: '🇲🇳', name: 'منغوليا' },
  { code: 'MS', dial_code: '+1664', flag: '🇲🇸', name: 'مونتسرات' },
  { code: 'MZ', dial_code: '+258', flag: '🇲🇿', name: 'موزمبيق' },
  { code: 'MM', dial_code: '+95', flag: '🇲🇲', name: 'ميانمار' },
  { code: 'NA', dial_code: '+264', flag: '🇳🇦', name: 'ناميبيا' },
  { code: 'NR', dial_code: '+674', flag: '🇳🇷', name: 'ناورو' },
  { code: 'NP', dial_code: '+977', flag: '🇳🇵', name: 'نيبال' },
  { code: 'NL', dial_code: '+31', flag: '🇳🇱', name: 'هولندا' },
  { code: 'NC', dial_code: '+687', flag: '🇳🇨', name: 'كاليدونيا الجديدة' },
  { code: 'NZ', dial_code: '+64', flag: '🇳🇿', name: 'نيوزيلندا' },
  { code: 'NI', dial_code: '+505', flag: '🇳🇮', name: 'نيكاراغوا' },
  { code: 'NE', dial_code: '+227', flag: '🇳🇪', name: 'النيجر' },
  { code: 'NG', dial_code: '+234', flag: '🇳🇬', name: 'نيجيريا' },
  { code: 'NU', dial_code: '+683', flag: '🇳🇺', name: 'نيوي' },
  { code: 'NF', dial_code: '+672', flag: '🇳🇫', name: 'جزيرة نورفولك' },
  { code: 'MP', dial_code: '+1670', flag: '🇲🇵', name: 'جزر ماريانا الشمالية' },
  { code: 'NO', dial_code: '+47', flag: '🇳🇴', name: 'النرويج' },
  { code: 'PK', dial_code: '+92', flag: '🇵🇰', name: 'باكستان' },
  { code: 'PW', dial_code: '+680', flag: '🇵🇼', name: 'بالاو' },
  { code: 'PA', dial_code: '+507', flag: '🇵🇦', name: 'بنما' },
  { code: 'PG', dial_code: '+675', flag: '🇵🇬', name: 'بابوا غينيا الجديدة' },
  { code: 'PY', dial_code: '+595', flag: '🇵🇾', name: 'باراغواي' },
  { code: 'PE', dial_code: '+51', flag: '🇵🇪', name: 'بيرو' },
  { code: 'PH', dial_code: '+63', flag: '🇵🇭', name: 'الفلبين' },
  { code: 'PL', dial_code: '+48', flag: '🇵🇱', name: 'بولندا' },
  { code: 'PT', dial_code: '+351', flag: '🇵🇹', name: 'البرتغال' },
  { code: 'PR', dial_code: '+1787', flag: '🇵🇷', name: 'بورتوريكو' },
  { code: 'RE', dial_code: '+262', flag: '🇷🇪', name: 'ريونيون' },
  { code: 'RO', dial_code: '+40', flag: '🇷🇴', name: 'رومانيا' },
  { code: 'RU', dial_code: '+7', flag: '🇷🇺', name: 'روسيا' },
  { code: 'RW', dial_code: '+250', flag: '🇷🇼', name: 'رواندا' },
  { code: 'SH', dial_code: '+290', flag: '🇸🇭', name: 'سانت هيلانة' },
  { code: 'KN', dial_code: '+1869', flag: '🇰🇳', name: 'سانت كيتس ونيفيس' },
  { code: 'LC', dial_code: '+1758', flag: '🇱🇨', name: 'سانت لوسيا' },
  { code: 'PM', dial_code: '+508', flag: '🇵🇲', name: 'سان بيير وميكلون' },
  { code: 'VC', dial_code: '+1784', flag: '🇻🇨', name: 'سانت فنسنت وجزر غرينادين' },
  { code: 'WS', dial_code: '+685', flag: '🇼🇸', name: 'ساموا' },
  { code: 'SM', dial_code: '+378', flag: '🇸🇲', name: 'سان مارينو' },
  { code: 'ST', dial_code: '+239', flag: '🇸🇹', name: 'ساو تومي وبرينسيب' },
  { code: 'SN', dial_code: '+221', flag: '🇸🇳', name: 'السنغال' },
  { code: 'CS', dial_code: '+381', flag: '🇷🇸', name: 'صربيا' },
  { code: 'SC', dial_code: '+248', flag: '🇸🇨', name: 'سيشيل' },
  { code: 'SL', dial_code: '+232', flag: '🇸🇱', name: 'سيراليون' },
  { code: 'SG', dial_code: '+65', flag: '🇸🇬', name: 'سنغافورة' },
  { code: 'SK', dial_code: '+421', flag: '🇸🇰', name: 'سلوفاكيا' },
  { code: 'SI', dial_code: '+386', flag: '🇸🇮', name: 'سلوفينيا' },
  { code: 'SB', dial_code: '+677', flag: '🇸🇧', name: 'جزر سليمان' },
  { code: 'ZA', dial_code: '+27', flag: '🇿🇦', name: 'جنوب أفريقيا' },
  { code: 'ES', dial_code: '+34', flag: '🇪🇸', name: 'إسبانيا' },
  { code: 'LK', dial_code: '+94', flag: '🇱🇰', name: 'سريلانكا' },
  { code: 'SR', dial_code: '+597', flag: '🇸🇷', name: 'سورينام' },
  { code: 'SZ', dial_code: '+268', flag: '🇸🇿', name: 'سوازيلاند' },
  { code: 'SE', dial_code: '+46', flag: '🇸🇪', name: 'السويد' },
  { code: 'CH', dial_code: '+41', flag: '🇨🇭', name: 'سويسرا' },
  { code: 'TW', dial_code: '+886', flag: '🇹🇼', name: 'تايوان' },
  { code: 'TJ', dial_code: '+992', flag: '🇹🇯', name: 'طاجيكستان' },
  { code: 'TZ', dial_code: '+255', flag: '🇹🇿', name: 'تنزانيا' },
  { code: 'TH', dial_code: '+66', flag: '🇹🇭', name: 'تايلاند' },
  { code: 'TL', dial_code: '+670', flag: '🇹🇱', name: 'تيمور الشرقية' },
  { code: 'TG', dial_code: '+228', flag: '🇹🇬', name: 'توغو' },
  { code: 'TK', dial_code: '+690', flag: '🇹🇰', name: 'توكيلاو' },
  { code: 'TO', dial_code: '+676', flag: '🇹🇴', name: 'تونغا' },
  { code: 'TT', dial_code: '+1868', flag: '🇹🇹', name: 'ترينيداد وتوباغو' },
  { code: 'TR', dial_code: '+90', flag: '🇹🇷', name: 'تركيا' },
  { code: 'TM', dial_code: '+993', flag: '🇹🇲', name: 'تركمانستان' },
  { code: 'TC', dial_code: '+1649', flag: '🇹🇨', name: 'جزر تركس وكايكوس' },
  { code: 'TV', dial_code: '+688', flag: '🇹🇻', name: 'توفالو' },
  { code: 'UG', dial_code: '+256', flag: '🇺🇬', name: 'أوغندا' },
  { code: 'UA', dial_code: '+380', flag: '🇺🇦', name: 'أوكرانيا' },
  { code: 'GB', dial_code: '+44', flag: '🇬🇧', name: 'المملكة المتحدة' },
  { code: 'UY', dial_code: '+598', flag: '🇺🇾', name: 'أوروغواي' },
  { code: 'UZ', dial_code: '+998', flag: '🇺🇿', name: 'أوزبكستان' },
  { code: 'VU', dial_code: '+678', flag: '🇻🇺', name: 'فانواتو' },
  { code: 'VE', dial_code: '+58', flag: '🇻🇪', name: 'فنزويلا' },
  { code: 'VN', dial_code: '+84', flag: '🇻🇳', name: 'فيتنام' },
  { code: 'VG', dial_code: '+1284', flag: '🇻🇬', name: 'جزر العذراء البريطانية' },
  { code: 'VI', dial_code: '+1340', flag: '🇻🇮', name: 'جزر العذراء الأمريكية' },
  { code: 'WF', dial_code: '+681', flag: '🇼🇫', name: 'واليس وفوتونا' },
  { code: 'ZM', dial_code: '+260', flag: '🇿🇲', name: 'زامبيا' },
  { code: 'ZW', dial_code: '+263', flag: '🇿🇼', name: 'زيمبابوي' },
];

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  totalAmount,
  currency,
  exchangeRates,
  shippingOption,
  onPlaceOrder,
  savedAddresses = [],
  coupons = []
}) => {
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod'>('card');
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [selectedCountryCode, setSelectedCountryCode] = useState('+966');
  
  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    city: '',
    phone: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });

  // Auto-fill form when a saved address is selected
  useEffect(() => {
      if (selectedAddressId && savedAddresses) {
          const addr = savedAddresses.find(a => a.id === selectedAddressId);
          if (addr) {
              setFormData(prev => ({
                  ...prev,
                  fullName: addr.recipientName,
                  address: addr.street,
                  city: addr.city,
                  phone: addr.phone
              }));
          }
      }
  }, [selectedAddressId, savedAddresses]);

  if (!isOpen) return null;

  const handleApplyCoupon = () => {
      setCouponError('');
      const code = couponCode.trim().toUpperCase();
      if (!code) return;

      const coupon = coupons.find(c => c.code === code && c.isActive);
      
      if (!coupon) {
          setCouponError('كود الخصم غير صحيح أو منتهي الصلاحية');
          return;
      }

      if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
          setCouponError('لقد انتهت صلاحية هذا الكوبون');
          return;
      }

      setAppliedCoupon(coupon);
      setCouponCode('');
  };

  const discountAmount = appliedCoupon ? (totalAmount * appliedCoupon.discount / 100) : 0;
  const finalTotal = totalAmount - discountAmount;

  const formatPrice = (priceInSar: number) => {
    if (currency === 'SAR') return priceInSar;
    if (currency === 'USD') return (priceInSar / exchangeRates.USD).toFixed(2);
    // YER
    return Math.round(priceInSar * exchangeRates.YER);
  };

  const displayTotal = formatPrice(finalTotal);
  const displayDiscount = formatPrice(discountAmount);

  const getCurrencySymbol = () => {
      if (currency === 'SAR') return 'ر.س';
      if (currency === 'USD') return '$';
      if (currency === 'YER') return 'ر.ي';
      return 'ر.س';
  };

  const currencySymbol = getCurrencySymbol();

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const paymentMethodString = paymentMethod === 'card'
        ? `بطاقة ائتمان (تنتهي بـ ${formData.cardNumber.slice(-4) || '****'})`
        : 'الدفع عند الاستلام (كاش)';

    // Combine Country Code and Phone
    const fullPhoneNumber = `${selectedCountryCode} ${formData.phone}`;
    const fullAddress = `${formData.address}, ${formData.city} (جوال: ${fullPhoneNumber})`;

    await onPlaceOrder(
      fullAddress, 
      paymentMethodString
    );
    
    setLoading(false);
    setStep('success');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {step === 'details' ? 'تفاصيل الشحن' : step === 'payment' ? 'الدفع' : 'تم الطلب بنجاح'}
          </h2>
          {step !== 'success' && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {step === 'details' && (
            <div className="space-y-6">
                {/* Saved Addresses Selector */}
                {savedAddresses.length > 0 && (
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-700">اختر من عناويني المحفوظة</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {savedAddresses.map(addr => (
                                <div 
                                    key={addr.id}
                                    onClick={() => setSelectedAddressId(addr.id)}
                                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${selectedAddressId === addr.id ? 'border-primary bg-blue-50 ring-1 ring-primary' : 'border-gray-200 hover:border-primary/50'}`}
                                >
                                    <div className="p-2 bg-white rounded-lg shadow-sm text-primary">
                                        {addr.type === 'العمل' ? <Briefcase className="w-4 h-4" /> : <Home className="w-4 h-4" />}
                                    </div>
                                    <div className="text-sm">
                                        <p className="font-bold text-gray-900">{addr.type}</p>
                                        <p className="text-gray-500 truncate text-xs">{addr.city}, {addr.street}</p>
                                    </div>
                                </div>
                            ))}
                            <div 
                                onClick={() => {
                                    setSelectedAddressId('');
                                    setFormData(prev => ({ ...prev, fullName: '', address: '', city: '', phone: '' }));
                                }}
                                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-center gap-2 text-sm font-bold text-gray-500 hover:text-primary ${!selectedAddressId ? 'border-primary bg-blue-50 ring-1 ring-primary' : 'border-gray-200 border-dashed hover:border-primary'}`}
                            >
                                <Plus className="w-4 h-4" />
                                عنوان جديد
                            </div>
                        </div>
                    </div>
                )}

                <form id="shipping-form" onSubmit={handleNext} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">الاسم الكامل</label>
                        <div className="relative">
                            <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input 
                            required 
                            type="text" 
                            className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            placeholder="محمد علي"
                            value={formData.fullName}
                            onChange={e => setFormData({...formData, fullName: e.target.value})}
                            />
                        </div>
                        </div>
                        <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">رقم الجوال</label>
                        {/* Phone Input with Country Code */}
                        <div className="flex gap-2" dir="ltr">
                            <div className="relative w-32 flex-shrink-0">
                                <select
                                    value={selectedCountryCode}
                                    onChange={(e) => setSelectedCountryCode(e.target.value)}
                                    className="w-full h-full appearance-none bg-gray-50 border border-gray-200 rounded-xl pl-3 pr-8 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none cursor-pointer"
                                >
                                    {countryCodes.map((country) => (
                                        <option key={country.code} value={country.dial_code}>
                                            {country.flag} {country.dial_code}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                            <div className="relative flex-1">
                                <input 
                                    required 
                                    type="tel" 
                                    className="w-full pl-4 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    placeholder="5xxxxxxxx"
                                    value={formData.phone}
                                    onChange={e => setFormData({...formData, phone: e.target.value})}
                                />
                            </div>
                        </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">العنوان</label>
                        <div className="relative">
                        <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                            required 
                            type="text" 
                            className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            placeholder="اسم الشارع، الحي"
                            value={formData.address}
                            onChange={e => setFormData({...formData, address: e.target.value})}
                        />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">المدينة</label>
                        <input 
                        required 
                        type="text" 
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        placeholder="الرياض"
                        value={formData.city}
                        onChange={e => setFormData({...formData, city: e.target.value})}
                        />
                    </div>

                    {/* Action Button Inside Form - Always Visible */}
                    <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500 font-bold">الإجمالي</p>
                            <p className="text-lg font-bold text-primary dir-ltr">{currencySymbol} {displayTotal}</p>
                        </div>
                        <button 
                            type="submit"
                            className="px-8 py-3 bg-primary hover:bg-secondary text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-2"
                        >
                            <span>متابعة للدفع</span>
                            <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
                        </button>
                    </div>
                </form>
            </div>
          )}

          {step === 'payment' && (
            <div className="space-y-6">
              {/* Summary and Coupon */}
              <div className="bg-blue-50 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-center text-blue-800">
                    <span className="font-bold">المبلغ الإجمالي:</span>
                    <span className="text-lg font-bold dir-ltr">{currencySymbol} {displayTotal}</span>
                  </div>
                  
                  {appliedCoupon && (
                      <div className="flex justify-between items-center text-green-600 animate-fade-in">
                        <span className="font-bold flex items-center gap-1"><Ticket className="w-4 h-4"/> خصم ({appliedCoupon.code}):</span>
                        <span className="text-lg font-bold dir-ltr">-{currencySymbol} {displayDiscount}</span>
                      </div>
                  )}

                  {appliedCoupon && (
                      <div className="border-t border-blue-200 pt-2 flex justify-between items-center text-blue-900">
                        <span className="font-black text-lg">الصافي للدفع:</span>
                        <span className="text-xl font-black dir-ltr">{currencySymbol} {displayTotal}</span>
                      </div>
                  )}
              </div>

              {/* Coupon Input */}
              <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="لديك كود خصم؟"
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none uppercase font-mono"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={!!appliedCoupon}
                  />
                  {appliedCoupon ? (
                      <button 
                        onClick={() => { setAppliedCoupon(null); setCouponCode(''); }}
                        className="px-4 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors"
                      >
                          إزالة
                      </button>
                  ) : (
                      <button 
                        onClick={handleApplyCoupon}
                        className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
                      >
                          تطبيق
                      </button>
                  )}
              </div>
              {couponError && <p className="text-xs text-red-500 font-bold">{couponError}</p>}
              
              <form id="payment-form" onSubmit={handlePayment} className="space-y-6">
                {/* Payment Methods */}
                <div className="grid grid-cols-2 gap-4">
                    <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                            paymentMethod === 'card' 
                            ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary' 
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                    >
                        <CreditCard className="w-6 h-6" />
                        <span className="text-sm font-bold">بطاقة ائتمان</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setPaymentMethod('cod')}
                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                            paymentMethod === 'cod' 
                            ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary' 
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                    >
                        <Banknote className="w-6 h-6" />
                        <span className="text-sm font-bold">الدفع عند الاستلام</span>
                    </button>
                </div>

                {paymentMethod === 'card' ? (
                    <div className="space-y-4 animate-fade-in">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">رقم البطاقة</label>
                        <input
                            type="text"
                            placeholder="0000 0000 0000 0000"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none dir-ltr"
                            value={formData.cardNumber}
                            onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">تاريخ الانتهاء</label>
                            <input
                                type="text"
                                placeholder="MM/YY"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none dir-ltr"
                                value={formData.expiry}
                                onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">رمز التحقق (CVV)</label>
                            <input
                                type="text"
                                placeholder="123"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none dir-ltr"
                                value={formData.cvv}
                                onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    </div>
                ) : (
                    <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-xl text-yellow-800 text-sm animate-fade-in">
                        سيتم دفع المبلغ نقداً عند استلام الطلب. يرجى تجهيز المبلغ المحدد.
                    </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={() => setStep('details')}
                        className="px-6 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                        disabled={loading}
                    >
                        رجوع
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-primary hover:bg-secondary text-white py-3 rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <>
                                <span>تأكيد الطلب</span>
                                <span className="bg-white/20 px-2 py-0.5 rounded text-sm font-normal dir-ltr">{currencySymbol} {displayTotal}</span>
                            </>
                        )}
                    </button>
                </div>
              </form>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-12 space-y-6 animate-fade-in">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-12 h-12" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">تم الطلب بنجاح!</h3>
                    <p className="text-gray-500 max-w-xs mx-auto">شكراً لتسوقك معنا. سيتم إرسال تفاصيل الطلب وتحديثات الشحن إلى بريدك الإلكتروني.</p>
                </div>
                <button
                    onClick={onClose}
                    className="bg-primary hover:bg-secondary text-white px-10 py-3 rounded-xl font-bold shadow-lg transition-all"
                >
                    متابعة التسوق
                </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
