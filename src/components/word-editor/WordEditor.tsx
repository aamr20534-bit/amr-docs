import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Check,
  Columns,
  Copy,
  Download,
  Eraser,
  FilePlus2,
  FolderOpen,
  Highlighter,
  ImagePlus,
  IndentDecrease,
  IndentIncrease,
  Italic,
  Link2,
  List,
  ListOrdered,
  MessageSquarePlus,
  Paintbrush,
  Printer,
  Redo2,
  Replace,
  Save,
  Scissors,
  Search,
  Shapes,
  Sparkles,
  Strikethrough,
  Table as TableIcon,
  Type,
  Underline,
  Undo2,
  ZoomIn,
  ZoomOut,
  Plus,
  Trash2,
  ClipboardPaste,
  History,
  Sigma,
  BookOpen,
  Ruler,
  PanelLeft,
  Pin,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { createEmptyDocxModel, parseDocxBlob } from '../../engines/docx/ooxmlParser';
import { exportDocxModelToPdfBlob, exportModelToDocxBlob } from '../../engines/docx/docxExporter';
import { createId, fileToDataUrl } from '../../utils/fileHelpers';
import { exportFileToDevice, shareDocumentFile } from '../../utils/capacitorBridge';
import {
  DocxBlock,
  DocxDocumentModel,
  DocxParagraph,
  DocxRun,
  DocxTable,
  StoredDocument,
} from '../../types';
import { PrintExportModal } from '../common/PrintExportModal';

type RibbonTab = 'file' | 'home' | 'insert' | 'layout' | 'design' | 'review' | 'view' | 'help';

const SYMBOLS = ['©', '®', '™', '°', '±', '÷', '×', '≤', '≥', '≠', '∞', '√', '∑', 'π', '§', '•', '—', '«', '»'];
const EQUATIONS = ['E = mc²', 'a² + b² = c²', 'x = (-b ± √(b² - 4ac)) / 2a', '∫ f(x) dx', '∑ (i=1..n) xᵢ', 'Δy / Δx = f′(x)'];

