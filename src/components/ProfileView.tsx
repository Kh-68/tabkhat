import React, { useState } from 'react';
import { UserProfile, Recipe } from '../types';
import {
  User,
  ChefHat,
  Heart,
  Calendar,
  ShoppingCart,
  Plus,
  Trash2,
  Download,
  Upload,
  Sparkles,
  Smartphone,
  Check,
  Edit2,
  ShieldCheck,
  Bell,
  Star,
} from 'lucide-react';

interface ProfileViewProps {
  profile: UserProfile;
  userRecipes: Recipe[];
  favoritesCount: number;
  shoppingItemsCount: number;
  onUpdateProfile: (updated: UserProfile) => void;
  onDeleteRecipe: (id: string) => void;
  onSelectRecipe: (recipe: Recipe) => void;
  onOpenAddRecipe: () => void;
  onOpenInstallGuide: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  userRecipes,
  favoritesCount,
  shoppingItemsCount,
  onUpdateProfile,
  onDeleteRecipe,
  onSelectRecipe,
  onOpenAddRecipe,
  onOpenInstallGuide,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [skillLevel, setSkillLevel] = useState(profile.skillLevel);
  const [dietaryPrefs, setDietaryPrefs] = useState<string[]>(profile.dietaryPreferences || []);
  const [toast, setToast] = useState<string | null>(null);

