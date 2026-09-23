import React, { useState } from 'react';
import { Recipe, RecipeCategory, Ingredient, InstructionStep } from '../types';
import { CATEGORIES } from '../data/categories';
import { X, Plus, Trash2, Camera, Sparkles, Check, Image as ImageIcon, Mic, Volume2, CheckCircle2 } from 'lucide-react';
import { VoiceRecipeRecorder, ParsedRecipeVoiceData } from './VoiceRecipeRecorder';

interface AddRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recipe: Recipe) => void;
}

const PRESET_IMAGES = [
  { url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80', label: 'سلطة وأطباق صحية' },
  { url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80', label: 'مشويات وشواء' },
  { url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80', label: 'بيتزا ومعجنات' },
  { url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=80', label: 'بانكيك وفطور' },
  { url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80', label: 'حلى وشوكولاتة' },
  { url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80', label: 'لحوم وأطباق رئيسية' },
];

export const AddRecipeModal: React.FC<AddRecipeModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<RecipeCategory>('main');
  const [image, setImage] = useState(PRESET_IMAGES[0].url);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [prepTime, setPrepTime] = useState(15);
  const [cookTime, setCookTime] = useState(25);
  const [servings, setServings] = useState(4);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [calories, setCalories] = useState(350);

  // Voice recording accordion state
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [voiceAppliedSuccess, setVoiceAppliedSuccess] = useState(false);

  // Dynamic ingredients
  const [ingredients, setIngredients] = useState<Array<{ name: string; amount: string; unit: string }>>([
    { name: '', amount: '1', unit: 'كوب' },
    { name: '', amount: '2', unit: 'ملعقة كبيرة' },
  ]);

  // Dynamic steps
  const [steps, setSteps] = useState<Array<{ instruction: string; timerMinutes?: string }>>([
    { instruction: '', timerMinutes: '' },
    { instruction: '', timerMinutes: '' },
  ]);

  // Handle voice data parsed into form
  const handleApplyVoiceData = (data: ParsedRecipeVoiceData) => {
    if (data.title) setTitle(data.title);
    if (data.description) setDescription(data.description);
    if (data.category) setCategory(data.category);
    if (data.prepTime) setPrepTime(data.prepTime);
    if (data.cookTime) setCookTime(data.cookTime);
    if (data.servings) setServings(data.servings);
    if (data.difficulty) setDifficulty(data.difficulty);
    if (data.calories) setCalories(data.calories);

    if (data.ingredients && data.ingredients.length > 0) {
      setIngredients(data.ingredients);
    }

    if (data.steps && data.steps.length > 0) {
      setSteps(data.steps);
    }

    setShowVoiceRecorder(false);
    setVoiceAppliedSuccess(true);
    setTimeout(() => setVoiceAppliedSuccess(false), 6000);
  };

  if (!isOpen) return null;

  const handleAddIngredientRow = () => {
    setIngredients([...ingredients, { name: '', amount: '1', unit: 'ملعقة' }]);
  };

  const handleRemoveIngredient = (index: number) => {
    if (ingredients.length <= 1) return;
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleAddStepRow = () => {
    setSteps([...steps, { instruction: '', timerMinutes: '' }]);
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length <= 1) return;
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const catObj = CATEGORIES.find(c => c.id === category) || CATEGORIES[2];

    const parsedIngredients: Ingredient[] = ingredients
      .filter(i => i.name.trim() !== '')
      .map((i, idx) => ({
        id: 'user_ing_' + Date.now() + '_' + idx,
        name: i.name.trim(),
        amount: parseFloat(i.amount) || 1,
        unit: i.unit || 'حبة',
      }));

    const parsedSteps: InstructionStep[] = steps
      .filter(s => s.instruction.trim() !== '')
      .map((s, idx) => ({
        step: idx + 1,
        instruction: s.instruction.trim(),
        timerMinutes: s.timerMinutes ? parseInt(s.timerMinutes) : undefined,
      }));

    const newRecipe: Recipe = {
      id: 'rec_custom_' + Date.now(),
      title: title.trim(),
      description: description.trim() || 'وصفة مميزة ولذيذة من مطبخي الخاص.',
      image: customImageUrl.trim() ? customImageUrl.trim() : image,
      category,
      categoryLabel: catObj.name,
      prepTime: Number(prepTime) || 10,
      cookTime: Number(cookTime) || 20,
      servings: Number(servings) || 4,
      difficulty,
      difficultyLabel: difficulty === 'easy' ? 'سهل' : difficulty === 'medium' ? 'متوسط' : 'متقدم',
      calories: Number(calories) || 300,
      isFeatured: false,
      rating: 5.0,
      reviewCount: 1,
      createdAt: new Date().toISOString().split('T')[0],
      isUserCreated: true,
      authorName: 'أنا (شيف البيت)',
      tags: [catObj.name, 'وصفاتي', 'منزلية'],
      ingredients: parsedIngredients.length > 0 ? parsedIngredients : [
        { id: 'ing1', name: 'المكون الرئيسي', amount: 1, unit: 'طبق' }
      ],
      instructions: parsedSteps.length > 0 ? parsedSteps : [
        { step: 1, instruction: 'اخلط المكونات واطبخها حتى النضج وقدمها ساخنة.' }
      ],
    };

    onSave(newRecipe);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#FAF8F5] animate-fadeIn pb-24">
      {/* Header Bar */}
      <div className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md px-4 py-3 border-b border-[#EDE7DD] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#FAF0E6] text-[#E26D46] flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </div>
          <h2 className="font-bold text-base text-[#242A26] font-heading">
            إضافة وصفة جديدة
          </h2>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#606963] hover:text-black border border-[#EDE7DD]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Voice Recording Card for elderly & busy users */}
        <div className="space-y-3">
          <div
            onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
            className="p-4 rounded-3xl bg-gradient-to-r from-[#FAF0E6] via-[#FFF5EC] to-[#FAF8F5] border-2 border-[#F2D7C5] shadow-xs hover:shadow-md transition cursor-pointer flex items-center justify-between active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#E26D46] to-[#F28C5B] text-white flex items-center justify-center shadow-sm">
                <Mic className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-black text-[#242A26] font-heading">
                    تسجيل الوصفة بالصوت
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E26D46] text-white">
                    جديد لكبار السن والمستعجلين 👵
                  </span>
                </div>
                <p className="text-[11px] text-[#7A6A58] mt-0.5">
                  سجل كلامك أو بلهجتك وسيتكفل التطبيق بفرز وتعبئة كل خانة وتفصيل تلقائياً!
                </p>
              </div>
            </div>

            <button
              type="button"
              className="px-3 py-1.5 rounded-xl bg-white border border-[#E5DACB] text-xs font-bold text-[#E26D46] shrink-0"
            >
              {showVoiceRecorder ? 'إغلاق المايك' : 'فتح المايك 🎙️'}
            </button>
          </div>

          {/* Voice Recorder Component */}
          {showVoiceRecorder && (
            <VoiceRecipeRecorder
              onApplyParsedData={handleApplyVoiceData}
              onClose={() => setShowVoiceRecorder(false)}
            />
          )}

          {/* Success Banner when populated from voice */}
          {voiceAppliedSuccess && (
            <div className="p-3.5 rounded-2xl bg-[#E8F0EA] border border-[#4E7659]/30 text-[#2B4B34] text-xs font-bold flex items-center gap-2.5 animate-slideDown shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-[#4E7659] shrink-0" />
              <span>
                ما شاء الله! تم استخراج اسم الوصفة وجميع المقادير والخطوات وتوزيعها في خاناتها بنجاح من تسجيلك الصوتي. يمكنك الآن مراجعتها وحفظها.
              </span>
            </div>
          )}
        </div>

        {/* Image Preview & Selector */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-[#242A26] block">صورة الوصفة:</label>
          <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-[#EDE7DD] border border-[#E2DBD1] shadow-xs">
            <img
              src={customImageUrl.trim() ? customImageUrl : image}
              alt="صورة الوصفة"
              className="w-full h-full object-cover"
            />
            <label className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-black/80 transition">
              <Camera className="w-3.5 h-3.5" />
              <span>رفع من جهازك</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>

          {/* Quick preset selector */}
          <div>
            <span className="text-[11px] text-[#606963] block mb-1.5">
              أو اختر صورة جاهزة جميلة:
            </span>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {PRESET_IMAGES.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setImage(img.url);
                    setCustomImageUrl('');
                  }}
                  className={`relative w-16 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                    image === img.url && !customImageUrl
                      ? 'border-[#E26D46] scale-105 shadow-sm'
                      : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-[#242A26] block mb-1">
              اسم الطبخة / الوصفة *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: مندي لحم مع الأرز المدخن"
              className="w-full px-4 py-3 rounded-xl bg-white border border-[#EDE7DD] text-sm text-[#242A26] placeholder-[#969F99] focus:outline-none focus:border-[#4E7659] shadow-xs"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#242A26] block mb-1">
              وصف مختصر
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اكتب نبذة قصيرة عن سر نكهة هذه الطبخة وما يميزها..."
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#EDE7DD] text-xs sm:text-sm text-[#242A26] placeholder-[#969F99] focus:outline-none focus:border-[#4E7659] shadow-xs"
            />
          </div>
        </div>

        {/* Category & Difficulty */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-[#242A26] block mb-1">
              التصنيف
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as RecipeCategory)}
              className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#EDE7DD] text-xs font-semibold text-[#242A26] focus:outline-none focus:border-[#4E7659]"
            >
              {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-[#242A26] block mb-1">
              مستوى الصعوبة
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
              className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#EDE7DD] text-xs font-semibold text-[#242A26] focus:outline-none focus:border-[#4E7659]"
            >
              <option value="easy">سهل وبسيط</option>
              <option value="medium">متوسط</option>
              <option value="hard">متقدم وشيف</option>
            </select>
          </div>
        </div>

        {/* Numbers Row */}
        <div className="grid grid-cols-4 gap-2">
          <div>
            <label className="text-[11px] font-bold text-[#606963] block mb-1">التحضير (د)</label>
            <input
              type="number"
              min="1"
              value={prepTime}
              onChange={(e) => setPrepTime(Number(e.target.value))}
              className="w-full px-2 py-2 rounded-xl bg-white border border-[#EDE7DD] text-xs text-center font-bold"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-[#606963] block mb-1">الطبخ (د)</label>
            <input
              type="number"
              min="0"
              value={cookTime}
              onChange={(e) => setCookTime(Number(e.target.value))}
              className="w-full px-2 py-2 rounded-xl bg-white border border-[#EDE7DD] text-xs text-center font-bold"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-[#606963] block mb-1">الأشخاص</label>
            <input
              type="number"
              min="1"
              value={servings}
              onChange={(e) => setServings(Number(e.target.value))}
              className="w-full px-2 py-2 rounded-xl bg-white border border-[#EDE7DD] text-xs text-center font-bold"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-[#606963] block mb-1">السعرات</label>
            <input
              type="number"
              min="50"
              step="10"
              value={calories}
              onChange={(e) => setCalories(Number(e.target.value))}
              className="w-full px-2 py-2 rounded-xl bg-white border border-[#EDE7DD] text-xs text-center font-bold"
            />
          </div>
        </div>

        {/* Ingredients Dynamic Builder */}
        <div className="p-4 rounded-2xl bg-white border border-[#EDE7DD] space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#242A26] flex items-center gap-1.5">
              <span>🧂 المقادير والكميات</span>
              <span className="text-[11px] text-[#8E9791]">({ingredients.length})</span>
            </label>
            <button
              type="button"
              onClick={handleAddIngredientRow}
              className="text-xs font-bold text-[#4E7659] flex items-center gap-1 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" /> إضافة مكون
            </button>
          </div>

          <div className="space-y-2">
            {ingredients.map((ing, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="اسم المكون (مثال: دجاج)"
                  value={ing.name}
                  onChange={(e) => {
                    const next = [...ingredients];
                    next[idx].name = e.target.value;
                    setIngredients(next);
                  }}
                  className="flex-1 px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#EDE7DD] text-xs text-[#242A26] focus:outline-none focus:border-[#4E7659]"
                />
                <input
                  type="text"
                  placeholder="الكمية"
                  value={ing.amount}
                  onChange={(e) => {
                    const next = [...ingredients];
                    next[idx].amount = e.target.value;
                    setIngredients(next);
                  }}
                  className="w-16 px-2 py-2 rounded-xl bg-[#FAF8F5] border border-[#EDE7DD] text-xs text-center font-bold text-[#242A26] focus:outline-none focus:border-[#4E7659]"
                />
                <input
                  type="text"
                  placeholder="الوحدة"
                  value={ing.unit}
                  onChange={(e) => {
                    const next = [...ingredients];
                    next[idx].unit = e.target.value;
                    setIngredients(next);
                  }}
                  className="w-20 px-2 py-2 rounded-xl bg-[#FAF8F5] border border-[#EDE7DD] text-xs text-center text-[#242A26] focus:outline-none focus:border-[#4E7659]"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveIngredient(idx)}
                  className="p-2 text-[#969F99] hover:text-red-500 transition"
                  disabled={ingredients.length <= 1}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Steps Dynamic Builder */}
        <div className="p-4 rounded-2xl bg-white border border-[#EDE7DD] space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#242A26] flex items-center gap-1.5">
              <span>👨‍🍳 خطوات التحضير</span>
              <span className="text-[11px] text-[#8E9791]">({steps.length})</span>
            </label>
            <button
              type="button"
              onClick={handleAddStepRow}
              className="text-xs font-bold text-[#4E7659] flex items-center gap-1 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" /> إضافة خطوة
            </button>
          </div>

          <div className="space-y-3">
            {steps.map((step, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EDE7DD] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#E26D46] bg-[#FAF0E6] px-2 py-0.5 rounded">
                    الخطوة {idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveStep(idx)}
                    className="text-[#969F99] hover:text-red-500 text-xs"
                    disabled={steps.length <= 1}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <textarea
                  rows={2}
                  placeholder="اشرح هذه الخطوة بالتفصيل..."
                  value={step.instruction}
                  onChange={(e) => {
                    const next = [...steps];
                    next[idx].instruction = e.target.value;
                    setSteps(next);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#EDE7DD] text-xs text-[#242A26] focus:outline-none focus:border-[#4E7659]"
                />

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#606963]">مؤقت اختياري (دقائق):</span>
                  <input
                    type="number"
                    placeholder="مثال: 15"
                    min="1"
                    value={step.timerMinutes || ''}
                    onChange={(e) => {
                      const next = [...steps];
                      next[idx].timerMinutes = e.target.value;
                      setSteps(next);
                    }}
                    className="w-20 px-2 py-1 rounded-lg bg-white border border-[#EDE7DD] text-xs text-center"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit CTA */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-[#E26D46] hover:bg-[#D05D36] text-white font-bold text-sm shadow-md active:scale-98 transition flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>حفظ الوصفة في حسابي</span>
          </button>
        </div>
      </form>
    </div>
  );
};
