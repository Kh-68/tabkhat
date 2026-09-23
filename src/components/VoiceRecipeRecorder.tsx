import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Sparkles, Loader2, Volume2, CheckCircle2, AlertCircle, RotateCcw, Play } from 'lucide-react';
import { RecipeCategory } from '../types';

export interface ParsedRecipeVoiceData {
  title: string;
  description: string;
  category: RecipeCategory;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  calories: number;
  ingredients: Array<{ name: string; amount: string; unit: string }>;
  steps: Array<{ instruction: string; timerMinutes?: string }>;
}

interface VoiceRecipeRecorderProps {
  onApplyParsedData: (data: ParsedRecipeVoiceData) => void;
  onClose?: () => void;
}

// Sample voice recordings for elderly or fast demonstration
const SAMPLE_VOICE_PROMPTS = [
  {
    title: 'مندي دجاج مع أرز بالزعفران',
    text: 'أبغى أسوي مندي دجاج، حبة دجاج كاملة مقطعة نصين، مع ثلاث كاسات رز بسمتي مغسول، وبصلتين مقطعة صغار، وأربع فصوص ثوم، وملعقة بهارات مندي، وملعقة ملح وليمون أسود. أول شي تبل الدجاج بالبهارات والزعفران ودخله الفرن ساعة على حرارة مئتين، بعدين احمس البصل والثوم واطبخ الرز مع مرقة الدجاج عشرين دقيقة، وبخر الرز بقطعة فحم وزيت. تكفي أربع أشخاص والتحضير ربع ساعة.',
  },
  {
    title: 'شوربة عدس دافئة بالكمون',
    text: 'شوربة عدس صفراء، حطي كاستين عدس أصفر مغسول، وحبة جزر مقطعة، وحبة بطاطس، وبصلة مفرومة، وثلاث ملاعق زيت زيتون، وملعقة كمون وملعقة ملح. أول خطوة اسلقي العدس مع الخضار والموية نص ساعة لين تستوي، بعدين اخلطيها بالخلاط لين تصير ناعمة، وآخر شي حمري بصلة بشوية زيت وصبيها فوق الشوربة مع رشة كمون وقدميها مع ليمون. تكفي خمس أشخاص والتحضير عشر دقايق.',
  },
  {
    title: 'شكشوكة طماطم بالبيض والجبن',
    text: 'شكشوكة فطور سريعة، أربع حبات بيض، وثلاث حبات طماطم مقطعة ناعم، وبصلة مفرومة، وفصين ثوم، وفلفل رومي أخضر، وملعقة معجون طماطم ورشة ملح وفلفل أسود وجبنة فيتا للوجه. احمس البصل والفلفل والثوم خمس دقايق، بعدين حط الطماطم والصلصة وخليها تتسبك عشر دقايق، بعدين سوي فتحات واكسر البيض وغطي المقلاة سبع دقايق لين يستوي البيض وزينها بالجبن والكزبرة. تكفي شخصين.',
  },
];

