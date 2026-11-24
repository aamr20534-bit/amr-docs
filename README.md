# AMR Word & PDF Studio (AMR DOCS)

تطبيق ويب وهواتف احترافي متكامل ومستقل لإنشاء وتحرير وتنسيق وإدارة مستندات **Word (.docx)** و **PDF**، مصمم بهوية Microsoft Office الحديثة باللون الأزرق الداكن والأزرق الملكي، ويعمل محليًا بالكامل دون إنترنت عبر **IndexedDB** مع قابلية التحويل إلى تطبيق **Android APK** باستخدام **Capacitor** و **GitHub Actions**.

---

## التقنيات المستخدمة
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Local Storage:** IndexedDB (`idb`) + Web Worker
- **DOCX Engine:** `jszip` + `DOMParser` (لقراءة بنية OOXML الحقيقية) + `docx` (لتصدير ملفات `.docx` الحقيقية مع الجداول والصور والحدود والهوامش والاتجاه RTL/LTR)
- **PDF Engine:** `pdfjs-dist` (عرض عالي الدقة واستخراج النصوص والبحث) + `pdf-lib` + `@pdf-lib/fontkit` (تعديل الصفحات، التدوير، الدمج، التقسيم، الضغط، التوقيع الإلكتروني، وطبقة التحرير)
- **Mobile & APK:** Capacitor 6 (`@capacitor/core`, `@capacitor/android`, `@capacitor/filesystem`, `@capacitor/share`, `@capacitor/status-bar`, `@capacitor/splash-screen`, `@capacitor/app`)

---

## تشغيل المشروع محليًا

```bash
npm install
npm run dev
npm run build
```

---

## دليل الرفع عبر Termux إلى مستودع GitHub مستقل

> **ملاحظة أمنية مهمة:** أنشئ مستودعًا جديدًا ومستقلًا على GitHub لـ **AMR DOCS** (لا تستخدم مستودعًا قديمًا حتى لا تستبدل ملفاته)، ولا تضع Personal Access Token داخل الأكواد أو الملفات. عند طلب كلمة المرور أثناء `git push` استخدم **GitHub Personal Access Token** بدلاً من كلمة مرور الحساب.

```bash
# 1. تثبيت الأدوات المطلوبة في Termux
pkg update -y && pkg install -y git unzip

# 2. السماح بالوصول إلى التخزين
termux-setup-storage

# 3. فك ضغط المشروع في مجلد العمل
unzip /sdcard/Download/AMR_DOCS_PROJECT.zip -d AMR

# 4. الدخول إلى مجلد المشروع
cd AMR

# 5. تهيئة Git
git init -b main
git config user.name "اسم المستخدم"
git config user.email "البريد الإلكتروني"
git add -A
git commit -m "Initial AMR DOCS release"

# 6. ربط مستودع GitHub الجديد ورفع المشروع
git remote add origin https://github.com/USERNAME/AMR.git
git push -u origin main
```

---

## بناء ملف Android APK عبر GitHub Actions

1. افتح مستودع GitHub الجديد على المتصفح.
2. ادخل إلى تبويب **Actions**.
3. اختر **Build AMR DOCS APK** من القائمة.
4. اضغط **Run workflow** وانتظر اكتمال البناء.
5. افتح نتيجة التشغيل ونزّل الـ Artifact باسم **`AMR-DOCS-APK`**.
6. فك ضغط الملف لاستخراج `app-debug.apk` وثبته على هاتف Android.

### إعداد توقيع نسخة Release (اختياري وآمن)
لإنتاج نسخة Release موقعة، أضف الأسرار التالية في **GitHub Repository Settings → Secrets and variables → Actions**:
- `KEYSTORE_BASE64`
- `KEYSTORE_PASSWORD`
- `KEY_ALIAS`
- `KEY_PASSWORD`

---

## القيود المعروفة والمميزات الخارجية
1. **تحرير PDF:** يعتمد المحرر على **طبقة تحرير إضافية (Overlay Layer)** يتم دمجها داخل بنية PDF عبر `PDF-Lib` عند الحفظ (إضافة نصوص، أشكال، توقيعات، صور، وإدارة صفحات). لا يدعم المحرر المحلي إعادة تدفق (Reflow) النصوص المضمّنة الأصلية داخل PDF.
2. **الميزات الخادمية المتقدمة لـ DOCX:** ميزات مثل تتبع التغييرات المتقدم متعدد المستخدمين (Track Changes) ومحرر المعادلات الرياضية المعقد (OMML) تتطلب خادم **ONLYOFFICE Docs** أو **Collabora Online** (تتوفر حقول ربط اختيارية لها في صفحة الإعدادات).
3. **التدقيق الإملائي:** يعتمد على محرك التدقيق الإملائي المدمج في المتصفح (`spellcheck`).
