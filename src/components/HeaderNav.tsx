import React from 'react';
import { PWAInstallButton } from './PWAInstallButton';
import { Calendar, ShoppingCart, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderNavProps {
  currentTab: string;
  onNavigateTab: (tab: 'home' | 'search' | 'add' | 'favorites' | 'profile' | 'planner' | 'shopping') => void;
  shoppingCount: number;
  profile: UserProfile;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentTab,
  onNavigateTab,
  shoppingCount,
  profile,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#EDE7DD] safe-top">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo & Brand */}
        <div
          onClick={() => onNavigateTab('home')}
          className="flex items-center gap-2 cursor-pointer active:scale-95 transition"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#5E8668] to-[#41634B] flex items-center justify-center text-white shadow-2xs">
            <span className="text-base leading-none">🍲</span>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-lg text-[#242A26] font-heading tracking-tight">
              طبخات
            </span>
            <span className="text-[9px] text-[#4E7659] -mt-1 font-semibold">
              أطباق يومية شهية
            </span>
          </div>
        </div>

        {/* Right Action Icons & PWA Install */}
        <div className="flex items-center gap-2">
          {/* PWA Install Button in Header */}
          <PWAInstallButton variant="header" />

          {/* Quick Shopping Cart with Counter */}
          <button
            onClick={() => onNavigateTab('shopping')}
            className="relative w-9 h-9 rounded-full bg-white border border-[#EDE7DD] shadow-2xs flex items-center justify-center text-[#242A26] hover:text-[#4E7659] active:scale-90 transition"
            title="قائمة المشتريات"
          >
            <ShoppingCart className="w-4 h-4" />
            {shoppingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E26D46] text-white text-[9px] font-bold flex items-center justify-center">
                {shoppingCount > 9 ? '9+' : shoppingCount}
              </span>
            )}
          </button>

          {/* User Profile Avatar */}
          <button
            onClick={() => onNavigateTab('profile')}
            className={`w-9 h-9 rounded-full overflow-hidden border-2 transition active:scale-90 ${
              currentTab === 'profile' ? 'border-[#4E7659]' : 'border-[#EDE7DD]'
            }`}
            title="الملف الشخصي"
          >
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          </button>
        </div>
      </div>
    </header>
  );
};
