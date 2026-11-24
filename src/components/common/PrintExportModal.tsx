import React, { useState } from 'react';
import { Download, Printer, Share2, X, CopyPlus } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export interface ExportOptions {
  paperSize: 'A4' | 'Letter' | 'Legal';
  orientation: 'portrait' | 'landscape';
  pageRange: string;
}

interface PrintExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  docTitle: string;
  docType: 'docx' | 'pdf';
  onExportDocx?: (opts: ExportOptions) => Promise<void>;
  onExportPdf: (opts: ExportOptions) => Promise<void>;
  onSaveAsCopy: (newName: string) => Promise<void>;
  onShare: () => Promise<void>;
}

export const PrintExportModal: React.FC<PrintExportModalProps> = ({
  isOpen,
  onClose,
  docTitle,
  docType,
  onExportDocx,
  onExportPdf,
  onSaveAsCopy,
  onShare,
}) => {
  const { settings } = useApp();
  const isAr = settings.language === 'ar';

  const [paperSize, setPaperSize] = useState<'A4' | 'Letter' | 'Legal'>(settings.defaultPaperSize || 'A4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(settings.defaultOrientation || 'portrait');
  const [pageRange, setPageRange] = useState('all');
  const [copyName, setCopyName] = useState(`${docTitle} - ${isAr ? 'نسخة' : 'Copy'}`);
  const [busy, setBusy] = useState(false);

  if (!isOpen) return null;

  const opts: ExportOptions = { paperSize, orientation, pageRange };

  const handlePrint = () => {
    const styleId = 'amr-dynamic-print-page';
    let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = `@page { size: ${paperSize} ${orientation}; margin: 12mm; }`;
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-3">
      <div className="bg-white dark:bg-navy-900 rounded-2xl shadow-card border border-slate-200 dark:border-navy-700 w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 bg-navy-800 text-white">
          <h3 className="font-bold text-base">
            {isAr ? 'مركز الطباعة والتصدير' : 'Print & Export Center'}
          </h3>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-navy-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-sm max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                {isAr ? 'حجم الورق' : 'Paper Size'}
              </label>
              <select
                value={paperSize}
                onChange={(e) => setPaperSize(e.target.value as typeof paperSize)}
                className="w-full rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 px-3 py-2"
              >
                <option value="A4">A4 (210 × 297 mm)</option>
                <option value="Letter">Letter (8.5 × 11 in)</option>
                <option value="Legal">Legal (8.5 × 14 in)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                {isAr ? 'اتجاه الورق' : 'Orientation'}
              </label>
              <select
                value={orientation}
                onChange={(e) => setOrientation(e.target.value as typeof orientation)}
                className="w-full rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 px-3 py-2"
              >
                <option value="portrait">{isAr ? 'عمودي (Portrait)' : 'Portrait'}</option>
                <option value="landscape">{isAr ? 'أفقي (Landscape)' : 'Landscape'}</option>
              </select>
            </div>
            {docType === 'pdf' && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  {isAr ? 'نطاق الصفحات للتصدير (مثل all أو 1-2)' : 'Page Range for PDF Export (e.g. all or 1-2)'}
                </label>
                <input
                  type="text"
                  value={pageRange}
                  onChange={(e) => setPageRange(e.target.value)}
                  placeholder="all / 1-2"
                  className="w-full rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 px-3 py-2"
                />
              </div>
            )}
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {isAr
              ? 'ملاحظة: يتم تحديد الطابعة وعدد النسخ مباشرة من نافذة الطباعة الخاصة بالنظام عند الضغط على "طباعة مباشرة".'
              : 'Note: Printer selection and copy count are handled by your OS print dialog when clicking "Print Now".'}
          </p>

          {/* Export Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {docType === 'docx' && onExportDocx && (
              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  await onExportDocx(opts);
                  setBusy(false);
                }}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-royal-600 hover:bg-royal-700 text-white font-semibold transition-colors"
              >
                <Download className="w-4 h-4" />
                {isAr ? 'تصدير DOCX' : 'Export DOCX'}
              </button>
            )}

            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                await onExportPdf(opts);
                setBusy(false);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-900 text-white font-semibold transition-colors"
            >
              <Download className="w-4 h-4" />
              {isAr ? 'تصدير PDF' : 'Export PDF'}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-navy-600 hover:bg-slate-100 dark:hover:bg-navy-800 font-semibold transition-colors"
            >
              <Printer className="w-4 h-4" />
              {isAr ? 'طباعة مباشرة' : 'Print Now'}
            </button>

            <button
              type="button"
              onClick={onShare}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-navy-600 hover:bg-slate-100 dark:hover:bg-navy-800 font-semibold transition-colors"
            >
              <Share2 className="w-4 h-4" />
              {isAr ? 'مشاركة الملف' : 'Share File'}
            </button>
          </div>

          {/* Save as New Copy */}
          <div className="pt-3 border-t border-slate-200 dark:border-navy-700">
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              {isAr ? 'حفظ نسخة جديدة دون تغيير الأصل' : 'Save a new copy without modifying original'}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={copyName}
                onChange={(e) => setCopyName(e.target.value)}
                className="flex-1 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 px-3 py-2 text-sm"
              />
              <button
                type="button"
                disabled={busy || !copyName.trim()}
                onClick={async () => {
                  setBusy(true);
                  await onSaveAsCopy(copyName.trim());
                  setBusy(false);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                <CopyPlus className="w-4 h-4" />
                {isAr ? 'حفظ نسخة' : 'Save Copy'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
