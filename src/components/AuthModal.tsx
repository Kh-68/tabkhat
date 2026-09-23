import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Info
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (message: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { loginGoogle, loginEmail, registerEmail, resetPassword } = useAuth();
  
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const getFriendlyErrorMessage = (code: string) => {
    if (code.includes('user-not-found') || code.includes('invalid-credential') || code.includes('wrong-password')) {
      return 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
    }
    if (code.includes('email-already-in-use')) {
      return 'هذا البريد الإلكتروني مسجل مسبقاً، يمكنك تسجيل الدخول به.';
    }
    if (code.includes('weak-password')) {
      return 'كلمة المرور ضعيفة. يرجى اختيار 6 أحرف أو أكثر.';
    }
    if (code.includes('invalid-email')) {
      return 'صيغة البريد الإلكتروني غير صحيحة.';
    }
    if (code.includes('operation-not-allowed')) {
      return 'تسجيل الدخول بالبريد الإلكتروني يتطلب تفعيل موفر (Email/Password) من لوحة تحكم Firebase.';
    }
    if (code.includes('popup-closed-by-user')) {
      return 'تم إلغاء نافذة تسجيل الدخول.';
    }
    return 'حدث خطأ أثناء الاتصال، يرجى المحاولة مرة أخرى.';
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const user = await loginGoogle();
      onSuccess?.(`مرحباً بك يا ${user.displayName || 'شيف طبخات'}! تم تسجيل الدخول بنجاح.`);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(getFriendlyErrorMessage(err.code || err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    if (!email.trim()) {
      setError('يرجى إدخال البريد الإلكتروني.');
      return;
    }

    if (mode === 'forgot') {
      try {
        setLoading(true);
        await resetPassword(email.trim());
        setInfoMessage('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني بنجاح!');
      } catch (err: any) {
        setError(getFriendlyErrorMessage(err.code || err.message || ''));
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!password || password.length < 6) {
      setError('يجب ألا تقل كلمة المرور عن 6 خانات.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const user = await registerEmail(email.trim(), password, displayName.trim() || 'طاهٍ جديد');
        onSuccess?.(`أهلاً بك يا ${user.displayName || 'طاهٍ جديد'}! تم إنشاء حسابك بنجاح.`);
      } else {
        const user = await loginEmail(email.trim(), password);
        onSuccess?.(`أهلاً بعودتك يا ${user.displayName || 'شيف طبخات'}!`);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(getFriendlyErrorMessage(err.code || err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#EDE7DD] overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-[#EDE7DD]/60 bg-gradient-to-b from-[#FAF8F5] to-white">
          <button
            onClick={onClose}
            className="absolute left-4 top-4 p-2 rounded-xl text-[#8E9791] hover:text-[#242A26] hover:bg-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 h-8 rounded-xl bg-[#4E7659]/10 text-[#4E7659] flex items-center justify-center text-lg">
              🍳
            </span>
            <h3 className="text-lg font-black text-[#242A26] font-heading">
              {mode === 'signin' && 'تسجيل الدخول إلى طبخات'}
              {mode === 'signup' && 'إنشاء حساب جديد في طبخات'}
              {mode === 'forgot' && 'استعادة كلمة المرور'}
            </h3>
          </div>
          <p className="text-xs text-[#606963]">
            {mode === 'signin' && 'سجّل دخولك للوصول لوصفاتك ومزامنتها على كل أجهزتك.'}
            {mode === 'signup' && 'انضم إلى مجتمع طبخات وابدأ في ابتكار وحفظ وصفاتك.'}
            {mode === 'forgot' && 'أدخل بريدك الإلكتروني وسنرسل لك رابط استعادة كلمة المرور.'}
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* Quick Google Sign In */}
          {mode !== 'forgot' && (
            <div>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-white border border-[#EDE7DD] text-xs font-bold text-[#242A26] shadow-2xs hover:bg-[#FAF8F5] transition active:scale-[0.99] disabled:opacity-50"
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
                <span>المتابعة عبر حساب Google</span>
              </button>

              <div className="relative my-4 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#EDE7DD]" />
                </div>
                <span className="relative bg-white px-3 text-[11px] text-[#8E9791] font-medium">
                  أو باستخدام البريد الإلكتروني
                </span>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-2.5 text-red-600 text-xs leading-relaxed animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Info Alert */}
          {infoMessage && (
            <div className="p-3 rounded-2xl bg-green-50 border border-green-100 flex items-start gap-2.5 text-green-700 text-xs leading-relaxed animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{infoMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-[#242A26] mb-1">الاسم أو اللقب</label>
                <div className="relative">
                  <User className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E9791]" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="مثال: الشيف سارة"
                    className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#EDE7DD] text-xs text-[#242A26] focus:bg-white focus:border-[#4E7659] focus:outline-hidden transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#242A26] mb-1">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E9791]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#EDE7DD] text-xs text-[#242A26] focus:bg-white focus:border-[#4E7659] focus:outline-hidden transition text-left"
                  dir="ltr"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#242A26]">كلمة المرور</label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); setError(null); }}
                      className="text-[11px] text-[#4E7659] hover:underline"
                    >
                      نسيت كلمة المرور؟
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E9791]" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#EDE7DD] text-xs text-[#242A26] focus:bg-white focus:border-[#4E7659] focus:outline-hidden transition text-left"
                    dir="ltr"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-[#4E7659] text-white text-xs font-bold shadow-md hover:bg-[#3d5e46] active:scale-[0.99] transition disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span>جاري المعالجة...</span>
              ) : mode === 'signin' ? (
                'تسجيل الدخول'
              ) : mode === 'signup' ? (
                'إنشاء الحساب'
              ) : (
                'إرسال رابط الاستعادة'
              )}
            </button>
          </form>

          {/* Mode Switcher */}
          <div className="pt-2 text-center text-xs text-[#606963]">
            {mode === 'signin' && (
              <p>
                ليس لديك حساب بعد؟{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError(null); }}
                  className="font-bold text-[#4E7659] hover:underline"
                >
                  إنشاء حساب جديد
                </button>
              </p>
            )}

            {mode === 'signup' && (
              <p>
                لديك حساب بالفعل؟{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setError(null); }}
                  className="font-bold text-[#4E7659] hover:underline"
                >
                  تسجيل الدخول
                </button>
              </p>
            )}

            {mode === 'forgot' && (
              <button
                type="button"
                onClick={() => { setMode('signin'); setError(null); }}
                className="font-bold text-[#4E7659] hover:underline flex items-center justify-center gap-1 mx-auto"
              >
                <span>العودة لتسجيل الدخول</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
