import React, { useRef } from 'react';
import {
  FilePlus2,
  FolderOpen,
  FilePenLine,
  FileText,
  Upload,
  Star,
  Trash2,
  Clock,
  HardDrive,
  Layers,
  LayoutTemplate,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { createEmptyDocxModel, parseDocxBlob } from '../../engines/docx/ooxmlParser';
import { exportModelToDocxBlob } from '../../engines/docx/docxExporter';
import { createBlankPdfBlob } from '../../engines/pdf/pdfEngine';
import { createId, formatBytes, formatDate } from '../../utils/fileHelpers';
import { builtInTemplates } from '../../data/templates';
import { StoredDocument } from '../../types';

export const Dashboard: React.FC = () => {
  const {
    t,
    documents,
    settings,
    storageInfo,
    openDocument,
    upsertDocument,
    setView,
    showToast,
    addNotification,
    searchQuery,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAr = settings.language === 'ar';

  const activeDocs = documents.filter((d) => !d.isDeleted);
  const recentDocs = [...activeDocs]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .filter((d) => !searchQuery || d.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .slice(0, 6);
  const favoriteDocs = activeDocs.filter((d) => d.isFavorite).slice(0, 4);
  const trashCount = documents.filter((d) => d.isDeleted).length;
  const wordCount = activeDocs.filter((d) => d.type === 'docx').length;
  const pdfCount = activeDocs.filter((d) => d.type === 'pdf').length;

  const handleCreateNewWord = async () => {
    const title = isAr ? `مستند جديد ${wordCount + 1}` : `New Document ${wordCount + 1}`;
    const model = createEmptyDocxModel(
      title,
      settings.direction,
      settings.defaultFontFamily,
      settings.defaultFontSize
    );
    const blob = await exportModelToDocxBlob(model);
    const doc: StoredDocument = {
      id: createId('doc'),
      name: `${title}.docx`,
      type: 'docx',
      folderId: null,
      size: blob.size,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastOpenedAt: Date.now(),
      isFavorite: false,
      isDeleted: false,
      blob,
      editorState: model,
      syncStatus: 'local',
    };
    await upsertDocument(doc);
    await openDocument(doc);
    showToast(isAr ? 'تم إنشاء مستند Word جديد' : 'Created new Word document', 'success');
  };

  const handleCreateNewPdf = async () => {
    const title = isAr ? `ملف PDF جديد ${pdfCount + 1}` : `New PDF ${pdfCount + 1}`;
    const blob = await createBlankPdfBlob(title, 1);
    const doc: StoredDocument = {
      id: createId('pdf'),
      name: `${title}.pdf`,
      type: 'pdf',
      folderId: null,
      size: blob.size,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastOpenedAt: Date.now(),
      isFavorite: false,
      isDeleted: false,
      blob,
      editorState: { annotations: [] },
      syncStatus: 'local',
    };
    await upsertDocument(doc);
    await openDocument(doc);
    showToast(isAr ? 'تم إنشاء ملف PDF جديد' : 'Created new PDF file', 'success');
  };

  const handleEditLatestOrNew = async (type: 'docx' | 'pdf') => {
    const latest = activeDocs.find((d) => d.type === type);
    if (latest) {
      await openDocument(latest);
    } else if (type === 'docx') {
      await handleCreateNewWord();
    } else {
      await handleCreateNewPdf();
    }
  };

  const handleImportFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    for (const file of Array.from(files)) {
      const lower = file.name.toLowerCase();
      if (lower.endsWith('.docx')) {
        try {
          const model = await parseDocxBlob(file, file.name.replace(/\.docx$/i, ''));
          const doc: StoredDocument = {
            id: createId('doc'),
            name: file.name,
            type: 'docx',
            folderId: null,
            size: file.size,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            lastOpenedAt: Date.now(),
            isFavorite: false,
            isDeleted: false,
            blob: file,
            editorState: model,
            syncStatus: 'local',
          };
          await upsertDocument(doc);
          showToast(`${isAr ? 'تم استيراد' : 'Imported'}: ${file.name}`, 'success');
          await addNotification(
            isAr ? 'استيراد مستند Word' : 'Word Imported',
            file.name,
            'success'
          );
        } catch {
          showToast(
            isAr ? `تعذر قراءة ملف DOCX: ${file.name}` : `Failed to parse DOCX: ${file.name}`,
            'error'
          );
        }
      } else if (lower.endsWith('.pdf')) {
        const doc: StoredDocument = {
          id: createId('pdf'),
          name: file.name,
          type: 'pdf',
          folderId: null,
          size: file.size,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastOpenedAt: Date.now(),
          isFavorite: false,
          isDeleted: false,
          blob: file,
          editorState: { annotations: [] },
          syncStatus: 'local',
        };
        await upsertDocument(doc);
        showToast(`${isAr ? 'تم استيراد' : 'Imported'}: ${file.name}`, 'success');
      } else {
        showToast(
          isAr ? 'الصيغ المدعومة هي DOCX و PDF فقط' : 'Only DOCX and PDF files are supported',
          'error'
        );
      }
    }
  };

  const handleUseTemplate = async (tplId: string) => {
    const tpl = builtInTemplates.find((item) => item.id === tplId);
    if (!tpl) return;
    const model = tpl.buildModel();
    const blob = await exportModelToDocxBlob(model);
    const title = isAr ? tpl.titleAr : tpl.titleEn;
    const doc: StoredDocument = {
      id: createId('doc'),
      name: `${title}.docx`,
      type: 'docx',
      folderId: null,
      size: blob.size,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastOpenedAt: Date.now(),
      isFavorite: false,
      isDeleted: false,
      blob,
      editorState: model,
      syncStatus: 'local',
    };
    await upsertDocument(doc);
    await openDocument(doc);
    showToast(isAr ? `تم فتح القالب: ${title}` : `Opened template: ${title}`, 'success');
  };

  return (
    <div className="p-3 sm:p-6 space-y-6 max-w-7xl mx-auto">
      <input
        ref={fileInputRef}
        type="file"
        accept=".docx,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        multiple
        className="hidden"
        onChange={(e) => handleImportFiles(e.target.files)}
      />

      {/* Hero Quick Actions Banner */}
      <section className="rounded-3xl bg-gradient-to-br from-navy-800 via-navy-900 to-royal-700 text-white p-5 sm:p-7 shadow-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-royal-100 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('appShort')} • {t('syncLocal')}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              {t('appName')}
            </h1>
            <p className="text-sm text-royal-100/90 max-w-xl">{t('tagline')}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleCreateNewWord}
              className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white text-navy-900 hover:bg-royal-50 font-bold text-xs sm:text-sm shadow-soft transition-all"
            >
              <FilePlus2 className="w-4 h-4 text-royal-600 shrink-0" />
              <span className="truncate">{t('newWord')}</span>
            </button>

            <button
              type="button"
              onClick={handleCreateNewPdf}
              className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-royal-500 hover:bg-royal-400 text-white font-bold text-xs sm:text-sm shadow-soft transition-all"
            >
              <FilePenLine className="w-4 h-4 shrink-0" />
              <span className="truncate">{t('newPdf')}</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs sm:text-sm border border-white/20 transition-all"
            >
              <Upload className="w-4 h-4 shrink-0" />
              <span className="truncate">{t('importFiles')}</span>
            </button>

            <button
              type="button"
              onClick={() => setView('files')}
              className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm transition-all"
            >
              <FolderOpen className="w-4 h-4 shrink-0" />
              <span className="truncate">{t('openDoc')}</span>
            </button>

            <button
              type="button"
              onClick={() => handleEditLatestOrNew('docx')}
              className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm transition-all"
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span className="truncate">{t('editWord')}</span>
            </button>

            <button
              type="button"
              onClick={() => handleEditLatestOrNew('pdf')}
              className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm transition-all"
            >
              <FilePenLine className="w-4 h-4 shrink-0" />
              <span className="truncate">{t('editPdf')}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-navy-900 rounded-2xl p-4 border border-slate-200 dark:border-navy-800 shadow-soft flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-royal-50 dark:bg-royal-900/40 text-royal-600 dark:text-royal-400 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs text-slate-500 dark:text-slate-400">{t('totalDocs')}</div>
            <div className="text-xl font-extrabold text-navy-900 dark:text-white">{activeDocs.length}</div>
            <div className="text-[11px] text-slate-400">
              {wordCount} Word • {pdfCount} PDF
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-900 rounded-2xl p-4 border border-slate-200 dark:border-navy-800 shadow-soft flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-navy-50 dark:bg-navy-800 text-navy-700 dark:text-royal-300 flex items-center justify-center shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs text-slate-500 dark:text-slate-400">{t('storageUsed')}</div>
            <div className="text-xl font-extrabold text-navy-900 dark:text-white">
              {formatBytes(storageInfo.totalBytesUsed)}
            </div>
            <div className="text-[11px] text-slate-400">IndexedDB Offline</div>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-900 rounded-2xl p-4 border border-slate-200 dark:border-navy-800 shadow-soft flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs text-slate-500 dark:text-slate-400">{t('fileTypes')}</div>
            <div className="text-sm font-bold text-navy-900 dark:text-white mt-0.5">
              .DOCX • .PDF • .TTF • .OTF
            </div>
            <div className="text-[11px] text-slate-400">OOXML + PDF-Lib</div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setView('files')}
          className="bg-white dark:bg-navy-900 rounded-2xl p-4 border border-slate-200 dark:border-navy-800 shadow-soft flex items-center gap-3.5 text-start hover:border-royal-400 transition-colors"
        >
          <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs text-slate-500 dark:text-slate-400">{t('trash')}</div>
            <div className="text-xl font-extrabold text-navy-900 dark:text-white">{trashCount}</div>
            <div className="text-[11px] text-slate-400">{t('favorites')}: {favoriteDocs.length}</div>
          </div>
        </button>
      </section>

      {/* Recent & Favorites */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <section className="lg:col-span-2 bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-800 shadow-soft p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 font-bold text-navy-900 dark:text-white">
              <Clock className="w-4 h-4 text-royal-600" />
              <h2>{t('recentFiles')}</h2>
            </div>
            <button
              type="button"
              onClick={() => setView('files')}
              className="text-xs font-semibold text-royal-600 dark:text-royal-400 hover:underline"
            >
              {t('allFiles')}
            </button>
          </div>

          {recentDocs.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <FileText className="w-10 h-10 text-slate-300 dark:text-navy-600 mx-auto" />
              <div className="font-semibold text-slate-700 dark:text-slate-200">{t('emptyStateTitle')}</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">{t('emptyStateDesc')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {recentDocs.map((doc) => (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => openDocument(doc)}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-navy-800 hover:border-royal-400 hover:bg-royal-50/40 dark:hover:bg-navy-800/60 text-start transition-all"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      doc.type === 'docx'
                        ? 'bg-royal-100 text-royal-700 dark:bg-royal-900/50 dark:text-royal-300'
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                    }`}
                  >
                    {doc.type.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate">
                      {doc.name}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {formatBytes(doc.size)} • {formatDate(doc.updatedAt, settings.language)}
                    </div>
                  </div>
                  {doc.isFavorite && <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Favorites Panel */}
        <section className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-800 shadow-soft p-4 sm:p-5">
          <div className="flex items-center gap-2 font-bold text-navy-900 dark:text-white mb-4">
            <Star className="w-4 h-4 text-amber-500" />
            <h2>{t('favorites')}</h2>
          </div>

          {favoriteDocs.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              {isAr ? 'لم تقم بإضافة مستندات للمفضلة بعد' : 'No favorite documents yet'}
            </div>
          ) : (
            <div className="space-y-2">
              {favoriteDocs.map((doc) => (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => openDocument(doc)}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-100 dark:border-navy-800 hover:border-amber-300 text-start transition-colors"
                >
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold truncate">{doc.name}</div>
                    <div className="text-[11px] text-slate-400">{doc.type.toUpperCase()}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Templates Showcase */}
      <section className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-800 shadow-soft p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 font-bold text-navy-900 dark:text-white">
            <LayoutTemplate className="w-4 h-4 text-royal-600" />
            <h2>{t('templates')}</h2>
          </div>
          <button
            type="button"
            onClick={() => setView('templates')}
            className="text-xs font-semibold text-royal-600 dark:text-royal-400 hover:underline"
          >
            {isAr ? 'عرض الكل (12)' : 'View all (12)'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {builtInTemplates.slice(0, 4).map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => handleUseTemplate(tpl.id)}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-navy-800 hover:border-royal-500 hover:shadow-soft text-start transition-all group"
            >
              <div className="text-xs font-bold text-royal-600 dark:text-royal-400 mb-1">
                {tpl.defaultType.toUpperCase()}
              </div>
              <div className="font-bold text-sm text-navy-900 dark:text-white group-hover:text-royal-600 transition-colors">
                {isAr ? tpl.titleAr : tpl.titleEn}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                {isAr ? tpl.descriptionAr : tpl.descriptionEn}
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
