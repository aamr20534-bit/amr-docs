export type DocType = 'docx' | 'pdf';

export type AppView =
  | 'dashboard'
  | 'word-editor'
  | 'pdf-editor'
  | 'files'
  | 'fonts'
  | 'templates'
  | 'settings';

export type ThemeMode = 'light' | 'dark' | 'auto';
export type AppLanguage = 'ar' | 'en';

export interface FolderItem {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface DocumentVersion {
  id: string;
  createdAt: number;
  note: string;
  size: number;
  blob: Blob;
}

export interface StoredDocument {
  id: string;
  name: string;
  type: DocType;
  folderId: string | null;
  sectionId?: string | null;
  size: number;
  createdAt: number;
  updatedAt: number;
  lastOpenedAt: number;
  isFavorite: boolean;
  isDeleted: boolean;
  deletedAt?: number;
  blob: Blob;
  /** Structured JSON state for Word DOCX model or PDF overlay annotations */
  editorState?: DocxDocumentModel | PdfOverlayState;
  versions?: DocumentVersion[];
  syncStatus?: 'local' | 'synced' | 'pending' | 'conflict';
}

export interface StoredFont {
  id: string;
  name: string;
  family: string;
  category: 'arabic' | 'english' | 'system';
  format: 'ttf' | 'otf' | 'system';
  isFavorite: boolean;
  isBuiltIn: boolean;
  installedAt: number;
  data?: ArrayBuffer;
  publicUrl?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  createdAt: number;
  read: boolean;
}

export interface AppSettings {
  theme: ThemeMode;
  language: AppLanguage;
  direction: 'rtl' | 'ltr';
  defaultFontFamily: string;
  defaultFontSize: number;
  autoSaveEnabled: boolean;
  autoSaveIntervalSec: number;
  autoBackupEnabled: boolean;
  defaultPaperSize: 'A4' | 'Letter' | 'Legal';
  defaultOrientation: 'portrait' | 'landscape';
  collaboraServerUrl: string;
  onlyofficeServerUrl: string;
  pinnedSnippet?: {
    text?: string;
    imageDataUrl?: string;
    style?: Partial<DocxRun>;
    heading?: 'normal' | 'h1' | 'h2' | 'h3' | 'subtitle' | 'quote';
    align?: 'left' | 'right' | 'center' | 'justify';
  } | null;
}

/* ==================== DOCX OOXML MODEL ==================== */

export interface DocxRun {
  id: string;
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  superScript?: boolean;
  subScript?: boolean;
  fontFamily?: string;
  fontSize?: number; // in pt
  color?: string; // hex #RRGGBB
  highlight?: string; // hex #RRGGBB
  backgroundColor?: string;
  linkUrl?: string;
  textEffect?: 'none' | 'shadow' | 'glow' | 'outline';
}

export interface DocxParagraph {
  id: string;
  type: 'paragraph';
  heading?: 'normal' | 'h1' | 'h2' | 'h3' | 'subtitle' | 'quote';
  align?: 'left' | 'right' | 'center' | 'justify';
  direction?: 'rtl' | 'ltr';
  lineSpacing?: number; // e.g., 1.15, 1.5, 2.0
  spaceBefore?: number; // pt
  spaceAfter?: number; // pt
  indentLeft?: number; // px
  indentRight?: number; // px
  listType?: 'none' | 'bullet' | 'number' | 'alpha-ar' | 'roman';
  listLevel?: number;
  runs: DocxRun[];
}

export interface DocxTableCell {
  id: string;
  paragraphs: DocxParagraph[];
  colSpan?: number;
  rowSpan?: number;
  backgroundColor?: string;
}

export interface DocxTableRow {
  id: string;
  cells: DocxTableCell[];
}

export interface DocxTable {
  id: string;
  type: 'table';
  rows: DocxTableRow[];
  borderColor?: string;
  tableStyle?: 'default' | 'royal' | 'navy' | 'emerald' | 'zebra';
}

export type ImageWrapMode = 'inline' | 'tight' | 'behind' | 'in-front';

export interface DocxImageBlock {
  id: string;
  type: 'image';
  dataUrl: string;
  width: number;
  height: number;
  align?: 'left' | 'center' | 'right';
  alt?: string;
  rotation?: number;
  flipH?: boolean;
  flipV?: boolean;
  wrapMode?: ImageWrapMode;
  effect?: 'none' | 'shadow' | 'frame' | 'rounded' | 'soft';
}

export interface DocxShapeBlock {
  id: string;
  type: 'shape' | 'textbox';
  shapeKind: 'rectangle' | 'circle' | 'callout' | 'textbox';
  text: string;
  fillColor: string;
  borderColor: string;
  width: number;
  height: number;
  align?: 'left' | 'center' | 'right';
}

export interface DocxPageBreak {
  id: string;
  type: 'pageBreak';
}

export type DocxBlock =
  | DocxParagraph
  | DocxTable
  | DocxImageBlock
  | DocxShapeBlock
  | DocxPageBreak;

export interface DocxComment {
  id: string;
  author: string;
  text: string;
  createdAt: number;
  blockId?: string;
  resolved?: boolean;
}

export interface DocxPageSetup {
  paperSize: 'A4' | 'Letter' | 'Legal';
  orientation: 'portrait' | 'landscape';
  marginTop: number; // mm
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  columns: 1 | 2;
  pageBorder: boolean;
  pageBorderColor: string;
  pageBorderWidth: number; // pt
  pageBorderStyle?: 'single' | 'dashed' | 'double' | 'dotted' | 'shadow3d';
  pageNumberFormat?: 'number' | 'ofTotal';
  differentFirstPage?: boolean;
  pageNumberStart?: number;
  pageBackgroundColor: string;
  watermarkText: string;
  headerText: string;
  footerText: string;
  showPageNumbers: boolean;
}

export interface DocxDocumentModel {
  title: string;
  direction: 'rtl' | 'ltr';
  pageSetup: DocxPageSetup;
  blocks: DocxBlock[];
  comments: DocxComment[];
}

/* ==================== PDF OVERLAY & EDITOR MODEL ==================== */

export type PdfAnnotationType =
  | 'text'
  | 'textbox'
  | 'note'
  | 'highlight'
  | 'underline'
  | 'strike'
  | 'freehand'
  | 'arrow'
  | 'rect'
  | 'circle'
  | 'image'
  | 'signature'
  | 'date';

export interface PdfAnnotation {
  id: string;
  pageIndex: number; // 0-based
  type: PdfAnnotationType;
  /** Normalized coordinates (0..1 relative to page width/height) for zoom & resolution independence */
  x: number;
  y: number;
  width?: number;
  height?: number;
  x2?: number;
  y2?: number;
  points?: Array<{ x: number; y: number }>;
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  backgroundColor?: string;
  opacity?: number;
  strokeWidth?: number;
  rotation?: number; // degrees
  imageDataUrl?: string;
  createdAt: number;
}

export interface PdfOverlayState {
  annotations: PdfAnnotation[];
  addPageNumbers?: boolean;
  pageNumberPosition?: 'bottom-center' | 'bottom-right' | 'bottom-left';
}

export interface TemplateDefinition {
  id: string;
  category: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  defaultType: DocType;
  buildModel: () => DocxDocumentModel;
}

export interface SectionItem {
  id: string;
  name: string;
  color: string;
  createdAt: number;
}

export interface CustomTemplateItem {
  id: string;
  category: string;
  title: string;
  description: string;
  defaultType: DocType;
  model: DocxDocumentModel;
  createdAt: number;
}
