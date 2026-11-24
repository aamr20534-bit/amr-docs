import React, { useRef, useState } from 'react';
import { Search, Star, Trash2, Upload, Type } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { createId } from '../../utils/fileHelpers';

export const FontLibrary: React.FC = () => {
  const { t, fonts, settings, addFont, toggleFavoriteFont, removeFont, showToast, isOnline } = useApp();
  const isAr = settings.language === 'ar';
  const inputRef = useRef<HTMLInputElement>(null);

  const [category, setCategory] = useState<'all' | 'arabic' | 'english' | 'favorites'>('all');
  const [fontSearch, setFontSearch] = useState('');
  const [previewText, setPreviewText] = useState(
    'بسم الله الرحمن الرحيم — AMR DOCS 2026'
  );

  const handleImportFont = async (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files)) {
      const lower = file.name.toLowerCase();
      if (!lower.endsWith('.ttf') && !lower.endsWith('.otf')) {
        showToast(
          isAr ? 'يرجى اختيار ملف خط بصيغة TTF أو OTF' : 'Please select a TTF or OTF font file',
          'error'
        );
        continue;
      }
      const data = await file.arrayBuffer();
      const baseName = file.name.replace(/\.(ttf|otf)$/i, '');
      const isArabicFont = /[\u0600-\u06FF]|arab|cairo|amiri|tajawal|naskh|kufi/i.test(baseName);

      await addFont({
        id: createId('font'),
        name: baseName,
        family: baseName,
        category: isArabicFont ? 'arabic' : 'english',
        format: lower.endsWith('.otf') ? 'otf' : 'ttf',
        isFavorite: false,
        isBuiltIn: false,
        installedAt: Date.now(),
        data,
      });
      showToast(`${isAr ? 'تم تثبيت الخط:' : 'Installed font:'} ${baseName}`, 'success');
    }
  };

  const filtered = fonts.filter((f) => {
    if (category === 'arabic' && f.category !== 'arabic') return false;
    if (category === 'english' && f.category !== 'english') return false;
    if (category === 'favorites' && !f.isFavorite) return false;
    if (fontSearch && !f.name.toLowerCase().includes(fontSearch.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-3 sm:p-6 max-w-6xl mx-auto space-y-5">
      <input
        ref={inputRef}
        type="file"
        accept=".ttf,.otf"
        multiple
        className="hidden"
        onChange={(e) => handleImportFont(e.target.files)}
      />

      <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-800 p-4 sm:p-5 shadow-soft space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Type className="w-5 h-5 text-royal-600" />
            <h1 className="text-lg font-extrabold text-navy-900 dark:text-white">{t('fonts')}</h1>
          </div>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-royal-600 hover:bg-royal-700 text-white text-xs font-bold"
          >
            <Upload className="w-4 h-4" />
            {t('importFont')}
          </button>
        </div>

        {/* Live Preview Input */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 start-3" />
            <input
              type="search"
              value={fontSearch}
              onChange={(e) => setFontSearch(e.target.value)}
              placeholder={isAr ? 'ابحث في الخطوط...' : 'Search fonts...'}
              className="w-full rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 ps-9 pe-3 py-2 text-sm"
            />
          </div>
          <input
            type="text"
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            placeholder={t('previewTextPlaceholder')}
            className="w-full rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 px-3 py-2 text-sm"
          />
        </div>

        {/* One-Click Arabic Web Fonts Download (when online) */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-semibold text-slate-500">
            {isAr ? 'تنزيل خطوط عربية سريعة:' : 'Quick Arabic Fonts:'}
          </span>
          {(['Amiri', 'Tajawal', 'IBM Plex Sans Arabic', 'Readex Pro'] as const).map((gFont) => {
            const installed = fonts.some((f) => f.family === gFont);
            return (
              <button
                key={gFont}
                type="button"
                disabled={installed || !isOnline}
                onClick={async () => {
                  const link = document.createElement('link');
                  link.rel = 'stylesheet';
                  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(gFont)}:wght@400;700&display=swap`;
                  document.head.appendChild(link);
                  await addFont({
                    id: createId('font'),
                    name: gFont,
                    family: gFont,
                    category: 'arabic',
                    format: 'system',
                    isFavorite: false,
                    isBuiltIn: false,
                    installedAt: Date.now(),
                  });
                  showToast(`${isAr ? 'تمت إضافة الخط:' : 'Added font:'} ${gFont}`, 'success');
                }}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-slate-200 dark:border-navy-700 hover:border-royal-500 disabled:opacity-45"
              >
                {installed ? `✓ ${gFont}` : `+ ${gFont}`}
              </button>
            );
          })}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              ['all', t('allFonts')],
              ['arabic', t('arabicFonts')],
              ['english', t('englishFonts')],
              ['favorites', t('favoriteFonts')],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setCategory(id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold ${
                category === id
                  ? 'bg-navy-800 text-white'
                  : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Font Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filtered.map((font) => (
          <div
            key={font.id}
            className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-800 p-4 shadow-soft flex flex-col gap-3"
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="font-bold text-sm text-navy-900 dark:text-white">{font.name}</div>
                <div className="text-[11px] text-slate-400">
                  {font.category.toUpperCase()} • {font.format.toUpperCase()} •{' '}
                  {font.isBuiltIn ? (isAr ? 'مدمج' : 'Built-in') : isAr ? 'مستورد' : 'Imported'}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => toggleFavoriteFont(font.id)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800"
                >
                  <Star
                    className={`w-4 h-4 ${
                      font.isFavorite ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                    }`}
                  />
                </button>
                {!font.isBuiltIn && (
                  <button
                    type="button"
                    onClick={() => removeFont(font.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div
              className="p-3 rounded-xl bg-slate-50 dark:bg-navy-800/70 text-base text-slate-800 dark:text-slate-100 min-h-[54px] flex items-center"
              style={{ fontFamily: `"${font.family}", Cairo, sans-serif` }}
            >
              {previewText || 'AMR DOCS'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
