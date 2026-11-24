import React, { useState } from 'react';
import { HardDrive, Info, ShieldCheck, Trash2, Type } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatBytes } from '../../utils/fileHelpers';
import { checkServerReachability, validateExternalServerUrl } from '../../engines/collaboraConnector';

export const SettingsView: React.FC = () => {
  const {
    t,
    settings,
    updateSettings,
    fonts,
    documents,
    storageInfo,
    removeDocumentForever,
    setView,
    showToast,
  } = useApp();

  const isAr = settings.language === 'ar';
  const [showPrivacy, setShowPrivacy] = useState(false);

  const trashDocs = documents.filter((d) => d.isDeleted);

  const handleEmptyTrash = async () => {
    for (const d of trashDocs) {
      await removeDocumentForever(d.id);
    }
    showToast(isAr ? 'تم إفراغ سلة المحذوفات' : 'Trash emptied', 'success');
  };

  return (
    <div className="p-3 sm:p-6 max-w-4xl mx-auto space-y-5">
      <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-800 p-5 shadow-soft">
        <h1 className="text-lg font-extrabold text-navy-900 dark:text-white">{t('settings')}</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {isAr
            ? 'تخصيص المظهر، اللغة، الخطوط الافتراضية، الحفظ التلقائي، والتخزين المحلي'
            : 'Customize appearance, language, default fonts, auto-save, and local storage'}
        </p>
      </div>

      {/* Appearance & Language */}
      <section className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-800 p-5 shadow-soft space-y-4 text-sm">
        <h2 className="font-bold text-navy-900 dark:text-white">
          {isAr ? 'المظهر واللغة' : 'Appearance & Language'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              {isAr ? 'سمة التطبيق' : 'Theme'}
            </label>
            <select
              value={settings.theme}
              onChange={(e) => updateSettings({ theme: e.target.value as 'light' | 'dark' | 'auto' })}
              className="w-full rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 px-3 py-2"
            >
              <option value="light">{t('themeLight')}</option>
              <option value="dark">{t('themeDark')}</option>
              <option value="auto">{t('themeAuto')}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              {t('language')}
            </label>
            <select
              value={settings.language}
              onChange={(e) => {
                const lang = e.target.value as 'ar' | 'en';
                updateSettings({ language: lang, direction: lang === 'ar' ? 'rtl' : 'ltr' });
              }}
              className="w-full rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 px-3 py-2"
            >
              <option value="ar">{t('arabic')}</option>
              <option value="en">{t('english')}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              {t('interfaceDir')}
            </label>
            <select
              value={settings.direction}
              onChange={(e) => updateSettings({ direction: e.target.value as 'rtl' | 'ltr' })}
              className="w-full rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 px-3 py-2"
            >
              <option value="rtl">RTL (من اليمين لليسار)</option>
              <option value="ltr">LTR (Left to Right)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Editor Defaults & Auto-Save */}
      <section className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-800 p-5 shadow-soft space-y-4 text-sm">
        <h2 className="font-bold text-navy-900 dark:text-white">
          {isAr ? 'إعدادات المحرر والحفظ التلقائي' : 'Editor & Auto-Save'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              {t('defaultFont')}
            </label>
            <select
              value={settings.defaultFontFamily}
              onChange={(e) => updateSettings({ defaultFontFamily: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 px-3 py-2"
            >
              {fonts.map((f) => (
                <option key={f.id} value={f.family}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              {t('defaultFontSize')}
            </label>
            <input
              type="number"
              min={8}
              max={36}
              value={settings.defaultFontSize}
              onChange={(e) => updateSettings({ defaultFontSize: Number(e.target.value) })}
              className="w-full rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 px-3 py-2"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-5 pt-1">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.autoSaveEnabled}
              onChange={(e) => updateSettings({ autoSaveEnabled: e.target.checked })}
            />
            <span>{t('autoSave')}</span>
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.autoBackupEnabled}
              onChange={(e) => updateSettings({ autoBackupEnabled: e.target.checked })}
            />
            <span>{t('autoBackup')}</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-navy-800">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              ONLYOFFICE Document Server URL ({isAr ? 'اختياري' : 'Optional'})
            </label>
            <input
              type="url"
              value={settings.onlyofficeServerUrl}
              onChange={(e) => updateSettings({ onlyofficeServerUrl: e.target.value })}
              placeholder="https://onlyoffice.example.com"
              className="w-full rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 px-3 py-2 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Collabora Online Server URL ({isAr ? 'اختياري' : 'Optional'})
            </label>
            <input
              type="url"
              value={settings.collaboraServerUrl}
              onChange={(e) => updateSettings({ collaboraServerUrl: e.target.value })}
              placeholder="https://collabora.example.com"
              className="w-full rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 px-3 py-2 text-xs"
            />
          </div>
          <div className="sm:col-span-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={async () => {
                const target = settings.onlyofficeServerUrl || settings.collaboraServerUrl;
                if (!validateExternalServerUrl(target)) {
                  showToast(isAr ? 'أدخل رابط خادم صالح يبدأ بـ https://' : 'Enter a valid server URL', 'error');
                  return;
                }
                const ok = await checkServerReachability(target);
                showToast(
                  ok
                    ? (isAr ? 'الخادم متاح للاستجابة' : 'Server is reachable')
                    : (isAr ? 'تعذر الوصول للخادم حالياً' : 'Could not reach server'),
                  ok ? 'success' : 'error'
                );
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-navy-800 text-xs font-semibold hover:bg-slate-200"
            >
              {isAr ? 'اختبار الاتصال بالخادم الخارجي' : 'Test External Server Connection'}
            </button>
          </div>
        </div>
      </section>

      {/* Storage & Fonts */}
      <section className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-800 p-5 shadow-soft space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <HardDrive className="w-4 h-4 text-royal-600" />
            <span>{t('storageManagement')}</span>
          </div>
          <span className="text-xs font-bold text-royal-600">
            {formatBytes(storageInfo.totalBytesUsed)}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setView('fonts')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 text-xs font-bold"
          >
            <Type className="w-4 h-4" />
            {t('fonts')} ({fonts.length})
          </button>

          <button
            type="button"
            disabled={trashDocs.length === 0}
            onClick={handleEmptyTrash}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 disabled:opacity-40 text-xs font-bold"
          >
            <Trash2 className="w-4 h-4" />
            {t('clearTrash')} ({trashDocs.length})
          </button>
        </div>
      </section>

      {/* App Info & Privacy */}
      <section className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-800 p-5 shadow-soft space-y-2 text-xs">
        <div className="flex items-center gap-2 font-bold text-sm">
          <Info className="w-4 h-4 text-royal-600" />
          <span>{t('appInfo')}</span>
        </div>
        <p className="text-slate-500 dark:text-slate-400">
          {t('appName')} ({t('appShort')}) — {t('version')} 1.0.0
        </p>
        <button
          type="button"
          onClick={() => setShowPrivacy((v) => !v)}
          className="inline-flex items-center gap-1 text-royal-600 font-semibold hover:underline"
        >
          <ShieldCheck className="w-4 h-4" />
          {t('privacyPolicy')}
        </button>
        {showPrivacy && (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-800 text-slate-600 dark:text-slate-300 leading-relaxed">
            {isAr
              ? 'يعمل تطبيق AMR DOCS محليًا بالكامل على جهازك باستخدام IndexedDB. لا يتم رفع مستنداتك أو خطوطك إلى أي خادم خارجي إلا إذا قمت أنت بإدخال رابط خادم ONLYOFFICE أو Collabora الخاص بك.'
              : 'AMR DOCS operates 100% locally on your device using IndexedDB. Your documents and fonts are never uploaded to any external server unless you explicitly configure your own ONLYOFFICE or Collabora server.'}
          </div>
        )}
      </section>
    </div>
  );
};
