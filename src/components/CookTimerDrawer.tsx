import React, { useState, useEffect } from 'react';
import { Timer, Play, Pause, RotateCcw, X, Bell, Plus, Minus } from 'lucide-react';

interface CookTimerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialMinutes?: number;
  initialTitle?: string;
}

export const CookTimerDrawer: React.FC<CookTimerDrawerProps> = ({
  isOpen,
  onClose,
  initialMinutes = 10,
  initialTitle = 'مؤقت الطبخ',
}) => {
  const [totalSeconds, setTotalSeconds] = useState(initialMinutes * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(initialMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [title, setTitle] = useState(initialTitle);

  useEffect(() => {
    if (initialMinutes > 0) {
      setTotalSeconds(initialMinutes * 60);
      setRemainingSeconds(initialMinutes * 60);
      setTitle(initialTitle);
    }
  }, [initialMinutes, initialTitle]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds(prev => prev - 1);
      }, 1000);
    } else if (remainingSeconds === 0 && isActive) {
      setIsActive(false);
      playAlarmSound();
      if ('vibrate' in navigator) {
        navigator.vibrate([300, 100, 300, 100, 500]);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, remainingSeconds]);

  const playAlarmSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const playChime = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0.3, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };

      playChime(587.33, 0, 0.4); // D5
      playChime(880, 0.2, 0.5);   // A5
      playChime(1174.66, 0.4, 0.8); // D6
    } catch (e) {
      console.log('Audio playback prevented', e);
    }
  };

  const toggleActive = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setRemainingSeconds(totalSeconds);
  };

  const adjustMinutes = (delta: number) => {
    if (isActive) return;
    const newTotal = Math.max(60, totalSeconds + delta * 60);
    setTotalSeconds(newTotal);
    setRemainingSeconds(newTotal);
  };

  if (!isOpen) return null;

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full sm:max-w-sm bg-[#FAF8F5] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-[#E9E4DC] animate-slideUp">
        <div className="flex items-center justify-between pb-3 border-b border-[#EAE4DB]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#FAF0E6] text-[#E26D46] flex items-center justify-center">
              <Timer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-[#242A26] text-sm">{title}</h3>
              <p className="text-[11px] text-[#606963]">مؤقت الطبخ الذكي</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#606963] hover:text-black border border-[#EAE4DB]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Circular Display */}
        <div className="py-8 flex flex-col items-center justify-center relative">
          <div className="relative w-48 h-48 flex items-center justify-center">
            {/* SVG circle */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                className="text-[#EAE4DB]"
                strokeWidth="6"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                className="text-[#E26D46] transition-all duration-300"
                strokeWidth="6"
                strokeDasharray={276.4}
                strokeDashoffset={276.4 - (276.4 * progressPercent) / 100}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>

            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-extrabold text-[#242A26] tracking-tight font-heading">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
              {remainingSeconds === 0 ? (
                <span className="text-xs font-bold text-[#E26D46] animate-pulse mt-1 flex items-center gap-1">
                  <Bell className="w-3.5 h-3.5" /> انتهى الوقت!
                </span>
              ) : (
                <span className="text-xs text-[#758178] mt-1">
                  {isActive ? 'جاري الطبخ...' : 'جاهز للبدء'}
                </span>
              )}
            </div>
          </div>

          {/* Preset adjustments */}
          {!isActive && (
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => adjustMinutes(-5)}
                className="px-3 py-1 rounded-xl bg-white border border-[#E2DBD1] text-xs font-semibold text-[#242A26] active:scale-95 transition"
              >
                - 5 دقائق
              </button>
              <button
                onClick={() => adjustMinutes(-1)}
                className="px-3 py-1 rounded-xl bg-white border border-[#E2DBD1] text-xs font-semibold text-[#242A26] active:scale-95 transition"
              >
                - دقيقة
              </button>
              <button
                onClick={() => adjustMinutes(1)}
                className="px-3 py-1 rounded-xl bg-white border border-[#E2DBD1] text-xs font-semibold text-[#242A26] active:scale-95 transition"
              >
                + دقيقة
              </button>
              <button
                onClick={() => adjustMinutes(5)}
                className="px-3 py-1 rounded-xl bg-white border border-[#E2DBD1] text-xs font-semibold text-[#242A26] active:scale-95 transition"
              >
                + 5 دقائق
              </button>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={resetTimer}
            className="w-12 h-12 rounded-2xl bg-white border border-[#E2DBD1] flex items-center justify-center text-[#606963] active:scale-95 transition shadow-sm"
            title="إعادة ضبط"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={toggleActive}
            className={`flex-1 py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 shadow-md active:scale-98 transition ${
              isActive ? 'bg-[#5B8266] hover:bg-[#4E7659]' : 'bg-[#E26D46] hover:bg-[#D05D36]'
            }`}
          >
            {isActive ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>إيقاف مؤقت</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>{remainingSeconds < totalSeconds ? 'استئناف' : 'بدء المؤقت'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
