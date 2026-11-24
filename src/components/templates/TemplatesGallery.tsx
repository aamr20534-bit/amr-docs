import React, { useState } from 'react';
import { FileText, FilePenLine, LayoutTemplate, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { builtInTemplates } from '../../data/templates';
import { exportDocxModelToPdfBlob, exportModelToDocxBlob } from '../../engines/docx/docxExporter';
import { createEmptyDocxModel } from '../../engines/docx/ooxmlParser';
import { createId } from '../../utils/fileHelpers';
import { CustomTemplateItem, DocxDocumentModel, StoredDocument, TemplateDefinition } from '../../types';

export const TemplatesGallery: React.FC = () => {
  const {
    settings,
    customTemplates,
    addCustomTemplate,
    removeCustomTemplate,
    upsertDocument,
    openDocument,
    showToast,
    t,
  } = useApp();
  const isAr = settings.language === 'ar';

  const [showAddModal, setShowAddModal] = useState(false);
  const [tplTitle, setTplTitle] = useState('');
  const [tplDesc, setTplDesc] = useState('');
  const [tplBody, setTplBody] = useState('');
  const [tplType, setTplType] = useState<'docx' | 'pdf'>('docx');

  const openModelAsDoc = async (title: string, model: DocxDocumentModel, asType: 'docx' | 'pdf') => {
    if (asType === 'docx') {
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
      showToast(isAr ? `تم فتح قالب Word: ${title}` : `Opened Word template: ${title}`, 'success');
    } else {
      const blob = await exportDocxModelToPdfBlob(model);
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
      showToast(isAr ? `تم إنشاء PDF من القالب: ${title}` : `Created PDF from template: ${title}`, 'success');
    }
  };

  const handleOpenTemplate = async (tpl: TemplateDefinition, asType: 'docx' | 'pdf') => {
    await openModelAsDoc(isAr ? tpl.titleAr : tpl.titleEn, tpl.buildModel(), asType);
  };

  const handleCreateCustomTemplate = async () => {
    if (!tplTitle.trim()) return;
    const base = createEmptyDocxModel(
      tplTitle.trim(),
      settings.direction,
      settings.defaultFontFamily,
      settings.defaultFontSize
    );
    if (tplBody.trim()) {
      base.blocks.push({
        id: createId('p'),
        type: 'paragraph',
        heading: 'normal',
        align: settings.direction === 'rtl' ? 'right' : 'left',
        direction: settings.direction,
        lineSpacing: 1.5,
        runs: [
          {
            id: createId('r'),
            text: tplBody.trim(),
            fontFamily: settings.defaultFontFamily,
            fontSize: settings.defaultFontSize,
            color: '#1E293B',
          },
        ],
      });
    }
    const item: CustomTemplateItem = {
      id: createId('ctpl'),
      category: 'custom',
      title: tplTitle.trim(),
      description: tplDesc.trim() || (isAr ? 'قالب مخصص من إنشاء المستخدم' : 'User-created custom template'),
      defaultType: tplType,
      model: base,
      createdAt: Date.now(),
    };
    await addCustomTemplate(item);
    setTplTitle('');
    setTplDesc('');
    setTplBody('');
    setShowAddModal(false);
    showToast(isAr ? 'تمت إضافة القالب المخصص بنجاح' : 'Custom template added', 'success');
  };

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto space-y-5">
      <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-800 p-4 sm:p-5 shadow-soft flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <LayoutTemplate className="w-6 h-6 text-royal-600 shrink-0" />
          <div>
            <h1 className="text-lg font-extrabold text-navy-900 dark:text-white">{t('templates')}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isAr
                ? `${builtInTemplates.length + customTemplates.length} قالباً قابلاً للفتح والتعديل والحفظ بصيغة DOCX أو PDF`
                : `${builtInTemplates.length + customTemplates.length} templates ready to edit and save as DOCX or PDF`}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-royal-600 hover:bg-royal-700 text-white text-xs font-bold"
        >
          <Plus className="w-4 h-4" />
          {isAr ? 'إضافة قالب مخصص' : 'Add Custom Template'}
        </button>
      </div>

      {/* Custom User Templates */}
      {customTemplates.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-extrabold text-navy-900 dark:text-white px-1">
            {isAr ? 'قوالبي المخصصة' : 'My Custom Templates'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {customTemplates.map((ct) => (
              <div
                key={ct.id}
                className="bg-white dark:bg-navy-900 rounded-2xl border border-royal-200 dark:border-royal-800/60 p-5 shadow-soft flex flex-col justify-between gap-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 mb-2">
                      {isAr ? 'مخصص' : 'CUSTOM'}
                    </span>
                    <h3 className="font-bold text-base text-navy-900 dark:text-white">{ct.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{ct.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCustomTemplate(ct.id)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50"
                    title={t('delete')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-navy-800">
                  <button
                    type="button"
                    onClick={() => openModelAsDoc(ct.title, ct.model, 'docx')}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-royal-600 hover:bg-royal-700 text-white text-xs font-bold"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    {isAr ? 'فتح كـ Word' : 'Open as Word'}
                  </button>
                  <button
                    type="button"
                    onClick={() => openModelAsDoc(ct.title, ct.model, 'pdf')}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-navy-800 hover:bg-navy-900 text-white text-xs font-bold"
                  >
                    <FilePenLine className="w-3.5 h-3.5" />
                    {isAr ? 'فتح كـ PDF' : 'Open as PDF'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Built-in Templates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {builtInTemplates.map((tpl) => (
          <div
            key={tpl.id}
            className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-800 p-5 shadow-soft flex flex-col justify-between gap-4 hover:border-royal-400 transition-all"
          >
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-royal-50 dark:bg-royal-900/40 text-royal-700 dark:text-royal-300 mb-2">
                {tpl.category.toUpperCase()}
              </span>
              <h2 className="font-bold text-base text-navy-900 dark:text-white">
                {isAr ? tpl.titleAr : tpl.titleEn}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isAr ? tpl.descriptionAr : tpl.descriptionEn}
              </p>
            </div>

            <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-navy-800">
              <button
                type="button"
                onClick={() => handleOpenTemplate(tpl, 'docx')}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-royal-600 hover:bg-royal-700 text-white text-xs font-bold transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                {isAr ? 'فتح كـ Word' : 'Open as Word'}
              </button>
              <button
                type="button"
                onClick={() => handleOpenTemplate(tpl, 'pdf')}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-navy-800 hover:bg-navy-900 text-white text-xs font-bold transition-colors"
              >
                <FilePenLine className="w-3.5 h-3.5" />
                {isAr ? 'فتح كـ PDF' : 'Open as PDF'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Custom Template Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-3">
          <div className="bg-white dark:bg-navy-900 rounded-2xl p-5 w-full max-w-md space-y-3 shadow-card">
            <h3 className="font-bold text-sm">{isAr ? 'إضافة قالب جديد' : 'Add New Template'}</h3>
            <input
              type="text"
              value={tplTitle}
              onChange={(e) => setTplTitle(e.target.value)}
              placeholder={isAr ? 'اسم القالب...' : 'Template title...'}
              className="w-full rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={tplDesc}
              onChange={(e) => setTplDesc(e.target.value)}
              placeholder={isAr ? 'وصف مختصر...' : 'Short description...'}
              className="w-full rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 px-3 py-2 text-sm"
            />
            <select
              value={tplType}
              onChange={(e) => setTplType(e.target.value as 'docx' | 'pdf')}
              className="w-full rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 px-3 py-2 text-sm"
            >
              <option value="docx">Word (DOCX)</option>
              <option value="pdf">PDF</option>
            </select>
            <textarea
              rows={4}
              value={tplBody}
              onChange={(e) => setTplBody(e.target.value)}
              placeholder={isAr ? 'المحتوى الافتراضي للقالب...' : 'Default template content...'}
              className="w-full rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 px-3 py-2 text-sm"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 rounded-xl border text-xs font-semibold"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleCreateCustomTemplate}
                className="px-4 py-1.5 rounded-xl bg-royal-600 text-white text-xs font-bold"
              >
                {t('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
