import React, { useState } from 'react';
import { Recipe } from '../types';
import {
  ArrowRight,
  Heart,
  Share2,
  Clock,
  Users,
  Flame,
  ChefHat,
  ShoppingCart,
  CalendarPlus,
  Timer,
  Check,
  Sparkles,
  Minus,
  Plus,
  Info,
} from 'lucide-react';

interface RecipeDetailModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onAddToShoppingList: (recipe: Recipe, servingsMultiplier: number) => void;
  onOpenMealPlannerDialog: (recipe: Recipe) => void;
  onOpenTimer: (minutes: number, title: string) => void;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  recipe,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite,
  onAddToShoppingList,
  onOpenMealPlannerDialog,
  onOpenTimer,
}) => {
  if (!isOpen || !recipe) return null;

  const [currentServings, setCurrentServings] = useState(recipe.servings);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [addedToCartToast, setAddedToCartToast] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  // Servings ratio multiplier
  const multiplier = currentServings / recipe.servings;

  const toggleIngredient = (id: string) => {
    setCheckedIngredients(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleStep = (stepNum: number) => {
    setCompletedSteps(prev => ({ ...prev, [stepNum]: !prev[stepNum] }));
  };

  const handleShare = async () => {
    const text = `جرب هذه الوصفة الشهية من تطبيق «طبخات»: ${recipe.title}\n\nالمقادير:\n${recipe.ingredients
      .slice(0, 4)
      .map(i => `• ${i.name}`)
      .join('\n')}\n\nافتحها في تطبيق طبخات!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          text: text,
          url: window.location.href,
        });
        return;
      } catch (e) {
        // User cancelled share or unsupported
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(text);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2500);
    } catch (e) {
      console.error('Clipboard failed', e);
    }
  };

  const handleAddAllToCart = () => {
    onAddToShoppingList(recipe, multiplier);
    setAddedToCartToast(true);
    setTimeout(() => setAddedToCartToast(false), 3000);
  };

  // Helper to format nicely (e.g. 1.5, 2, 0.25)
  const formatAmount = (baseAmount: number) => {
    const scaled = baseAmount * multiplier;
    if (Number.isInteger(scaled)) return scaled.toString();
    const rounded = Math.round(scaled * 10) / 10;
    return rounded.toString();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#FAF8F5] animate-fadeIn">
      {/* Toast notifications */}
      {addedToCartToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[70] flex items-center gap-2 bg-[#4E7659] text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-xl animate-slideDown">
          <ShoppingCart className="w-4 h-4" />
          <span>تمت إضافة المقادير إلى قائمة المشتريات بنجاح! 🛒</span>
        </div>
      )}

      {shareToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[70] flex items-center gap-2 bg-[#242A26] text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-xl animate-slideDown">
          <Check className="w-4 h-4 text-[#E26D46]" />
          <span>تم نسخ تفاصيل الوصفة إلى الحافظة!</span>
        </div>
      )}

      {/* Top Floating Controls Bar */}
      <div className="fixed top-0 inset-x-0 z-40 p-4 flex items-center justify-between pointer-events-none">
        <button
          onClick={onClose}
          className="pointer-events-auto w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-md flex items-center justify-center text-[#242A26] hover:bg-white active:scale-90 transition border border-[#EDE7DD]"
          title="رجوع"
        >
          <ArrowRight className="w-5 h-5" />
        </button>

        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => onOpenMealPlannerDialog(recipe)}
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-md flex items-center justify-center text-[#4E7659] hover:bg-white active:scale-90 transition border border-[#EDE7DD]"
            title="إضافة لجدول الطبخ"
          >
            <CalendarPlus className="w-4 h-4" />
          </button>
          <button
            onClick={handleShare}
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-md flex items-center justify-center text-[#242A26] hover:bg-white active:scale-90 transition border border-[#EDE7DD]"
            title="مشاركة"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToggleFavorite(recipe.id)}
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-md flex items-center justify-center text-[#E26D46] hover:bg-white active:scale-90 transition border border-[#EDE7DD]"
            title="المفضلة"
          >
            <Heart
              className={`w-4 h-4 ${
                isFavorite ? 'fill-[#E26D46] text-[#E26D46]' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative w-full h-[360px] sm:h-[420px] bg-[#EBE5DB]">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FAF8F5] via-transparent to-black/30" />
      </div>

      {/* Content Container */}
      <div className="relative -mt-10 rounded-t-3xl bg-[#FAF8F5] p-5 sm:p-8 max-w-3xl mx-auto min-h-[500px] shadow-sm pb-28">
        {/* Category & Badge */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-[#4E7659] bg-[#E8F0EA] px-3 py-1 rounded-full">
            {recipe.categoryLabel}
          </span>
          <div className="flex items-center gap-1 text-xs text-[#E26D46] font-bold">
            <span>★</span>
            <span>{recipe.rating.toFixed(1)}</span>
            <span className="text-[#8E9791] font-normal">({recipe.reviewCount})</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-black text-[#242A26] leading-tight font-heading">
          {recipe.title}
        </h1>

        {/* Short Description */}
        <p className="text-xs sm:text-sm text-[#606963] mt-2 leading-relaxed">
          {recipe.description}
        </p>

        {/* Metadata Badges Card */}
        <div className="grid grid-cols-4 gap-2 mt-5 p-3.5 rounded-2xl bg-white border border-[#EDE7DD] shadow-xs text-center">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-[#8E9791]">التحضير</span>
            <span className="text-xs sm:text-sm font-bold text-[#242A26] mt-0.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#E26D46]" /> {recipe.prepTime} د
            </span>
          </div>
          <div className="flex flex-col items-center border-r border-[#F0EBE3]">
            <span className="text-[10px] text-[#8E9791]">الطبخ</span>
            <span className="text-xs sm:text-sm font-bold text-[#242A26] mt-0.5 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-[#E26D46]" /> {recipe.cookTime} د
            </span>
          </div>
          <div className="flex flex-col items-center border-r border-[#F0EBE3]">
            <span className="text-[10px] text-[#8E9791]">الصعوبة</span>
            <span className="text-xs sm:text-sm font-bold text-[#4E7659] mt-0.5 flex items-center gap-1">
              <ChefHat className="w-3.5 h-3.5" /> {recipe.difficultyLabel}
            </span>
          </div>
          <div className="flex flex-col items-center border-r border-[#F0EBE3]">
            <span className="text-[10px] text-[#8E9791]">السعرات</span>
            <span className="text-xs sm:text-sm font-bold text-[#242A26] mt-0.5">
              {recipe.calories} ك.س
            </span>
          </div>
        </div>

        {/* Interactive Servings Scaler */}
        <div className="mt-6 p-4 rounded-2xl bg-[#F4EFE7] border border-[#E8E1D5] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#4E7659] text-white flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#242A26]">عدد الحصص والأشخاص</h4>
              <p className="text-[11px] text-[#606963]">تعديل المقادير تلقائيًا</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-xl border border-[#E3DBD0] shadow-xs">
            <button
              onClick={() => setCurrentServings(Math.max(1, currentServings - 1))}
              disabled={currentServings <= 1}
              className="w-7 h-7 rounded-lg bg-[#F8F5F0] flex items-center justify-center text-[#242A26] hover:bg-[#EAE4DB] disabled:opacity-30 active:scale-95 transition"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-sm font-extrabold text-[#242A26] min-w-[2.5rem] text-center font-heading">
              {currentServings} {currentServings === 1 ? 'فرد' : 'أشخاص'}
            </span>
            <button
              onClick={() => setCurrentServings(Math.min(20, currentServings + 1))}
              disabled={currentServings >= 20}
              className="w-7 h-7 rounded-lg bg-[#F8F5F0] flex items-center justify-center text-[#242A26] hover:bg-[#EAE4DB] disabled:opacity-30 active:scale-95 transition"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Ingredients Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🧂</span>
              <h2 className="text-base font-bold text-[#242A26] font-heading">
                المقادير والمكونات
              </h2>
              <span className="text-xs text-[#8E9791]">
                ({recipe.ingredients.length})
              </span>
            </div>

            <button
              onClick={handleAddAllToCart}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FAF0E6] text-[#E26D46] hover:bg-[#F6E3D5] text-xs font-bold transition active:scale-95"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>إضافة للمشتريات</span>
            </button>
          </div>

          <div className="space-y-2">
            {recipe.ingredients.map((ing) => {
              const isChecked = !!checkedIngredients[ing.id];
              return (
                <div
                  key={ing.id}
                  onClick={() => toggleIngredient(ing.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition cursor-pointer select-none ${
                    isChecked
                      ? 'bg-[#E8F0EA]/50 border-[#4E7659]/30 text-[#8E9791]'
                      : 'bg-white border-[#EDE7DD] hover:border-[#D5CDC1]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition border ${
                        isChecked
                          ? 'bg-[#4E7659] border-[#4E7659] text-white'
                          : 'border-[#CBC3B5] bg-[#FAF8F5]'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <span
                      className={`text-xs sm:text-sm ${
                        isChecked ? 'line-through text-[#8E9791]' : 'text-[#242A26] font-medium'
                      }`}
                    >
                      {ing.name}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-[#E26D46] bg-[#FFF2EB] px-2.5 py-1 rounded-lg">
                    {formatAmount(ing.amount)} {ing.unit}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">👨‍🍳</span>
            <h2 className="text-base font-bold text-[#242A26] font-heading">
              طريقة التحضير خطوة بخطوة
            </h2>
          </div>

          <div className="space-y-3">
            {recipe.instructions.map((step) => {
              const isDone = !!completedSteps[step.step];
              return (
                <div
                  key={step.step}
                  className={`p-4 rounded-2xl border transition-all ${
                    isDone
                      ? 'bg-[#E8F0EA]/40 border-[#4E7659]/30 opacity-75'
                      : 'bg-white border-[#EDE7DD] shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleStep(step.step)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 transition ${
                        isDone
                          ? 'bg-[#4E7659] text-white'
                          : 'bg-[#FAF0E6] text-[#E26D46] border border-[#F2D7C5]'
                      }`}
                    >
                      {isDone ? <Check className="w-3.5 h-3.5" /> : step.step}
                    </button>

                    <div className="flex-1">
                      <p
                        className={`text-xs sm:text-sm leading-relaxed ${
                          isDone ? 'line-through text-[#8E9791]' : 'text-[#242A26]'
                        }`}
                      >
                        {step.instruction}
                      </p>

                      {/* Chef Tip */}
                      {step.tip && (
                        <div className="mt-2.5 p-2.5 rounded-xl bg-[#FAF6EE] border border-[#EDE4D2] flex items-start gap-2 text-xs text-[#735A38]">
                          <Sparkles className="w-3.5 h-3.5 text-[#E26D46] shrink-0 mt-0.5" />
                          <span>
                            <strong>نصيحة الشيف:</strong> {step.tip}
                          </span>
                        </div>
                      )}

                      {/* Kitchen Timer Button if step specifies minutes */}
                      {step.timerMinutes && (
                        <div className="mt-3">
                          <button
                            onClick={() =>
                              onOpenTimer(
                                step.timerMinutes!,
                                `الخطوة ${step.step}: ${recipe.title}`
                              )
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#4E7659] text-white text-xs font-bold shadow-xs hover:bg-[#41634B] active:scale-95 transition"
                          >
                            <Timer className="w-3.5 h-3.5" />
                            <span>تشغيل مؤقت ({step.timerMinutes} دقائق)</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA Bar */}
        <div className="fixed bottom-0 inset-x-0 p-4 bg-white/95 backdrop-blur-md border-t border-[#EDE7DD] flex items-center gap-3 z-40 max-w-3xl mx-auto">
          <button
            onClick={() => onOpenMealPlannerDialog(recipe)}
            className="flex-1 py-3 rounded-2xl bg-[#FAF0E6] text-[#E26D46] hover:bg-[#F5E2D3] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-98 transition"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>جدولة الوجبة</span>
          </button>

          <button
            onClick={handleAddAllToCart}
            className="flex-1 py-3 rounded-2xl bg-[#4E7659] hover:bg-[#41634B] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md active:scale-98 transition"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>قائمة المشتريات</span>
          </button>
        </div>
      </div>
    </div>
  );
};
