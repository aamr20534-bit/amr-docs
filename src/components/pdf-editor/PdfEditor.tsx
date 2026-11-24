import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Circle,
  Download,
  FilePlus2,
  FolderOpen,
  Highlighter,
  ImagePlus,
  Layers,
  Minimize2,
  MousePointer,
  PenTool,
  Printer,
  RotateCw,
  Save,
  Scissors,
  Search,
  Square,
  StickyNote,
  Strikethrough,
  Trash2,
  Type,
  Underline,
  ZoomIn,
  ZoomOut,
  FileImage,
  ArrowUpDown,
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { useApp } from '../../context/AppContext';
import {
  addBlankPdfPage,
  applyAnnotationsAndSavePdf,
  compressPdfBlob,
  createBlankPdfBlob,
  deletePdfPage,
  extractPdfPages,
  imagesToPdfBlob,
  loadPdfDocument,
  mergePdfBlobs,
  renderPdfPageToCanvas,
  reorderPdfPages,
  rotatePdfPage,
} from '../../engines/pdf/pdfEngine';
import { createId, downloadBlob, fileToDataUrl } from '../../utils/fileHelpers';
import { exportFileToDevice, shareDocumentFile } from '../../utils/capacitorBridge';
import { PdfAnnotation, PdfAnnotationType, PdfOverlayState, StoredDocument } from '../../types';
import { PrintExportModal } from '../common/PrintExportModal';

type PdfTool = 'select' | PdfAnnotationType;

