import React, { useMemo, useRef, useState } from 'react';
import {
  Copy,
  Download,
  Edit3,
  Folder,
  FolderPlus,
  Info,
  RotateCcw,
  Share2,
  Star,
  Trash2,
  Upload,
  CheckSquare,
  Square,
  Tag,
  Plus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { parseDocxBlob } from '../../engines/docx/ooxmlParser';
import { createId, formatBytes, formatDate } from '../../utils/fileHelpers';
import { exportFileToDevice, shareDocumentFile } from '../../utils/capacitorBridge';
import { StoredDocument } from '../../types';

type FilterTab = 'all' | 'docx' | 'pdf' | 'favorites' | 'recent' | 'trash';
type SortBy = 'date' | 'name' | 'size';

export const FileManager: React.FC = () => {
  const {
    t,
    documents,
    folders,
    sections,
    settings,
    searchQuery,
    openDocument,
    upsertDocument,
    softDeleteDocument,
    restoreDocument,
    removeDocumentForever,
    createNewFolder,
    removeFolder,
    createNewSection,
    removeSection,
    showToast,
  } = useApp();

  const isAr = settings.language === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<FilterTab | string>('all');
  const [showNewSection, setShowNewSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [assignSectionTarget, setAssignSectionTarget] = useState<StoredDocument | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [renameTarget, setRenameTarget] = useState<StoredDocument | null>(null);
  const [renameText, setRenameText] = useState('');
  const [detailsTarget, setDetailsTarget] = useState<StoredDocument | null>(null);
  const [moveTarget, setMoveTarget] = useState<StoredDocument | null>(null);
  const [confirmTrashIds, setConfirmTrashIds] = useState<string[] | null>(null);
  const [confirmPermId, setConfirmPermId] = useState<string | null>(null);

  const filteredDocs = useMemo(() => {
    let list = documents.filter((d) => {
      if (activeTab === 'trash') return d.isDeleted;
      if (d.isDeleted) return false;
      if (activeTab === 'docx' && d.type !== 'docx') return false;
      if (activeTab === 'pdf' && d.type !== 'pdf') return false;
      if (activeTab === 'favorites' && !d.isFavorite) return false;
      if (activeTab === 'all' && d.folderId !== currentFolderId) return false;
      if (!['all', 'docx', 'pdf', 'favorites', 'recent', 'trash'].includes(activeTab)) {
        return d.sectionId === activeTab;
      }
      return true;
    });

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((d) => d.name.toLowerCase().includes(q));
    }

    return [...list].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'size') return b.size - a.size;
      if (activeTab === 'recent') return b.lastOpenedAt - a.lastOpenedAt;
      return b.updatedAt - a.updatedAt;
    });
  }, [documents, activeTab, currentFolderId, searchQuery, sortBy]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleImport = async (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files)) {
      const lower = file.name.toLowerCase();
      if (lower.endsWith('.docx')) {
        const model = await parseDocxBlob(file, file.name.replace(/\.docx$/i, ''));
        await upsertDocument({
          id: createId('doc'),
          name: file.name,
          type: 'docx',
          folderId: currentFolderId,
          size: file.size,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastOpenedAt: Date.now(),
          isFavorite: false,
          isDeleted: false,
          blob: file,
          editorState: model,
          syncStatus: 'local',
        });
      } else if (lower.endsWith('.pdf')) {
        await upsertDocument({
          id: createId('pdf'),
          name: file.name,
          type: 'pdf',
          folderId: currentFolderId,
          size: file.size,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastOpenedAt: Date.now(),
          isFavorite: false,
          isDeleted: false,
          blob: file,
          editorState: { annotations: [] },
          syncStatus: 'local',
        });
      }
    }
    showToast(isAr ? 'تم استيراد الملفات بنجاح' : 'Files imported successfully', 'success');
  };

  const handleDuplicate = async (doc: StoredDocument) => {
    const suffix = isAr ? 'نسخة' : 'Copy';
    const copyName = /\.\w+$/.test(doc.name)
      ? doc.name.replace(/(\.\w+)$/, ` (${suffix})$1`)
      : `${doc.name} (${suffix})`;
    await upsertDocument({
      ...doc,
      id: createId(doc.type === 'docx' ? 'doc' : 'pdf'),
      name: copyName,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastOpenedAt: Date.now(),
    });
    showToast(isAr ? 'تم نسخ الملف' : 'File duplicated', 'success');
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    await createNewFolder(newFolderName.trim(), currentFolderId);
    setNewFolderName('');
    setShowNewFolder(false);
    showToast(isAr ? 'تم إنشاء المجلد' : 'Folder created', 'success');
  };

  const visibleFolders = activeTab === 'all' ? folders.filter((f) => f.parentId === currentFolderId) : [];

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".docx,.pdf"
        className="hidden"
        onChange={(e) => handleImport(e.target.files)}
      />

      {/* Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white dark:bg-navy-900 p-4 rounded-2xl border border-slate-200 dark:border-navy-800 shadow-soft">
        <h1 className="text-lg font-extrabold text-navy-900 dark:text-white">{t('files')}</h1>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-royal-600 hover:bg-royal-700 text-white text-xs font-semibold"
          >
            <Upload className="w-4 h-4" />
            <span>{t('importFiles')}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowNewFolder(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-700 hover:bg-slate-100 dark:hover:bg-navy-800 text-xs font-semibold"
          >
            <FolderPlus className="w-4 h-4" />
            <span>{t('createFolder')}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMultiSelectMode((v) => !v);
              setSelectedIds(new Set());
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold ${
              multiSelectMode
                ? 'bg-navy-800 text-white border-navy-800'
                : 'border-slate-200 dark:border-navy-700'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>{t('selectMultiple')}</span>
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 px-2.5 py-2 text-xs font-semibold"
          >
            <option value="date">{t('sortByDate')}</option>
            <option value="name">{t('sortByName')}</option>
            <option value="size">{t('sortBySize')}</option>
          </select>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1.5">
        {(
          [
            ['all', t('allFiles')],
            ['docx', t('wordFiles')],
            ['pdf', t('pdfFiles')],
            ['favorites', t('favorites')],
            ['recent', t('recentFiles')],
            ['trash', t('trash')],
          ] as Array<[FilterTab, string]>
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setActiveTab(id);
              if (id !== 'all') setCurrentFolderId(null);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              activeTab === id
                ? 'bg-navy-800 text-white'
                : 'bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-navy-800'
            }`}
          >
            {label}
          </button>
        ))}

        {sections.map((sec) => (
          <div key={sec.id} className="inline-flex items-center">
            <button
              type="button"
              onClick={() => setActiveTab(sec.id)}
              className={`px-3 py-1.5 rounded-s-xl text-xs font-bold transition-colors ${
                activeTab === sec.id
                  ? 'bg-royal-600 text-white'
                  : 'bg-royal-50 dark:bg-navy-800 text-royal-700 dark:text-royal-300 border border-royal-200 dark:border-navy-700'
              }`}
            >
              {sec.name}
            </button>
            <button
              type="button"
              onClick={() => {
                if (activeTab === sec.id) setActiveTab('all');
                removeSection(sec.id);
              }}
              title={t('delete')}
              className="px-1.5 py-1.5 rounded-e-xl bg-royal-50 dark:bg-navy-800 text-rose-500 border border-s-0 border-royal-200 dark:border-navy-700 text-xs font-bold"
            >
              ×
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setShowNewSection(true)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-dashed border-royal-400 text-royal-700 dark:text-royal-300 text-xs font-bold hover:bg-royal-50"
        >
          <Plus className="w-3.5 h-3.5" />
          {isAr ? 'إضافة تبويب / قسم' : 'New Tab / Section'}
        </button>

        {currentFolderId && (
          <button
            type="button"
            onClick={() => setCurrentFolderId(null)}
            className="px-3 py-1.5 rounded-xl bg-royal-50 text-royal-700 text-xs font-bold"
          >
            {isAr ? '← العودة للمجلد الرئيسي' : '← Back to Root'}
          </button>
        )}
      </div>

      {/* Multi-select batch bar */}
      {multiSelectMode && selectedIds.size > 0 && (
        <div className="flex items-center justify-between bg-navy-800 text-white px-4 py-2.5 rounded-xl text-xs">
          <span>
            {isAr ? `تم تحديد ${selectedIds.size} ملف` : `${selectedIds.size} selected`}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setConfirmTrashIds(Array.from(selectedIds))}
              className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 font-semibold"
            >
              {t('delete')}
            </button>
          </div>
        </div>
      )}

      {/* Folders Grid */}
      {visibleFolders.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
          {visibleFolders.map((f) => (
            <div
              key={f.id}
              className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 hover:border-royal-400 cursor-pointer"
              onClick={() => setCurrentFolderId(f.id)}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Folder className="w-5 h-5 text-amber-500 shrink-0" />
                <span className="text-xs font-bold truncate">{f.name}</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFolder(f.id);
                }}
                className="p-1 text-slate-400 hover:text-rose-500"
                title={t('delete')}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Documents List */}
      {filteredDocs.length === 0 ? (
        <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-800 p-12 text-center">
          <div className="text-sm font-bold text-slate-700 dark:text-slate-200">{t('emptyStateTitle')}</div>
          <p className="text-xs text-slate-400 mt-1">{t('emptyStateDesc')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredDocs.map((doc) => {
            const isSelected = selectedIds.has(doc.id);
            return (
              <div
                key={doc.id}
                className={`bg-white dark:bg-navy-900 rounded-2xl border p-4 shadow-soft flex flex-col justify-between gap-3 transition-all ${
                  isSelected
                    ? 'border-royal-600 ring-2 ring-royal-500/20'
                    : 'border-slate-200 dark:border-navy-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  {multiSelectMode && (
                    <button type="button" onClick={() => toggleSelect(doc.id)} className="mt-1">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-royal-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  )}

                  <div
                    onClick={() => !doc.isDeleted && openDocument(doc)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 cursor-pointer ${
                      doc.type === 'docx'
                        ? 'bg-royal-100 text-royal-700 dark:bg-royal-900/50 dark:text-royal-300'
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                    }`}
                  >
                    {doc.type.toUpperCase()}
                  </div>

                  <div
                    onClick={() => !doc.isDeleted && openDocument(doc)}
                    className="min-w-0 flex-1 cursor-pointer"
                  >
                    <div className="font-bold text-sm text-navy-900 dark:text-white truncate">
                      {doc.name}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {formatBytes(doc.size)} • {formatDate(doc.updatedAt, settings.language)}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => upsertDocument({ ...doc, isFavorite: !doc.isFavorite })}
                    className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        doc.isFavorite ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                      }`}
                    />
                  </button>
                </div>

                {/* Action Bar */}
                <div className="flex flex-wrap items-center gap-1 pt-2 border-t border-slate-100 dark:border-navy-800 text-xs">
                  {doc.isDeleted ? (
                    <>
                      <button
                        type="button"
                        onClick={() => restoreDocument(doc.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        {t('restore')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmPermId(doc.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 font-semibold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {t('permanentDelete')}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setRenameTarget(doc);
                          setRenameText(doc.name);
                        }}
                        title={t('rename')}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-600 dark:text-slate-300"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDuplicate(doc)}
                        title={t('copy')}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-600 dark:text-slate-300"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setMoveTarget(doc)}
                        title={t('move')}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-600 dark:text-slate-300"
                      >
                        <Folder className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setAssignSectionTarget(doc)}
                        title={isAr ? 'إضافة إلى قسم / تبويب' : 'Assign to Section'}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800 text-royal-600"
                      >
                        <Tag className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => exportFileToDevice(doc.blob, doc.name)}
                        title={t('exportDownloads')}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-600 dark:text-slate-300"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => shareDocumentFile(doc.blob, doc.name, doc.name)}
                        title={t('share')}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-600 dark:text-slate-300"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDetailsTarget(doc)}
                        title={t('details')}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-600 dark:text-slate-300"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmTrashIds([doc.id])}
                        title={t('delete')}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500 ms-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Folder Modal */}
      {showNewFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-3">
          <div className="bg-white dark:bg-navy-900 rounded-2xl p-5 w-full max-w-sm space-y-3 shadow-card">
            <h3 className="font-bold text-sm">{t('createFolder')}</h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder={isAr ? 'اسم المجلد...' : 'Folder name...'}
              className="w-full rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 px-3 py-2 text-sm"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNewFolder(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleCreateFolder}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-royal-600 text-white"
              >
                {t('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {renameTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-3">
          <div className="bg-white dark:bg-navy-900 rounded-2xl p-5 w-full max-w-sm space-y-3 shadow-card">
            <h3 className="font-bold text-sm">{t('rename')}</h3>
            <input
              type="text"
              value={renameText}
              onChange={(e) => setRenameText(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 px-3 py-2 text-sm"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRenameTarget(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (renameText.trim()) {
                    await upsertDocument({
                      ...renameTarget,
                      name: renameText.trim(),
                      updatedAt: Date.now(),
                    });
                  }
                  setRenameTarget(null);
                }}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-royal-600 text-white"
              >
                {t('save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Move Modal */}
      {moveTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-3">
          <div className="bg-white dark:bg-navy-900 rounded-2xl p-5 w-full max-w-sm space-y-3 shadow-card">
            <h3 className="font-bold text-sm">{t('move')}</h3>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              <button
                type="button"
                onClick={async () => {
                  await upsertDocument({ ...moveTarget, folderId: null, updatedAt: Date.now() });
                  setMoveTarget(null);
                }}
                className="w-full text-start px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-navy-800 text-xs font-semibold"
              >
                {isAr ? 'المجلد الرئيسي (Root)' : 'Root Directory'}
              </button>
              {folders.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={async () => {
                    await upsertDocument({ ...moveTarget, folderId: f.id, updatedAt: Date.now() });
                    setMoveTarget(null);
                  }}
                  className="w-full text-start px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-navy-800 text-xs font-semibold flex items-center gap-2"
                >
                  <Folder className="w-4 h-4 text-amber-500" />
                  {f.name}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setMoveTarget(null)}
              className="w-full py-2 rounded-xl text-xs font-semibold border border-slate-200"
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {detailsTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-3">
          <div className="bg-white dark:bg-navy-900 rounded-2xl p-5 w-full max-w-sm space-y-2.5 shadow-card text-xs">
            <h3 className="font-bold text-sm">{t('details')}</h3>
            <div><strong>{isAr ? 'الاسم:' : 'Name:'}</strong> {detailsTarget.name}</div>
            <div><strong>{isAr ? 'النوع:' : 'Type:'}</strong> {detailsTarget.type.toUpperCase()}</div>
            <div><strong>{isAr ? 'الحجم:' : 'Size:'}</strong> {formatBytes(detailsTarget.size)}</div>
            <div><strong>{isAr ? 'تاريخ الإنشاء:' : 'Created:'}</strong> {formatDate(detailsTarget.createdAt, settings.language)}</div>
            <div><strong>{isAr ? 'آخر تعديل:' : 'Modified:'}</strong> {formatDate(detailsTarget.updatedAt, settings.language)}</div>
            <div><strong>{isAr ? 'النسخ الاحتياطية:' : 'Backups:'}</strong> {detailsTarget.versions?.length || 0}</div>
            <button
              type="button"
              onClick={() => setDetailsTarget(null)}
              className="w-full mt-2 py-2 rounded-xl bg-navy-800 text-white font-semibold"
            >
              {t('confirm')}
            </button>
          </div>
        </div>
      )}

      {/* Confirm Soft Delete Modal */}
      {confirmTrashIds && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-3">
          <div className="bg-white dark:bg-navy-900 rounded-2xl p-5 w-full max-w-sm space-y-4 shadow-card">
            <p className="text-sm font-semibold">{t('confirmDelete')}</p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmTrashIds(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={async () => {
                  for (const id of confirmTrashIds) await softDeleteDocument(id);
                  setConfirmTrashIds(null);
                  setSelectedIds(new Set());
                  showToast(isAr ? 'تم النقل إلى المحذوفات' : 'Moved to Trash', 'info');
                }}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 text-white"
              >
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Permanent Delete Modal */}
      {confirmPermId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-3">
          <div className="bg-white dark:bg-navy-900 rounded-2xl p-5 w-full max-w-sm space-y-4 shadow-card">
            <p className="text-sm font-semibold text-rose-600">{t('confirmPermDelete')}</p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmPermId(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={async () => {
                  await removeDocumentForever(confirmPermId);
                  setConfirmPermId(null);
                  showToast(isAr ? 'تم الحذف نهائيًا' : 'Permanently deleted', 'info');
                }}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 text-white"
              >
                {t('permanentDelete')}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* New Section / Tab Modal */}
      {showNewSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-3">
          <div className="bg-white dark:bg-navy-900 rounded-2xl p-5 w-full max-w-sm space-y-3 shadow-card">
            <h3 className="font-bold text-sm">{isAr ? 'إنشاء تبويب أو قسم جديد' : 'Create New Tab / Section'}</h3>
            <input
              type="text"
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              placeholder={isAr ? 'اسم القسم (مثل: الجامعة، العقود)...' : 'Section name...'}
              className="w-full rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 px-3 py-2 text-sm"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNewSection(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!newSectionName.trim()) return;
                  await createNewSection(newSectionName.trim());
                  setNewSectionName('');
                  setShowNewSection(false);
                  showToast(isAr ? 'تم إنشاء القسم' : 'Section created', 'success');
                }}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-royal-600 text-white"
              >
                {t('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Document to Section Modal */}
      {assignSectionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-3">
          <div className="bg-white dark:bg-navy-900 rounded-2xl p-5 w-full max-w-sm space-y-3 shadow-card">
            <h3 className="font-bold text-sm">{isAr ? 'إضافة المستند إلى قسم / تبويب' : 'Assign to Section / Tab'}</h3>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              <button
                type="button"
                onClick={async () => {
                  await upsertDocument({ ...assignSectionTarget, sectionId: null, updatedAt: Date.now() });
                  setAssignSectionTarget(null);
                }}
                className="w-full text-start px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-navy-800 text-xs font-semibold"
              >
                {isAr ? 'بدون قسم' : 'No Section'}
              </button>
              {sections.map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={async () => {
                    await upsertDocument({ ...assignSectionTarget, sectionId: sec.id, updatedAt: Date.now() });
                    setAssignSectionTarget(null);
                    showToast(isAr ? `تمت الإضافة إلى ${sec.name}` : `Added to ${sec.name}`, 'success');
                  }}
                  className="w-full text-start px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-navy-800 text-xs font-semibold flex items-center gap-2"
                >
                  <Tag className="w-4 h-4 text-royal-600" />
                  {sec.name}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setAssignSectionTarget(null)}
              className="w-full py-2 rounded-xl text-xs font-semibold border border-slate-200"
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
