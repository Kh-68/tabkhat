import React, { useState } from 'react';
import { Recipe, DayOfWeek, MealType } from '../types';
import { DAYS_OF_WEEK, MEAL_TYPES } from '../data/categories';
import { Calendar, X, Check, CalendarCheck } from 'lucide-react';

interface AddToMealPlanModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (recipe: Recipe, day: DayOfWeek, meal: MealType) => void;
}

export const AddToMealPlanModal: React.FC<AddToMealPlanModalProps> = ({
  recipe,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('sat');
  const [selectedMeal, setSelectedMeal] = useState<MealType>('lunch');

  if (!isOpen || !recipe) return null;

  const handleSave = () => {
    onConfirm(recipe, selectedDay, selectedMeal);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-fadeIn">
      <div className="w-full sm:max-w-md bg-[#FAF8F5] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-[#EDE7DD] animate-slideUp">
        <div className="flex items-center justify-between pb-3 border-b border-[#EDE7DD]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#E8F0EA] text-[#4E7659] flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-[#242A26] text-sm">إضافة إلى جدول الطبخ</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#606963] hover:text-black border border-[#EDE7DD]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Recipe Preview */}
        <div className="mt-4 flex items-center gap-3 p-2.5 rounded-2xl bg-white border border-[#EDE7DD]">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-14 h-14 rounded-xl object-cover"
          />
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-[#4E7659] bg-[#E8F0EA] px-2 py-0.5 rounded">
              {recipe.categoryLabel}
            </span>
            <h4 className="text-xs font-bold text-[#242A26] truncate mt-1">
              {recipe.title}
            </h4>
          </div>
        </div>

        {/* Choose Day */}
        <div className="mt-5">
          <label className="text-xs font-bold text-[#242A26] block mb-2">
            اختر يوم الأسبوع:
          </label>
          <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-7">
            {DAYS_OF_WEEK.map((d) => {
              const isSelected = selectedDay === d.key;
              return (
                <button
                  key={d.key}
                  onClick={() => setSelectedDay(d.key as DayOfWeek)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition flex flex-col items-center gap-0.5 border ${
                    isSelected
                      ? 'bg-[#4E7659] text-white border-[#4E7659] shadow-xs'
                      : 'bg-white text-[#606963] border-[#EDE7DD] hover:bg-[#F2ECE2]'
                  }`}
                >
                  <span>{d.short}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Choose Meal */}
        <div className="mt-5">
          <label className="text-xs font-bold text-[#242A26] block mb-2">
            نوع الوجبة:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {MEAL_TYPES.map((m) => {
              const isSelected = selectedMeal === m.key;
              return (
                <button
                  key={m.key}
                  onClick={() => setSelectedMeal(m.key as MealType)}
                  className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition border ${
                    isSelected
                      ? 'bg-[#FAF0E6] text-[#E26D46] border-[#E26D46] shadow-xs'
                      : 'bg-white text-[#242A26] border-[#EDE7DD] hover:bg-[#F2ECE2]'
                  }`}
                >
                  <span className="text-base">{m.icon}</span>
                  <div className="text-right">
                    <div>{m.label}</div>
                    <div className="text-[10px] text-[#8E9791] font-normal">{m.timeHint}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={handleSave}
          className="mt-6 w-full py-3 rounded-2xl bg-[#4E7659] text-white text-xs sm:text-sm font-bold shadow-md hover:bg-[#41634B] active:scale-98 transition flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" />
          <span>تأكيد الإضافة للجدول</span>
        </button>
      </div>
    </div>
  );
};
