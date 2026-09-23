import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share, PlusSquare, X, CheckCircle2, Smartphone } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'banner' | 'compact' | 'header';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'compact' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // If already running in standalone PWA or user dismissed this session
  if (isInstalled || dismissed) {
    return null;
  }

  // Header compact badge
  if (variant === 'header') {
    if (isInstallable) {
      return (
        <button
          onClick={install}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E26D46] text-white text-xs font-semibold shadow-sm active:scale-95 transition"
          title="تثبيت التطبيق على جهازك"
        >
          <Download className="w-3.5 h-3.5" />
          <span>تثبيت التطبيق</span>
        </button>
      );
    }
    if (isIOS) {
      return (
        <>
          <button
            onClick={() => setShowIOSGuide(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#4E7659] text-white text-xs font-semibold shadow-sm active:scale-95 transition"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>تثبيت للآيفون</span>
          </button>

          {showIOSGuide && (
            <IOSGuideModal onClose={() => setShowIOSGuide(false)} />
          )}
        </>
      );
    }
    return null;
  }

  // Banner variant on Home
  return (
    <>
      <div className="mx-4 my-3 p-4 rounded-2xl bg-gradient-to-r from-[#FAF0E6] to-[#F3ECE0] border border-[#E8DEC8] shadow-sm relative overflow-hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4E7659] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-[#242A26] text-sm">ثبّت «طبخات» على شاشة هاتفك</h4>
              <p className="text-xs text-[#606963] mt-0.5 leading-relaxed">
                تصفح أسرع، بدون إنترنت، ووصول فوري لوصفاتك وجدول الطبخ بدون فتح المتصفح.
              </p>
              
              <div className="mt-3 flex items-center gap-2">
                {isInstallable && (
                  <button
                    onClick={install}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#E26D46] text-white text-xs font-bold shadow active:scale-95 transition"
                  >
                    <Download className="w-4 h-4" />
                    تثبيت الآن بنقرة واحدة
                  </button>
                )}
                {isIOS && (
                  <button
                    onClick={() => setShowIOSGuide(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#4E7659] text-white text-xs font-bold shadow active:scale-95 transition"
                  >
                    <Smartphone className="w-4 h-4" />
                    طريقة التثبيت على الآيفون
                  </button>
                )}
                {!isInstallable && !isIOS && (
                  <button
                    onClick={() => setShowIOSGuide(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#4E7659] text-white text-xs font-bold shadow active:scale-95 transition"
                  >
                    <Download className="w-4 h-4" />
                    كيفية إضافة التطبيق
                  </button>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => setDismissed(true)}
            className="text-[#969F99] hover:text-[#242A26] p-1"
            title="إخفاء"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showIOSGuide && (
        <IOSGuideModal onClose={() => setShowIOSGuide(false)} />
      )}
    </>
  );
};

const IOSGuideModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-fadeIn">
      <div className="w-full sm:max-w-md bg-[#FAF8F5] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-[#E9E4DC]">
        <div className="flex items-center justify-between pb-3 border-b border-[#EBE5DB]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#4E7659] flex items-center justify-center text-white">
              <Smartphone className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-[#242A26]">تثبيت «طبخات» على الآيفون</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#606963] hover:text-black border border-[#EBE5DB]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="mt-3 text-xs text-[#606963]">
          لتحصل على تجربة التطبيق الكاملة والشاشة الكاملة مثل تطبيقات App Store، اتبع الخطوتين التاليتين في متصفح سفاري (Safari):
        </p>

        <div className="mt-4 space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-[#EBE5DB]">
            <div className="w-7 h-7 rounded-full bg-[#FAF0E6] text-[#E26D46] flex items-center justify-center font-bold text-xs shrink-0">
              1
            </div>
            <div className="text-xs text-[#242A26] leading-relaxed">
              <span>انقر على أيقونة </span>
              <span className="inline-flex items-center gap-1 font-bold text-[#4E7659] bg-[#E8F0EA] px-2 py-0.5 rounded">
                <Share className="w-3.5 h-3.5" /> مشاركة (Share)
              </span>
              <span> في أسفل شاشة المتصفح.</span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-[#EBE5DB]">
            <div className="w-7 h-7 rounded-full bg-[#FAF0E6] text-[#E26D46] flex items-center justify-center font-bold text-xs shrink-0">
              2
            </div>
            <div className="text-xs text-[#242A26] leading-relaxed">
              <span>مرر للأسفل واضغط على </span>
              <span className="inline-flex items-center gap-1 font-bold text-[#E26D46] bg-[#FAF0E6] px-2 py-0.5 rounded">
                <PlusSquare className="w-3.5 h-3.5" /> إضافة إلى الصفحة الرئيسية
              </span>
              <span> ثم اضغط <strong>إضافة</strong>.</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 p-2.5 rounded-xl bg-[#E8F0EA] text-[#4E7659] text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>سيظهر رمز «طبخات» مباشرة على شاشتك الرئيسية ويعمل بشكل فوري!</span>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-2.5 rounded-xl bg-[#4E7659] text-white text-sm font-bold shadow active:scale-98 transition"
        >
          فهمت ذلك، تم!
        </button>
      </div>
    </div>
  );
};
