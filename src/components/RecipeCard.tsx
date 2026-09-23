import React from 'react';
import { Recipe } from '../types';
import { Clock, Users, Flame, Heart, BookmarkPlus } from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onSelect: (recipe: Recipe) => void;
  onAddToMealPlan?: (recipe: Recipe) => void;
  layout?: 'card' | 'compact' | 'featured';
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  isFavorite,
  onToggleFavorite,
  onSelect,
  onAddToMealPlan,
  layout = 'card',
}) => {
  const totalTime = recipe.prepTime + recipe.cookTime;

  // Featured Large Banner / Hero layout
  if (layout === 'featured') {
    return (
      <div
        onClick={() => onSelect(recipe)}
        className="group relative w-full h-[320px] rounded-3xl overflow-hidden shadow-md cursor-pointer transition-all duration-300 hover:shadow-xl active:scale-[0.99]"
      >
        <img
          src={recipe.image}
          alt={recipe.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Soft Warm Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />

        {/* Top Badges */}
        <div className="absolute top-4 inset-x-4 flex items-center justify-between pointer-events-none">
          <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#4E7659] text-xs font-bold shadow-sm">
            {recipe.categoryLabel}
          </span>
          <div className="flex items-center gap-2 pointer-events-auto">
            {onAddToMealPlan && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToMealPlan(recipe);
                }}
                className="w-9 h-9 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-[#242A26] hover:bg-white shadow-sm transition active:scale-90"
                title="إضافة لجدول الطبخ"
              >
                <BookmarkPlus className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(recipe.id);
              }}
              className="w-9 h-9 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-[#E26D46] hover:bg-white shadow-sm transition active:scale-90"
              title={isFavorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  isFavorite ? 'fill-[#E26D46] text-[#E26D46]' : 'text-[#242A26]'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Bottom Content */}
        <div className="absolute bottom-4 inset-x-4 text-white">
          <div className="flex items-center gap-2 text-xs text-white/80 mb-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#F28C5B]" /> {totalTime} دقيقة
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-[#F28C5B]" /> {recipe.servings} أشخاص
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-[#F28C5B]" /> {recipe.calories} ك.س
            </span>
          </div>

          <h3 className="text-lg font-bold text-white leading-snug line-clamp-2 font-heading">
            {recipe.title}
          </h3>
          <p className="text-xs text-white/70 line-clamp-1 mt-1 font-light">
            {recipe.description}
          </p>
        </div>
      </div>
    );
  }

  // Compact horizontal row
  if (layout === 'compact') {
    return (
      <div
        onClick={() => onSelect(recipe)}
        className="flex items-center gap-3 p-2.5 rounded-2xl bg-white border border-[#EDE7DD] shadow-sm hover:shadow-md transition cursor-pointer active:scale-[0.99]"
      >
        <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
          <img
            src={recipe.image}
            alt={recipe.title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-bold text-[#4E7659] bg-[#E8F0EA] px-2 py-0.5 rounded-md">
            {recipe.categoryLabel}
          </span>
          <h4 className="text-sm font-bold text-[#242A26] truncate mt-1">
            {recipe.title}
          </h4>
          <div className="flex items-center gap-3 text-[11px] text-[#758178] mt-1.5">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#E26D46]" /> {totalTime} د
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 text-[#4E7659]" /> {recipe.servings}
            </span>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(recipe.id);
          }}
          className="p-2 text-[#969F99] hover:text-[#E26D46] active:scale-90 transition"
        >
          <Heart
            className={`w-4 h-4 ${
              isFavorite ? 'fill-[#E26D46] text-[#E26D46]' : ''
            }`}
          />
        </button>
      </div>
    );
  }

  // Standard Card layout (Default)
  return (
    <div
      onClick={() => onSelect(recipe)}
      className="group bg-white rounded-2xl overflow-hidden border border-[#EDE7DD] shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col active:scale-[0.98]"
    >
      {/* Image Container */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#F3ECE0]">
        <img
          src={recipe.image}
          alt={recipe.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Category Pill */}
        <div className="absolute top-2.5 right-2.5">
          <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-bold text-[#4E7659] shadow-xs">
            {recipe.categoryLabel}
          </span>
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(recipe.id);
          }}
          className="absolute top-2.5 left-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#242A26] hover:text-[#E26D46] shadow-xs active:scale-90 transition"
        >
          <Heart
            className={`w-3.5 h-3.5 ${
              isFavorite ? 'fill-[#E26D46] text-[#E26D46]' : ''
            }`}
          />
        </button>

        {/* Quick bottom badge on image */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[10px]">
          <Clock className="w-3 h-3 text-[#F28C5B]" />
          <span>{totalTime} دقيقة</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-[#242A26] line-clamp-1 leading-snug group-hover:text-[#4E7659] transition">
            {recipe.title}
          </h3>
          <p className="text-xs text-[#758178] line-clamp-1 mt-1 font-normal">
            {recipe.description}
          </p>
        </div>

        <div className="mt-3 pt-2.5 border-t border-[#F2EDE5] flex items-center justify-between text-[11px] text-[#606963]">
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-[#4E7659]" />
            <span>{recipe.servings} أشخاص</span>
          </div>

          <div className="flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-[#E26D46]" />
            <span>{recipe.calories} ك.س</span>
          </div>
        </div>
      </div>
    </div>
  );
};