const AI_BOILERPLATE_PATTERNS = [
  /\[insert\b/i,
  /\[تحديد|أدخل/i,
  /\bas an ai\b/i,
  /\bi hope this helps\b/i,
  /\bcertainly!/i,
  /كمساعد ذكاء اصطناعي/,
  /بصفتي نموذج ذكاء اصطناعي/,
  /آمل أن يساعدك هذا/,
  /^#{1,3}\s+/m,
  /\*\*[^*]+\*\*/,
];

function detectParagraphIndicators(text: string): { hasAiArtifact: boolean; hasRepeatedWord: boolean } {
  const hasAiArtifact = AI_BOILERPLATE_PATTERNS.some((rx) => rx.test(text));
  const hasRepeatedWord = /\b([\u0600-\u06FFa-zA-Z]{2,})\s+\1\b/i.test(text);
  return { hasAiArtifact, hasRepeatedWord };
}

export const WordEditor: React.FC = () => {
  const {
    t,
    documents,
    activeDocId,
    setActiveDocId,
    fonts,
    addFont,
    addCustomTemplate,
    settings,
    updateSettings,
    upsertDocument,
    showToast,
  } = useApp();

  const isAr = settings.language === 'ar';
  const activeDoc = useMemo(
    () => documents.find((d) => d.id === activeDocId && d.type === 'docx') || null,
    [documents, activeDocId]
  );

  const [model, setModel] = useState<DocxDocumentModel>(() =>
    createEmptyDocxModel(
      isAr ? 'مستند جديد' : 'New Document',
      settings.direction,
      settings.defaultFontFamily,
      settings.defaultFontSize
    )
  );
  const [history, setHistory] = useState<DocxDocumentModel[]>([]);
  const [redoStack, setRedoStack] = useState<DocxDocumentModel[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [ribbonTab, setRibbonTab] = useState<RibbonTab>('home');
  const [zoom, setZoom] = useState(100);
  const [spellCheck, setSpellCheck] = useState(true);
  const [copiedFormat, setCopiedFormat] = useState<Partial<DocxRun> | null>(null);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [activeMatchIdx, setActiveMatchIdx] = useState(0);
  const [focusMode, setFocusMode] = useState(false);
  const historyTimerRef = useRef<number | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showSymbolModal, setShowSymbolModal] = useState(false);
  const [showEquationModal, setShowEquationModal] = useState(false);
  const [equationInput, setEquationInput] = useState('E = mc²');
  const [showShapeModal, setShowShapeModal] = useState(false);
  const [showVersionsModal, setShowVersionsModal] = useState(false);
  const [showRuler, setShowRuler] = useState(true);
  const [showNavPane, setShowNavPane] = useState(false);
  const [selectionToolbarBlockId, setSelectionToolbarBlockId] = useState<string | null>(null);
  const [copiedImageDataUrl, setCopiedImageDataUrl] = useState<string | null>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('https://');
  const [linkLabel, setLinkLabel] = useState('');
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const openDocxInputRef = useRef<HTMLInputElement>(null);
  const insertImageInputRef = useRef<HTMLInputElement>(null);

  // Automatically detect missing fonts in opened DOCX & load/register them without blocking offline
  const ensureDocumentFontsLoaded = useCallback(
    async (docModel: DocxDocumentModel) => {
      const usedFonts = new Set<string>();
      for (const b of docModel.blocks) {
        if (b.type === 'paragraph') {
          for (const r of b.runs) if (r.fontFamily) usedFonts.add(r.fontFamily.trim());
        } else if (b.type === 'table') {
          for (const row of b.rows) {
            for (const cell of row.cells) {
              for (const p of cell.paragraphs) {
                for (const r of p.runs) if (r.fontFamily) usedFonts.add(r.fontFamily.trim());
              }
            }
          }
        }
      }

      for (const family of usedFonts) {
        if (!family || fonts.some((f) => f.family.toLowerCase() === family.toLowerCase())) continue;
        const isArFont = /[؀-ۿ]|arab|cairo|amiri|tajawal|naskh|kufi|readex|ibm/i.test(family);
        if (typeof navigator !== 'undefined' && navigator.onLine) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@400;700&display=swap`;
          document.head.appendChild(link);
        }
        await addFont({
          id: createId('font'),
          name: family,
          family,
          category: isArFont ? 'arabic' : 'english',
          format: 'system',
          isFavorite: false,
          isBuiltIn: false,
          installedAt: Date.now(),
        });
        showToast(
          isAr
            ? (navigator.onLine ? `تم التعرف على الخط "${family}" وتحميله تلقائياً` : `تم تسجيل الخط "${family}" (وضع عدم الاتصال)`)
            : (navigator.onLine ? `Auto-loaded font "${family}"` : `Registered font "${family}" (offline fallback)`),
          'info'
        );
      }
    },
    [addFont, fonts, isAr, showToast]
  );

  // Sync loaded document into editor
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!activeDoc) return;
      if (activeDoc.editorState && 'blocks' in activeDoc.editorState) {
        const m = activeDoc.editorState as DocxDocumentModel;
        setModel(m);
        ensureDocumentFontsLoaded(m);
        const firstBlock = (activeDoc.editorState as DocxDocumentModel).blocks[0];
        if (firstBlock) setSelectedBlockId(firstBlock.id);
      } else if (activeDoc.blob) {
        try {
          const parsed = await parseDocxBlob(activeDoc.blob, activeDoc.name.replace(/\.docx$/i, ''));
          if (!cancelled) {
            setModel(parsed);
            ensureDocumentFontsLoaded(parsed);
            if (parsed.blocks[0]) setSelectedBlockId(parsed.blocks[0].id);
          }
        } catch {
          // Keep existing model
        }
      }
      setHistory([]);
      setRedoStack([]);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [activeDoc?.id]);

  const commitModel = useCallback(
    (updater: (prev: DocxDocumentModel) => DocxDocumentModel, immediateHistory = true) => {
      setModel((prev) => {
        const next = updater(prev);
        if (immediateHistory) {
          setHistory((h) => [...h.slice(-29), prev]);
          setRedoStack([]);
        } else {
          if (historyTimerRef.current) window.clearTimeout(historyTimerRef.current);
          const snapshot = prev;
          historyTimerRef.current = window.setTimeout(() => {
            setHistory((h) => [...h.slice(-29), snapshot]);
            setRedoStack([]);
          }, 600);
        }
        return next;
      });
    },
    []
  );

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setRedoStack((r) => [...r, model]);
    setHistory((h) => h.slice(0, -1));
    setModel(previous);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setHistory((h) => [...h, model]);
    setRedoStack((r) => r.slice(0, -1));
    setModel(next);
  };

  const saveCurrentDocument = useCallback(
    async (createBackup = false) => {
      setIsSaving(true);
      try {
        const blob = await exportModelToDocxBlob(model);
        const now = Date.now();
        if (activeDoc) {
          const versions = [...(activeDoc.versions || [])];
          if (createBackup || settings.autoBackupEnabled) {
            if (versions.length === 0 || now - versions[0].createdAt > 120000) {
              versions.unshift({
                id: createId('ver'),
                createdAt: now,
                note: isAr ? 'نسخة تلقائية' : 'Auto-backup',
                size: blob.size,
                blob,
              });
            }
          }
          await upsertDocument({
            ...activeDoc,
            name: (model.title.trim() || 'Document').endsWith('.docx') ? (model.title.trim() || 'Document') : `${model.title.trim() || 'Document'}.docx`,
            size: blob.size,
            updatedAt: now,
            blob,
            editorState: model,
            versions: versions.slice(0, 5),
          });
        } else {
          const newDoc: StoredDocument = {
            id: createId('doc'),
            name: `${model.title}.docx`,
            type: 'docx',
            folderId: null,
            size: blob.size,
            createdAt: now,
            updatedAt: now,
            lastOpenedAt: now,
            isFavorite: false,
            isDeleted: false,
            blob,
            editorState: model,
            syncStatus: 'local',
          };
          await upsertDocument(newDoc);
          setActiveDocId(newDoc.id);
        }
        setLastSavedAt(now);
      } finally {
        setIsSaving(false);
      }
    },
    [activeDoc, isAr, model, setActiveDocId, settings.autoBackupEnabled, upsertDocument]
  );

  // Global Word keyboard shortcuts (Ctrl+S, Ctrl+Z, Ctrl+Y, Ctrl+F, Ctrl+B, Ctrl+I, Ctrl+U)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const key = e.key.toLowerCase();
      if (key === 's') {
        e.preventDefault();
        saveCurrentDocument(true);
        showToast(isAr ? 'تم حفظ المستند' : 'Document saved', 'success');
      } else if (key === 'f') {
        e.preventDefault();
        setShowFindReplace((v) => !v);
      } else if (key === 'z' && !e.shiftKey) {
        if (document.activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault();
          handleUndo();
        }
      } else if (key === 'y' || (key === 'z' && e.shiftKey)) {
        if (document.activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault();
          handleRedo();
        }
      } else if (key === 'b') {
        e.preventDefault();
        updateRunStyle({ bold: !firstRun.bold });
      } else if (key === 'i') {
        e.preventDefault();
        updateRunStyle({ italic: !firstRun.italic });
      } else if (key === 'u') {
        e.preventDefault();
        updateRunStyle({ underline: !firstRun.underline });
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  // Immediate debounced auto-save (1.5s) + sudden-exit flush (pagehide/visibilitychange/beforeunload)
  useEffect(() => {
    if (!settings.autoSaveEnabled) return;
    const debounce = setTimeout(() => {
      saveCurrentDocument(false);
    }, 1500);
    return () => clearTimeout(debounce);
  }, [model, saveCurrentDocument, settings.autoSaveEnabled]);

  useEffect(() => {
    if (!settings.autoSaveEnabled) return;
    const flushOnExit = () => {
      saveCurrentDocument(false);
    };
    const onVisChange = () => {
      if (document.visibilityState === 'hidden') flushOnExit();
    };
    window.addEventListener('pagehide', flushOnExit);
    window.addEventListener('beforeunload', flushOnExit);
    document.addEventListener('visibilitychange', onVisChange);
    return () => {
      window.removeEventListener('pagehide', flushOnExit);
      window.removeEventListener('beforeunload', flushOnExit);
      document.removeEventListener('visibilitychange', onVisChange);
    };
  }, [saveCurrentDocument, settings.autoSaveEnabled]);

  const selectedParagraph = useMemo(() => {
    const b = model.blocks.find((blk) => blk.id === selectedBlockId && blk.type === 'paragraph');
    if (b && b.type === 'paragraph') return b;
    const firstP = model.blocks.find((blk) => blk.type === 'paragraph');
    return firstP && firstP.type === 'paragraph' ? firstP : null;
  }, [model.blocks, selectedBlockId]);

  const firstRun: Partial<DocxRun> = selectedParagraph?.runs[0] || {};

  const updateSelectedParagraph = (fn: (p: DocxParagraph) => DocxParagraph) => {
    const targetId = selectedParagraph?.id;
    if (!targetId) return;
    commitModel((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) =>
        b.id === targetId && b.type === 'paragraph' ? fn(b) : b
      ),
    }));
  };

  const updateRunStyle = (patch: Partial<DocxRun>) => {
    updateSelectedParagraph((p) => ({
      ...p,
      runs: p.runs.map((r) => ({ ...r, ...patch })),
    }));
  };

  const handleParagraphTextChange = (blockId: string, newText: string) => {
    commitModel((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) => {
        if (b.id !== blockId || b.type !== 'paragraph') return b;
        const baseStyle = b.runs[0] || { id: createId('r'), text: '' };
        return {
          ...b,
          runs: [{ ...baseStyle, text: newText }],
        };
      }),
    }), false);
  };

  const addNewParagraphAfter = (afterId?: string) => {
    const newP: DocxParagraph = {
      id: createId('p'),
      type: 'paragraph',
      heading: 'normal',
      align: model.direction === 'rtl' ? 'right' : 'left',
      direction: model.direction,
      lineSpacing: 1.45,
      spaceAfter: 6,
      runs: [
        {
          id: createId('r'),
          text: '',
          fontFamily: settings.defaultFontFamily,
          fontSize: settings.defaultFontSize,
          color: '#1E293B',
        },
      ],
    };
    commitModel((prev) => {
      if (!afterId) return { ...prev, blocks: [...prev.blocks, newP] };
      const idx = prev.blocks.findIndex((b) => b.id === afterId);
      const next = [...prev.blocks];
      next.splice(idx + 1, 0, newP);
      return { ...prev, blocks: next };
    });
    setSelectedBlockId(newP.id);
  };

  const handleInsertTable = (rowsCount = 3, colsCount = 3) => {
    const table: DocxTable = {
      id: createId('tbl'),
      type: 'table',
      borderColor: '#CBD5E1',
      rows: Array.from({ length: rowsCount }, (_, r) => ({
        id: createId('tr'),
        cells: Array.from({ length: colsCount }, (__, c) => ({
          id: createId('tc'),
          backgroundColor: r === 0 ? '#EFF6FF' : '#FFFFFF',
          paragraphs: [
            {
              id: createId('p'),
              type: 'paragraph',
              align: 'center',
              direction: model.direction,
              runs: [
                {
                  id: createId('r'),
                  text: r === 0 ? `${isAr ? 'عمود' : 'Col'} ${c + 1}` : '',
                  bold: r === 0,
                  fontFamily: settings.defaultFontFamily,
                  fontSize: 11,
                },
              ],
            },
          ],
        })),
      })),
    };
    commitModel((prev) => ({ ...prev, blocks: [...prev.blocks, table] }));
    setSelectedBlockId(table.id);
  };

  const handleInsertImage = async (file: File | undefined) => {
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    const imgBlock: DocxBlock = {
      id: createId('img'),
      type: 'image',
      dataUrl,
      width: 340,
      height: 220,
      align: 'center',
    };
    commitModel((prev) => ({ ...prev, blocks: [...prev.blocks, imgBlock] }));
  };

  const handleFindAndReplace = (replaceAll: boolean) => {
    if (!findText) return;
    let count = 0;
    commitModel((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) => {
        if (b.type !== 'paragraph') return b;
        return {
          ...b,
          runs: b.runs.map((r) => {
            if (!r.text.includes(findText)) return r;
            if (!replaceAll && count > 0) return r;
            count += 1;
            return {
              ...r,
              text: replaceAll ? r.text.split(findText).join(replaceText) : r.text.replace(findText, replaceText),
            };
          }),
        };
      }),
    }));
    showToast(
      isAr ? `تم استبدال ${count} موضع` : `Replaced ${count} occurrence(s)`,
      count > 0 ? 'success' : 'info'
    );
  };

  const searchMatches = useMemo(() => {
    if (!findText.trim()) return [] as string[];
    const needle = matchCase ? findText : findText.toLowerCase();
    return model.blocks
      .filter((b) => {
        if (b.type === 'paragraph') {
          const txt = b.runs.map((r) => r.text).join('');
          return (matchCase ? txt : txt.toLowerCase()).includes(needle);
        }
        return false;
      })
      .map((b) => b.id);
  }, [model.blocks, findText, matchCase]);

  const stats = useMemo(() => {
    let text = '';
    for (const b of model.blocks) {
      if (b.type === 'paragraph') {
        text += ' ' + b.runs.map((r) => r.text).join('');
      } else if (b.type === 'table') {
        for (const r of b.rows) {
          for (const c of r.cells) {
            text += ' ' + c.paragraphs.map((p) => p.runs.map((rn) => rn.text).join('')).join(' ');
          }
        }
      }
    }
    const clean = text.trim();
    const words = clean ? clean.split(/\s+/).length : 0;
    const chars = clean.length;
    const pages = Math.max(1, Math.ceil((model.blocks.filter((b) => b.type === 'pageBreak').length + 1 + words / 320)));
    return { words, chars, pages };
  }, [model.blocks]);

  const handleOpenDocxFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const parsed = await parseDocxBlob(file, file.name.replace(/\.docx$/i, ''));
      const newDoc: StoredDocument = {
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
        editorState: parsed,
        syncStatus: 'local',
      };
      await upsertDocument(newDoc);
      setActiveDocId(newDoc.id);
      setModel(parsed);
      ensureDocumentFontsLoaded(parsed);
      showToast(isAr ? 'تم فتح ملف DOCX بنجاح' : 'DOCX opened successfully', 'success');
    } catch {
      showToast(isAr ? 'تعذر قراءة ملف DOCX' : 'Failed to parse DOCX', 'error');
    }
  };

  const ps = model.pageSetup;
  const pageWidthPx =
    (ps.orientation === 'landscape' ? 1050 : 794) * (zoom / 100);

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-slate-100 dark:bg-navy-950 overflow-hidden">
      <input
        ref={openDocxInputRef}
        type="file"
        accept=".docx"
        className="hidden"
        onChange={(e) => handleOpenDocxFile(e.target.files?.[0])}
      />
      <input
        ref={insertImageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleInsertImage(e.target.files?.[0])}
      />

      {/* Top Document Title & Quick Save Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-white dark:bg-navy-900 border-b border-slate-200 dark:border-navy-800">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <input
            type="text"
            value={model.title}
            onChange={(e) => setModel((prev) => ({ ...prev, title: e.target.value }))}
            className="font-bold text-sm bg-transparent border-b border-transparent focus:border-royal-500 focus:outline-none px-1 py-0.5 min-w-[120px] max-w-xs truncate"
          />
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            {isSaving
              ? isAr
                ? 'جاري الحفظ...'
                : 'Saving...'
              : lastSavedAt
                ? isAr
                  ? 'محفوظ محليًا'
                  : 'Saved locally'
                : 'DOCX'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleUndo}
            disabled={history.length === 0}
            title={isAr ? 'تراجع' : 'Undo'}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800 disabled:opacity-40"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            title={isAr ? 'إعادة' : 'Redo'}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800 disabled:opacity-40"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={async () => {
              await saveCurrentDocument(true);
              showToast(isAr ? 'تم حفظ المستند بنجاح' : 'Document saved', 'success');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-royal-600 hover:bg-royal-700 text-white text-xs font-bold"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{t('save')}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowPrintModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-navy-800 hover:bg-navy-900 text-white text-xs font-bold"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isAr ? 'تصدير / طباعة' : 'Export / Print'}</span>
          </button>
        </div>
      </div>

      {/* Ribbon Tabs */}
      {focusMode ? (
        <div className="bg-navy-800 text-white px-4 py-1.5 flex items-center justify-between text-xs">
          <span>{isAr ? 'وضع القراءة والتركيز مفعّل' : 'Focus Mode Active'}</span>
          <button type="button" onClick={() => setFocusMode(false)} className="px-2.5 py-0.5 rounded bg-royal-600 font-bold">
            {isAr ? 'إظهار شريط الأدوات' : 'Show Ribbon'}
          </button>
        </div>
      ) : (
      <div className="bg-white dark:bg-navy-900 border-b border-slate-200 dark:border-navy-800 px-2 sm:px-4">
        <div className="flex items-center gap-1 overflow-x-auto ribbon-scroll py-1">
          {(
            [
              ['file', t('tabFile')],
              ['home', t('tabHome')],
              ['insert', t('tabInsert')],
              ['layout', t('tabLayout')],
              ['design', t('tabDesign')],
              ['review', t('tabReview')],
              ['view', t('tabView')],
              ['help', t('tabHelp')],
            ] as Array<[RibbonTab, string]>
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setRibbonTab(id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                ribbonTab === id
                  ? 'bg-royal-600 text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Ribbon Toolbar Content */}
        <div className="py-2 flex flex-nowrap sm:flex-wrap items-center gap-1.5 text-xs border-t border-slate-100 dark:border-navy-800 overflow-x-auto ribbon-scroll">
          {ribbonTab === 'file' && (
            <>
              <button
                type="button"
                onClick={() => {
                  setActiveDocId(null);
                  setModel(
                    createEmptyDocxModel(
                      isAr ? 'مستند جديد' : 'New Document',
                      settings.direction,
                      settings.defaultFontFamily,
                      settings.defaultFontSize
                    )
                  );
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 font-semibold"
              >
                <FilePlus2 className="w-3.5 h-3.5" />
                {t('newWord')}
              </button>
              <button
                type="button"
                onClick={() => openDocxInputRef.current?.click()}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 font-semibold"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                {isAr ? 'فتح DOCX' : 'Open DOCX'}
              </button>
              <button
                type="button"
                onClick={async () => {
                  const blob = await exportModelToDocxBlob(model);
                  await exportFileToDevice(blob, `${model.title}.docx`);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-royal-50 text-royal-700 font-semibold"
              >
                <Download className="w-3.5 h-3.5" />
                {t('exportDocx')}
              </button>
              <button
                type="button"
                onClick={async () => {
                  const blob = await exportDocxModelToPdfBlob(model);
                  await exportFileToDevice(blob, `${model.title}.pdf`);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 font-semibold"
              >
                <Download className="w-3.5 h-3.5" />
                {t('exportPdf')}
              </button>
              <button
                type="button"
                onClick={async () => {
                  const plain = model.blocks
                    .map((b) =>
                      b.type === 'paragraph'
                        ? b.runs.map((r) => r.text).join('')
                        : b.type === 'table'
                          ? b.rows.map((r) => r.cells.map((c) => c.paragraphs.map((p) => p.runs.map((rn) => rn.text).join('')).join(' ')).join(' | ')).join('\n')
                          : ''
                    )
                    .filter(Boolean)
                    .join('\n\n');
                  const blob = new Blob([plain], { type: 'text/plain;charset=utf-8' });
                  await exportFileToDevice(blob, `${model.title.trim() || 'Document'}.txt`);
                  showToast(isAr ? 'تم تصدير ملف TXT' : 'TXT exported', 'success');
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-navy-800 font-semibold"
              >
                <Download className="w-3.5 h-3.5" />
                TXT
              </button>
              <button
                type="button"
                onClick={async () => {
                  const bodyHtml = model.blocks
                    .map((b) => {
                      if (b.type === 'paragraph') {
                        const txt = b.runs.map((r) => r.text).join('').replace(/</g, '&lt;');
                        const tag = b.heading === 'h1' ? 'h1' : b.heading === 'h2' ? 'h2' : b.heading === 'h3' ? 'h3' : 'p';
                        return `<${tag} dir="${b.direction || model.direction}" style="text-align:${b.align || 'start'};">${txt}</${tag}>`;
                      }
                      if (b.type === 'image') return `<img src="${b.dataUrl}" style="max-width:100%;width:${b.width}px;" />`;
                      return '';
                    })
                    .join('\n');
                  const fullHtml = `<!doctype html><html dir="${model.direction}"><head><meta charset="utf-8"><title>${model.title}</title><style>body{font-family:Cairo,Arial,sans-serif;max-width:800px;margin:2rem auto;padding:1rem;line-height:1.6;}</style></head><body>${bodyHtml}</body></html>`;
                  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
                  await exportFileToDevice(blob, `${model.title.trim() || 'Document'}.html`);
                  showToast(isAr ? 'تم تصدير صفحة HTML' : 'HTML exported', 'success');
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-navy-800 font-semibold"
              >
                <Download className="w-3.5 h-3.5" />
                HTML
              </button>
              <button
                type="button"
                onClick={() => setShowPrintModal(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-navy-800 font-semibold"
              >
                <Printer className="w-3.5 h-3.5" />
                {t('printPreview')}
              </button>
              <button
                type="button"
                onClick={async () => {
                  await addCustomTemplate({
                    id: createId('ctpl'),
                    category: 'custom',
                    title: model.title.trim() || (isAr ? 'قالب مخصص' : 'Custom Template'),
                    description: isAr ? 'قالب محفوظ من المحرر' : 'Saved from Word Editor',
                    defaultType: 'docx',
                    model,
                    createdAt: Date.now(),
                  });
                  showToast(isAr ? 'تم حفظ المستند كقالب في مكتبة القوالب' : 'Saved as custom template', 'success');
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                {isAr ? 'حفظ كقالب' : 'Save as Template'}
              </button>
            </>
          )}

          {ribbonTab === 'home' && (
            <>
              <select
                value={firstRun.fontFamily || settings.defaultFontFamily}
                onChange={(e) => updateRunStyle({ fontFamily: e.target.value })}
                className="rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 px-2 py-1"
              >
                {fonts.map((f) => (
                  <option key={f.id} value={f.family}>
                    {f.name}
                  </option>
                ))}
              </select>

              <select
                value={firstRun.fontSize || settings.defaultFontSize}
                onChange={(e) => updateRunStyle({ fontSize: Number(e.target.value) })}
                className="rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 px-2 py-1"
              >
                {[9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 36].map((sz) => (
                  <option key={sz} value={sz}>
                    {sz} pt
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => updateRunStyle({ fontSize: Math.min(48, (firstRun.fontSize || 12) + 2) })}
                className="px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800 font-bold"
                title={isAr ? 'تكبير الخط' : 'Increase Font'}
              >
                A+
              </button>
              <button
                type="button"
                onClick={() => updateRunStyle({ fontSize: Math.max(8, (firstRun.fontSize || 12) - 2) })}
                className="px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800 font-bold"
                title={isAr ? 'تصغير الخط' : 'Decrease Font'}
              >
                A-
              </button>

              <div className="h-5 w-px bg-slate-200 dark:bg-navy-700 mx-0.5" />

              <button
                type="button"
                onClick={() => updateRunStyle({ bold: !firstRun.bold })}
                className={`p-1.5 rounded-lg ${firstRun.bold ? 'bg-royal-100 text-royal-700' : 'hover:bg-slate-100 dark:hover:bg-navy-800'}`}
                title={isAr ? 'عريض' : 'Bold'}
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => updateRunStyle({ italic: !firstRun.italic })}
                className={`p-1.5 rounded-lg ${firstRun.italic ? 'bg-royal-100 text-royal-700' : 'hover:bg-slate-100 dark:hover:bg-navy-800'}`}
                title={isAr ? 'مائل' : 'Italic'}
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => updateRunStyle({ underline: !firstRun.underline })}
                className={`p-1.5 rounded-lg ${firstRun.underline ? 'bg-royal-100 text-royal-700' : 'hover:bg-slate-100 dark:hover:bg-navy-800'}`}
                title={isAr ? 'تسطير' : 'Underline'}
              >
                <Underline className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => updateRunStyle({ strike: !firstRun.strike })}
                className={`p-1.5 rounded-lg ${firstRun.strike ? 'bg-royal-100 text-royal-700' : 'hover:bg-slate-100 dark:hover:bg-navy-800'}`}
                title={isAr ? 'يتوسطه خط' : 'Strikethrough'}
              >
                <Strikethrough className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => updateRunStyle({ superScript: !firstRun.superScript, subScript: false })}
                className={`px-1.5 py-1 rounded-lg text-[11px] font-bold ${firstRun.superScript ? 'bg-royal-100 text-royal-700' : 'hover:bg-slate-100 dark:hover:bg-navy-800'}`}
                title={isAr ? 'مرتفع (أس)' : 'Superscript'}
              >
                x²
              </button>
              <button
                type="button"
                onClick={() => updateRunStyle({ subScript: !firstRun.subScript, superScript: false })}
                className={`px-1.5 py-1 rounded-lg text-[11px] font-bold ${firstRun.subScript ? 'bg-royal-100 text-royal-700' : 'hover:bg-slate-100 dark:hover:bg-navy-800'}`}
                title={isAr ? 'منخفض' : 'Subscript'}
              >
                x₂
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!selectedParagraph) return;
                  const txt = selectedParagraph.runs.map((r) => r.text).join('');
                  const next = txt === txt.toUpperCase() ? txt.toLowerCase() : txt.toUpperCase();
                  handleParagraphTextChange(selectedParagraph.id, next);
                }}
                className="px-1.5 py-1 rounded-lg text-[11px] font-bold hover:bg-slate-100 dark:hover:bg-navy-800"
                title={isAr ? 'تبديل حالة الأحرف (Aa)' : 'Change Case (Aa)'}
              >
                Aa
              </button>
              <select
                value={firstRun.textEffect || 'none'}
                onChange={(e) =>
                  updateRunStyle({ textEffect: e.target.value as 'none' | 'shadow' | 'glow' | 'outline' })
                }
                title={isAr ? 'تأثيرات النص' : 'Text Effects'}
                className="rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 px-1.5 py-1"
              >
                <option value="none">{isAr ? 'تأثير نص: عادي' : 'Text FX: None'}</option>
                <option value="shadow">{isAr ? 'ظل النص' : 'Shadow'}</option>
                <option value="glow">{isAr ? 'توهج أزرق' : 'Blue Glow'}</option>
                <option value="outline">{isAr ? 'حد خارجي' : 'Outline'}</option>
              </select>

              <label className="inline-flex items-center gap-1 px-1.5 py-1 rounded-lg hover:bg-slate-100 cursor-pointer" title={isAr ? 'لون النص' : 'Text Color'}>
                <Type className="w-3.5 h-3.5" />
                <input
                  type="color"
                  value={firstRun.color || '#1E293B'}
                  onChange={(e) => updateRunStyle({ color: e.target.value })}
                  className="w-4 h-4 p-0 border-0 bg-transparent cursor-pointer"
                />
              </label>

              <label className="inline-flex items-center gap-1 px-1.5 py-1 rounded-lg hover:bg-slate-100 cursor-pointer" title={isAr ? 'تمييز النص' : 'Highlight'}>
                <Highlighter className="w-3.5 h-3.5 text-amber-500" />
                <input
                  type="color"
                  value={firstRun.highlight || '#FEF08A'}
                  onChange={(e) => updateRunStyle({ highlight: e.target.value })}
                  className="w-4 h-4 p-0 border-0 bg-transparent cursor-pointer"
                />
              </label>
              <label className="inline-flex items-center gap-1 px-1.5 py-1 rounded-lg hover:bg-slate-100 cursor-pointer" title={isAr ? 'تضليل الخلفية' : 'Shading'}>
                <span className="text-[10px] font-bold px-1 rounded bg-royal-100 text-royal-800">{isAr ? 'تضليل' : 'Bg'}</span>
                <input
                  type="color"
                  value={firstRun.backgroundColor || '#DBEAFE'}
                  onChange={(e) => updateRunStyle({ backgroundColor: e.target.value })}
                  className="w-4 h-4 p-0 border-0 bg-transparent cursor-pointer"
                />
              </label>

              <button
                type="button"
                onClick={() => {
                  if (!copiedFormat) {
                    setCopiedFormat({
                      bold: firstRun.bold,
                      italic: firstRun.italic,
                      underline: firstRun.underline,
                      fontFamily: firstRun.fontFamily,
                      fontSize: firstRun.fontSize,
                      color: firstRun.color,
                    });
                    showToast(isAr ? 'تم نسخ التنسيق - اختر فقرة أخرى لتطبيقه' : 'Format copied', 'info');
                  } else {
                    updateRunStyle(copiedFormat);
                    setCopiedFormat(null);
                  }
                }}
                className={`p-1.5 rounded-lg ${copiedFormat ? 'bg-amber-100 text-amber-700' : 'hover:bg-slate-100 dark:hover:bg-navy-800'}`}
                title={isAr ? 'نسخ التنسيق' : 'Format Painter'}
              >
                <Paintbrush className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  const pin = settings.pinnedSnippet;
                  if (!pin) {
                    showToast(
                      isAr ? 'لا يوجد نمط ثابت محفوظ بعد — حدد نصاً أو صورة واضغط "نمط ثابت"' : 'No pinned style saved yet — select text or image first',
                      'info'
                    );
                    return;
                  }
                  if (pin.imageDataUrl) {
                    commitModel((prev) => ({
                      ...prev,
                      blocks: [
                        ...prev.blocks,
                        { id: createId('img'), type: 'image', dataUrl: pin.imageDataUrl!, width: 340, height: 220, align: 'center' },
                      ],
                    }));
                  } else {
                    commitModel((prev) => ({
                      ...prev,
                      blocks: [
                        ...prev.blocks,
                        {
                          id: createId('p'),
                          type: 'paragraph',
                          heading: pin.heading || 'normal',
                          align: pin.align || (model.direction === 'rtl' ? 'right' : 'left'),
                          direction: model.direction,
                          lineSpacing: 1.45,
                          runs: [
                            {
                              id: createId('r'),
                              text: pin.text || '',
                              ...(pin.style || {}),
                            },
                          ],
                        },
                      ],
                    }));
                  }
                  showToast(isAr ? 'تم لصق النمط الثابت المحفوظ' : 'Pasted pinned style & content', 'success');
                }}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg font-bold ${
                  settings.pinnedSnippet ? 'bg-royal-100 text-royal-800' : 'hover:bg-slate-100 dark:hover:bg-navy-800'
                }`}
                title={isAr ? 'لصق النمط الثابت المحفوظ دائماً' : 'Paste Pinned Style'}
              >
                <Pin className="w-3.5 h-3.5" />
                <span>{isAr ? 'نمط ثابت' : 'Pinned'}</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  updateRunStyle({
                    bold: false,
                    italic: false,
                    underline: false,
                    strike: false,
                    color: '#1E293B',
                    highlight: undefined,
                    fontSize: settings.defaultFontSize,
                  })
                }
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800"
                title={isAr ? 'إزالة التنسيق' : 'Clear Formatting'}
              >
                <Eraser className="w-4 h-4" />
              </button>

              <div className="h-5 w-px bg-slate-200 dark:bg-navy-700 mx-0.5" />

              <button
                type="button"
                onClick={() => updateSelectedParagraph((p) => ({ ...p, align: 'right' }))}
                className={`p-1.5 rounded-lg ${selectedParagraph?.align === 'right' ? 'bg-royal-100 text-royal-700' : 'hover:bg-slate-100'}`}
              >
                <AlignRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => updateSelectedParagraph((p) => ({ ...p, align: 'center' }))}
                className={`p-1.5 rounded-lg ${selectedParagraph?.align === 'center' ? 'bg-royal-100 text-royal-700' : 'hover:bg-slate-100'}`}
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => updateSelectedParagraph((p) => ({ ...p, align: 'left' }))}
                className={`p-1.5 rounded-lg ${selectedParagraph?.align === 'left' ? 'bg-royal-100 text-royal-700' : 'hover:bg-slate-100'}`}
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => updateSelectedParagraph((p) => ({ ...p, align: 'justify' }))}
                className={`p-1.5 rounded-lg ${selectedParagraph?.align === 'justify' ? 'bg-royal-100 text-royal-700' : 'hover:bg-slate-100'}`}
              >
                <AlignJustify className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() =>
                  updateSelectedParagraph((p) => ({
                    ...p,
                    listType: p.listType === 'bullet' ? 'none' : 'bullet',
                  }))
                }
                className={`p-1.5 rounded-lg ${selectedParagraph?.listType === 'bullet' ? 'bg-royal-100 text-royal-700' : 'hover:bg-slate-100'}`}
                title={isAr ? 'قائمة نقطية' : 'Bullets'}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  updateSelectedParagraph((p) => ({
                    ...p,
                    listType: p.listType === 'number' ? 'none' : 'number',
                  }))
                }
                className={`p-1.5 rounded-lg ${selectedParagraph?.listType === 'number' ? 'bg-royal-100 text-royal-700' : 'hover:bg-slate-100'}`}
                title={isAr ? 'قائمة رقمية' : 'Numbering'}
              >
                <ListOrdered className="w-4 h-4" />
              </button>
              <select
                value={selectedParagraph?.listType || 'none'}
                onChange={(e) =>
                  updateSelectedParagraph((p) => ({
                    ...p,
                    listType: e.target.value as DocxParagraph['listType'],
                  }))
                }
                title={isAr ? 'نمط الترقيم' : 'List Style'}
                className="rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 px-1.5 py-1"
              >
                <option value="none">{isAr ? 'بلا قائمة' : 'No List'}</option>
                <option value="bullet">• {isAr ? 'نقطي' : 'Bullet'}</option>
                <option value="number">1. {isAr ? 'رقمي' : '1, 2, 3'}</option>
                <option value="alpha-ar">أ. {isAr ? 'أبجدي' : 'أ، ب، ج'}</option>
                <option value="roman">I. {isAr ? 'روماني' : 'I, II, III'}</option>
              </select>

              <button
                type="button"
                onClick={() =>
                  updateSelectedParagraph((p) => ({ ...p, indentRight: (p.indentRight || 0) + 16 }))
                }
                className="p-1.5 rounded-lg hover:bg-slate-100"
                title={isAr ? 'زيادة المسافة البادئة' : 'Increase Indent'}
              >
                <IndentIncrease className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  updateSelectedParagraph((p) => ({
                    ...p,
                    indentRight: Math.max(0, (p.indentRight || 0) - 16),
                  }))
                }
                className="p-1.5 rounded-lg hover:bg-slate-100"
                title={isAr ? 'تقليل المسافة البادئة' : 'Decrease Indent'}
              >
                <IndentDecrease className="w-4 h-4" />
              </button>

              <select
                value={selectedParagraph?.heading || 'normal'}
                onChange={(e) =>
                  updateSelectedParagraph((p) => ({
                    ...p,
                    heading: e.target.value as DocxParagraph['heading'],
                  }))
                }
                className="rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 px-2 py-1"
              >
                <option value="normal">{isAr ? 'نص عادي' : 'Normal'}</option>
                <option value="h1">{isAr ? 'عنوان 1' : 'Heading 1'}</option>
                <option value="h2">{isAr ? 'عنوان 2' : 'Heading 2'}</option>
                <option value="h3">{isAr ? 'عنوان 3' : 'Heading 3'}</option>
                <option value="subtitle">{isAr ? 'عنوان فرعي' : 'Subtitle'}</option>
                <option value="quote">{isAr ? 'نص مقتبس' : 'Quote'}</option>
              </select>

              <button
                type="button"
                onClick={() =>
                  updateSelectedParagraph((p) => ({
                    ...p,
                    direction: p.direction === 'rtl' ? 'ltr' : 'rtl',
                    align: p.direction === 'rtl' ? 'left' : 'right',
                  }))
                }
                className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-navy-800 font-bold"
              >
                {(selectedParagraph?.direction || model.direction).toUpperCase()}
              </button>
              <button
                type="button"
                onClick={() => {
                  commitModel((prev) => {
                    const paras = prev.blocks.filter((b): b is DocxParagraph => b.type === 'paragraph');
                    const others = prev.blocks.filter((b) => b.type !== 'paragraph');
                    const sorted = [...paras].sort((a, b) =>
                      a.runs.map((r) => r.text).join('').localeCompare(b.runs.map((r) => r.text).join(''))
                    );
                    return { ...prev, blocks: [...sorted, ...others] };
                  });
                  showToast(isAr ? 'تم فرز الفقرات أبجدياً' : 'Sorted paragraphs A-Z', 'success');
                }}
                className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-navy-800 font-bold"
                title={isAr ? 'فرز الفقرات أبجدياً' : 'Sort Paragraphs A-Z'}
              >
                {isAr ? 'فرز أ-ي' : 'A-Z'}
              </button>

              <button
                type="button"
                onClick={() => setShowFindReplace((v) => !v)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800"
              >
                <Search className="w-3.5 h-3.5" />
                {isAr ? 'بحث/استبدال' : 'Find'}
              </button>

              <button
                type="button"
                onClick={() => {
                  const txt = selectedParagraph?.runs.map((r) => r.text).join('') || '';
                  navigator.clipboard?.writeText(txt);
                  showToast(isAr ? 'تم نسخ نص الفقرة' : 'Copied text', 'info');
                }}
                className="p-1.5 rounded-lg hover:bg-slate-100"
                title={isAr ? 'نسخ' : 'Copy'}
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  const txt = selectedParagraph?.runs.map((r) => r.text).join('') || '';
                  navigator.clipboard?.writeText(txt);
                  updateSelectedParagraph((p) => ({ ...p, runs: [{ ...p.runs[0], text: '' }] }));
                }}
                className="p-1.5 rounded-lg hover:bg-slate-100"
                title={isAr ? 'قص' : 'Cut'}
              >
                <Scissors className="w-3.5 h-3.5" />
              </button>
              {copiedImageDataUrl && (
                <button
                  type="button"
                  onClick={() =>
                    commitModel((prev) => ({
                      ...prev,
                      blocks: [
                        ...prev.blocks,
                        { id: createId('img'), type: 'image', dataUrl: copiedImageDataUrl, width: 340, height: 220, align: 'center' },
                      ],
                    }))
                  }
                  className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold"
                >
                  {isAr ? 'لصق صورة' : 'Paste Image'}
                </button>
              )}
              <button
                type="button"
                onClick={async () => {
                  try {
                    const clip = await navigator.clipboard.readText();
                    if (clip) {
                      updateSelectedParagraph((p) => ({
                        ...p,
                        runs: p.runs.map((r, i) => (i === 0 ? { ...r, text: `${r.text}${clip}` } : r)),
                      }));
                    }
                  } catch {
                    showToast(isAr ? 'استخدم Ctrl+V أو الصق مباشرة داخل الفقرة' : 'Use Ctrl+V to paste directly', 'info');
                  }
                }}
                className="p-1.5 rounded-lg hover:bg-slate-100"
                title={isAr ? 'لصق' : 'Paste'}
              >
                <ClipboardPaste className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {ribbonTab === 'insert' && (
            <>
              <button
                type="button"
                onClick={() => addNewParagraphAfter(selectedBlockId || undefined)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-royal-50 text-royal-700 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                {isAr ? 'فقرة جديدة' : 'New Paragraph'}
              </button>
              <button
                type="button"
                onClick={() => insertImageInputRef.current?.click()}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-navy-800 font-semibold"
              >
                <ImagePlus className="w-3.5 h-3.5" />
                {isAr ? 'صورة' : 'Image'}
              </button>
              <button
                type="button"
                onClick={() => handleInsertTable(3, 3)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-navy-800 font-semibold"
              >
                <TableIcon className="w-3.5 h-3.5" />
                {isAr ? 'جدول 3×3' : 'Table 3×3'}
              </button>
              <button
                type="button"
                onClick={() => setShowLinkModal(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-navy-800 font-semibold"
              >
                <Link2 className="w-3.5 h-3.5" />
                {isAr ? 'رابط' : 'Link'}
              </button>
              <button
                type="button"
                onClick={() => setShowSymbolModal(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-navy-800 font-semibold"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isAr ? 'رموز' : 'Symbols'}
              </button>
              <button
                type="button"
                onClick={() => setShowShapeModal(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-navy-800 font-semibold"
              >
                <Shapes className="w-3.5 h-3.5" />
                {isAr ? 'أشكال ومربعات نص' : 'Shapes & TextBox'}
              </button>
              <button
                type="button"
                onClick={() => setShowEquationModal(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-navy-800 font-semibold"
              >
                <Sigma className="w-3.5 h-3.5" />
                {isAr ? 'معادلة' : 'Equation'}
              </button>
              <button
                type="button"
                onClick={() =>
                  commitModel((prev) => ({
                    ...prev,
                    blocks: [...prev.blocks, { id: createId('pb'), type: 'pageBreak' }],
                  }))
                }
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-navy-800 font-semibold"
              >
                {isAr ? 'فاصل صفحة' : 'Page Break'}
              </button>
              <button
                type="button"
                onClick={() => {
                  const dateStr = new Date().toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  });
                  updateSelectedParagraph((p) => ({
                    ...p,
                    runs: p.runs.map((r, i) => (i === 0 ? { ...r, text: `${r.text} ${dateStr}`.trim() } : r)),
                  }));
                }}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-navy-800 font-semibold"
              >
                {isAr ? 'التاريخ' : 'Date'}
              </button>
              <button
                type="button"
                onClick={() =>
                  commitModel((prev) => ({
                    ...prev,
                    blocks: [
                      ...prev.blocks,
                      {
                        id: createId('p'),
                        type: 'paragraph',
                        align: 'center',
                        direction: model.direction,
                        runs: [{ id: createId('r'), text: '────────────────────────────────────────', color: '#CBD5E1', fontSize: 10 }],
                      },
                    ],
                  }))
                }
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-navy-800 font-semibold"
              >
                {isAr ? 'خط فاصل' : 'Divider'}
              </button>
              <button
                type="button"
                onClick={() => {
                  const noteText = window.prompt(isAr ? 'أدخل نص الحاشية السفلية:' : 'Enter footnote text:');
                  if (!noteText?.trim()) return;
                  commitModel((prev) => ({
                    ...prev,
                    blocks: [
                      ...prev.blocks,
                      {
                        id: createId('fn'),
                        type: 'paragraph',
                        align: model.direction === 'rtl' ? 'right' : 'left',
                        direction: model.direction,
                        runs: [
                          {
                            id: createId('r'),
                            text: `[¹] ${noteText.trim()}`,
                            fontSize: 10,
                            italic: true,
                            color: '#475569',
                            fontFamily: settings.defaultFontFamily,
                          },
                        ],
                      },
                    ],
                  }));
                }}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-navy-800 font-semibold"
              >
                {isAr ? 'حاشية سفلية' : 'Footnote'}
              </button>
              <input
                type="text"
                value={ps.headerText}
                onChange={(e) =>
                  commitModel((prev) => ({
                    ...prev,
                    pageSetup: { ...prev.pageSetup, headerText: e.target.value },
                  }))
                }
                placeholder={isAr ? 'رأس الصفحة...' : 'Header text...'}
                className="rounded-lg border border-slate-200 dark:border-navy-700 px-2 py-1 w-32"
              />
              <input
                type="text"
                value={ps.footerText}
                onChange={(e) =>
                  commitModel((prev) => ({
                    ...prev,
                    pageSetup: { ...prev.pageSetup, footerText: e.target.value },
                  }))
                }
                placeholder={isAr ? 'تذييل الصفحة...' : 'Footer text...'}
                className="rounded-lg border border-slate-200 dark:border-navy-700 px-2 py-1 w-32"
              />
              <label className="inline-flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ps.showPageNumbers}
                  onChange={(e) =>
                    commitModel((prev) => ({
                      ...prev,
                      pageSetup: { ...prev.pageSetup, showPageNumbers: e.target.checked },
                    }))
                  }
                />
                <span>{isAr ? 'أرقام الصفحات' : 'Page Numbers'}</span>
              </label>
              <select
                value={ps.pageNumberFormat || 'ofTotal'}
                onChange={(e) =>
                  commitModel((prev) => ({
                    ...prev,
                    pageSetup: { ...prev.pageSetup, pageNumberFormat: e.target.value as 'number' | 'ofTotal' },
                  }))
                }
                className="rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 px-2 py-1"
              >
                <option value="ofTotal">{isAr ? 'ترقيم: 1 / N' : 'Format: 1 / N'}</option>
                <option value="number">{isAr ? 'ترقيم: 1' : 'Format: 1'}</option>
              </select>
              <label className="inline-flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!ps.differentFirstPage}
                  onChange={(e) =>
                    commitModel((prev) => ({
                      ...prev,
                      pageSetup: { ...prev.pageSetup, differentFirstPage: e.target.checked },
                    }))
                  }
                />
                <span>{isAr ? 'إخفاء رقم الغلاف' : 'Hide on Page 1'}</span>
              </label>
              <label className="inline-flex items-center gap-1">
                <span>{isAr ? 'بدء الترقيم:' : 'Start #:'}</span>
                <input
                  type="number"
                  min={1}
                  max={999}
                  value={ps.pageNumberStart ?? 1}
                  onChange={(e) =>
                    commitModel((prev) => ({
                      ...prev,
                      pageSetup: { ...prev.pageSetup, pageNumberStart: Math.max(1, Number(e.target.value)) },
                    }))
                  }
                  className="w-12 rounded-lg border border-slate-200 px-1.5 py-1"
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  const headings = model.blocks.filter(
                    (b): b is DocxParagraph => b.type === 'paragraph' && b.heading !== 'normal'
                  );
                  const tocRows = headings.map((h, i) => ({
                    id: createId('p'),
                    type: 'paragraph' as const,
                    heading: 'normal' as const,
                    align: model.direction === 'rtl' ? ('right' as const) : ('left' as const),
                    direction: model.direction,
                    runs: [
                      {
                        id: createId('r'),
                        text: `${i + 1}. ${h.runs.map((r) => r.text).join('')}`,
                        fontFamily: settings.defaultFontFamily,
                        fontSize: 11,
                        color: '#1D4ED8',
                      },
                    ],
                  }));
                  const tocHeader: DocxParagraph = {
                    id: createId('p'),
                    type: 'paragraph',
                    heading: 'h2',
                    align: model.direction === 'rtl' ? 'right' : 'left',
                    direction: model.direction,
                    runs: [
                      {
                        id: createId('r'),
                        text: isAr ? 'فهرس المحتويات' : 'Table of Contents',
                        bold: true,
                        fontFamily: settings.defaultFontFamily,
                        fontSize: 15,
                        color: '#0F2942',
                      },
                    ],
                  };
                  commitModel((prev) => ({
                    ...prev,
                    blocks: [tocHeader, ...tocRows, ...prev.blocks],
                  }));
                  showToast(isAr ? 'تم إدراج فهرس المحتويات' : 'Inserted Table of Contents', 'success');
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-royal-50 text-royal-700 font-semibold"
              >
                <BookOpen className="w-3.5 h-3.5" />
                {isAr ? 'فهرس المحتويات' : 'Table of Contents'}
              </button>
              <button
                type="button"
                onClick={() => {
                  const coverBlocks: DocxBlock[] = [
                    {
                      id: createId('cov1'),
                      type: 'paragraph',
                      heading: 'h1',
                      align: 'center',
                      direction: model.direction,
                      runs: [{ id: createId('r'), text: model.title, bold: true, fontSize: 24, color: '#0F2942', fontFamily: settings.defaultFontFamily }],
                    },
                    {
                      id: createId('cov2'),
                      type: 'paragraph',
                      heading: 'subtitle',
                      align: 'center',
                      direction: model.direction,
                      runs: [{ id: createId('r'), text: isAr ? 'وثيقة رسمية — AMR DOCS' : 'Official Document — AMR DOCS', fontSize: 14, color: '#1D4ED8', fontFamily: settings.defaultFontFamily }],
                    },
                    {
                      id: createId('cov3'),
                      type: 'paragraph',
                      align: 'center',
                      direction: model.direction,
                      runs: [{ id: createId('r'), text: new Date().toLocaleDateString(isAr ? 'ar-EG' : 'en-US'), fontSize: 12, color: '#64748B', fontFamily: settings.defaultFontFamily }],
                    },
                    { id: createId('covpb'), type: 'pageBreak' },
                  ];
                  commitModel((prev) => ({ ...prev, blocks: [...coverBlocks, ...prev.blocks] }));
                  showToast(isAr ? 'تم إدراج صفحة الغلاف' : 'Inserted Cover Page', 'success');
                }}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-navy-800 font-semibold"
              >
                {isAr ? 'صفحة غلاف' : 'Cover Page'}
              </button>
            </>
          )}

          {ribbonTab === 'layout' && (
            <>
              <select
                value={ps.paperSize}
                onChange={(e) =>
                  commitModel((prev) => ({
                    ...prev,
                    pageSetup: { ...prev.pageSetup, paperSize: e.target.value as 'A4' | 'Letter' | 'Legal' },
                  }))
                }
                className="rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 px-2 py-1"
              >
                <option value="A4">A4</option>
                <option value="Letter">Letter</option>
                <option value="Legal">Legal</option>
              </select>
              <select
                value={ps.orientation}
                onChange={(e) =>
                  commitModel((prev) => ({
                    ...prev,
                    pageSetup: { ...prev.pageSetup, orientation: e.target.value as 'portrait' | 'landscape' },
                  }))
                }
                className="rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 px-2 py-1"
              >
                <option value="portrait">{isAr ? 'عمودي' : 'Portrait'}</option>
                <option value="landscape">{isAr ? 'أفقي' : 'Landscape'}</option>
              </select>
              <label className="inline-flex items-center gap-1">
                <span>{isAr ? 'الهوامش (mm):' : 'Margins (mm):'}</span>
                <input
                  type="number"
                  min={5}
                  max={50}
                  value={ps.marginTop}
                  onChange={(e) => {
                    const m = Number(e.target.value);
                    commitModel((prev) => ({
                      ...prev,
                      pageSetup: {
                        ...prev.pageSetup,
                        marginTop: m,
                        marginBottom: m,
                        marginLeft: m,
                        marginRight: m,
                      },
                    }));
                  }}
                  className="w-14 rounded-lg border border-slate-200 px-2 py-1"
                />
              </label>
              <select
                value={ps.marginTop}
                onChange={(e) => {
                  const m = Number(e.target.value);
                  commitModel((prev) => ({
                    ...prev,
                    pageSetup: { ...prev.pageSetup, marginTop: m, marginBottom: m, marginLeft: m, marginRight: m },
                  }));
                }}
                className="rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 px-2 py-1"
              >
                <option value={10}>{isAr ? 'هوامش ضيقة (10mm)' : 'Narrow (10mm)'}</option>
                <option value={20}>{isAr ? 'هوامش عادية (20mm)' : 'Normal (20mm)'}</option>
                <option value={30}>{isAr ? 'هوامش عريضة (30mm)' : 'Wide (30mm)'}</option>
              </select>
              <button
                type="button"
                onClick={() =>
                  commitModel((prev) => ({
                    ...prev,
                    pageSetup: { ...prev.pageSetup, columns: prev.pageSetup.columns === 1 ? 2 : 1 },
                  }))
                }
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg ${
                  ps.columns === 2 ? 'bg-royal-100 text-royal-700' : 'bg-slate-100 dark:bg-navy-800'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                {ps.columns === 2 ? (isAr ? 'عمودان' : '2 Columns') : isAr ? 'عمود واحد' : '1 Column'}
              </button>
              <label className="inline-flex items-center gap-1">
                <span>{isAr ? 'تباعد الأسطر:' : 'Line Spacing:'}</span>
                <select
                  value={selectedParagraph?.lineSpacing || 1.45}
                  onChange={(e) =>
                    updateSelectedParagraph((p) => ({ ...p, lineSpacing: Number(e.target.value) }))
                  }
                  className="rounded-lg border border-slate-200 px-2 py-1"
                >
                  <option value={1.0}>1.0</option>
                  <option value={1.15}>1.15</option>
                  <option value={1.45}>1.45</option>
                  <option value={1.5}>1.5</option>
                  <option value={2.0}>2.0</option>
                </select>
              </label>
              <label className="inline-flex items-center gap-1">
                <span>{isAr ? 'قبل/بعد الفقرة (pt):' : 'Para Before/After:'}</span>
                <input
                  type="number"
                  min={0}
                  max={48}
                  value={selectedParagraph?.spaceBefore ?? 0}
                  onChange={(e) =>
                    updateSelectedParagraph((p) => ({ ...p, spaceBefore: Number(e.target.value) }))
                  }
                  className="w-12 rounded-lg border border-slate-200 px-1.5 py-1"
                />
                <input
                  type="number"
                  min={0}
                  max={48}
                  value={selectedParagraph?.spaceAfter ?? 6}
                  onChange={(e) =>
                    updateSelectedParagraph((p) => ({ ...p, spaceAfter: Number(e.target.value) }))
                  }
                  className="w-12 rounded-lg border border-slate-200 px-1.5 py-1"
                />
              </label>
            </>
          )}

          {ribbonTab === 'design' && (
            <>
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ps.pageBorder}
                  onChange={(e) =>
                    commitModel((prev) => ({
                      ...prev,
                      pageSetup: { ...prev.pageSetup, pageBorder: e.target.checked },
                    }))
                  }
                />
                <span>{isAr ? 'إطار الصفحة' : 'Page Border'}</span>
              </label>
              <label className="inline-flex items-center gap-1">
                <span>{isAr ? 'لون الإطار:' : 'Border Color:'}</span>
                <input
                  type="color"
                  value={ps.pageBorderColor}
                  onChange={(e) =>
                    commitModel((prev) => ({
                      ...prev,
                      pageSetup: { ...prev.pageSetup, pageBorderColor: e.target.value },
                    }))
                  }
                  className="w-6 h-6"
                />
              </label>
              <label className="inline-flex items-center gap-1">
                <span>{isAr ? 'السمك:' : 'Width:'}</span>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={ps.pageBorderWidth}
                  onChange={(e) =>
                    commitModel((prev) => ({
                      ...prev,
                      pageSetup: { ...prev.pageSetup, pageBorderWidth: Number(e.target.value) },
                    }))
                  }
                  className="w-12 rounded-lg border border-slate-200 px-2 py-1"
                />
              </label>
              <select
                value={ps.pageBorderStyle || 'single'}
                onChange={(e) =>
                  commitModel((prev) => ({
                    ...prev,
                    pageSetup: { ...prev.pageSetup, pageBorderStyle: e.target.value as 'single' | 'dashed' | 'double' },
                  }))
                }
                className="rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 px-2 py-1"
              >
                <option value="single">{isAr ? 'إطار متصل' : 'Solid'}</option>
                <option value="dashed">{isAr ? 'إطار متقطع' : 'Dashed'}</option>
                <option value="double">{isAr ? 'إطار مزدوج' : 'Double'}</option>
                <option value="dotted">{isAr ? 'إطار منقّط' : 'Dotted'}</option>
                <option value="shadow3d">{isAr ? 'إطار ظل ثلاثي الأبعاد' : '3D Shadow'}</option>
              </select>
              <label className="inline-flex items-center gap-1">
                <span>{isAr ? 'خلفية الصفحة:' : 'Page Background:'}</span>
                <input
                  type="color"
                  value={ps.pageBackgroundColor}
                  onChange={(e) =>
                    commitModel((prev) => ({
                      ...prev,
                      pageSetup: { ...prev.pageSetup, pageBackgroundColor: e.target.value },
                    }))
                  }
                  className="w-6 h-6"
                />
              </label>
              <input
                type="text"
                value={ps.watermarkText}
                onChange={(e) =>
                  commitModel((prev) => ({
                    ...prev,
                    pageSetup: { ...prev.pageSetup, watermarkText: e.target.value },
                  }))
                }
                placeholder={isAr ? 'نص العلامة المائية...' : 'Watermark text...'}
                className="rounded-lg border border-slate-200 px-2.5 py-1 w-40"
              />
              <select
                value={ps.watermarkText}
                onChange={(e) =>
                  commitModel((prev) => ({
                    ...prev,
                    pageSetup: { ...prev.pageSetup, watermarkText: e.target.value },
                  }))
                }
                className="rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 px-2 py-1"
              >
                <option value="">{isAr ? 'بدون علامة مائية' : 'No Watermark'}</option>
                <option value={isAr ? 'سري للغاية' : 'CONFIDENTIAL'}>{isAr ? 'سري للغاية' : 'CONFIDENTIAL'}</option>
                <option value={isAr ? 'مسودة' : 'DRAFT'}>{isAr ? 'مسودة' : 'DRAFT'}</option>
                <option value={isAr ? 'عاجل' : 'URGENT'}>{isAr ? 'عاجل' : 'URGENT'}</option>
                <option value={isAr ? 'نسخة أصلية' : 'ORIGINAL'}>{isAr ? 'نسخة أصلية' : 'ORIGINAL'}</option>
              </select>
            </>
          )}

          {ribbonTab === 'review' && (
            <>
              <button
                type="button"
                onClick={() => setShowFindReplace((v) => !v)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-navy-800 font-semibold"
              >
                <Replace className="w-3.5 h-3.5" />
                {isAr ? 'بحث واستبدال' : 'Find & Replace'}
              </button>
              <button
                type="button"
                onClick={() => setShowComments((v) => !v)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-royal-50 text-royal-700 font-semibold"
              >
                <MessageSquarePlus className="w-3.5 h-3.5" />
                {isAr ? `التعليقات (${model.comments.length})` : `Comments (${model.comments.length})`}
              </button>
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={spellCheck}
                  onChange={(e) => setSpellCheck(e.target.checked)}
                />
                <span>{isAr ? 'التدقيق الإملائي (المتصفح)' : 'Browser Spellcheck'}</span>
              </label>
              <button
                type="button"
                onClick={() => setShowVersionsModal(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-navy-800 font-semibold"
              >
                <History className="w-3.5 h-3.5" />
                {isAr ? `سجل النسخ (${activeDoc?.versions?.length || 0})` : `Versions (${activeDoc?.versions?.length || 0})`}
              </button>
              <span className="text-slate-500">
                {isAr
                  ? `الكلمات: ${stats.words} • الحروف: ${stats.chars} • الصفحات: ${stats.pages}`
                  : `Words: ${stats.words} • Chars: ${stats.chars} • Pages: ${stats.pages}`}
              </span>
            </>
          )}

          {ribbonTab === 'view' && (
            <>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(60, z - 15))}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-navy-800"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="font-bold px-2">{zoom}%</span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(160, z + 15))}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-navy-800"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoom(100)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-navy-800 font-semibold"
              >
                100%
              </button>
              <button
                type="button"
                onClick={() => setShowRuler((v) => !v)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold ${showRuler ? 'bg-royal-100 text-royal-700' : 'bg-slate-100 dark:bg-navy-800'}`}
              >
                <Ruler className="w-3.5 h-3.5" />
                {isAr ? 'المسطرة' : 'Ruler'}
              </button>
              <button
                type="button"
                onClick={() => setShowNavPane((v) => !v)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold ${showNavPane ? 'bg-royal-100 text-royal-700' : 'bg-slate-100 dark:bg-navy-800'}`}
              >
                <PanelLeft className="w-3.5 h-3.5" />
                {isAr ? 'جزء التنقل' : 'Navigation'}
              </button>
              <button
                type="button"
                onClick={() => setZoom(window.innerWidth < 640 ? 85 : 115)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-navy-800 font-semibold"
              >
                {isAr ? 'ملاءمة العرض' : 'Fit Width'}
              </button>
              <button
                type="button"
                onClick={() => setFocusMode((v) => !v)}
                className={`px-2.5 py-1 rounded-lg font-semibold ${focusMode ? 'bg-navy-800 text-white' : 'bg-slate-100 dark:bg-navy-800'}`}
              >
                {isAr ? 'وضع القراءة' : 'Focus Mode'}
              </button>
            </>
          )}

          {ribbonTab === 'help' && (
            <div className="text-slate-600 dark:text-slate-300 px-2">
              {isAr
                ? 'محرك DOCX حقيقي يقرأ ويكتب ملفات OOXML (.docx) محليًا دون إنترنت عبر JSZip و docx، مع إمكانية ربط خادم ONLYOFFICE أو Collabora من الإعدادات.'
                : 'Real offline OOXML (.docx) engine powered by JSZip & docx, with optional ONLYOFFICE / Collabora server integration in Settings.'}
            </div>
          )}
        </div>
      </div>
      )}

      {/* Find & Replace Bar */}
      {showFindReplace && (
        <div className="flex flex-wrap items-center gap-2 px-4 py-2 bg-royal-50 dark:bg-navy-800 border-b border-royal-200 dark:border-navy-700 text-xs">
          <input
            type="text"
            value={findText}
            onChange={(e) => {
              setFindText(e.target.value);
              setActiveMatchIdx(0);
            }}
            placeholder={isAr ? 'بحث عن...' : 'Find...'}
            className="rounded-lg border border-slate-300 px-2.5 py-1 bg-white dark:bg-navy-900"
          />
          <input
            type="text"
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            placeholder={isAr ? 'استبدال بـ...' : 'Replace with...'}
            className="rounded-lg border border-slate-300 px-2.5 py-1 bg-white dark:bg-navy-900"
          />
          <label className="inline-flex items-center gap-1 cursor-pointer">
            <input type="checkbox" checked={matchCase} onChange={(e) => setMatchCase(e.target.checked)} />
            <span>{isAr ? 'مطابقة الحالة' : 'Match Case'}</span>
          </label>
          {findText && (
            <div className="inline-flex items-center gap-1">
              <span className="font-bold text-royal-700 dark:text-royal-300">
                {searchMatches.length > 0 ? `${(activeMatchIdx % searchMatches.length) + 1}/${searchMatches.length}` : '0/0'}
              </span>
              <button
                type="button"
                disabled={searchMatches.length === 0}
                onClick={() => {
                  const next = (activeMatchIdx - 1 + searchMatches.length) % searchMatches.length;
                  setActiveMatchIdx(next);
                  setSelectedBlockId(searchMatches[next]);
                }}
                className="px-2 py-0.5 rounded bg-white dark:bg-navy-900 border"
              >
                {isAr ? 'السابق' : 'Prev'}
              </button>
              <button
                type="button"
                disabled={searchMatches.length === 0}
                onClick={() => {
                  const next = (activeMatchIdx + 1) % searchMatches.length;
                  setActiveMatchIdx(next);
                  setSelectedBlockId(searchMatches[next]);
                }}
                className="px-2 py-0.5 rounded bg-white dark:bg-navy-900 border"
              >
                {isAr ? 'التالي' : 'Next'}
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={() => handleFindAndReplace(false)}
            className="px-3 py-1 rounded-lg bg-royal-600 text-white font-semibold"
          >
            {isAr ? 'استبدال' : 'Replace'}
          </button>
          <button
            type="button"
            onClick={() => handleFindAndReplace(true)}
            className="px-3 py-1 rounded-lg bg-navy-800 text-white font-semibold"
          >
            {isAr ? 'استبدال الكل' : 'Replace All'}
          </button>
        </div>
      )}

      {/* Main Canvas + Optional Navigation & Comments Drawers */}
      <div className="flex-1 flex overflow-hidden">
        {showNavPane && (
          <aside className="w-56 bg-white dark:bg-navy-900 border-e border-slate-200 dark:border-navy-800 p-3 overflow-y-auto hidden sm:block">
            <div className="font-bold text-xs mb-2 text-navy-900 dark:text-white">
              {isAr ? 'العناوين والتنقل' : 'Document Outline'}
            </div>
            <div className="space-y-1">
              {model.blocks
                .filter((b): b is DocxParagraph => b.type === 'paragraph' && b.heading !== 'normal')
                .map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => setSelectedBlockId(h.id)}
                    className={`w-full text-start text-xs px-2 py-1.5 rounded-lg truncate hover:bg-royal-50 dark:hover:bg-navy-800 ${
                      h.id === selectedBlockId ? 'bg-royal-100 text-royal-700 font-bold' : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {h.runs.map((r) => r.text).join('') || '...'}
                  </button>
                ))}
            </div>
          </aside>
        )}
        <div className="flex-1 overflow-auto p-3 sm:p-6 flex justify-center">
          <div
            onPaste={(e) => {
              const items = e.clipboardData?.items;
              if (!items) return;
              for (const item of Array.from(items)) {
                if (item.type.startsWith('image/')) {
                  const file = item.getAsFile();
                  if (file) {
                    e.preventDefault();
                    handleInsertImage(file);
                  }
                }
              }
            }}
            className="print-area relative rounded-sm page-shadow transition-all"
            style={{
              width: `${pageWidthPx}px`,
              maxWidth: '100%',
              minHeight: ps.orientation === 'landscape' ? '680px' : '1020px',
              backgroundColor: ps.pageBackgroundColor || '#FFFFFF',
              paddingTop: `clamp(14px, 3vw, ${ps.marginTop * 2.2}px)`,
              paddingBottom: `clamp(14px, 3vw, ${ps.marginBottom * 2.2}px)`,
              paddingLeft: `clamp(14px, 3.5vw, ${ps.marginLeft * 2.2}px)`,
              paddingRight: `clamp(14px, 3.5vw, ${ps.marginRight * 2.2}px)`,
              border: ps.pageBorder
                ? `${ps.pageBorderWidth}pt ${
                    ps.pageBorderStyle === 'dashed'
                      ? 'dashed'
                      : ps.pageBorderStyle === 'double'
                        ? 'double'
                        : ps.pageBorderStyle === 'dotted'
                          ? 'dotted'
                          : 'solid'
                  } ${ps.pageBorderColor}`
                : '1px solid #E2E8F0',
              boxShadow:
                ps.pageBorder && ps.pageBorderStyle === 'shadow3d'
                  ? `6px 6px 0px ${ps.pageBorderColor}40, 0 8px 28px rgba(15, 41, 66, 0.14)`
                  : undefined,
              columnCount: ps.columns,
              columnGap: '24px',
            }}
          >
            {showRuler && (
              <div className="mb-3 pb-1 border-b border-slate-200 flex justify-between text-[9px] text-slate-400 select-none font-mono">
                {Array.from({ length: 11 }, (_, idx) => (
                  <span key={idx}>{idx * 2}cm</span>
                ))}
              </div>
            )}
            {/* Watermark */}
            {ps.watermarkText && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
                <span className="text-4xl sm:text-6xl font-extrabold text-slate-300/35 -rotate-45 select-none">
                  {ps.watermarkText}
                </span>
              </div>
            )}

            {/* Header */}
            {ps.headerText && (
              <div className="text-center text-xs text-slate-400 border-b border-slate-100 pb-2 mb-4">
                {ps.headerText}
              </div>
            )}

            {/* Document Blocks */}
            <div className="space-y-2.5 relative z-10">
              {model.blocks.map((block) => {
                const isSelected = block.id === selectedBlockId;

                if (block.type === 'pageBreak') {
                  return (
                    <div
                      key={block.id}
                      onClick={() => setSelectedBlockId(block.id)}
                      className="my-4 border-t-2 border-dashed border-royal-300 text-center text-[10px] text-royal-500 pt-1 cursor-pointer"
                    >
                      {isAr ? '— فاصل صفحة —' : '— Page Break —'}
                    </div>
                  );
                }

                if (block.type === 'image') {
                  const wrap = block.wrapMode || 'inline';
                  return (
                    <div
                      key={block.id}
                      onClick={() => setSelectedBlockId(block.id)}
                      className={`flex flex-col gap-1.5 p-2 rounded-lg ${
                        wrap === 'tight' ? (block.align === 'left' ? 'float-start me-3 mb-2' : 'float-end ms-3 mb-2') : ''
                      } ${wrap === 'behind' ? 'opacity-60 border border-dashed border-royal-300' : ''} ${
                        isSelected ? 'ring-2 ring-royal-400' : ''
                      }`}
                    >
                      <img
                        src={block.dataUrl}
                        alt={block.alt || 'Image'}
                        style={{
                          width: `${block.width}px`,
                          maxWidth: '100%',
                          height: 'auto',
                          transform: `rotate(${block.rotation || 0}deg) scaleX(${block.flipH ? -1 : 1}) scaleY(${block.flipV ? -1 : 1})`,
                          alignSelf: block.align === 'left' ? 'flex-start' : block.align === 'right' ? 'flex-end' : 'center',
                        }}
                        className={`transition-all ${
                          block.effect === 'shadow'
                            ? 'rounded-lg shadow-xl'
                            : block.effect === 'frame'
                              ? 'rounded-md border-4 border-navy-800 p-1 bg-white shadow-md'
                              : block.effect === 'rounded'
                                ? 'rounded-3xl shadow-md'
                                : block.effect === 'soft'
                                  ? 'rounded-2xl opacity-90 blur-[0.3px] shadow-lg'
                                  : 'rounded'
                        }`}
                      />
                      {isSelected && (
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] bg-slate-100 px-2 py-1.5 rounded-lg">
                          <span>{isAr ? 'العرض:' : 'Width:'}</span>
                          <input
                            type="range"
                            min={100}
                            max={620}
                            value={block.width}
                            onChange={(e) =>
                              commitModel((prev) => ({
                                ...prev,
                                blocks: prev.blocks.map((b) =>
                                  b.id === block.id && b.type === 'image'
                                    ? { ...b, width: Number(e.target.value) }
                                    : b
                                ),
                              }))
                            }
                          />
                          <button
                            type="button"
                            onClick={() =>
                              commitModel((prev) => ({
                                ...prev,
                                blocks: prev.blocks.map((b) =>
                                  b.id === block.id && b.type === 'image'
                                    ? { ...b, rotation: ((b.rotation || 0) + 90) % 360 }
                                    : b
                                ),
                              }))
                            }
                            className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-semibold"
                          >
                            {isAr ? 'تدوير 90°' : 'Rotate'}
                          </button>
                          <select
                            value={block.wrapMode || 'inline'}
                            onChange={(e) =>
                              commitModel((prev) => ({
                                ...prev,
                                blocks: prev.blocks.map((b) =>
                                  b.id === block.id && b.type === 'image'
                                    ? { ...b, wrapMode: e.target.value as 'inline' | 'tight' | 'behind' | 'in-front' }
                                    : b
                                ),
                              }))
                            }
                            className="rounded bg-white border border-slate-300 px-1.5 py-0.5 text-[11px]"
                          >
                            <option value="inline">{isAr ? 'مع السطر' : 'Inline'}</option>
                            <option value="tight">{isAr ? 'مشدود' : 'Tight'}</option>
                            <option value="behind">{isAr ? 'خلف النص' : 'Behind Text'}</option>
                            <option value="in-front">{isAr ? 'أمام النص' : 'In Front'}</option>
                          </select>
                          <select
                            value={block.effect || 'none'}
                            onChange={(e) =>
                              commitModel((prev) => ({
                                ...prev,
                                blocks: prev.blocks.map((b) =>
                                  b.id === block.id && b.type === 'image'
                                    ? { ...b, effect: e.target.value as 'none' | 'shadow' | 'frame' | 'rounded' | 'soft' }
                                    : b
                                ),
                              }))
                            }
                            className="rounded bg-white border border-slate-300 px-1.5 py-0.5 text-[11px]"
                          >
                            <option value="none">{isAr ? 'تأثير صورة: عادي' : 'Effect: None'}</option>
                            <option value="shadow">{isAr ? 'ظل فاخر' : 'Drop Shadow'}</option>
                            <option value="frame">{isAr ? 'برواز رسمي' : 'Formal Frame'}</option>
                            <option value="rounded">{isAr ? 'حواف دائرية' : 'Rounded'}</option>
                            <option value="soft">{isAr ? 'حواف ناعمة' : 'Soft Glow'}</option>
                          </select>
                          <button
                            type="button"
                            onClick={() =>
                              commitModel((prev) => {
                                const idx = prev.blocks.findIndex((b) => b.id === block.id);
                                if (idx <= 0) return prev;
                                const next = [...prev.blocks];
                                [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                                return { ...prev, blocks: next };
                              })
                            }
                            className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-semibold"
                            title={isAr ? 'نقل للأعلى بين النصوص' : 'Move Up'}
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              commitModel((prev) => {
                                const idx = prev.blocks.findIndex((b) => b.id === block.id);
                                if (idx < 0 || idx >= prev.blocks.length - 1) return prev;
                                const next = [...prev.blocks];
                                [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
                                return { ...prev, blocks: next };
                              })
                            }
                            className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-semibold"
                            title={isAr ? 'نقل للأسفل بين النصوص' : 'Move Down'}
                          >
                            ▼
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              commitModel((prev) => ({
                                ...prev,
                                blocks: prev.blocks.map((b) =>
                                  b.id === block.id && b.type === 'image' ? { ...b, flipH: !b.flipH } : b
                                ),
                              }))
                            }
                            className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-semibold"
                          >
                            {isAr ? 'قلب أفقي' : 'Flip H'}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              commitModel((prev) => ({
                                ...prev,
                                blocks: prev.blocks.map((b) =>
                                  b.id === block.id && b.type === 'image' ? { ...b, flipV: !b.flipV } : b
                                ),
                              }))
                            }
                            className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-semibold"
                          >
                            {isAr ? 'قلب رأسي' : 'Flip V'}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              commitModel((prev) => ({
                                ...prev,
                                blocks: prev.blocks.map((b) =>
                                  b.id === block.id && b.type === 'image'
                                    ? { ...b, width: 340, rotation: 0, flipH: false, flipV: false, wrapMode: 'inline' }
                                    : b
                                ),
                              }))
                            }
                            className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-semibold"
                          >
                            {isAr ? 'إعادة ضبط' : 'Reset'}
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              await updateSettings({ pinnedSnippet: { imageDataUrl: block.dataUrl } });
                              showToast(isAr ? 'تم حفظ الصورة في النمط الثابت الدائم' : 'Image saved to Pinned Style', 'success');
                            }}
                            className="px-2 py-0.5 rounded bg-navy-800 text-white font-semibold"
                          >
                            {isAr ? 'نمط ثابت' : 'Pin'}
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              setCopiedImageDataUrl(block.dataUrl);
                              try {
                                const res = await fetch(block.dataUrl);
                                const blob = await res.blob();
                                if (navigator.clipboard && 'write' in navigator.clipboard) {
                                  await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
                                }
                              } catch {
                                // Internal copiedImageDataUrl still works offline
                              }
                              showToast(isAr ? 'تم نسخ الصورة' : 'Image copied', 'success');
                            }}
                            className="px-2 py-0.5 rounded bg-royal-50 text-royal-700 font-semibold"
                          >
                            {isAr ? 'نسخ الصورة' : 'Copy'}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              commitModel((prev) => ({
                                ...prev,
                                blocks: prev.blocks.filter((b) => b.id !== block.id),
                              }))
                            }
                            className="text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                }

                if (block.type === 'textbox' || block.type === 'shape') {
                  return (
                    <div
                      key={block.id}
                      onClick={() => setSelectedBlockId(block.id)}
                      className={`p-3 border-2 ${
                        block.shapeKind === 'circle'
                          ? 'rounded-full text-center px-6'
                          : block.shapeKind === 'callout'
                            ? 'rounded-2xl border-s-8'
                            : 'rounded-xl'
                      }`}
                      style={{
                        backgroundColor: block.fillColor,
                        borderColor: block.borderColor,
                      }}
                    >
                      <textarea
                        value={block.text}
                        onChange={(e) =>
                          commitModel((prev) => ({
                            ...prev,
                            blocks: prev.blocks.map((b) =>
                              b.id === block.id && (b.type === 'textbox' || b.type === 'shape')
                                ? { ...b, text: e.target.value }
                                : b
                            ),
                          }))
                        }
                        rows={2}
                        className="w-full bg-transparent text-slate-800 text-sm focus:outline-none resize-y"
                      />
                    </div>
                  );
                }

                if (block.type === 'table') {
                  return (
                    <div
                      key={block.id}
                      onClick={() => setSelectedBlockId(block.id)}
                      className={`overflow-x-auto rounded-lg p-1 ${
                        isSelected ? 'ring-2 ring-royal-400' : ''
                      }`}
                    >
                      <table className="w-full border-collapse text-xs">
                        <tbody>
                          {block.rows.map((row, rIdx) => (
                            <tr key={row.id}>
                              {row.cells.map((cell, cIdx) => (
                                <td
                                  key={cell.id}
                                  colSpan={cell.colSpan}
                                  rowSpan={cell.rowSpan}
                                  style={{
                                    border: `1px solid ${block.borderColor || '#CBD5E1'}`,
                                    backgroundColor: cell.backgroundColor || '#FFFFFF',
                                  }}
                                  className="p-1.5"
                                >
                                  <input
                                    type="text"
                                    value={cell.paragraphs[0]?.runs[0]?.text || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      commitModel((prev) => ({
                                        ...prev,
                                        blocks: prev.blocks.map((b) => {
                                          if (b.id !== block.id || b.type !== 'table') return b;
                                          const nextRows = b.rows.map((rw, ri) =>
                                            ri !== rIdx
                                              ? rw
                                              : {
                                                  ...rw,
                                                  cells: rw.cells.map((cl, ci) =>
                                                    ci !== cIdx
                                                      ? cl
                                                      : {
                                                          ...cl,
                                                          paragraphs: [
                                                            {
                                                              ...(cl.paragraphs[0] || {
                                                                id: createId('p'),
                                                                type: 'paragraph',
                                                                runs: [{ id: createId('r'), text: '' }],
                                                              }),
                                                              runs: [
                                                                {
                                                                  ...(cl.paragraphs[0]?.runs[0] || {
                                                                    id: createId('r'),
                                                                  }),
                                                                  text: val,
                                                                },
                                                              ],
                                                            },
                                                          ],
                                                        }
                                                  ),
                                                }
                                          );
                                          return { ...b, rows: nextRows };
                                        }),
                                      }));
                                    }}
                                    className="w-full bg-transparent text-slate-900 focus:outline-none text-center"
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {isSelected && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5 text-[11px]">
                          <button
                            type="button"
                            onClick={() =>
                              commitModel((prev) => ({
                                ...prev,
                                blocks: prev.blocks.map((b) => {
                                  if (b.id !== block.id || b.type !== 'table') return b;
                                  const cols = b.rows[0]?.cells.length || 3;
                                  return {
                                    ...b,
                                    rows: [
                                      ...b.rows,
                                      {
                                        id: createId('tr'),
                                        cells: Array.from({ length: cols }, () => ({
                                          id: createId('tc'),
                                          paragraphs: [
                                            {
                                              id: createId('p'),
                                              type: 'paragraph',
                                              runs: [{ id: createId('r'), text: '' }],
                                            },
                                          ],
                                        })),
                                      },
                                    ],
                                  };
                                }),
                              }))
                            }
                            className="px-2 py-0.5 rounded bg-royal-50 text-royal-700 font-semibold"
                          >
                            {isAr ? '+ صف' : '+ Row'}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              commitModel((prev) => ({
                                ...prev,
                                blocks: prev.blocks.map((b) =>
                                  b.id !== block.id || b.type !== 'table'
                                    ? b
                                    : {
                                        ...b,
                                        rows: b.rows.map((r) => ({
                                          ...r,
                                          cells: [
                                            ...r.cells,
                                            {
                                              id: createId('tc'),
                                              paragraphs: [
                                                {
                                                  id: createId('p'),
                                                  type: 'paragraph',
                                                  runs: [{ id: createId('r'), text: '' }],
                                                },
                                              ],
                                            },
                                          ],
                                        })),
                                      }
                                ),
                              }))
                            }
                            className="px-2 py-0.5 rounded bg-royal-50 text-royal-700 font-semibold"
                          >
                            {isAr ? '+ عمود' : '+ Col'}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              commitModel((prev) => ({
                                ...prev,
                                blocks: prev.blocks.map((b) =>
                                  b.id !== block.id || b.type !== 'table' || b.rows.length <= 1
                                    ? b
                                    : { ...b, rows: b.rows.slice(0, -1) }
                                ),
                              }))
                            }
                            className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold"
                          >
                            {isAr ? '- صف' : '- Row'}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              commitModel((prev) => ({
                                ...prev,
                                blocks: prev.blocks.map((b) =>
                                  b.id !== block.id || b.type !== 'table' || (b.rows[0]?.cells.length || 0) <= 1
                                    ? b
                                    : { ...b, rows: b.rows.map((r) => ({ ...r, cells: r.cells.slice(0, -1) })) }
                                ),
                              }))
                            }
                            className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold"
                          >
                            {isAr ? '- عمود' : '- Col'}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              commitModel((prev) => ({
                                ...prev,
                                blocks: prev.blocks.map((b) => {
                                  if (b.id !== block.id || b.type !== 'table') return b;
                                  const firstRow = b.rows[0];
                                  if (!firstRow || firstRow.cells.length < 2) return b;
                                  const mergedCell = {
                                    ...firstRow.cells[0],
                                    colSpan: (firstRow.cells[0].colSpan || 1) + 1,
                                  };
                                  const nextFirstRow = {
                                    ...firstRow,
                                    cells: [mergedCell, ...firstRow.cells.slice(2)],
                                  };
                                  return { ...b, rows: [nextFirstRow, ...b.rows.slice(1)] };
                                }),
                              }))
                            }
                            className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-semibold"
                          >
                            {isAr ? 'دمج أول خليتين' : 'Merge Cells'}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              commitModel((prev) => ({
                                ...prev,
                                blocks: prev.blocks.map((b) => {
                                  if (b.id !== block.id || b.type !== 'table') return b;
                                  const firstRow = b.rows[0];
                                  if (!firstRow || (firstRow.cells[0]?.colSpan || 1) <= 1) return b;
                                  const span = firstRow.cells[0].colSpan || 1;
                                  const splitCells = [
                                    { ...firstRow.cells[0], colSpan: 1 },
                                    ...Array.from({ length: span - 1 }, () => ({
                                      id: createId('tc'),
                                      paragraphs: [{ id: createId('p'), type: 'paragraph' as const, runs: [{ id: createId('r'), text: '' }] }],
                                    })),
                                    ...firstRow.cells.slice(1),
                                  ];
                                  return { ...b, rows: [{ ...firstRow, cells: splitCells }, ...b.rows.slice(1)] };
                                }),
                              }))
                            }
                            className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-semibold"
                          >
                            {isAr ? 'تقسيم الخلية' : 'Split Cell'}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              commitModel((prev) => ({
                                ...prev,
                                blocks: prev.blocks.map((b) =>
                                  b.id !== block.id || b.type !== 'table'
                                    ? b
                                    : {
                                        ...b,
                                        rows: b.rows.map((r, ri) => ({
                                          ...r,
                                          cells: r.cells.map((c) => ({
                                            ...c,
                                            backgroundColor: ri === 0 ? '#DBEAFE' : ri % 2 === 0 ? '#F8FAFC' : '#FFFFFF',
                                          })),
                                        })),
                                      }
                                ),
                              }))
                            }
                            className="px-2 py-0.5 rounded bg-royal-50 text-royal-700 font-semibold"
                          >
                            {isAr ? 'تظليل متناوب' : 'Zebra Style'}
                          </button>
                          <select
                            value={block.tableStyle || 'default'}
                            onChange={(e) => {
                              const st = e.target.value as 'default' | 'royal' | 'navy' | 'emerald' | 'zebra';
                              const headerBg =
                                st === 'royal' ? '#1D4ED8' : st === 'navy' ? '#0F2942' : st === 'emerald' ? '#047857' : st === 'zebra' ? '#E2E8F0' : '#EFF6FF';
                              const headerColor = st === 'royal' || st === 'navy' || st === 'emerald' ? '#FFFFFF' : '#1E293B';
                              commitModel((prev) => ({
                                ...prev,
                                blocks: prev.blocks.map((b) =>
                                  b.id !== block.id || b.type !== 'table'
                                    ? b
                                    : {
                                        ...b,
                                        tableStyle: st,
                                        rows: b.rows.map((r, ri) => ({
                                          ...r,
                                          cells: r.cells.map((c) => ({
                                            ...c,
                                            backgroundColor: ri === 0 ? headerBg : ri % 2 === 0 ? '#F8FAFC' : '#FFFFFF',
                                            paragraphs: c.paragraphs.map((cp) => ({
                                              ...cp,
                                              runs: cp.runs.map((rn) => ({ ...rn, color: ri === 0 ? headerColor : rn.color })),
                                            })),
                                          })),
                                        })),
                                      }
                                ),
                              }));
                            }}
                            className="rounded bg-white border border-slate-300 px-1.5 py-0.5 text-[11px]"
                          >
                            <option value="default">{isAr ? 'نمط جدول: افتراضي' : 'Table Style'}</option>
                            <option value="royal">{isAr ? 'أزرق ملكي فاخر' : 'Royal Blue'}</option>
                            <option value="navy">{isAr ? 'كحلي داكن رسمي' : 'Navy Executive'}</option>
                            <option value="emerald">{isAr ? 'أخضر زمردي' : 'Emerald'}</option>
                            <option value="zebra">{isAr ? 'رمادي متناوب' : 'Classic Zebra'}</option>
                          </select>
                          <label className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold cursor-pointer">
                            <span>{isAr ? 'حدود الجدول:' : 'Borders:'}</span>
                            <input
                              type="color"
                              value={block.borderColor === 'transparent' ? '#CBD5E1' : (block.borderColor || '#CBD5E1')}
                              onChange={(e) =>
                                commitModel((prev) => ({
                                  ...prev,
                                  blocks: prev.blocks.map((b) =>
                                    b.id === block.id && b.type === 'table'
                                      ? { ...b, borderColor: e.target.value }
                                      : b
                                  ),
                                }))
                              }
                              className="w-4 h-4 p-0 border-0 bg-transparent"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              commitModel((prev) => ({
                                ...prev,
                                blocks: prev.blocks.map((b) =>
                                  b.id === block.id && b.type === 'table'
                                    ? { ...b, borderColor: b.borderColor === 'transparent' ? '#CBD5E1' : 'transparent' }
                                    : b
                                ),
                              }))
                            }
                            className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold"
                          >
                            {block.borderColor === 'transparent' ? (isAr ? 'إظهار الحدود' : 'Show Borders') : (isAr ? 'بلا حدود' : 'No Borders')}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              commitModel((prev) => ({
                                ...prev,
                                blocks: prev.blocks.filter((b) => b.id !== block.id),
                              }))
                            }
                            className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-semibold"
                          >
                            {isAr ? 'حذف الجدول' : 'Delete Table'}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                }

                // Paragraph block
                if (block.type !== 'paragraph') return null;
                const run = block.runs[0] || { id: 'r', text: '' };
                const textVal = block.runs.map((r) => r.text).join('');
                const sizePt =
                  block.heading === 'h1'
                    ? 20
                    : block.heading === 'h2'
                      ? 16
                      : block.heading === 'h3'
                        ? 14
                        : run.fontSize || 12;

                return (
                  <div
                    key={block.id}
                    onClick={() => setSelectedBlockId(block.id)}
                    style={{
                      paddingLeft: `${block.indentLeft || 0}px`,
                      paddingRight: `${block.indentRight || 0}px`,
                    }}
                    className={`relative flex items-start gap-1.5 rounded-lg px-1.5 py-0.5 transition-colors ${
                      searchMatches.includes(block.id) ? 'bg-amber-100/70 ring-2 ring-amber-400' : isSelected ? 'bg-royal-50/40 ring-1 ring-royal-300' : ''
                    }`}
                  >
                    {selectionToolbarBlockId === block.id && (
                      <div
                        onMouseDown={(e) => e.preventDefault()}
                        className="absolute -top-10 start-2 z-30 flex items-center gap-1 bg-navy-900 text-white px-2 py-1 rounded-xl shadow-card border border-navy-700 text-xs"
                      >
                        <button type="button" onClick={() => updateRunStyle({ bold: !run.bold })} className="px-1.5 py-0.5 rounded hover:bg-navy-700 font-bold">B</button>
                        <button type="button" onClick={() => updateRunStyle({ italic: !run.italic })} className="px-1.5 py-0.5 rounded hover:bg-navy-700 italic">I</button>
                        <button type="button" onClick={() => updateRunStyle({ underline: !run.underline })} className="px-1.5 py-0.5 rounded hover:bg-navy-700 underline">U</button>
                        <input
                          type="color"
                          title={isAr ? 'لون النص' : 'Text Color'}
                          value={run.color || '#1E293B'}
                          onChange={(e) => updateRunStyle({ color: e.target.value })}
                          className="w-4 h-4 p-0 border-0 bg-transparent cursor-pointer"
                        />
                        <input
                          type="color"
                          title={isAr ? 'تمييز / تضليل' : 'Highlight / Shading'}
                          value={run.highlight || '#FEF08A'}
                          onChange={(e) => updateRunStyle({ highlight: e.target.value })}
                          className="w-4 h-4 p-0 border-0 bg-transparent cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            await updateSettings({
                              pinnedSnippet: {
                                text: textVal,
                                heading: block.heading,
                                align: block.align,
                                style: {
                                  bold: run.bold,
                                  italic: run.italic,
                                  underline: run.underline,
                                  strike: run.strike,
                                  fontFamily: run.fontFamily,
                                  fontSize: run.fontSize,
                                  color: run.color,
                                  highlight: run.highlight,
                                  backgroundColor: run.backgroundColor,
                                },
                              },
                            });
                            showToast(isAr ? 'تم حفظ النمط والمحتوى في الحافظة الدائمة (نمط ثابت)' : 'Saved to permanent Pinned Style', 'success');
                            setSelectionToolbarBlockId(null);
                          }}
                          className="px-1.5 py-0.5 rounded bg-royal-600 hover:bg-royal-500 font-bold"
                        >
                          {isAr ? 'نمط ثابت' : 'Pin'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard?.writeText(textVal);
                            showToast(isAr ? 'تم النسخ' : 'Copied', 'info');
                            setSelectionToolbarBlockId(null);
                          }}
                          className="px-1.5 py-0.5 rounded hover:bg-navy-700"
                        >
                          {isAr ? 'نسخ' : 'Copy'}
                        </button>
                        <button type="button" onClick={() => setSelectionToolbarBlockId(null)} className="px-1 text-slate-300 hover:text-white">×</button>
                      </div>
                    )}
                    {block.listType === 'bullet' && <span className="mt-1 text-slate-700">•</span>}
                    {block.listType === 'number' && <span className="mt-1 text-slate-700 text-xs">1.</span>}
                    {block.listType === 'alpha-ar' && <span className="mt-1 text-slate-700 text-xs">أ.</span>}
                    {block.listType === 'roman' && <span className="mt-1 text-slate-700 text-xs">I.</span>}
                    <textarea
                      onSelect={(e) => {
                        const el = e.currentTarget;
                        if (el.selectionEnd > el.selectionStart) {
                          setSelectedBlockId(block.id);
                          setSelectionToolbarBlockId(block.id);
                        } else if (selectionToolbarBlockId === block.id) {
                          setSelectionToolbarBlockId(null);
                        }
                      }}
                      dir={block.direction || model.direction}
                      spellCheck={spellCheck}
                      value={textVal}
                      onChange={(e) => handleParagraphTextChange(block.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          addNewParagraphAfter(block.id);
                        }
                      }}
                      rows={Math.max(1, Math.ceil((textVal.length || 1) / 68))}
                      placeholder={isAr ? 'اكتب هنا...' : 'Type here...'}
                      style={{
                        fontFamily: `"${run.fontFamily || settings.defaultFontFamily}", Cairo, sans-serif`,
                        fontSize: `${sizePt}pt`,
                        fontWeight: block.heading !== 'normal' || run.bold ? 700 : 400,
                        fontStyle: run.italic ? 'italic' : 'normal',
                        textDecoration: [
                          run.underline ? 'underline' : '',
                          run.strike ? 'line-through' : '',
                        ]
                          .filter(Boolean)
                          .join(' '),
                        color: run.color || '#1E293B',
                        backgroundColor: run.highlight || run.backgroundColor || 'transparent',
                        textAlign: block.align || (model.direction === 'rtl' ? 'right' : 'left'),
                        lineHeight: block.lineSpacing || 1.45,
                        textShadow:
                          run.textEffect === 'shadow'
                            ? '2px 2px 4px rgba(15, 41, 66, 0.35)'
                            : run.textEffect === 'glow'
                              ? '0 0 8px rgba(37, 99, 235, 0.55)'
                              : undefined,
                        WebkitTextStroke: run.textEffect === 'outline' ? '0.6px #0F2942' : undefined,
                      }}
                      className="w-full bg-transparent focus:outline-none resize-none overflow-hidden"
                    />
                    {(() => {
                      const ind = detectParagraphIndicators(textVal);
                      if (!ind.hasAiArtifact && !ind.hasRepeatedWord && !isSelected) return null;
                      return (
                        <div className="flex items-center gap-1 shrink-0 mt-1">
                          {ind.hasAiArtifact && (
                            <span
                              title={isAr ? 'يحتوي على عبارة قالب/علامة ذكاء اصطناعي' : 'Contains explicit AI boilerplate/marker'}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold"
                            >
                              ● AI
                            </span>
                          )}
                          {ind.hasRepeatedWord && (
                            <span
                              title={isAr ? 'تنبيه إملائي: كلمة مكررة' : 'Spelling hint: repeated word'}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold"
                            >
                              !
                            </span>
                          )}
                          {isSelected && (
                            <>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  commitModel((prev) => {
                                    const idx = prev.blocks.findIndex((b) => b.id === block.id);
                                    const clone: DocxParagraph = {
                                      ...block,
                                      id: createId('p'),
                                      runs: block.runs.map((r) => ({ ...r, id: createId('r') })),
                                    };
                                    const next = [...prev.blocks];
                                    next.splice(idx + 1, 0, clone);
                                    return { ...prev, blocks: next };
                                  });
                                }}
                                title={isAr ? 'تكرار الفقرة' : 'Duplicate Paragraph'}
                                className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-royal-100 text-slate-600 text-[10px] font-bold"
                              >
                                +
                              </button>
                              {model.blocks.length > 1 && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    commitModel((prev) => ({
                                      ...prev,
                                      blocks: prev.blocks.filter((b) => b.id !== block.id),
                                    }));
                                  }}
                                  title={isAr ? 'حذف الفقرة' : 'Delete Paragraph'}
                                  className="px-1.5 py-0.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] font-bold"
                                >
                                  ×
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            {(ps.footerText || ps.showPageNumbers) && (
              <div className="mt-8 pt-2 border-t border-slate-100 text-center text-xs text-slate-400">
                {[ps.footerText, ps.showPageNumbers && !ps.differentFirstPage ? (ps.pageNumberFormat === 'number' ? `${ps.pageNumberStart ?? 1}` : `${ps.pageNumberStart ?? 1} / ${stats.pages}`) : ''].filter(Boolean).join(' • ')}
              </div>
            )}
          </div>
        </div>

        {/* Comments Sidebar */}
        {showComments && (
          <div className="w-64 sm:w-72 bg-white dark:bg-navy-900 border-s border-slate-200 dark:border-navy-800 p-4 flex flex-col gap-3">
            <div className="font-bold text-sm">{isAr ? 'التعليقات والمراجعة' : 'Review Comments'}</div>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder={isAr ? 'أضف تعليقًا...' : 'Add comment...'}
                className="flex-1 rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 px-2.5 py-1.5 text-xs"
              />
              <button
                type="button"
                onClick={() => {
                  if (!newCommentText.trim()) return;
                  commitModel((prev) => ({
                    ...prev,
                    comments: [
                      ...prev.comments,
                      {
                        id: createId('cmt'),
                        author: 'AMR User',
                        text: newCommentText.trim(),
                        createdAt: Date.now(),
                        blockId: selectedBlockId || undefined,
                      },
                    ],
                  }));
                  setNewCommentText('');
                }}
                className="px-2.5 py-1.5 rounded-lg bg-royal-600 text-white text-xs font-bold"
              >
                +
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {model.comments.map((c) => (
                <div
                  key={c.id}
                  className={`p-2.5 rounded-xl border text-xs ${
                    c.resolved ? 'opacity-50 bg-slate-50' : 'bg-amber-50/50 border-amber-200'
                  }`}
                >
                  <div className="font-bold text-navy-900 dark:text-white">{c.author}</div>
                  <div className="mt-1">{c.text}</div>
                  <button
                    type="button"
                    onClick={() =>
                      commitModel((prev) => ({
                        ...prev,
                        comments: prev.comments.map((item) =>
                          item.id === c.id ? { ...item, resolved: !item.resolved } : item
                        ),
                      }))
                    }
                    className="mt-1.5 text-[11px] text-royal-600 font-semibold inline-flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    {c.resolved ? (isAr ? 'محلول' : 'Resolved') : isAr ? 'تحديد كمحلول' : 'Resolve'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Status Bar */}
      <div className="bg-navy-800 text-white px-4 py-1.5 text-[11px] flex items-center justify-between">
        <div>
          {isAr
            ? `الصفحات: ${stats.pages} | الكلمات: ${stats.words} | الحروف: ${stats.chars} | القراءة: ~${Math.max(1, Math.ceil(stats.words / 200))} د`
            : `Pages: ${stats.pages} | Words: ${stats.words} | Chars: ${stats.chars} | Read: ~${Math.max(1, Math.ceil(stats.words / 200))}m`}
        </div>
        <div>{ps.paperSize} • {ps.orientation} • {zoom}%</div>
      </div>

      {/* Symbols Picker Modal */}
      {showSymbolModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-3">
          <div className="bg-white dark:bg-navy-900 rounded-2xl p-5 w-full max-w-sm space-y-3 shadow-card">
            <h3 className="font-bold text-sm">{isAr ? 'إدراج رمز' : 'Insert Symbol'}</h3>
            <div className="grid grid-cols-6 gap-2">
              {SYMBOLS.map((sym) => (
                <button
                  key={sym}
                  type="button"
                  onClick={() => {
                    updateSelectedParagraph((p) => ({
                      ...p,
                      runs: p.runs.map((r, i) => (i === 0 ? { ...r, text: `${r.text}${sym}` } : r)),
                    }));
                    setShowSymbolModal(false);
                  }}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-navy-800 hover:bg-royal-100 font-bold text-base"
                >
                  {sym}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowSymbolModal(false)}
              className="w-full py-2 rounded-xl border border-slate-200 text-xs font-semibold"
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Hyperlink Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-3">
          <div className="bg-white dark:bg-navy-900 rounded-2xl p-5 w-full max-w-sm space-y-3 shadow-card">
            <h3 className="font-bold text-sm">{isAr ? 'إدراج رابط' : 'Insert Hyperlink'}</h3>
            <input
              type="text"
              value={linkLabel}
              onChange={(e) => setLinkLabel(e.target.value)}
              placeholder={isAr ? 'نص الرابط...' : 'Link text...'}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="px-3 py-1.5 rounded-xl border text-xs font-semibold"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  commitModel((prev) => ({
                    ...prev,
                    blocks: [
                      ...prev.blocks,
                      {
                        id: createId('p'),
                        type: 'paragraph',
                        align: model.direction === 'rtl' ? 'right' : 'left',
                        direction: model.direction,
                        runs: [
                          {
                            id: createId('r'),
                            text: linkLabel || linkUrl,
                            linkUrl,
                            color: '#1D4ED8',
                            underline: true,
                            fontFamily: settings.defaultFontFamily,
                            fontSize: settings.defaultFontSize,
                          },
                        ],
                      },
                    ],
                  }));
                  setShowLinkModal(false);
                }}
                className="px-4 py-1.5 rounded-xl bg-royal-600 text-white text-xs font-semibold"
              >
                {t('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Equation Modal */}
      {showEquationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-3">
          <div className="bg-white dark:bg-navy-900 rounded-2xl p-5 w-full max-w-md space-y-3 shadow-card">
            <h3 className="font-bold text-sm">{isAr ? 'إدراج معادلة رياضية' : 'Insert Equation'}</h3>
            <div className="flex flex-wrap gap-1.5">
              {EQUATIONS.map((eq) => (
                <button
                  key={eq}
                  type="button"
                  onClick={() => setEquationInput(eq)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-navy-800 hover:bg-royal-100 text-xs font-mono"
                >
                  {eq}
                </button>
              ))}
            </div>
            <input
              type="text"
              dir="ltr"
              value={equationInput}
              onChange={(e) => setEquationInput(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 px-3 py-2 text-sm font-mono"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowEquationModal(false)} className="px-3 py-1.5 rounded-xl border text-xs font-semibold">
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  commitModel((prev) => ({
                    ...prev,
                    blocks: [
                      ...prev.blocks,
                      {
                        id: createId('p'),
                        type: 'paragraph',
                        align: 'center',
                        direction: 'ltr',
                        runs: [
                          {
                            id: createId('r'),
                            text: equationInput,
                            italic: true,
                            bold: true,
                            fontFamily: 'Georgia',
                            fontSize: 14,
                            color: '#0F2942',
                          },
                        ],
                      },
                    ],
                  }));
                  setShowEquationModal(false);
                }}
                className="px-4 py-1.5 rounded-xl bg-royal-600 text-white text-xs font-bold"
              >
                {t('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shape Picker Modal */}
      {showShapeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-3">
          <div className="bg-white dark:bg-navy-900 rounded-2xl p-5 w-full max-w-sm space-y-3 shadow-card">
            <h3 className="font-bold text-sm">{isAr ? 'إدراج شكل أو مربع نص' : 'Insert Shape or Text Box'}</h3>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              {(
                [
                  ['textbox', isAr ? 'مربع نص' : 'Text Box'],
                  ['rectangle', isAr ? 'مستطيل' : 'Rectangle'],
                  ['circle', isAr ? 'دائرة / بيضاوي' : 'Circle'],
                  ['callout', isAr ? 'وسيلة شرح' : 'Callout Box'],
                ] as const
              ).map(([kind, label]) => (
                <button
                  key={kind}
                  type="button"
                  onClick={() => {
                    commitModel((prev) => ({
                      ...prev,
                      blocks: [
                        ...prev.blocks,
                        {
                          id: createId('shp'),
                          type: kind === 'textbox' ? 'textbox' : 'shape',
                          shapeKind: kind,
                          text: label,
                          fillColor: kind === 'callout' ? '#FEF3C7' : '#EFF6FF',
                          borderColor: kind === 'callout' ? '#D97706' : '#1D4ED8',
                          width: 360,
                          height: 80,
                        },
                      ],
                    }));
                    setShowShapeModal(false);
                  }}
                  className="p-3 rounded-xl border border-slate-200 dark:border-navy-700 hover:border-royal-500 bg-slate-50 dark:bg-navy-800"
                >
                  {label}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setShowShapeModal(false)} className="w-full py-2 rounded-xl border text-xs font-semibold">
              {t('cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Versions & Restore Modal */}
      {showVersionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-3">
          <div className="bg-white dark:bg-navy-900 rounded-2xl p-5 w-full max-w-md space-y-3 shadow-card">
            <h3 className="font-bold text-sm">{isAr ? 'النسخ الاحتياطية واستعادة الجلسات' : 'Backup Versions & Restore'}</h3>
            <p className="text-xs text-slate-500">
              {isAr ? `تاريخ التراجع في الجلسة الحالية: ${history.length} خطوة` : `Current session undo steps: ${history.length}`}
            </p>
            <div className="max-h-56 overflow-y-auto space-y-2">
              {(!activeDoc?.versions || activeDoc.versions.length === 0) ? (
                <div className="text-xs text-slate-400 py-4 text-center">
                  {isAr ? 'لا توجد نسخ احتياطية محفوظة بعد. اضغط حفظ لإنشاء نسخة.' : 'No backup versions yet. Click Save to create one.'}
                </div>
              ) : (
                activeDoc.versions.map((v) => (
                  <div key={v.id} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-navy-700 text-xs">
                    <div>
                      <div className="font-bold">{v.note}</div>
                      <div className="text-slate-400">{new Date(v.createdAt).toLocaleString()}</div>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        const restored = await parseDocxBlob(v.blob, model.title);
                        setModel(restored);
                        setShowVersionsModal(false);
                        showToast(isAr ? 'تمت استعادة النسخة الاحتياطية' : 'Backup version restored', 'success');
                      }}
                      className="px-3 py-1 rounded-lg bg-royal-600 text-white font-semibold"
                    >
                      {t('restore')}
                    </button>
                  </div>
                ))
              )}
            </div>
            <button type="button" onClick={() => setShowVersionsModal(false)} className="w-full py-2 rounded-xl border text-xs font-semibold">
              {t('cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Print & Export Modal */}
      <PrintExportModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        docTitle={model.title}
        docType="docx"
        onExportDocx={async (opts) => {
          const customModel = {
            ...model,
            pageSetup: { ...model.pageSetup, paperSize: opts.paperSize, orientation: opts.orientation },
          };
          const blob = await exportModelToDocxBlob(customModel);
          await exportFileToDevice(blob, `${model.title}.docx`);
          showToast(isAr ? 'تم تصدير DOCX' : 'DOCX exported', 'success');
        }}
        onExportPdf={async (opts) => {
          const customModel = {
            ...model,
            pageSetup: { ...model.pageSetup, paperSize: opts.paperSize, orientation: opts.orientation },
          };
          const blob = await exportDocxModelToPdfBlob(customModel);
          await exportFileToDevice(blob, `${model.title}.pdf`);
          showToast(isAr ? 'تم تصدير PDF' : 'PDF exported', 'success');
        }}
        onSaveAsCopy={async (newName) => {
          const copiedModel = { ...model, title: newName };
          const blob = await exportModelToDocxBlob(copiedModel);
          await upsertDocument({
            id: createId('doc'),
            name: `${newName}.docx`,
            type: 'docx',
            folderId: null,
            size: blob.size,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            lastOpenedAt: Date.now(),
            isFavorite: false,
            isDeleted: false,
            blob,
            editorState: copiedModel,
            syncStatus: 'local',
          });
          showToast(isAr ? 'تم حفظ النسخة الجديدة' : 'Saved new copy', 'success');
        }}
        onShare={async () => {
          const blob = await exportModelToDocxBlob(model);
          await shareDocumentFile(blob, `${model.title}.docx`, model.title);
        }}
      />
    </div>
  );
};