export const VoiceRecipeRecorder: React.FC<VoiceRecipeRecorderProps> = ({
  onApplyParsedData,
  onClose,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('اضغط على المايك وتحدث براحتك بالعامية أو الفصحى');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerIntervalRef = useRef<any>(null);

  // Initialize SpeechRecognition if available
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'ar-SA'; // Arabic (Saudi Arabia)

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript + ' ';
        }
        setTranscript(currentTranscript.trim());
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMessage('يرجى السماح للتطبيق باستخدام الميكروفون من إعدادات المتصفح.');
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Timer while recording
  useEffect(() => {
    if (isRecording) {
      setRecordingSeconds(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  }, [isRecording]);

  const startRecording = async () => {
    setErrorMessage(null);
    setTranscript('');
    setAudioChunks([]);

    // 1. Try starting Web Speech Recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Recognition start error:', err);
      }
    }

    // 2. Also start MediaRecorder for audio backup
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        const chunks: Blob[] = [];
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };
        mediaRecorder.onstop = () => {
          setAudioChunks(chunks);
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start();
      } catch (err: any) {
        console.warn('Microphone permission not granted:', err);
        if (!recognitionRef.current) {
          setErrorMessage('لم يتم السماح بالميكروفون. يمكنك كتابة النص أو اختيار نموذج صوتي جاهز.');
          return;
        }
      }
    }

    setIsRecording(true);
    setStatusMessage('نستمع إليك الآن... تحدث بصوتك الطبيعي وسنسجل كل كلمة!');
  };

  const stopRecording = () => {
    setIsRecording(false);
    setStatusMessage('تم إيقاف التسجيل. يمكنك مراجعة الكلام والضغط على زر التحليل الذكي.');

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
  };

  const handleToggleRecord = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Convert audio blob to base64 if needed
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = (reader.result as string).split(',')[1];
        resolve(base64data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Process recorded transcript or audio with Gemini
  const handleProcessSpeech = async (overrideText?: string) => {
    const textToSend = overrideText || transcript;

    if (!textToSend.trim() && audioChunks.length === 0) {
      setErrorMessage('يرجى التحدث أولاً أو كتابة مقادير الوصفة لتحليلها.');
      return;
    }

    setIsProcessing(true);
    setStatusMessage('جارٍ تحليل الصوت واستخراج المقادير والخطوات وتوزيعها في الخانات... ✨');
    setErrorMessage(null);

    try {
      let audioBase64: string | undefined = undefined;
      let mimeType: string | undefined = undefined;

      if (!textToSend.trim() && audioChunks.length > 0) {
        const audioBlob = new Blob(audioChunks, { type: audioChunks[0].type || 'audio/webm' });
        audioBase64 = await blobToBase64(audioBlob);
        mimeType = audioBlob.type;
      }

      const response = await fetch('/api/parse-recipe-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: textToSend.trim(),
          audioBase64,
          mimeType,
        }),
      });

      const resData = await response.json();

      if (resData.success && resData.data) {
        const d = resData.data;

        // Map parsed ingredients into form string format
        const formattedIngredients = (d.ingredients || []).map((ing: any) => ({
          name: ing.name || 'مكون',
          amount: ing.amount !== undefined ? String(ing.amount) : '1',
          unit: ing.unit || 'حبة',
        }));

        // Map parsed steps into form string format
        const formattedSteps = (d.instructions || []).map((st: any) => ({
          instruction: st.instruction || '',
          timerMinutes: st.timerMinutes ? String(st.timerMinutes) : '',
        }));

        const result: ParsedRecipeVoiceData = {
          title: d.title || 'طبق منزلي شهي',
          description: d.description || 'طبق لذيذ تم تسجيله صوتياً.',
          category: (d.category as RecipeCategory) || 'main',
          prepTime: Number(d.prepTime) || 15,
          cookTime: Number(d.cookTime) || 30,
          servings: Number(d.servings) || 4,
          difficulty: d.difficulty === 'hard' ? 'hard' : d.difficulty === 'medium' ? 'medium' : 'easy',
          calories: Number(d.calories) || 400,
          ingredients: formattedIngredients.length > 0 ? formattedIngredients : [{ name: 'مكون رئيسي', amount: '1', unit: 'طبق' }],
          steps: formattedSteps.length > 0 ? formattedSteps : [{ instruction: textToSend, timerMinutes: '' }],
        };

        onApplyParsedData(result);
        if (onClose) onClose();
      } else {
        throw new Error(resData.error || 'لم نتمكن من تحليل الوصفة بالشكل المطلوب.');
      }
    } catch (err: any) {
      console.warn('Backend parse error, using client Arabic fallback parser:', err);
      // Client-side fallback so it never fails even if backend is unreachable or offline!
      const fallbackResult = fallbackArabicParser(textToSend);
      onApplyParsedData(fallbackResult);
      if (onClose) onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  // Local Arabic parser fallback in case of offline or server issue
  const fallbackArabicParser = (text: string): ParsedRecipeVoiceData => {
    const lines = text.split(/[،,.\n]+/).map(s => s.trim()).filter(Boolean);
    const title = lines[0] || 'وصفة مسجلة بالصوت';

    // Simple ingredient heuristic extraction
    const rawIngs = lines.slice(1, Math.min(lines.length, 6));
    const ingredients = rawIngs.map((line) => {
      // detect numbers
      const matchNum = line.match(/\d+/);
      const amount = matchNum ? matchNum[0] : '1';
      return {
        name: line.replace(/\d+/, '').trim() || 'مكون',
        amount: amount,
        unit: line.includes('كيلو') ? 'كيلو' : line.includes('كوب') || line.includes('كاس') ? 'كوب' : line.includes('ملعقة') ? 'ملعقة' : 'حبة',
      };
    });

    const steps = lines.slice(Math.min(lines.length, 6)).map((line, idx) => ({
      instruction: line,
      timerMinutes: line.includes('دقيقة') ? '20' : '',
    }));

    return {
      title,
      description: text.slice(0, 100) + '...',
      category: text.includes('حلى') || text.includes('كيك') ? 'dessert' : text.includes('فطور') || text.includes('بيض') ? 'breakfast' : 'traditional',
      prepTime: 15,
      cookTime: 35,
      servings: 4,
      difficulty: 'easy',
      calories: 450,
      ingredients: ingredients.length > 0 ? ingredients : [{ name: 'مكون رئيسي', amount: '1', unit: 'طبق' }],
      steps: steps.length > 0 ? steps : [{ instruction: text, timerMinutes: '15' }],
    };
  };

  const handleUseSample = (sample: typeof SAMPLE_VOICE_PROMPTS[0]) => {
    setTranscript(sample.text);
    handleProcessSpeech(sample.text);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="p-5 rounded-3xl bg-gradient-to-b from-[#FFF9F2] to-[#FAF5EC] border-2 border-[#EADAC5] shadow-md space-y-4">
      {/* Friendly Title & Description for elderly / busy users */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#E26D46] to-[#F28C5B] text-white flex items-center justify-center shadow-sm">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-[#242A26] font-heading flex items-center gap-1.5">
              <span>التسجيل بالصوت الذكي</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E8F0EA] text-[#4E7659] font-bold">
                سهل وسريع للجميع 👵👴
              </span>
            </h3>
            <p className="text-[11px] text-[#786452] font-medium">
              تكلمي أو تكلم براحتك.. والتطبيق سيفهم المقادير والخطوات ويوزع كل تفصيل في خانته فوراً!
            </p>
          </div>
        </div>
      </div>

      {/* Big Tactile Microphone Button */}
      <div className="flex flex-col items-center justify-center py-4">
        <div className="relative flex items-center justify-center">
          {/* Pulsing rings when recording */}
          {isRecording && (
            <>
              <div className="absolute w-28 h-28 rounded-full bg-[#E26D46]/20 animate-ping" />
              <div className="absolute w-24 h-24 rounded-full bg-[#E26D46]/30 animate-pulse" />
            </>
          )}

          <button
            type="button"
            onClick={handleToggleRecord}
            disabled={isProcessing}
            className={`relative z-10 w-20 h-20 rounded-full flex flex-col items-center justify-center text-white shadow-xl transition-all duration-300 active:scale-90 ${
              isRecording
                ? 'bg-red-500 scale-105 shadow-red-500/40'
                : 'bg-gradient-to-tr from-[#E26D46] to-[#F28C5B] hover:shadow-orange-500/40'
            }`}
          >
            {isRecording ? (
              <MicOff className="w-8 h-8 animate-bounce" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
          </button>
        </div>

        <div className="text-center mt-3">
          {isRecording ? (
            <div className="flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span className="text-xs font-black text-red-600 font-heading">
                جارٍ التسجيل الآن... ({formatSeconds(recordingSeconds)})
              </span>
            </div>
          ) : (
            <span className="text-xs font-bold text-[#242A26]">
              اضغط على المايك لبدء التحدث
            </span>
          )}
          <p className="text-[11px] text-[#7A6A58] mt-0.5 max-w-xs mx-auto">
            {statusMessage}
          </p>
        </div>
      </div>

      {/* Live Transcript Box */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[#242A26] flex items-center gap-1.5">
            <span>الكلام المسجل:</span>
          </label>
          {transcript && (
            <button
              type="button"
              onClick={() => setTranscript('')}
              className="text-[11px] text-[#8E9791] hover:text-red-500 flex items-center gap-0.5"
            >
              <RotateCcw className="w-3 h-3" /> مسح النص
            </button>
          )}
        </div>

        <textarea
          rows={3}
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="سيظهر كلامك المسجل هنا تلقائياً، أو يمكنك كتابته بلهجتك وسيقوم الذكاء الاصطناعي بتنظيمه وتعبئة جميع الخانات..."
          className="w-full p-3 rounded-2xl bg-white border border-[#E0D5C3] text-xs sm:text-sm text-[#242A26] placeholder-[#A3998D] focus:outline-none focus:border-[#4E7659] shadow-inner"
        />
      </div>

      {/* Action CTA: Analyze and Populate Form */}
      {transcript.trim().length > 0 && !isRecording && (
        <button
          type="button"
          onClick={() => handleProcessSpeech()}
          disabled={isProcessing}
          className="w-full py-3 px-4 rounded-2xl bg-[#4E7659] hover:bg-[#3D5E46] text-white text-xs sm:text-sm font-bold shadow-md active:scale-98 transition flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>جارٍ توزيع المقادير والخطوات في خاناتها...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-[#F2C078]" />
              <span>تطبيق المقادير والخطوات وتعبئة الخانات فوراً ✨</span>
            </>
          )}
        </button>
      )}

      {/* Error Message if any */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Ready-made Audio Examples for Demonstration & Quick Testing */}
      <div className="pt-2 border-t border-[#EAE0D2]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-[#7A6A58] flex items-center gap-1">
            <Play className="w-3 h-3 text-[#E26D46]" />
            <span>أو جرب مثال صوتي جاهز بنقرة واحدة:</span>
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {SAMPLE_VOICE_PROMPTS.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleUseSample(sample)}
              disabled={isProcessing}
              className="px-3 py-1.5 rounded-xl bg-white border border-[#E5DACB] text-[11px] font-semibold text-[#242A26] hover:border-[#E26D46] hover:text-[#E26D46] whitespace-nowrap shadow-2xs active:scale-95 transition flex items-center gap-1 shrink-0"
            >
              <span>🎙️</span>
              <span>{sample.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
