# PERFORMANCE_AUDIT.md — تحليل الأداء والاستقرار

## 1. التحليل المعماري الساكن (Code-Level Performance Analysis)
- **التخزين المحلي (`IndexedDB`):** الملفات الثنائية الكبيرة (`Blob`) والنسخ الاحتياطية والخطوط (`.ttf`/`.otf`) محفوظة في `IndexedDB` وليس في `LocalStorage` — **PASS**.
- **الخطوط الخارجية (`index.html`):** تم جعل رابط Google Fonts غير حاجب (`media="print" onload="this.media='all'"`) لضمان عدم تجميد الإقلاع عند انقطاع الإنترنت — **PASS**.
- **ملاحظة أداء في `WordEditor.tsx` (تحتاج تحسيناً مستقبلياً للمستندات الضخمة):**
  - دالة `commitModel` تنسخ مصفوفة `blocks` وتخزن حتى 30 نسخة في `history` عند كل تعديل نصي (`onChange`). في مستندات 50–100 صفحة، يُوصى مستقبلاً بتجميع `history` بـ `debounce` (مثل كل ثانية) بدلاً من كل حرف.
  - `stats` (`words`/`chars`/`pages`) يعيد مسح كل `blocks` عند كل تغيير؛ يمكن نقله إلى `documentWorker.ts` للمستندات التي تتجاوز 10,000 كلمة.

## 2. جدول اختبارات الأداء الحية (Live Benchmarks — لم تُنفذ داخل البيئة المعزولة)
| الاختبار | الحالة | السبب |
|---|---|---|
| مستند 1 / 10 / 50 / 100 صفحة (زمن الفتح والكتابة) | BLOCKED | يتطلب تشغيل `npm run dev` ومتصفح حقيقي |
| لصق نص ضخم (10,000 – 100,000+ حرف) وزمن الاستجابة | BLOCKED | يتطلب متصفح وDOM حقيقي |
| استهلاك الذاكرة (Heap MB) ومعدل الإطارات (FPS) | BLOCKED | يتطلب Chrome DevTools / Android Profiler |
| امتلاء مساحة التخزين (`QuotaExceededError`) | BLOCKED | يتطلب اختبار متصفح فعلي |
