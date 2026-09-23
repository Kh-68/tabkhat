import React from 'react';
import { Recipe, RecipeCategory } from '../types';
import { CATEGORIES } from '../data/categories';
import { RecipeCard } from './RecipeCard';
import { PWAInstallButton } from './PWAInstallButton';
import {
  Search,
  Sparkles,
  Calendar,
  ShoppingCart,
  Timer,
  ChevronLeft,
  Flame,
  Clock,
  Users,
} from 'lucide-react';

interface HomeViewProps {
  recipes: Recipe[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onSelectRecipe: (recipe: Recipe) => void;
  onSelectCategory: (category: RecipeCategory) => void;
  onNavigateTab: (tab: 'home' | 'search' | 'add' | 'favorites' | 'profile' | 'planner' | 'shopping') => void;
  onOpenSmartSuggestions: () => void;
  onOpenTimer: () => void;
  onAddToMealPlan: (recipe: Recipe) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  recipes,
  favorites,
  onToggleFavorite,
  onSelectRecipe,
  onSelectCategory,
  onNavigateTab,
  onOpenSmartSuggestions,
  onOpenTimer,
  onAddToMealPlan,
}) => {
  // Dish of the day
  const dishOfDay = recipes.find(r => r.isTodayPick) || recipes[0];

  // Featured recipes
  const featuredRecipes = recipes.filter(r => r.isFeatured && r.id !== dishOfDay?.id);

  // Latest recipes
  const latestRecipes = [...recipes].reverse().slice(0, 6);

  return (
    <div className="space-y-6 pb-28">
      {/* Quick Search Trigger Bar */}
      <div className="px-4 pt-1">
        <div
          onClick={() => onNavigateTab('search')}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-[#EDE7DD] shadow-2xs hover:shadow-xs transition cursor-pointer text-[#8E9791] active:scale-[0.99]"
        >
          <Search className="w-4 h-4 text-[#4E7659]" />
          <span className="text-xs sm:text-sm font-medium">
            ابحث عن طبخة، مكونات (دجاج، أرز)...
          </span>
        </div>
      </div>

      {/* PWA Install Banner */}
      <PWAInstallButton variant="banner" />

      {/* Quick Action Pills (Meal Plan, Shopping, Smart Suggestions, Timer) */}
      <div className="px-4">
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => onNavigateTab('planner')}
            className="p-3 rounded-2xl bg-white border border-[#EDE7DD] flex flex-col items-center gap-1.5 shadow-2xs hover:shadow-xs active:scale-95 transition"
          >
            <div className="w-9 h-9 rounded-xl bg-[#FAF0E6] text-[#E26D46] flex items-center justify-center text-base">
              📅
            </div>
            <span className="text-[11px] font-bold text-[#242A26]">جدول الطبخ</span>
          </button>

          <button
            onClick={() => onNavigateTab('shopping')}
            className="p-3 rounded-2xl bg-white border border-[#EDE7DD] flex flex-col items-center gap-1.5 shadow-2xs hover:shadow-xs active:scale-95 transition"
          >
            <div className="w-9 h-9 rounded-xl bg-[#E8F0EA] text-[#4E7659] flex items-center justify-center text-base">
              🛒
            </div>
            <span className="text-[11px] font-bold text-[#242A26]">المشتريات</span>
          </button>

          <button
            onClick={onOpenSmartSuggestions}
            className="p-3 rounded-2xl bg-white border border-[#EDE7DD] flex flex-col items-center gap-1.5 shadow-2xs hover:shadow-xs active:scale-95 transition"
          >
            <div className="w-9 h-9 rounded-xl bg-[#FFF6E5] text-[#D97706] flex items-center justify-center text-base">
              💡
            </div>
            <span className="text-[11px] font-bold text-[#242A26]">ماذا أطبخ؟</span>
          </button>

          <button
            onClick={onOpenTimer}
            className="p-3 rounded-2xl bg-white border border-[#EDE7DD] flex flex-col items-center gap-1.5 shadow-2xs hover:shadow-xs active:scale-95 transition"
          >
            <div className="w-9 h-9 rounded-xl bg-[#F0EBE1] text-[#786452] flex items-center justify-center text-base">
              ⏱️
            </div>
            <span className="text-[11px] font-bold text-[#242A26]">المؤقت</span>
          </button>
        </div>
      </div>

      {/* Voice Recipe Quick Record Banner */}
      <div className="px-4">
        <div
          onClick={() => onNavigateTab('add')}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-[#FAF0E6] via-[#FFF3E8] to-[#FAF8F5] border border-[#F5D8C5] shadow-xs hover:shadow-sm transition cursor-pointer flex items-center justify-between active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E26D46] text-white flex items-center justify-center shadow-xs">
              <span className="text-xl">🎙️</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#242A26]">
                  تسجيل وصفة بالصوت
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-[#E26D46] text-white">
                  جديد
                </span>
              </div>
              <p className="text-[11px] text-[#786452] mt-0.5">
                تكلم بالمقادير والكميات.. وسنوزعها في الخانات المناسبة فوراً!
              </p>
            </div>
          </div>

          <span className="text-xs font-bold text-[#E26D46] px-2 py-1 rounded-lg bg-white border border-[#EDE7DD] shadow-2xs shrink-0">
            تحدث 🎤
          </span>
        </div>
      </div>

      {/* Dish of the Day (اقتراح اليوم) */}
      {dishOfDay && (
        <div className="px-4">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <span className="text-base">🌟</span>
              <h2 className="text-sm sm:text-base font-black text-[#242A26] font-heading">
                اقتراح اليوم
              </h2>
            </div>
            <span className="text-[11px] text-[#4E7659] font-bold">
              مختار بعناية لك
            </span>
          </div>

          <RecipeCard
            recipe={dishOfDay}
            isFavorite={favorites.includes(dishOfDay.id)}
            onToggleFavorite={onToggleFavorite}
            onSelect={onSelectRecipe}
            onAddToMealPlan={onAddToMealPlan}
            layout="featured"
          />
        </div>
      )}

      {/* Cooking Categories (تصنيفات الطبخ) */}
      <div className="space-y-2.5">
        <div className="px-4 flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-black text-[#242A26] font-heading">
            تصنيفات الطبخ
          </h2>
          <button
            onClick={() => {
              onSelectCategory('all');
              onNavigateTab('search');
            }}
            className="text-xs text-[#4E7659] hover:underline font-bold flex items-center"
          >
            <span>عرض الكل</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex gap-2.5 overflow-x-auto no-scrollbar px-4 py-1">
          {CATEGORIES.filter(c => c.id !== 'all').map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                onSelectCategory(cat.id);
                onNavigateTab('search');
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-[#EDE7DD] shadow-2xs hover:shadow-xs hover:border-[#4E7659] transition shrink-0 active:scale-95"
            >
              <span className="text-lg">{cat.icon}</span>
              <span className="text-xs font-bold text-[#242A26] whitespace-nowrap">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Featured Recipes (وصفات مميزة) */}
      {featuredRecipes.length > 0 && (
        <div className="space-y-3">
          <div className="px-4 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-base">🔥</span>
              <h2 className="text-sm sm:text-base font-black text-[#242A26] font-heading">
                وصفات مميزة
              </h2>
            </div>
            <span className="text-xs text-[#8E9791]">الأعلى تقييماً</span>
          </div>

          <div className="flex gap-3.5 overflow-x-auto no-scrollbar px-4 py-1">
            {featuredRecipes.map((recipe) => (
              <div key={recipe.id} className="w-[250px] shrink-0">
                <RecipeCard
                  recipe={recipe}
                  isFavorite={favorites.includes(recipe.id)}
                  onToggleFavorite={onToggleFavorite}
                  onSelect={onSelectRecipe}
                  layout="card"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Latest Recipes (أحدث الوصفات) */}
      <div className="px-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-base">🥗</span>
            <h2 className="text-sm sm:text-base font-black text-[#242A26] font-heading">
              أحدث الوصفات
            </h2>
          </div>
          <button
            onClick={() => onNavigateTab('search')}
            className="text-xs text-[#4E7659] hover:underline font-bold flex items-center"
          >
            <span>المزيد</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {latestRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isFavorite={favorites.includes(recipe.id)}
              onToggleFavorite={onToggleFavorite}
              onSelect={onSelectRecipe}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
