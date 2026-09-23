import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '25mb' }));

// Initialize GoogleGenAI server-side with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Endpoint to parse voice or text of recipe into structured fields
app.post('/api/parse-recipe-voice', async (req, res) => {
  try {
    const { transcript, audioBase64, mimeType } = req.body;

    let spokenText = transcript;

    // If audio is provided, transcribe it first
    if (!spokenText && audioBase64) {
      const audioPart = {
        inlineData: {
          mimeType: mimeType || 'audio/webm',
          data: audioBase64,
        },
      };

      const transcribeResponse = await ai.models.generateContent({
        model: 'gemini-3.5-transcribe',
        contents: {
          parts: [
            audioPart,
            { text: 'انسخ هذا المقطع الصوتي بدقة باللغة العربية مع كل تفاصيل الوصفة والكميات.' },
          ],
        },
      });

      spokenText = transcribeResponse.text || '';
    }

    if (!spokenText || typeof spokenText !== 'string' || !spokenText.trim()) {
      return res.status(400).json({ error: 'لم يتم استلام نص أو تسجيل صوتي صالح.' });
    }

    // Now parse spoken recipe into structured JSON using gemini-3.8-flash with responseSchema
    const parseResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `أنت خبير طبخ عربي ومساعد ذكي لتطبيق «طبخات».
قام شخص (قد يكون كبير في السن أو يتحدث باللهجة العامية أو مستعجل) بقول وصفة طبخ بالصوت:
"${spokenText}"

المطلوب: استخراج وتحليل كل جزء من كلامه بدقة وتوزيعه في الخانات المخصصة:
1. اسم الطبخة بدقة (title).
2. وصف مختصر وشهي في سطرين (description).
3. التصنيف (category) من بين:
   - main (أطباق رئيسية)
   - traditional (شعبي وخليجي مثل كبسة، مندي، جريش، مضغوط)
   - breakfast (فطور)
   - fast (سريع)
   - healthy (صحي وسلطات)
   - dessert (حلى وكيك)
   - appetizer (مقبلات وشوربات)
   - drinks (مشروبات وعصائر)
4. وقت التحضير بالدقائق (prepTime) كعدد صحيح.
5. وقت الطبخ بالدقائق (cookTime) كعدد صحيح.
6. عدد الحصص/الأشخاص (servings) كعدد صحيح.
7. مستوى الصعوبة (difficulty) إما easy أو medium أو hard.
8. السعرات الحرارية التقريبية للوجبة (calories) كعدد صحيح.
9. قائمة المقادير والمكونات (ingredients) حيث كل مكون يحتوي:
   - name: اسم المكون بالعربية بدون الكمية (مثلاً "أرز بسمتي"، "دجاج"، "بصل مفروم").
   - amount: الكمية كرقم (مثلاً 1 أو 2 أو 0.5 أو 3).
   - unit: وحدة القياس بالعربية (مثلاً "كوب"، "حبة"، "ملعقة كبيرة"، "كيلو"، "رشة").
10. خطوات التحضير (instructions) مرتبة خطوة بخطوة مع وضع مؤقت (timerMinutes) إن كانت الخطوة تتطلب وقتاً معيناً (مثلاً سلق 20 دقيقة).`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'اسم الوصفة' },
            description: { type: Type.STRING, description: 'وصف مختصر ومحفز للوصفة' },
            category: {
              type: Type.STRING,
              description: 'التصنيف الرئيسي للطبخة: main, traditional, breakfast, fast, healthy, dessert, appetizer, drinks',
            },
            prepTime: { type: Type.INTEGER, description: 'وقت التحضير بالدقائق' },
            cookTime: { type: Type.INTEGER, description: 'وقت الطبخ بالدقائق' },
            servings: { type: Type.INTEGER, description: 'عدد الأشخاص والحصص' },
            difficulty: { type: Type.STRING, description: 'easy or medium or hard' },
            calories: { type: Type.INTEGER, description: 'السعرات التقريبية' },
            ingredients: {
              type: Type.ARRAY,
              description: 'المقادير المذكورة بالاسم والكمية والوحدة',
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: 'اسم المكون' },
                  amount: { type: Type.NUMBER, description: 'الكمية كرقم' },
                  unit: { type: Type.STRING, description: 'الوحدة مثل كوب أو حبة أو ملعقة' },
                },
                required: ['name', 'amount', 'unit'],
              },
            },
            instructions: {
              type: Type.ARRAY,
              description: 'طريقة التحضير خطوة بخطوة',
              items: {
                type: Type.OBJECT,
                properties: {
                  step: { type: Type.INTEGER, description: 'رقم الخطوة 1, 2, 3...' },
                  instruction: { type: Type.STRING, description: 'شرح الخطوة' },
                  timerMinutes: { type: Type.INTEGER, description: 'وقت المؤقت بالدقائق إن ذكر' },
                },
                required: ['step', 'instruction'],
              },
            },
          },
          required: ['title', 'category', 'ingredients', 'instructions'],
        },
      },
    });

    const parsedJson = JSON.parse(parseResponse.text || '{}');
    return res.json({
      success: true,
      data: parsedJson,
      originalTranscript: spokenText,
    });
  } catch (error: any) {
    console.error('Error in /api/parse-recipe-voice:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'حدث خطأ أثناء معالجة الصوت وتحليل الوصفة.',
    });
  }
});

// Direct Project Zip Download route
app.get('/api/download-zip', (req, res) => {
  const zipPath = path.resolve(__dirname, 'public/tabkhat-project.zip');
  if (fs.existsSync(zipPath)) {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="tabkhat-project.zip"');
    return fs.createReadStream(zipPath).pipe(res);
  }
  return res.status(404).send('Archive not found');
});

// Direct GitHub Push API route (optional if user prefers web action)
app.post('/api/github-push', async (req, res) => {
  const { token, repoName = 'tabkhat' } = req.body;
  if (!token) {
    return res.status(400).json({ success: false, error: 'Token is required' });
  }
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    const cleanToken = token.trim();
    const remoteUrl = `https://${cleanToken}@github.com/Kh-68/${repoName}.git`;

    await execAsync('git config user.name "Kh-68" && git config user.email "play1112025@gmail.com"');
    await execAsync('git add .');
    try {
      await execAsync('git commit -m "update: تطبيق طبخات"');
    } catch (e) {
      // Nothing to commit is fine
    }
    await execAsync(`git remote remove origin || true`);
    await execAsync(`git remote add origin ${remoteUrl}`);
    await execAsync(`git branch -M main`);
    await execAsync(`git push -u origin main --force`);

    return res.json({ success: true, message: 'تم رفع المشروع بنجاح إلى GitHub!' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'فشل الرفع إلى GitHub' });
  }
});

// Vite middleware or static dist serving
async function startServer() {
  const port = Number(PORT) || 3000;

  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    // Mount Vite middleware for static assets, HMR, and imports
    app.use(vite.middlewares);

    // Serve index.html transformed by Vite for client-side routing
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const indexPath = path.resolve(__dirname, 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

export default app;

if (!process.env.VERCEL) {
  startServer();
}
