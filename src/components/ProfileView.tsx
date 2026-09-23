import React, { useState } from 'react';
import { UserProfile, Recipe } from '../types';
import { useAuth } from '../context/AuthContext';
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
  LogIn,
  LogOut,
  Cloud,
  CheckCircle2,
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
  const { currentUser, userData, login, logout, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
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

  const handleGoogleLogin = async () => {
    try {
      setIsLoggingIn(true);
      const user = await login();
      showToast(`أهلاً بك يا ${user.displayName || 'شيف طبخات'}! تم تسجيل الدخول بنجاح.`);
    } catch (err: any) {
      console.error('Login error:', err);
      showToast('تعذر تسجيل الدخول، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      showToast('تم تسجيل الخروج بنجاح.');
    } catch (err) {
      showToast('حدث خطأ أثناء تسجيل الخروج.');
    }
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

  const activeName = currentUser?.displayName || userData?.displayName || profile.name;
  const activeEmail = currentUser?.email || userData?.email || profile.email;
  const activeAvatar = currentUser?.photoURL || userData?.photoURL || profile.avatar;

  return (
    <div className="max-w-2xl mx-auto px-4 py-3 space-y-5 pb-28">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-[#242A26] text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-xl animate-slideDown">
          <Check className="w-4 h-4 text-[#4E7659]" />
          <span>{toast}</span>
        </div>
      )}

      {/* Firebase Authentication & Cloud Sync Banner */}
      <div className="p-4 rounded-3xl bg-white border border-[#EDE7DD] shadow-xs">
        {currentUser ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-[#EDE7DD]">
                <img src={activeAvatar} alt={activeName} className="w-full h-full object-cover" />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#242A26]">{activeName}</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[10px] font-semibold">
                    <Cloud className="w-3 h-3" /> متصل بـ Firebase
                  </span>
                </div>
                <p className="text-[11px] text-[#8E9791] mt-0.5">{activeEmail}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold transition active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-xl shrink-0">
                🔥
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#242A26]">سجّل دخولك لحفظ ومزامنة حسابك</h4>
                <p className="text-[11px] text-[#606963] mt-0.5 leading-relaxed">
                  اربط حسابك مع Firebase لحفظ وصفاتك، مفضلتك، وقوائم المشتريات ومزامنتها على كل أجهزتك.
                </p>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-[#EDE7DD] shadow-2xs hover:bg-[#FAF8F5] text-xs font-bold text-[#242A26] transition active:scale-95 shrink-0"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isLoggingIn ? 'جاري الاتصال...' : 'تسجيل الدخول عبر Google'}</span>
            </button>
          </div>
        )}
      </div>

      {/* User Header Profile Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-b from-white to-[#FAF8F5] border border-[#EDE7DD] shadow-sm relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-md">
              <img
                src={activeAvatar}
                alt={activeName}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-[#242A26] font-heading">
                  {activeName}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#E8F0EA] text-[#4E7659] text-[10px] font-bold">
                  {profile.skillLevel}
                </span>
              </div>
              <p className="text-xs text-[#8E9791] mt-0.5">{activeEmail}</p>
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