  const DIETARY_OPTIONS = [
    'سريع التحضير',
    'قليل السعرات',
    'كيتو دايت',
    'نباتي',
    'خالي من الجلوتين',
    'عائلي واقتصادي',
    'عالي البروتين',
  ];

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...profile,
      name: name.trim() || 'شيف طبخات',
      email: email.trim(),
      skillLevel,
      dietaryPreferences: dietaryPrefs,
    };
    onUpdateProfile(updated);
    setIsEditing(false);
    showToast('تم تحديث الملف الشخصي بنجاح!');
  };

  const toggleDiet = (tag: string) => {
    if (dietaryPrefs.includes(tag)) {
      setDietaryPrefs(dietaryPrefs.filter(t => t !== tag));
    } else {
      setDietaryPrefs([...dietaryPrefs, tag]);
    }
  };

  // Export data as JSON
  const handleExportData = () => {
    const data = {
      profile,
      recipes: userRecipes,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tabkhat_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('تم تصدير نسخة احتياطية من بياناتك!');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-3 space-y-5 pb-28">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-[#242A26] text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-xl animate-slideDown">
          <Check className="w-4 h-4 text-[#4E7659]" />
          <span>{toast}</span>
        </div>
      )}

      {/* User Header Profile Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-b from-white to-[#FAF8F5] border border-[#EDE7DD] shadow-sm relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-md">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-[#242A26] font-heading">
                  {profile.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#E8F0EA] text-[#4E7659] text-[10px] font-bold">
                  {profile.skillLevel}
                </span>
              </div>
              <p className="text-xs text-[#8E9791] mt-0.5">{profile.email}</p>
              <p className="text-xs text-[#606963] mt-1 font-light line-clamp-1">
                {profile.bio || 'محب للطبخ ومشاركة الأطباق اللذيذة.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 rounded-xl bg-[#FAF8F5] border border-[#EDE7DD] text-[#606963] hover:text-[#242A26] active:scale-95 transition"
            title="تعديل الحساب"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-[#F0EAE1] text-center">
          <div className="p-2 rounded-xl bg-white/70 border border-[#EDE7DD]">
            <span className="text-xs text-[#8E9791] block">وصفاتي</span>
            <span className="text-base font-extrabold text-[#242A26] font-heading mt-0.5 block">
              {userRecipes.length}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-white/70 border border-[#EDE7DD]">
            <span className="text-xs text-[#8E9791] block">المفضلة</span>
            <span className="text-base font-extrabold text-[#E26D46] font-heading mt-0.5 block">
              {favoritesCount}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-white/70 border border-[#EDE7DD]">
            <span className="text-xs text-[#8E9791] block">المشتريات</span>
            <span className="text-base font-extrabold text-[#4E7659] font-heading mt-0.5 block">
              {shoppingItemsCount}
            </span>
          </div>
        </div>
      </div>

      {/* Edit Form Drawer */}
      {isEditing && (
        <form onSubmit={handleSave} className="p-5 rounded-3xl bg-white border border-[#EDE7DD] shadow-sm space-y-4 animate-slideDown">
          <h3 className="text-sm font-bold text-[#242A26]">تعديل بيانات الحساب والتفضيلات</h3>

          <div>
            <label className="text-xs font-bold text-[#606963] block mb-1">الاسم</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#EDE7DD] text-xs font-semibold"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#606963] block mb-1">البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#EDE7DD] text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#606963] block mb-1">مستوى الطبخ</label>
            <select
              value={skillLevel}
              onChange={(e) => setSkillLevel(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#EDE7DD] text-xs font-semibold"
            >
              <option value="مبتدئ">مبتدئ</option>
              <option value="هاوي طبخ">هاوي طبخ</option>
              <option value="شيف متمرس">شيف متمرس</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-[#606963] block mb-1.5">التفضيلات الغذائية</label>
            <div className="flex flex-wrap gap-1.5">
              {DIETARY_OPTIONS.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => toggleDiet(tag)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                    dietaryPrefs.includes(tag)
                      ? 'bg-[#4E7659] text-white border-[#4E7659]'
                      : 'bg-[#FAF8F5] text-[#606963] border-[#EDE7DD]'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="flex-1 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#EDE7DD] text-xs font-bold text-[#606963]"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-[#4E7659] text-white text-xs font-bold shadow-sm"
            >
              حفظ التغييرات
            </button>
          </div>
        </form>
      )}

      {/* User's Created Recipes Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChefHat className="w-4 h-4 text-[#4E7659]" />
            <h3 className="text-sm font-bold text-[#242A26] font-heading">
              الوصفات التي أضفتها ({userRecipes.length})
            </h3>
          </div>
          <button
            onClick={onOpenAddRecipe}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FAF0E6] text-[#E26D46] text-xs font-bold transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة وصفة</span>
          </button>
        </div>

        {userRecipes.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white border border-[#EDE7DD] text-center space-y-2">
            <p className="text-xs text-[#8E9791]">لم تضف وصفات خاصة بك حتى الآن.</p>
            <button
              onClick={onOpenAddRecipe}
              className="text-xs font-bold text-[#4E7659] hover:underline"
            >
              أضف أول وصفة لك الآن 🍲
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {userRecipes.map((r) => (
              <div
                key={r.id}
                onClick={() => onSelectRecipe(r)}
                className="flex items-center justify-between p-3 rounded-2xl bg-white border border-[#EDE7DD] hover:border-[#D8CFBF] transition cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={r.image}
                    alt={r.title}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div className="truncate">
                    <h4 className="text-xs sm:text-sm font-bold text-[#242A26] truncate">
                      {r.title}
                    </h4>
                    <span className="text-[10px] text-[#8E9791]">
                      {r.categoryLabel} • {r.prepTime + r.cookTime} د • {r.servings} أشخاص
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`هل تريد حذف وصفة «${r.title}»؟`)) {
                      onDeleteRecipe(r.id);
                      showToast('تم حذف الوصفة.');
                    }
                  }}
                  className="p-2 text-[#969F99] hover:text-red-500 transition"
                  title="حذف الوصفة"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* App & Device Settings */}
      <div className="p-4 rounded-3xl bg-white border border-[#EDE7DD] space-y-3">
        <h4 className="text-xs font-bold text-[#242A26] mb-2">التطبيق والبيانات</h4>

        <button
          onClick={onOpenInstallGuide}
          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FAF8F5] transition text-right"
        >
          <div className="flex items-center gap-2.5 text-xs text-[#242A26] font-semibold">
            <Smartphone className="w-4 h-4 text-[#4E7659]" />
            <span>طريقة تثبيت التطبيق على الشاشة الرئيسية (PWA)</span>
          </div>
          <span className="text-xs text-[#8E9791]">عرض</span>
        </button>

        <button
          onClick={handleExportData}
          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FAF8F5] transition text-right"
        >
          <div className="flex items-center gap-2.5 text-xs text-[#242A26] font-semibold">
            <Download className="w-4 h-4 text-[#E26D46]" />
            <span>تصدير نسخة احتياطية من وصفاتي (JSON)</span>
          </div>
          <span className="text-xs text-[#8E9791]">حفظ</span>
        </button>

        {/* Download complete codebase ZIP */}
        <a
          href="/api/download-zip"
          download="tabkhat-project.zip"
          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FAF8F5] transition text-right"
        >
          <div className="flex items-center gap-2.5 text-xs text-[#242A26] font-semibold">
            <Download className="w-4 h-4 text-[#1E6091]" />
            <span>تحميل كامل كود المشروع (ملف مضغوط ZIP)</span>
          </div>
          <span className="text-xs bg-[#1E6091]/10 text-[#1E6091] px-2 py-0.5 rounded-full font-bold">تحميل ZIP</span>
        </a>
      </div>

      {/* GitHub Direct Push Panel */}
      <div className="p-4 rounded-3xl bg-white border border-[#EDE7DD] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">🐙</span>
            <h4 className="text-xs font-bold text-[#242A26]">رفع ونشر المشروع على GitHub</h4>
          </div>
          <span className="text-[10px] text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-medium">مستودع Kh-68/tabkhat</span>
        </div>
        <p className="text-[11px] text-[#606963] leading-relaxed">
          يمكنك رفع وتحديث كامل المشروع في حسابك على GitHub بنقرة واحدة بإدخال رمز الوصول (Personal Access Token):
        </p>
        <div className="flex gap-2">
          <input
            id="gh-token-input"
            type="password"
            placeholder="ألصق الرمز ghp_..."
            className="flex-1 text-xs px-3 py-2 border border-[#EDE7DD] rounded-xl outline-none focus:border-[#E26D46]"
          />
          <button
            onClick={async () => {
              const input = document.getElementById('gh-token-input') as HTMLInputElement;
              const val = input?.value?.trim();
              if (!val) {
                alert('يرجى لصق رمز الـ Token أولاً');
                return;
              }
              try {
                showToast('جاري الرفع إلى GitHub...');
                const res = await fetch('/api/github-push', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ token: val, repoName: 'tabkhat' }),
                });
                const data = await res.json();
                if (data.success) {
                  showToast('🎉 تم رفع المشروع بنجاح إلى GitHub!');
                  alert('تم رفع ونشر المشروع بنجاح إلى github.com/Kh-68/tabkhat !');
                } else {
                  alert('فشل الرفع: ' + (data.error || 'تأكد من صحة الرمز'));
                }
              } catch (err: any) {
                alert('حدث خطأ أثناء الرفع: ' + err.message);
              }
            }}
            className="px-4 py-2 bg-[#242A26] text-white rounded-xl text-xs font-bold hover:bg-black transition"
          >
            رفع الآن
          </button>
        </div>
      </div>

      {/* Future Features Roadmap (Showing database architectural readiness) */}
      <div className="p-4 rounded-3xl bg-[#F7F4EE] border border-[#E9E3D6] space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#242A26]">
          <Sparkles className="w-3.5 h-3.5 text-[#E26D46]" />
          <span>بنية البيانات المجهزة للميزات المستقبلية</span>
        </div>
        <p className="text-[11px] text-[#606963] leading-relaxed">
          تم تصميم قاعدة البيانات بهيكلية معيارية قابلة للتوسع تدعم: تقييمات وتعليقات المستخدمين، الفيديوهات القصيرة للطبخ، إشعارات تذكير الوجبات، والمزامنة السحابية المتعددة.
        </p>
      </div>
    </div>
  );
};
