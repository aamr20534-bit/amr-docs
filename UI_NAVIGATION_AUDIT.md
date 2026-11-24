# UI_NAVIGATION_AUDIT.md — فحص الواجهات والتنقل والتجاوب

## 1. خريطة الشاشات الرئيسية (`AppView` في `src/App.tsx`)
| الواجهة | المكون | حالة الكود | التوافق مع 320px+ | حالة الاختبار الفعلي (Browser) |
|---|---|---|---|---|
| `dashboard` | `Dashboard.tsx` | PASS (مربوط بالكامل) | PASS (شبكات متجاوبة `grid-cols-1 sm:grid-cols-2`) | BLOCKED (يحتاج متصفح) |
| `word-editor` | `WordEditor.tsx` | PASS (مربوط بالكامل) | PASS (شريط أدوات `flex-nowrap overflow-x-auto` + هوامش `clamp`) | BLOCKED (يحتاج متصفح) |
| `pdf-editor` | `PdfEditor.tsx` | PASS (مربوط بالكامل) | PASS (شريط أدوات `overflow-x-auto` + `touch-none` للرسم) | BLOCKED (يحتاج متصفح) |
| `files` | `FileManager.tsx` | PASS (مربوط بالكامل) | PASS (بطاقات مرنة + أزرار تلتف `flex-wrap`) | BLOCKED (يحتاج متصفح) |
| `templates` | `TemplatesGallery.tsx` | PASS (مربوط بالكامل) | PASS (شبكة `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`) | BLOCKED (يحتاج متصفح) |
| `fonts` | `FontLibrary.tsx` | PASS (مربوط بالكامل) | PASS (حقول متجاوبة وبطاقات مرنة) | BLOCKED (يحتاج متصفح) |
| `settings` | `SettingsView.tsx` | PASS (مربوط بالكامل) | PASS (حقول متجاوبة `grid-cols-1 sm:grid-cols-3`) | BLOCKED (يحتاج متصفح) |

## 2. النوافذ المنبثقة والقوائم الجانبية (`Modals & Drawers`)
- **القائمة الجانبية ودرج الهاتف (`Sidebar.tsx`):** تبديل تلقائي بين القائمة الثابتة (`md:flex`) ودرج الهاتف (`md:hidden`) مع زر إغلاق والنقر على الخلفية (`backdrop-blur-sm`).
- **مركز الطباعة والتصدير (`PrintExportModal.tsx`):** يفتح من `WordEditor` و`PdfEditor`، مع زر إغلاق `X` وتمرير داخلي `max-h-[75vh] overflow-y-auto`.
- **نوافذ `WordEditor.tsx`:** الرموز (`showSymbolModal`)، الروابط (`showLinkModal`)، المعادلات (`showEquationModal`)، الأشكال (`showShapeModal`)، سجل النسخ (`showVersionsModal`)، التعليقات (`showComments`)، جزء التنقل (`showNavPane`)، وشريط التحديد العائم (`selectionToolbarBlockId`).
- **نوافذ `PdfEditor.tsx`:** التوقيع الإلكتروني (`showSignatureModal`)، إدارة الصفحات (`showPageTools`)، وتعليقات PDF (`showPdfComments`).
- **نوافذ `FileManager.tsx`:** مجلد جديد، قسم جديد، نقل لمجلد، نقل لقسم، إعادة تسمية، تفاصيل، تأكيد الحذف، وتأكيد الحذف النهائي.
- **نوافذ `TemplatesGallery.tsx`:** إضافة قالب مخصص (`showAddModal`).

## 3. زر الرجوع في Android (`capacitorBridge.ts` + `App.tsx`)
- `registerAndroidBackHandler`: يغلق درج الهاتف أولاً إذا كان مفتوحاً، ثم يعود من أي شاشة فرعية إلى `dashboard`، ثم يخرج من التطبيق إذا كان في الرئيسية. (الحالة: `PASS` في الكود، `BLOCKED` على الجهاز الفعلي حتى بناء APK).
