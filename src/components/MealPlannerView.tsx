import React, { useState } from 'react';
import { WeeklyPlan, DayOfWeek, MealType, Recipe } from '../types';
import { DAYS_OF_WEEK, MEAL_TYPES } from '../data/categories';
import {
  Calendar,
  Sparkles,
  ShoppingCart,
  Trash2,
  Plus,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight,
  Check,
  RotateCcw,
} from 'lucide-react';

interface MealPlannerViewProps {
  plan: WeeklyPlan;
  recipes: Recipe[];
  onUpdatePlan: (newPlan: WeeklyPlan) => void;
  onSelectRecipe: (recipe: Recipe) => void;
  onExportToShoppingList: () => void;
}

export const MealPlannerView: React.FC<MealPlannerViewProps> = ({
  plan,
  recipes,
  onUpdatePlan,
  onSelectRecipe,
  onExportToShoppingList,
}) => {
  const [activeDay, setActiveDay] = useState<DayOfWeek>('sat');
  const [recipePickerTarget, setRecipePickerTarget] = useState<{ day: DayOfWeek; meal: MealType } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAssignRecipe = (recipe: Recipe) => {
    if (!recipePickerTarget) return;
    const { day, meal } = recipePickerTarget;
    const updated = { ...plan };
    if (!updated[day]) {
      updated[day] = {};
    }
    updated[day] = {
      ...updated[day],
      [meal]: recipe,
    };
    onUpdatePlan(updated);
    setRecipePickerTarget(null);
    showToast(`تمت إضافة «${recipe.title}» إلى وجبة ${MEAL_TYPES.find(m => m.key === meal)?.label}!`);
  };

  const handleRemoveMeal = (day: DayOfWeek, meal: MealType) => {
    const updated = { ...plan };
    if (updated[day]) {
      const dayObj = { ...updated[day] };
      delete dayObj[meal];
      updated[day] = dayObj;
      onUpdatePlan(updated);
    }
  };

  // Auto-generate full week meal plan magic
  const handleAutoGenerateWeek = () => {
    const mainDishes = recipes.filter(r => r.category === 'main' || r.category === 'traditional' || r.category === 'fast' || r.category === 'healthy');
    const breakfasts = recipes.filter(r => r.category === 'breakfast' || r.category === 'healthy');
    const dessertsAndDrinks = recipes.filter(r => r.category === 'dessert' || r.category === 'drinks' || r.category === 'appetizer');

    const getRandom = (arr: Recipe[]) => arr[Math.floor(Math.random() * arr.length)];

    const newPlan: WeeklyPlan = {
      sat: { lunch: getRandom(mainDishes), dinner: getRandom(breakfasts) },
      sun: { lunch: getRandom(mainDishes), snack: getRandom(dessertsAndDrinks) },
      mon: { lunch: getRandom(mainDishes), dinner: getRandom(mainDishes) },
      tue: { lunch: getRandom(mainDishes), snack: getRandom(dessertsAndDrinks) },
      wed: { lunch: getRandom(mainDishes), dinner: getRandom(breakfasts) },
      thu: { lunch: getRandom(mainDishes), dinner: getRandom(mainDishes) },
      fri: { lunch: getRandom(mainDishes), snack: getRandom(dessertsAndDrinks) },
    };

    onUpdatePlan(newPlan);
    showToast('✨ تم اقتراح جدول أسبوعي متوازن وشهي بنجاح!');
  };

  const handleClearWeek = () => {
    const emptyPlan: WeeklyPlan = {
      sat: {},
      sun: {},
      mon: {},
      tue: {},
      wed: {},
      thu: {},
      fri: {},
    };
    onUpdatePlan(emptyPlan);
    showToast('تم إفراغ جدول الطبخ.');
  };

  const currentDayData = plan[activeDay] || {};

  return (
    <div className="max-w-2xl mx-auto px-4 py-3 space-y-5 pb-28">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-[#242A26] text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-xl animate-slideDown">
          <Check className="w-4 h-4 text-[#4E7659]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <h1 className="text-xl font-black text-[#242A26] font-heading flex items-center gap-2">
            <span>📅 جدول الطبخ الأسبوعي</span>
          </h1>
          <p className="text-xs text-[#606963] mt-0.5">
            نظّم وجبات عائلتك وتخلص من حيرة «ماذا نأكل اليوم؟»
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAutoGenerateWeek}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-[#FAF0E6] to-[#F7E5D6] text-[#E26D46] border border-[#F2D2BC] text-xs font-bold shadow-2xs hover:shadow-xs active:scale-95 transition"
            title="اقتراح جدول ذكي للأسبوع"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E26D46]" />
            <span>اقتراح الأسبوع</span>
          </button>

          <button
            onClick={onExportToShoppingList}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#4E7659] text-white text-xs font-bold shadow-xs hover:bg-[#41634B] active:scale-95 transition"
            title="تجميع المقادير في قائمة المشتريات"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>تحديث المشتريات</span>
          </button>
        </div>
      </div>

      {/* Days Horizontal Pill Selector */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
        {DAYS_OF_WEEK.map((d) => {
          const isSelected = activeDay === d.key;
          const dayPlan = plan[d.key as DayOfWeek];
          const hasMeals = dayPlan && Object.values(dayPlan).filter(Boolean).length > 0;

          return (
            <button
              key={d.key}
              onClick={() => setActiveDay(d.key as DayOfWeek)}
              className={`flex-1 min-w-[70px] py-2.5 px-2 rounded-2xl text-center transition flex flex-col items-center gap-1 border ${
                isSelected
                  ? 'bg-[#4E7659] text-white border-[#4E7659] shadow-sm scale-102'
                  : 'bg-white text-[#242A26] border-[#EDE7DD] hover:bg-[#F5EFE7]'
              }`}
            >
              <span className="text-xs font-bold">{d.name}</span>
              <div className="flex items-center gap-1">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    hasMeals
                      ? isSelected ? 'bg-white' : 'bg-[#E26D46]'
                      : 'bg-transparent'
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Day Meals List */}
      <div className="space-y-3">
        {MEAL_TYPES.map((meal) => {
          const recipe = currentDayData[meal.key as MealType];

          return (
            <div
              key={meal.key}
              className="p-4 rounded-2xl bg-white border border-[#EDE7DD] shadow-xs"
            >
              {/* Meal header */}
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{meal.icon}</span>
                  <span className="text-xs font-bold text-[#242A26] font-heading">
                    {meal.label}
                  </span>
                  <span className="text-[10px] text-[#8E9791]">
                    ({meal.timeHint})
                  </span>
                </div>

                {recipe && (
                  <button
                    onClick={() => handleRemoveMeal(activeDay, meal.key as MealType)}
                    className="text-[#969F99] hover:text-red-500 p-1 text-xs transition"
                    title="حذف الوجبة"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Recipe card or empty slot */}
              {recipe ? (
                <div
                  onClick={() => onSelectRecipe(recipe)}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EBE4D8] hover:border-[#D5CDC0] transition cursor-pointer active:scale-[0.99]"
                >
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-[#4E7659] bg-[#E8F0EA] px-2 py-0.5 rounded">
                      {recipe.categoryLabel}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-[#242A26] truncate mt-1">
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
                  </div>
                  <ChevronLeft className="w-4 h-4 text-[#969F99]" />
                </div>
              ) : (
                <button
                  onClick={() => setRecipePickerTarget({ day: activeDay, meal: meal.key as MealType })}
                  className="w-full py-3 px-3 rounded-xl border border-dashed border-[#D2C8B8] bg-[#FAF8F5] hover:bg-[#F2ECE2] text-[#606963] hover:text-[#242A26] text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4 text-[#4E7659]" />
                  <span>اختيار طبخة لوجبة {meal.label}</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Clear & Action */}
      <div className="pt-2 flex items-center justify-between text-xs text-[#8E9791]">
        <button
          onClick={handleClearWeek}
          className="flex items-center gap-1 text-[#969F99] hover:text-red-500 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>إفراغ الجدول</span>
        </button>

        <span>جميع التغييرات تُحفظ تلقائياً في حسابك</span>
      </div>

      {/* Recipe Picker Modal */}
      {recipePickerTarget && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-fadeIn">
          <div className="w-full sm:max-w-md max-h-[85vh] bg-[#FAF8F5] rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-[#EDE7DD] flex flex-col animate-slideUp">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDE7DD]">
              <div>
                <h3 className="text-sm font-bold text-[#242A26]">
                  اختر طبخة لـ {MEAL_TYPES.find(m => m.key === recipePickerTarget.meal)?.label} (
                  {DAYS_OF_WEEK.find(d => d.key === recipePickerTarget.day)?.name})
                </h3>
                <p className="text-[11px] text-[#606963]">اختر من وصفاتك المفضلة والمقترحة</p>
              </div>
              <button
                onClick={() => setRecipePickerTarget(null)}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#606963]"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto py-3 space-y-2 flex-1">
              {recipes.map((r) => (
                <div
                  key={r.id}
                  onClick={() => handleAssignRecipe(r)}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-[#EDE7DD] hover:border-[#4E7659] transition cursor-pointer active:scale-[0.99]"
                >
                  <img
                    src={r.image}
                    alt={r.title}
                    className="w-14 h-14 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-[#4E7659] bg-[#E8F0EA] px-2 py-0.5 rounded">
                      {r.categoryLabel}
                    </span>
                    <h4 className="text-xs font-bold text-[#242A26] truncate mt-1">
                      {r.title}
                    </h4>
                    <span className="text-[10px] text-[#8E9791]">
                      {r.prepTime + r.cookTime} دقيقة • {r.servings} أشخاص
                    </span>
                  </div>
                  <Plus className="w-4 h-4 text-[#4E7659]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
