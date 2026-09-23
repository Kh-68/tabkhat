import React from 'react';
import { Home, Search, PlusCircle, Heart, User, LucideIcon } from 'lucide-react';

interface BottomNavProps {
  currentTab: 'home' | 'search' | 'add' | 'favorites' | 'profile' | 'planner' | 'shopping';
  onSelectTab: (tab: 'home' | 'search' | 'add' | 'favorites' | 'profile') => void;
  favoritesCount: number;
}

interface NavItem {
  key: 'home' | 'search' | 'add' | 'favorites' | 'profile';
  label: string;
  icon: LucideIcon;
  isPrimary?: boolean;
  badge?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  favoritesCount,
}) => {
  const tabs: NavItem[] = [
    { key: 'home', label: 'الرئيسية', icon: Home },
    { key: 'search', label: 'البحث', icon: Search },
    { key: 'add', label: 'إضافة', icon: PlusCircle, isPrimary: true },
    { key: 'favorites', label: 'المفضلة', icon: Heart, badge: favoritesCount },
    { key: 'profile', label: 'الحساب', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#EDE7DD] safe-bottom shadow-lg">
      <div className="max-w-md mx-auto px-3 h-16 flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.key;
          const Icon = tab.icon;

          if (tab.isPrimary) {
            return (
              <button
                key={tab.key}
                onClick={() => onSelectTab(tab.key)}
                className="relative -top-2 flex flex-col items-center group active:scale-95 transition"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#E26D46] to-[#F28C5B] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition">
                  <PlusCircle className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-bold text-[#242A26] mt-0.5">
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.key}
              onClick={() => onSelectTab(tab.key)}
              className={`flex-1 flex flex-col items-center justify-center py-1 relative transition active:scale-95 ${
                isActive ? 'text-[#4E7659]' : 'text-[#8E9791] hover:text-[#242A26]'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.75]'
                  } ${isActive && tab.key === 'favorites' ? 'fill-[#4E7659]' : ''}`}
                />
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1 -right-2.5 px-1 min-w-3.5 h-3.5 rounded-full bg-[#E26D46] text-white text-[9px] font-bold flex items-center justify-center">
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                ) : null}
              </div>

              <span
                className={`text-[10px] mt-1 transition-all ${
                  isActive ? 'font-black text-[#4E7659]' : 'font-medium'
                }`}
              >
                {tab.label}
              </span>

              {/* Active pill indicator */}
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-[#4E7659] mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
