import React, { useState } from 'react';
import { Recipe } from '../types';
import { PANTRY_INGREDIENTS } from '../data/categories';
import { RecipeCard } from './RecipeCard';
import { Sparkles, X, Clock, Users, Check, Flame, ChevronLeft } from 'lucide-react';

interface SmartSuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipes: Recipe[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onSelectRecipe: (recipe: Recipe) => void;
}

export const SmartSuggestionsModal: React.FC<SmartSuggestionsModalProps> = ({
  isOpen,
  onClose,
  recipes,
  favorites,
  onToggleFavorite,
  onSelectRecipe,
}) => {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>(['دجاج', 'طماطم']);
  const [maxMinutes, setMaxMinutes] = useState<number>(60);
  const [targetServings, setTargetServings] = useState<number>(4);
  const [preference, setPreference] = useState<'all' | 'healthy' | 'fast'>('all');

  if (!isOpen) return null;

  const toggleIngredient = (name: string) => {
    if (selectedIngredients.includes(name)) {
      setSelectedIngredients(selectedIngredients.filter(i => i !== name));
    } else {
      setSelectedIngredients([...selectedIngredients, name]);
    }
  };

  // Matching algorithm
  const scoredRecipes = recipes
    .filter(r => {
      const totalTime = r.prepTime + r.cookTime;
      if (maxMinutes < 60 && totalTime > maxMinutes) return false;
      if (preference === 'healthy' && r.category !== 'healthy') return false;
      if (preference === 'fast' && totalTime > 30) return false;
      return true;
    })
    .map(recipe => {
      // Find matching ingredients
      const matched: string[] = [];
      const missing: string[] = [];

      recipe.ingredients.forEach(ing => {
        const hasMatch = selectedIngredients.some(sel =>
          ing.name.toLowerCase().includes(sel.toLowerCase()) || sel.toLowerCase().includes(ing.name.toLowerCase())
        );
        if (hasMatch) {
          matched.push(ing.name);
        } else {
          missing.push(ing.name);
        }
      });

      const totalIngs = recipe.ingredients.length;
      const score = totalIngs > 0 ? (matched.length / totalIngs) * 100 : 0;

      return {
        recipe,
        matched,
        missing,
        score: Math.round(score),
      };
    })
    .sort((a, b) => b.score - a.score);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#FAF8F5] animate-fadeIn pb-24">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md px-4 py-3 border-b border-[#EDE7DD] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#FAF0E6] text-[#E26D46] flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-sm sm:text-base text-[#242A26] font-heading">
              اقتراحات الطبخ الذكية
            </h2>
            <p className="text-[10px] text-[#606963]">ماذا يمكنك أن تطبخ اليوم بمكوناتك؟</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#606963] hover:text-black border border-[#EDE7DD]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Step 1: Available Ingredients */}
        <div className="p-4 rounded-2xl bg-white border border-[#EDE7DD] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-[#242A26] flex items-center gap-1.5">
              <span>🥑 ما المكونات المتوفرة في مطبخك الآن؟</span>
            </h3>
            <span className="text-[11px] text-[#4E7659] font-bold">
              {selectedIngredients.length} محددة
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {PANTRY_INGREDIENTS.map((item) => {
              const isSelected = selectedIngredients.includes(item);
              return (
                <button
                  key={item}
                  onClick={() => toggleIngredient(item)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1 border ${
                    isSelected
                      ? 'bg-[#4E7659] text-white border-[#4E7659] shadow-xs scale-102'
                      : 'bg-[#FAF8F5] text-[#242A26] border-[#EDE7DD] hover:bg-[#F2ECE2]'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  <span>{item}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Time & Preference */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-white border border-[#EDE7DD] shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#242A26] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#E26D46]" /> الوقت المتاح
              </span>
              <span className="text-xs font-bold text-[#E26D46]">
                {maxMinutes >= 60 ? 'أي وقت' : `حتى ${maxMinutes} دقيقة`}
              </span>
            </div>
            <div className="flex gap-2">
              {[20, 35, 50, 60].map((m) => (
                <button
                  key={m}
                  onClick={() => setMaxMinutes(m)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition ${
                    maxMinutes === m
                      ? 'bg-[#FAF0E6] text-[#E26D46] border-[#E26D46]'
                      : 'bg-[#FAF8F5] text-[#606963] border-[#EDE7DD]'
                  }`}
                >
                  {m === 60 ? 'الكل' : `${m} د`}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#EDE7DD] shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#242A26] flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-[#4E7659]" /> النمط المفضل
              </span>
            </div>
            <div className="flex gap-2">
              {[
                { id: 'all', label: 'أي نمط' },
                { id: 'healthy', label: 'صحي وخفيف' },
                { id: 'fast', label: 'سريع جداً' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPreference(p.id as typeof preference)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition ${
                    preference === p.id
                      ? 'bg-[#E8F0EA] text-[#4E7659] border-[#4E7659]'
                      : 'bg-[#FAF8F5] text-[#606963] border-[#EDE7DD]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs sm:text-sm font-bold text-[#242A26] font-heading">
              أفضل الوصفات المقترحة ({scoredRecipes.length})
            </h3>
            <span className="text-[11px] text-[#8E9791]">مرتبة حسب نسبة توفر المكونات</span>
          </div>

          {scoredRecipes.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white border border-[#EDE7DD]">
              <p className="text-sm font-bold text-[#242A26]">لم نجد وصفة مطابقة تماماً للخيارات</p>
              <p className="text-xs text-[#8E9791] mt-1">جرب زيادة الوقت المتاح أو اختيار مكونات إضافية.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scoredRecipes.map(({ recipe, score, matched, missing }) => (
                <div
                  key={recipe.id}
                  onClick={() => onSelectRecipe(recipe)}
                  className="p-3.5 rounded-2xl bg-white border border-[#EDE7DD] shadow-xs hover:shadow-md transition cursor-pointer flex items-center gap-3.5 active:scale-[0.99]"
                >
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-20 h-20 rounded-xl object-cover shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-[#4E7659] bg-[#E8F0EA] px-2 py-0.5 rounded">
                        {recipe.categoryLabel}
                      </span>
                      {score > 0 && (
                        <span className="text-[11px] font-extrabold text-[#E26D46] bg-[#FAF0E6] px-2 py-0.5 rounded-full">
                          تطابق {score}%
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-[#242A26] truncate">
                      {recipe.title}
                    </h4>

                    <div className="flex items-center gap-3 text-[11px] text-[#606963] mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#E26D46]" /> {recipe.prepTime + recipe.cookTime} د
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-[#4E7659]" /> {recipe.servings} أشخاص
                      </span>
                    </div>

                    {matched.length > 0 && (
                      <p className="text-[10px] text-[#4E7659] truncate mt-1">
                        متوفر لديك: {matched.slice(0, 3).join('، ')}
                      </p>
                    )}
                  </div>

                  <ChevronLeft className="w-5 h-5 text-[#969F99] shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