export const PdfEditor: React.FC = () => {
  const { t, documents, activeDocId, setActiveDocId, fonts, settings, upsertDocument, showToast } =
    useApp();
  const isAr = settings.language === 'ar';

  const activeDoc = useMemo(
    () => documents.find((d) => d.id === activeDocId && d.type === 'pdf') || null,
    [documents, activeDocId]
  );

  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfProxy, setPdfProxy] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.25);
  const [pageText, setPageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<number[]>([]);

  const [tool, setTool] = useState<PdfTool>('select');
  const [annotations, setAnnotations] = useState<PdfAnnotation[]>([]);
  const [selectedAnnId, setSelectedAnnId] = useState<string | null>(null);
  const [addPageNumbers, setAddPageNumbers] = useState(false);

  const [activeColor, setActiveColor] = useState('#1D4ED8');
  const [activeFontSize, setActiveFontSize] = useState(16);
  const [activeFontFamily, setActiveFontFamily] = useState(settings.defaultFontFamily);
  const [textDraft, setTextDraft] = useState(isAr ? 'نص جديد' : 'New Text');

  const [isDrawing, setIsDrawing] = useState(false);
  const [freehandPoints, setFreehandPoints] = useState<Array<{ x: number; y: number }>>([]);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showPageTools, setShowPageTools] = useState(false);
  const [showPdfComments, setShowPdfComments] = useState(false);
  const [splitRange, setSplitRange] = useState('1-1');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const sigCanvasRef = useRef<HTMLCanvasElement>(null);
  const sigDrawingRef = useRef(false);

  const openPdfRef = useRef<HTMLInputElement>(null);
  const insertImgRef = useRef<HTMLInputElement>(null);
  const mergePdfRef = useRef<HTMLInputElement>(null);
  const imgsToPdfRef = useRef<HTMLInputElement>(null);

  // Initialize from activeDoc or blank PDF
  useEffect(() => {
    const init = async () => {
      if (activeDoc) {
        setPdfBlob(activeDoc.blob);
        const st = activeDoc.editorState as PdfOverlayState | undefined;
        setAnnotations(st?.annotations || []);
        setAddPageNumbers(!!st?.addPageNumbers);
      } else {
        const blank = await createBlankPdfBlob('New PDF', 1);
        setPdfBlob(blank);
        setAnnotations([]);
      }
      setCurrentPage(1);
    };
    init();
  }, [activeDoc?.id]);

  // Load PDF proxy whenever pdfBlob changes
  useEffect(() => {
    if (!pdfBlob) return;
    let cancelled = false;
    loadPdfDocument(pdfBlob)
      .then((proxy) => {
        if (cancelled) return;
        setPdfProxy(proxy);
        setNumPages(proxy.numPages);
        setCurrentPage((p) => Math.min(Math.max(1, p), proxy.numPages));
      })
      .catch(() => {
        showToast(isAr ? 'تعذر تحميل ملف PDF' : 'Failed to load PDF', 'error');
      });
    return () => {
      cancelled = true;
    };
  }, [pdfBlob]);

  // Render active page
  useEffect(() => {
    if (!pdfProxy || !canvasRef.current) return;
    renderPdfPageToCanvas(pdfProxy, currentPage, canvasRef.current, scale).then((res) => {
      setPageText(res.textContent);
    });
  }, [pdfProxy, currentPage, scale]);

  const handleSearchPdf = async () => {
    if (!pdfProxy || !searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    const matches: number[] = [];
    const q = searchTerm.toLowerCase();
    for (let i = 1; i <= pdfProxy.numPages; i++) {
      const page = await pdfProxy.getPage(i);
      const tc = await page.getTextContent();
      const txt = tc.items.map((it) => ('str' in it ? it.str : '')).join(' ').toLowerCase();
      if (txt.includes(q)) matches.push(i);
    }
    setSearchResults(matches);
    if (matches.length > 0) {
      setCurrentPage(matches[0]);
      showToast(
        isAr ? `تم العثور على نتائج في ${matches.length} صفحة` : `Found in ${matches.length} page(s)`,
        'success'
      );
    } else {
      showToast(isAr ? 'لم يتم العثور على نتائج' : 'No matches found', 'info');
    }
  };

  const getRelativeCoords = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = overlayRef.current!.getBoundingClientRect();
    return {
      x: Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height)),
    };
  };

  const handleOverlayPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (tool === 'select') {
      setSelectedAnnId(null);
      return;
    }
    const { x, y } = getRelativeCoords(e);
    if (tool === 'freehand') {
      setIsDrawing(true);
      setFreehandPoints([{ x, y }]);
      return;
    }

    const newAnn: PdfAnnotation = {
      id: createId('ann'),
      pageIndex: currentPage - 1,
      type: tool,
      x,
      y,
      width: tool === 'highlight' || tool === 'underline' || tool === 'strike' ? 0.25 : 0.22,
      height: tool === 'highlight' ? 0.035 : tool === 'rect' || tool === 'circle' ? 0.1 : 0.06,
      x2: x + 0.16,
      y2: y + 0.04,
      text:
        tool === 'date'
          ? new Date().toLocaleDateString(isAr ? 'ar-EG' : 'en-US')
          : tool === 'text' || tool === 'textbox' || tool === 'note'
            ? textDraft
            : undefined,
      fontFamily: activeFontFamily,
      fontSize: activeFontSize,
      color: tool === 'highlight' ? '#FACC15' : activeColor,
      backgroundColor:
        tool === 'textbox' ? '#FFFFFF' : tool === 'note' ? '#FEF08A' : undefined,
      opacity: tool === 'highlight' ? 0.35 : 1,
      strokeWidth: 2,
      createdAt: Date.now(),
    };

    setAnnotations((prev) => [...prev, newAnn]);
    setSelectedAnnId(newAnn.id);
    setTool('select');
  };

  const handleOverlayPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDrawing || tool !== 'freehand') return;
    const pt = getRelativeCoords(e);
    setFreehandPoints((prev) => [...prev, pt]);
  };

  const handleOverlayPointerUp = () => {
    if (!isDrawing || tool !== 'freehand') return;
    setIsDrawing(false);
    if (freehandPoints.length > 1) {
      setAnnotations((prev) => [
        ...prev,
        {
          id: createId('ann'),
          pageIndex: currentPage - 1,
          type: 'freehand',
          x: freehandPoints[0].x,
          y: freehandPoints[0].y,
          points: freehandPoints,
          color: activeColor,
          strokeWidth: 2.5,
          createdAt: Date.now(),
        },
      ]);
    }
    setFreehandPoints([]);
  };

  const handleSavePdf = useCallback(
    async (compress = true) => {
      if (!pdfBlob) return;
      const updatedBlob = await applyAnnotationsAndSavePdf(pdfBlob, annotations, fonts, {
        addPageNumbers,
        compress,
      });
      setPdfBlob(updatedBlob);
      const now = Date.now();
      if (activeDoc) {
        await upsertDocument({
          ...activeDoc,
          size: updatedBlob.size,
          updatedAt: now,
          blob: updatedBlob,
          editorState: { annotations: [], addPageNumbers },
        });
      } else {
        const doc: StoredDocument = {
          id: createId('pdf'),
          name: `Document_${new Date().toISOString().slice(0, 10)}.pdf`,
          type: 'pdf',
          folderId: null,
          size: updatedBlob.size,
          createdAt: now,
          updatedAt: now,
          lastOpenedAt: now,
          isFavorite: false,
          isDeleted: false,
          blob: updatedBlob,
          editorState: { annotations: [], addPageNumbers },
          syncStatus: 'local',
        };
        await upsertDocument(doc);
        setActiveDocId(doc.id);
      }
      setAnnotations([]);
      showToast(isAr ? 'تم حفظ التعديلات داخل ملف PDF' : 'Saved edits into PDF', 'success');
    },
    [activeDoc, addPageNumbers, annotations, fonts, isAr, pdfBlob, setActiveDocId, showToast, upsertDocument]
  );

  const handleInsertImage = async (file: File | undefined) => {
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setAnnotations((prev) => [
      ...prev,
      {
        id: createId('img'),
        pageIndex: currentPage - 1,
        type: 'image',
        x: 0.25,
        y: 0.25,
        width: 0.3,
        height: 0.2,
        rotation: 0,
        imageDataUrl: dataUrl,
        createdAt: Date.now(),
      },
    ]);
  };

  const handleSaveDrawnSignature = () => {
    const c = sigCanvasRef.current;
    if (!c) return;
    const dataUrl = c.toDataURL('image/png');
    setAnnotations((prev) => [
      ...prev,
      {
        id: createId('sig'),
        pageIndex: currentPage - 1,
        type: 'signature',
        x: 0.3,
        y: 0.72,
        width: 0.28,
        height: 0.12,
        rotation: 0,
        imageDataUrl: dataUrl,
        createdAt: Date.now(),
      },
    ]);
    setShowSignatureModal(false);
  };

  const handleConvertPageToImage = () => {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob((blob) => {
      if (blob) downloadBlob(blob, `${activeDoc?.name || 'page'}_p${currentPage}.png`);
    }, 'image/png');
  };

  const selectedAnn = annotations.find((a) => a.id === selectedAnnId) || null;
  const pageAnnotations = annotations.filter((a) => a.pageIndex === currentPage - 1);

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-slate-100 dark:bg-navy-950 overflow-hidden">
      <input
        ref={openPdfRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          setPdfBlob(f);
          setAnnotations([]);
          const newDoc: StoredDocument = {
            id: createId('pdf'),
            name: f.name,
            type: 'pdf',
            folderId: null,
            size: f.size,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            lastOpenedAt: Date.now(),
            isFavorite: false,
            isDeleted: false,
            blob: f,
            editorState: { annotations: [] },
            syncStatus: 'local',
          };
          await upsertDocument(newDoc);
          setActiveDocId(newDoc.id);
        }}
      />
      <input
        ref={insertImgRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleInsertImage(e.target.files?.[0])}
      />
      <input
        ref={mergePdfRef}
        type="file"
        accept=".pdf,application/pdf"
        multiple
        className="hidden"
        onChange={async (e) => {
          const files = e.target.files;
          if (!files || !pdfBlob) return;
          const merged = await mergePdfBlobs([pdfBlob, ...Array.from(files)]);
          setPdfBlob(merged);
          showToast(isAr ? 'تم دمج ملفات PDF بنجاح' : 'Merged PDFs successfully', 'success');
        }}
      />
      <input
        ref={imgsToPdfRef}
        type="file"
        accept="image/png,image/jpeg"
        multiple
        className="hidden"
        onChange={async (e) => {
          const files = e.target.files;
          if (!files || files.length === 0) return;
          const converted = await imagesToPdfBlob(Array.from(files));
          setPdfBlob(converted);
          setAnnotations([]);
          showToast(isAr ? 'تم تحويل الصور إلى PDF' : 'Converted images to PDF', 'success');
        }}
      />

      {/* Top PDF Bar */}
      <div className="bg-white dark:bg-navy-900 border-b border-slate-200 dark:border-navy-800 px-3 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-bold text-sm truncate max-w-[180px] sm:max-w-xs">
            {activeDoc?.name || (isAr ? 'محرر PDF' : 'PDF Editor')}
          </span>
          <button
            type="button"
            onClick={() => openPdfRef.current?.click()}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-navy-800 text-xs font-semibold"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isAr ? 'فتح PDF' : 'Open'}</span>
          </button>
        </div>

        {/* Search inside PDF */}
        <div className="flex items-center gap-1.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute top-1/2 -translate-y-1/2 start-2.5" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchPdf()}
              placeholder={isAr ? 'بحث داخل PDF...' : 'Search PDF...'}
              className="w-32 sm:w-44 rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 ps-7 pe-2 py-1 text-xs"
            />
          </div>
          {searchResults.length > 0 && (
            <span className="text-[11px] text-royal-600 font-bold">
              {searchResults.length} {isAr ? 'صفحة' : 'pg'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowPageTools((v) => !v)}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold ${
              showPageTools ? 'bg-navy-800 text-white' : 'bg-slate-100 dark:bg-navy-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isAr ? 'إدارة الصفحات' : 'Pages'}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowPdfComments((v) => !v)}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold ${
              showPdfComments ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-navy-800'
            }`}
          >
            <StickyNote className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isAr ? 'التعليقات' : 'Comments'}</span>
          </button>
          <button
            type="button"
            onClick={() => handleSavePdf(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-royal-600 hover:bg-royal-700 text-white text-xs font-bold"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{t('save')}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowPrintModal(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-navy-800 text-white text-xs font-bold"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isAr ? 'تصدير / طباعة' : 'Export'}</span>
          </button>
        </div>
      </div>

      {/* Honest Overlay Notice */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800/50 px-3 py-1.5 text-[11px] text-amber-900 dark:text-amber-200">
        {t('pdfOverlayNotice')}
      </div>

      {/* Annotation & Drawing Toolbar */}
      <div className="bg-white dark:bg-navy-900 border-b border-slate-200 dark:border-navy-800 px-3 py-2 flex flex-wrap items-center gap-1.5 text-xs overflow-x-auto ribbon-scroll">
        {(
          [
            ['select', <MousePointer className="w-3.5 h-3.5" />, isAr ? 'تحديد' : 'Select'],
            ['text', <Type className="w-3.5 h-3.5" />, isAr ? 'نص' : 'Text'],
            ['textbox', <Square className="w-3.5 h-3.5" />, isAr ? 'مربع نص' : 'Box'],
            ['note', <StickyNote className="w-3.5 h-3.5" />, isAr ? 'ملاحظة' : 'Note'],
            ['highlight', <Highlighter className="w-3.5 h-3.5" />, isAr ? 'تمييز' : 'Highlight'],
            ['underline', <Underline className="w-3.5 h-3.5" />, isAr ? 'تسطير' : 'Underline'],
            ['strike', <Strikethrough className="w-3.5 h-3.5" />, isAr ? 'شطب' : 'Strike'],
            ['freehand', <PenTool className="w-3.5 h-3.5" />, isAr ? 'رسم حر' : 'Draw'],
            ['arrow', <ArrowRight className="w-3.5 h-3.5" />, isAr ? 'سهم' : 'Arrow'],
            ['rect', <Square className="w-3.5 h-3.5" />, isAr ? 'مستطيل' : 'Rect'],
            ['circle', <Circle className="w-3.5 h-3.5" />, isAr ? 'دائرة' : 'Circle'],
            ['date', <Calendar className="w-3.5 h-3.5" />, isAr ? 'تاريخ' : 'Date'],
          ] as Array<[PdfTool, React.ReactNode, string]>
        ).map(([id, icon, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTool(id)}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold whitespace-nowrap ${
              tool === id
                ? 'bg-royal-600 text-white'
                : 'bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-200'
            }`}
          >
            {icon}
            <span>{label}</span>
          </button>
        ))}

        <button
          type="button"
          onClick={() => insertImgRef.current?.click()}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-navy-800 font-semibold"
        >
          <ImagePlus className="w-3.5 h-3.5" />
          <span>{isAr ? 'صورة' : 'Image'}</span>
        </button>

        <button
          type="button"
          onClick={() => setShowSignatureModal(true)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-royal-50 text-royal-700 font-bold"
        >
          <PenTool className="w-3.5 h-3.5" />
          <span>{isAr ? 'توقيع إلكتروني' : 'Signature'}</span>
        </button>

        <div className="h-5 w-px bg-slate-200 dark:bg-navy-700 mx-1" />

        <input
          type="text"
          value={textDraft}
          onChange={(e) => setTextDraft(e.target.value)}
          placeholder={isAr ? 'النص للإضافة...' : 'Text to add...'}
          className="rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 px-2 py-1 w-28"
        />

        <select
          value={activeFontFamily}
          onChange={(e) => setActiveFontFamily(e.target.value)}
          className="rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 px-2 py-1"
        >
          {fonts.map((f) => (
            <option key={f.id} value={f.family}>
              {f.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          min={8}
          max={48}
          value={activeFontSize}
          onChange={(e) => setActiveFontSize(Number(e.target.value))}
          className="w-12 rounded-lg border border-slate-200 px-1.5 py-1"
        />

        <input
          type="color"
          value={activeColor}
          onChange={(e) => setActiveColor(e.target.value)}
          className="w-6 h-6 cursor-pointer"
        />

        <label className="inline-flex items-center gap-1 cursor-pointer">
          <input
            type="checkbox"
            checked={addPageNumbers}
            onChange={(e) => setAddPageNumbers(e.target.checked)}
          />
          <span>{isAr ? 'أرقام الصفحات' : 'Page #'}</span>
        </label>
      </div>

      {/* Page Management & Conversion Strip */}
      {showPageTools && (
        <div className="bg-navy-50 dark:bg-navy-900 border-b border-navy-200 dark:border-navy-700 px-3 py-2 flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            onClick={async () => {
              if (!pdfBlob) return;
              setPdfBlob(await rotatePdfPage(pdfBlob, currentPage - 1, 90));
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-navy-800 border border-slate-200 font-semibold"
          >
            <RotateCw className="w-3.5 h-3.5" />
            {isAr ? 'تدوير 90°' : 'Rotate 90°'}
          </button>
          <button
            type="button"
            onClick={async () => {
              if (!pdfBlob) return;
              setPdfBlob(await addBlankPdfPage(pdfBlob, currentPage - 1));
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-navy-800 border border-slate-200 font-semibold"
          >
            <FilePlus2 className="w-3.5 h-3.5" />
            {isAr ? 'إضافة صفحة فارغة' : 'Add Blank Page'}
          </button>
          <button
            type="button"
            onClick={async () => {
              if (!pdfBlob) return;
              try {
                setPdfBlob(await deletePdfPage(pdfBlob, currentPage - 1));
              } catch {
                showToast(isAr ? 'لا يمكن حذف الصفحة الوحيدة' : 'Cannot delete last page', 'error');
              }
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {isAr ? 'حذف الصفحة' : 'Delete Page'}
          </button>
          <button
            type="button"
            onClick={async () => {
              if (!pdfBlob || numPages < 2 || currentPage >= numPages) {
                showToast(isAr ? 'لا يمكن نقل الصفحة الأخيرة للأسفل' : 'Already at last page', 'info');
                return;
              }
              const order = Array.from({ length: numPages }, (_, i) => i);
              const idx = currentPage - 1;
              [order[idx], order[idx + 1]] = [order[idx + 1], order[idx]];
              setPdfBlob(await reorderPdfPages(pdfBlob, order));
              setCurrentPage(currentPage + 1);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-navy-800 border border-slate-200 font-semibold"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            {isAr ? 'نقل الصفحة للأسفل' : 'Move Page Down'}
          </button>
          <button
            type="button"
            onClick={() => mergePdfRef.current?.click()}
            className="px-2.5 py-1.5 rounded-lg bg-royal-600 text-white font-semibold"
          >
            {t('mergePdfs')}
          </button>
          <div className="inline-flex items-center gap-1">
            <input
              type="text"
              value={splitRange}
              onChange={(e) => setSplitRange(e.target.value)}
              placeholder="1-2"
              className="w-16 rounded-lg border border-slate-200 px-2 py-1 bg-white dark:bg-navy-800"
            />
            <button
              type="button"
              onClick={async () => {
                if (!pdfBlob) return;
                const [s, e] = splitRange.split('-').map((n) => Math.max(1, Number(n.trim()) || 1));
                const start = Math.min(numPages, Math.max(1, s));
                const end = Math.max(start, Math.min(numPages, e || start));
                const indices = [];
                for (let i = start - 1; i < end; i++) indices.push(i);
                const extracted = await extractPdfPages(pdfBlob, indices);
                downloadBlob(extracted, `split_${s}-${end}.pdf`);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-navy-800 border border-slate-200 font-semibold"
            >
              <Scissors className="w-3.5 h-3.5" />
              {isAr ? 'استخراج / تقسيم' : 'Extract / Split'}
            </button>
          </div>
          <button
            type="button"
            onClick={async () => {
              if (!pdfBlob) return;
              const comp = await compressPdfBlob(pdfBlob);
              setPdfBlob(comp);
              showToast(isAr ? 'تم ضغط ملف PDF' : 'PDF compressed', 'success');
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-navy-800 border border-slate-200 font-semibold"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            {t('compressPdf')}
          </button>
          <button
            type="button"
            onClick={() => imgsToPdfRef.current?.click()}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-navy-800 border border-slate-200 font-semibold"
          >
            <FileImage className="w-3.5 h-3.5" />
            {t('imagesToPdf')}
          </button>
          <button
            type="button"
            onClick={handleConvertPageToImage}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-navy-800 border border-slate-200 font-semibold"
          >
            <FileImage className="w-3.5 h-3.5" />
            {t('pdfToImages')}
          </button>
        </div>
      )}

      {/* Selected Annotation Inspector (Move / Resize / Rotate / Delete) */}
      {selectedAnn && (
        <div className="bg-royal-50 dark:bg-navy-800 border-b border-royal-200 dark:border-navy-700 px-3 py-1.5 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold">{isAr ? 'تحرير العنصر:' : 'Edit Item:'}</span>
          {(selectedAnn.type === 'text' || selectedAnn.type === 'textbox' || selectedAnn.type === 'note' || selectedAnn.type === 'date') && (
            <input
              type="text"
              value={selectedAnn.text || ''}
              onChange={(e) => {
                const val = e.target.value;
                setAnnotations((prev) =>
                  prev.map((a) => (a.id === selectedAnn.id ? { ...a, text: val } : a))
                );
              }}
              className="rounded-lg border border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-2.5 py-1 text-xs min-w-[160px]"
            />
          )}
          {(selectedAnn.type === 'image' || selectedAnn.type === 'signature') && (
            <>
              <label className="inline-flex items-center gap-1">
                <span>{isAr ? 'الحجم:' : 'Size:'}</span>
                <input
                  type="range"
                  min={0.1}
                  max={0.8}
                  step={0.05}
                  value={selectedAnn.width || 0.25}
                  onChange={(e) => {
                    const w = Number(e.target.value);
                    setAnnotations((prev) =>
                      prev.map((a) => (a.id === selectedAnn.id ? { ...a, width: w, height: w * 0.55 } : a))
                    );
                  }}
                />
              </label>
              <button
                type="button"
                onClick={() =>
                  setAnnotations((prev) =>
                    prev.map((a) =>
                      a.id === selectedAnn.id ? { ...a, rotation: ((a.rotation || 0) + 90) % 360 } : a
                    )
                  )
                }
                className="px-2 py-1 rounded bg-white dark:bg-navy-900 border"
              >
                {isAr ? 'تدوير' : 'Rotate'}
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => {
              setAnnotations((prev) => prev.filter((a) => a.id !== selectedAnn.id));
              setSelectedAnnId(null);
            }}
            className="px-2 py-1 rounded bg-rose-600 text-white font-semibold ms-auto"
          >
            {t('delete')}
          </button>
        </div>
      )}

      {/* Main PDF Canvas + Overlay + Optional Comments Sidebar */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
      <div className="flex-1 overflow-auto p-3 sm:p-6 flex flex-col items-center">
        <div className="relative inline-block page-shadow bg-white">
          <canvas ref={canvasRef} className="block" />
          <div
            ref={overlayRef}
            onPointerDown={handleOverlayPointerDown}
            onPointerMove={handleOverlayPointerMove}
            onPointerUp={handleOverlayPointerUp}
            className="absolute inset-0 cursor-crosshair touch-none"
          >
            {pageAnnotations.map((ann) => {
              const isSel = ann.id === selectedAnnId;
              if (ann.type === 'text' || ann.type === 'textbox' || ann.type === 'note' || ann.type === 'date') {
                return (
                  <div
                    key={ann.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAnnId(ann.id);
                    }}
                    style={{
                      left: `${ann.x * 100}%`,
                      top: `${ann.y * 100}%`,
                      color: ann.color,
                      fontSize: `${(ann.fontSize || 14) * scale}px`,
                      fontFamily: `"${ann.fontFamily || 'Cairo'}", sans-serif`,
                      backgroundColor: ann.backgroundColor,
                    }}
                    className={`absolute px-1.5 py-0.5 rounded select-none cursor-move ${
                      isSel ? 'ring-2 ring-royal-500' : ''
                    } ${ann.type === 'note' ? 'shadow border border-amber-400' : ''}`}
                  >
                    {ann.text}
                  </div>
                );
              }
              if (ann.type === 'highlight' || ann.type === 'rect') {
                return (
                  <div
                    key={ann.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAnnId(ann.id);
                    }}
                    style={{
                      left: `${ann.x * 100}%`,
                      top: `${ann.y * 100}%`,
                      width: `${(ann.width || 0.2) * 100}%`,
                      height: `${(ann.height || 0.04) * 100}%`,
                      backgroundColor: ann.type === 'highlight' ? ann.color : 'transparent',
                      opacity: ann.type === 'highlight' ? 0.35 : 1,
                      border: ann.type === 'rect' ? `2px solid ${ann.color}` : undefined,
                    }}
                    className={`absolute ${isSel ? 'ring-2 ring-royal-600' : ''}`}
                  />
                );
              }
              if (ann.type === 'underline' || ann.type === 'strike') {
                return (
                  <div
                    key={ann.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAnnId(ann.id);
                    }}
                    style={{
                      left: `${ann.x * 100}%`,
                      top: `${ann.y * 100}%`,
                      width: `${(ann.width || 0.25) * 100}%`,
                      height: `${ann.strokeWidth || 2}px`,
                      backgroundColor: ann.color || '#1D4ED8',
                    }}
                    className={`absolute ${isSel ? 'ring-2 ring-royal-600' : ''}`}
                  />
                );
              }
              if (ann.type === 'circle') {
                return (
                  <div
                    key={ann.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAnnId(ann.id);
                    }}
                    style={{
                      left: `${ann.x * 100}%`,
                      top: `${ann.y * 100}%`,
                      width: `${(ann.width || 0.12) * 100}%`,
                      height: `${(ann.height || 0.12) * 100}%`,
                      border: `2px solid ${ann.color || '#1D4ED8'}`,
                      borderRadius: '9999px',
                    }}
                    className={`absolute ${isSel ? 'ring-2 ring-royal-600' : ''}`}
                  />
                );
              }
              if (ann.type === 'arrow') {
                return (
                  <svg
                    key={ann.id}
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAnnId(ann.id);
                    }}
                    className="absolute inset-0 w-full h-full pointer-events-none"
                  >
                    <line
                      x1={ann.x * 100}
                      y1={ann.y * 100}
                      x2={(ann.x2 ?? ann.x + 0.15) * 100}
                      y2={(ann.y2 ?? ann.y) * 100}
                      stroke={ann.color || '#1D4ED8'}
                      strokeWidth="0.6"
                      className="pointer-events-auto cursor-pointer"
                    />
                  </svg>
                );
              }
              if (ann.type === 'freehand' && ann.points && ann.points.length > 1) {
                const pts = ann.points.map((pt) => `${pt.x * 100},${pt.y * 100}`).join(' ');
                return (
                  <svg
                    key={ann.id}
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    className="absolute inset-0 w-full h-full pointer-events-none"
                  >
                    <polyline
                      fill="none"
                      stroke={ann.color || '#1D4ED8'}
                      strokeWidth="0.5"
                      points={pts}
                    />
                  </svg>
                );
              }
              if ((ann.type === 'image' || ann.type === 'signature') && ann.imageDataUrl) {
                return (
                  <img
                    key={ann.id}
                    src={ann.imageDataUrl}
                    alt={ann.type}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAnnId(ann.id);
                    }}
                    style={{
                      left: `${ann.x * 100}%`,
                      top: `${ann.y * 100}%`,
                      width: `${(ann.width || 0.25) * 100}%`,
                      transform: `rotate(${ann.rotation || 0}deg)`,
                    }}
                    className={`absolute object-contain ${isSel ? 'ring-2 ring-royal-500' : ''}`}
                  />
                );
              }
              return null;
            })}
            {isDrawing && freehandPoints.length > 1 && (
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="absolute inset-0 w-full h-full pointer-events-none"
              >
                <polyline
                  fill="none"
                  stroke={activeColor}
                  strokeWidth="0.5"
                  points={freehandPoints.map((pt) => `${pt.x * 100},${pt.y * 100}`).join(' ')}
                />
              </svg>
            )}
          </div>
        </div>

        {/* Extracted Text Copy Helper */}
        {pageText && (
          <div className="mt-4 w-full max-w-3xl bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800 p-3 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-slate-600 dark:text-slate-300">
                {isAr ? 'النص المستخرج من الصفحة (للنسخ)' : 'Extracted Page Text (Copyable)'}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(pageText);
                  showToast(isAr ? 'تم نسخ نص الصفحة' : 'Copied page text', 'success');
                }}
                className="text-royal-600 font-semibold hover:underline"
              >
                {t('copy')}
              </button>
            </div>
            <p className="text-slate-500 dark:text-slate-400 line-clamp-3 select-text">{pageText}</p>
          </div>
        )}
      </div>

      {showPdfComments && (
        <aside className="w-64 sm:w-72 bg-white dark:bg-navy-900 border-s border-slate-200 dark:border-navy-800 p-3 flex flex-col gap-2.5 overflow-y-auto">
          <div className="font-bold text-xs">{isAr ? 'التعليقات والملاحظات على PDF' : 'PDF Comments & Notes'}</div>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={textDraft}
              onChange={(e) => setTextDraft(e.target.value)}
              placeholder={isAr ? 'اكتب تعليقًا...' : 'Write comment...'}
              className="flex-1 rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 px-2 py-1 text-xs"
            />
            <button
              type="button"
              onClick={() => {
                if (!textDraft.trim()) return;
                setAnnotations((prev) => [
                  ...prev,
                  {
                    id: createId('note'),
                    pageIndex: currentPage - 1,
                    type: 'note',
                    x: 0.1,
                    y: 0.1 + (prev.length % 5) * 0.08,
                    text: textDraft.trim(),
                    fontSize: 13,
                    fontFamily: activeFontFamily,
                    color: '#0F2942',
                    backgroundColor: '#FEF08A',
                    createdAt: Date.now(),
                  },
                ]);
              }}
              className="px-2.5 py-1 rounded-lg bg-royal-600 text-white text-xs font-bold"
            >
              +
            </button>
          </div>
          <div className="space-y-2">
            {annotations.filter((a) => a.type === 'note').length === 0 ? (
              <div className="text-xs text-slate-400 text-center py-4">
                {isAr ? 'لا توجد تعليقات بعد' : 'No comments yet'}
              </div>
            ) : (
              annotations
                .filter((a) => a.type === 'note')
                .map((note) => (
                  <div
                    key={note.id}
                    onClick={() => setCurrentPage(note.pageIndex + 1)}
                    className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-[10px] text-amber-700 font-bold mb-1">
                      <span>{isAr ? `صفحة ${note.pageIndex + 1}` : `Page ${note.pageIndex + 1}`}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAnnotations((prev) => prev.filter((a) => a.id !== note.id));
                        }}
                        className="text-rose-600"
                      >
                        {t('delete')}
                      </button>
                    </div>
                    <div>{note.text}</div>
                  </div>
                ))
            )}
          </div>
        </aside>
      )}
      </div>
      {/* Bottom Pagination & Zoom Bar */}
      <div className="bg-navy-800 text-white px-3 py-1.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1 rounded hover:bg-navy-700 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <span>
            {currentPage} / {numPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= numPages}
            onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
            className="p-1 rounded hover:bg-navy-700 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setScale((s) => Math.max(0.6, Number((s - 0.2).toFixed(2))))}
            className="p-1 rounded hover:bg-navy-700"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span>{Math.round(scale * 100)}%</span>
          <button
            type="button"
            onClick={() => setScale((s) => Math.min(2.4, Number((s + 0.2).toFixed(2))))}
            className="p-1 rounded hover:bg-navy-700"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Drawn Electronic Signature Modal */}
      {showSignatureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-3">
          <div className="bg-white dark:bg-navy-900 rounded-2xl p-5 w-full max-w-md space-y-3 shadow-card">
            <h3 className="font-bold text-sm">
              {isAr ? 'ارسم توقيعك الإلكتروني' : 'Draw Electronic Signature'}
            </h3>
            <canvas
              ref={sigCanvasRef}
              width={380}
              height={160}
              onPointerDown={(e) => {
                sigDrawingRef.current = true;
                const ctx = sigCanvasRef.current!.getContext('2d')!;
                const rect = sigCanvasRef.current!.getBoundingClientRect();
                ctx.strokeStyle = '#0F2942';
                ctx.lineWidth = 2.5;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
              }}
              onPointerMove={(e) => {
                if (!sigDrawingRef.current) return;
                const ctx = sigCanvasRef.current!.getContext('2d')!;
                const rect = sigCanvasRef.current!.getBoundingClientRect();
                ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
                ctx.stroke();
              }}
              onPointerUp={() => {
                sigDrawingRef.current = false;
              }}
              className="w-full border border-slate-300 rounded-xl bg-white touch-none"
            />
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => {
                  const ctx = sigCanvasRef.current?.getContext('2d');
                  ctx?.clearRect(0, 0, 380, 160);
                }}
                className="px-3 py-1.5 rounded-xl border text-xs font-semibold"
              >
                {isAr ? 'مسح' : 'Clear'}
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowSignatureModal(false)}
                  className="px-3 py-1.5 rounded-xl border text-xs font-semibold"
                >
                  {t('cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleSaveDrawnSignature}
                  className="px-4 py-1.5 rounded-xl bg-royal-600 text-white text-xs font-bold"
                >
                  {isAr ? 'إدراج التوقيع' : 'Insert Signature'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print & Export Modal */}
      <PrintExportModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        docTitle={activeDoc?.name.replace(/\.pdf$/i, '') || 'Document'}
        docType="pdf"
        onExportPdf={async (opts) => {
          if (!pdfBlob) return;
          let out = await applyAnnotationsAndSavePdf(pdfBlob, annotations, fonts, {
            addPageNumbers,
            compress: true,
          });
          if (opts.pageRange && opts.pageRange.trim().toLowerCase() !== 'all') {
            const [s, e] = opts.pageRange.split('-').map((n) => Math.max(1, Number(n.trim()) || 1));
            const start = Math.min(numPages, Math.max(1, s));
            const end = Math.max(start, Math.min(numPages, e || start));
            const indices: number[] = [];
            for (let i = start - 1; i < end; i++) indices.push(i);
            out = await extractPdfPages(out, indices);
          }
          await exportFileToDevice(out, activeDoc?.name || 'exported.pdf');
          showToast(isAr ? 'تم تصدير PDF' : 'PDF exported', 'success');
        }}
        onSaveAsCopy={async (newName) => {
          if (!pdfBlob) return;
          const out = await applyAnnotationsAndSavePdf(pdfBlob, annotations, fonts, {
            addPageNumbers,
            compress: true,
          });
          await upsertDocument({
            id: createId('pdf'),
            name: newName.endsWith('.pdf') ? newName : `${newName}.pdf`,
            type: 'pdf',
            folderId: null,
            size: out.size,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            lastOpenedAt: Date.now(),
            isFavorite: false,
            isDeleted: false,
            blob: out,
            editorState: { annotations: [] },
            syncStatus: 'local',
          });
          showToast(isAr ? 'تم حفظ النسخة الجديدة' : 'Saved new copy', 'success');
        }}
        onShare={async () => {
          if (!pdfBlob) return;
          const out = await applyAnnotationsAndSavePdf(pdfBlob, annotations, fonts, {
            addPageNumbers,
            compress: true,
          });
          await shareDocumentFile(out, activeDoc?.name || 'document.pdf', activeDoc?.name || 'PDF');
        }}
      />
    </div>
  );
};
