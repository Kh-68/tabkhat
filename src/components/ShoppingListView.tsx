import React, { useState } from 'react';
import { ShoppingItem } from '../types';
import {
  ShoppingCart,
  Check,
  Plus,
  Trash2,
  Share2,
  Copy,
  RotateCcw,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';

interface ShoppingListViewProps {
  items: ShoppingItem[];
  onUpdateItems: (items: ShoppingItem[]) => void;
  onRegenerateFromMealPlan: () => void;
}

export const ShoppingListView: React.FC<ShoppingListViewProps> = ({
  items,
  onUpdateItems,
  onRegenerateFromMealPlan,
}) => {
  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('1');
  const [newItemUnit, setNewItemUnit] = useState('حبة');
  const [copiedToast, setCopiedToast] = useState(false);

  const toggleCheck = (id: string) => {
    const updated = items.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    onUpdateItems(updated);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: ShoppingItem = {
      id: 'shop_manual_' + Date.now(),
      name: newItemName.trim(),
      amount: parseFloat(newItemAmount) || 1,
      unit: newItemUnit.trim() || 'حبة',
      category: 'pantry',
      categoryLabel: 'مواد تموينية',
      checked: false,
    };

    onUpdateItems([newItem, ...items]);
    setNewItemName('');
    setNewItemAmount('1');
  };

  const handleClearCompleted = () => {
    onUpdateItems(items.filter(i => !i.checked));
  };

  const handleClearAll = () => {
    onUpdateItems([]);
  };

  const handleShareList = async () => {
    const lines = [
      '🛒 قائمة مشتريات «طبخات» المقترحة:',
      '',
      ...items.map(
        i => `${i.checked ? '✅' : '▫️'} ${i.name}: ${i.amount} ${i.unit}`
      ),
      '',
      'تم الإنشاء بواسطة تطبيق طبخات ✨',
    ];
    const text = lines.join('\n');

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'قائمة مشتريات طبخات',
          text,
        });
        return;
      } catch (e) {
        // Ignored
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const completedCount = items.filter(i => i.checked).length;

  // Group items by category
  const categories: ShoppingItem['category'][] = ['produce', 'meat', 'dairy', 'spices', 'bakery', 'pantry', 'other'];
  const categoryLabels: Record<ShoppingItem['category'], string> = {
    produce: '🥦 خضار وفواكه',
    meat: '🥩 لحوم ودواجن وأسماك',
    dairy: '🧀 ألبان وأجبان وبيض',
    spices: '🧂 توابل وبهارات',
    bakery: '🍞 مخبوزات',
    pantry: '🥫 تموين ومؤونة',
    other: '📦 أخرى',
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-3 space-y-5 pb-28">
      {/* Copied Toast */}
      {copiedToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-[#242A26] text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-xl animate-slideDown">
          <Check className="w-4 h-4 text-[#4E7659]" />
          <span>تم نسخ قائمة المشتريات لمشاركتها!</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-xl font-black text-[#242A26] font-heading flex items-center gap-2">
            <span>🛒 قائمة المشتريات الذكية</span>
          </h1>
          <p className="text-xs text-[#606963] mt-0.5">
            تجميع مقادير وجبات الأسبوع تلقائياً للتسوق بسهولة
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShareList}
            className="w-9 h-9 rounded-xl bg-white border border-[#EDE7DD] shadow-2xs flex items-center justify-center text-[#242A26] hover:text-[#4E7659] active:scale-95 transition"
            title="مشاركة القائمة"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRegenerateFromMealPlan}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FAF0E6] text-[#E26D46] border border-[#F2D2BC] text-xs font-bold shadow-2xs active:scale-95 transition"
            title="إعادة تجميع المقادير من جدول الأسبوع"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>مزامنة الجدول</span>
          </button>
        </div>
      </div>

      {/* Progress & Summary Card */}
      <div className="p-4 rounded-2xl bg-white border border-[#EDE7DD] shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E8F0EA] text-[#4E7659] flex items-center justify-center font-bold text-sm">
            {completedCount}/{items.length}
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#242A26]">عناصر التسوق</h4>
            <p className="text-[11px] text-[#606963]">
              {items.length === 0
                ? 'القائمة فارغة حالياً'
                : completedCount === items.length
                ? '🎉 مبروك! اشتريت كل المقادير'
                : `تبقى ${items.length - completedCount} عناصر للشراء`}
            </p>
          </div>
        </div>

        {completedCount > 0 && (
          <button
            onClick={handleClearCompleted}
            className="text-xs text-[#E26D46] hover:underline font-bold"
          >
            حذف المكتمل ({completedCount})
          </button>
        )}
      </div>

      {/* Add Custom Item Input */}
      <form
        onSubmit={handleAddItem}
        className="p-3 rounded-2xl bg-white border border-[#EDE7DD] shadow-xs flex items-center gap-2"
      >
        <input
          type="text"
          placeholder="أضف غرض جديد (مثال: حليب، بيض...)"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          className="flex-1 px-3 py-2 text-xs sm:text-sm bg-transparent focus:outline-none text-[#242A26] placeholder-[#969F99]"
        />
        <input
          type="text"
          placeholder="الكمية"
          value={newItemAmount}
          onChange={(e) => setNewItemAmount(e.target.value)}
          className="w-14 px-2 py-1.5 text-xs text-center rounded-lg bg-[#FAF8F5] border border-[#EDE7DD] font-bold"
        />
        <input
          type="text"
          placeholder="الوحدة"
          value={newItemUnit}
          onChange={(e) => setNewItemUnit(e.target.value)}
          className="w-16 px-2 py-1.5 text-xs text-center rounded-lg bg-[#FAF8F5] border border-[#EDE7DD]"
        />
        <button
          type="submit"
          disabled={!newItemName.trim()}
          className="p-2.5 rounded-xl bg-[#4E7659] text-white disabled:opacity-30 active:scale-95 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
        </button>
      </form>

      {/* Grouped Shopping Items */}
      {items.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-white border border-[#EDE7DD] space-y-2">
          <ShoppingBag className="w-10 h-10 text-[#C7BEAF] mx-auto" />
          <h3 className="text-sm font-bold text-[#242A26]">قائمة المشتريات فارغة</h3>
          <p className="text-xs text-[#8E9791]">
            يمكنك تجميع مقادير جدول الأسبوع بنقرة واحدة أو إضافة عناصر يدوياً!
          </p>
          <button
            onClick={onRegenerateFromMealPlan}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#4E7659] text-white text-xs font-bold shadow-xs active:scale-95 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>استيراد مقادير جدول الأسبوع</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((catKey) => {
            const catItems = items.filter(i => i.category === catKey);
            if (catItems.length === 0) return null;

            return (
              <div key={catKey} className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-bold text-[#242A26]">
                    {categoryLabels[catKey]}
                  </h3>
                  <span className="text-[10px] text-[#8E9791]">
                    ({catItems.length})
                  </span>
                </div>

                <div className="space-y-1.5">
                  {catItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleCheck(item.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border transition cursor-pointer select-none ${
                        item.checked
                          ? 'bg-[#E8F0EA]/50 border-[#4E7659]/30 text-[#8E9791]'
                          : 'bg-white border-[#EDE7DD] hover:border-[#D5CDC0]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center transition border ${
                            item.checked
                              ? 'bg-[#4E7659] border-[#4E7659] text-white'
                              : 'border-[#CBC3B5] bg-[#FAF8F5]'
                          }`}
                        >
                          {item.checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div>
                          <span
                            className={`text-xs sm:text-sm font-medium ${
                              item.checked ? 'line-through text-[#8E9791]' : 'text-[#242A26]'
                            }`}
                          >
                            {item.name}
                          </span>
                          {item.recipeSource && (
                            <span className="block text-[10px] text-[#8E9791] truncate max-w-[200px]">
                              لوصفة: {item.recipeSource}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-xs font-bold text-[#E26D46] bg-[#FFF2EB] px-2.5 py-1 rounded-lg">
                        {item.amount} {item.unit}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {items.length > 0 && (
        <div className="pt-2 text-center">
          <button
            onClick={handleClearAll}
            className="text-xs text-[#969F99] hover:text-red-500 transition"
          >
            مسح كل عناصر القائمة
          </button>
        </div>
      )}
    </div>
  );
};
