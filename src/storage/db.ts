import { openDB, DBSchema, IDBPDatabase } from 'idb';
import {
  AppNotification,
  AppSettings,
  CustomTemplateItem,
  FolderItem,
  SectionItem,
  StoredDocument,
  StoredFont,
} from '../types';

interface AmrDocsDB extends DBSchema {
  documents: {
    key: string;
    value: StoredDocument;
    indexes: {
      'by-updated': number;
      'by-folder': string;
      'by-type': string;
    };
  };
  folders: {
    key: string;
    value: FolderItem;
  };
  fonts: {
    key: string;
    value: StoredFont;
  };
  settings: {
    key: string;
    value: AppSettings & { id: string };
  };
  notifications: {
    key: string;
    value: AppNotification;
  };
  sections: {
    key: string;
    value: SectionItem;
  };
  templates: {
    key: string;
    value: CustomTemplateItem;
  };
}

const DB_NAME = 'amr-word-pdf-studio-db';
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase<AmrDocsDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<AmrDocsDB>> {
  if (!dbPromise) {
    dbPromise = openDB<AmrDocsDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('documents')) {
          const docStore = db.createObjectStore('documents', { keyPath: 'id' });
          docStore.createIndex('by-updated', 'updatedAt');
          docStore.createIndex('by-folder', 'folderId');
          docStore.createIndex('by-type', 'type');
        }
        if (!db.objectStoreNames.contains('folders')) {
          db.createObjectStore('folders', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('fonts')) {
          db.createObjectStore('fonts', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('notifications')) {
          db.createObjectStore('notifications', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('sections')) {
          db.createObjectStore('sections', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('templates')) {
          db.createObjectStore('templates', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

export const defaultSettings: AppSettings = {
  theme: 'light',
  language: 'ar',
  direction: 'rtl',
  defaultFontFamily: 'Cairo',
  defaultFontSize: 12,
  autoSaveEnabled: true,
  autoSaveIntervalSec: 15,
  autoBackupEnabled: true,
  defaultPaperSize: 'A4',
  defaultOrientation: 'portrait',
  collaboraServerUrl: '',
  onlyofficeServerUrl: '',
};

export const builtInFonts: StoredFont[] = [
  { id: 'font-noto-kufi', name: 'Noto Kufi Arabic (كوفي فاخر)', family: 'Noto Kufi Arabic', category: 'arabic', format: 'ttf', isFavorite: true, isBuiltIn: true, installedAt: 1700000000000, publicUrl: '/fonts/NotoKufiArabic-Regular.ttf' },
  { id: 'font-noto-sans-ar', name: 'Noto Sans Arabic (حديث)', family: 'Noto Sans Arabic', category: 'arabic', format: 'ttf', isFavorite: true, isBuiltIn: true, installedAt: 1700000000000, publicUrl: '/fonts/NotoSansArabic-Regular.ttf' },
  { id: 'font-noto-naskh', name: 'Noto Naskh Arabic (نسخ رسمي)', family: 'Noto Naskh Arabic', category: 'arabic', format: 'ttf', isFavorite: true, isBuiltIn: true, installedAt: 1700000000000, publicUrl: '/fonts/NotoNaskhArabic-Regular.ttf' },
  { id: 'font-amiri', name: 'Amiri (الأميري الكلاسيكي)', family: 'Amiri', category: 'arabic', format: 'ttf', isFavorite: true, isBuiltIn: true, installedAt: 1700000000000, publicUrl: '/fonts/Amiri-Regular.ttf' },
  { id: 'font-cairo', name: 'Cairo (كايرو)', family: 'Cairo', category: 'arabic', format: 'system', isFavorite: true, isBuiltIn: true, installedAt: 1700000000000 },
  { id: 'font-trad-ar', name: 'Traditional Arabic', family: 'Traditional Arabic', category: 'arabic', format: 'system', isFavorite: false, isBuiltIn: true, installedAt: 1700000000000 },
  { id: 'font-simp-ar', name: 'Simplified Arabic', family: 'Simplified Arabic', category: 'arabic', format: 'system', isFavorite: false, isBuiltIn: true, installedAt: 1700000000000 },
  { id: 'font-ar-type', name: 'Arabic Typesetting', family: 'Arabic Typesetting', category: 'arabic', format: 'system', isFavorite: false, isBuiltIn: true, installedAt: 1700000000000 },
  { id: 'font-tahoma', name: 'Tahoma (تاهوما)', family: 'Tahoma', category: 'arabic', format: 'system', isFavorite: false, isBuiltIn: true, installedAt: 1700000000000 },
  { id: 'font-arial', name: 'Arial (أريال)', family: 'Arial', category: 'arabic', format: 'system', isFavorite: false, isBuiltIn: true, installedAt: 1700000000000 },
  { id: 'font-calibri', name: 'Calibri (Word Default)', family: 'Calibri', category: 'english', format: 'system', isFavorite: true, isBuiltIn: true, installedAt: 1700000000000 },
  { id: 'font-cambria', name: 'Cambria', family: 'Cambria', category: 'english', format: 'system', isFavorite: false, isBuiltIn: true, installedAt: 1700000000000 },
  { id: 'font-segoe', name: 'Segoe UI', family: 'Segoe UI', category: 'english', format: 'system', isFavorite: false, isBuiltIn: true, installedAt: 1700000000000 },
  { id: 'font-inter', name: 'Inter', family: 'Inter', category: 'english', format: 'system', isFavorite: true, isBuiltIn: true, installedAt: 1700000000000 },
  { id: 'font-times', name: 'Times New Roman', family: 'Times New Roman', category: 'english', format: 'system', isFavorite: false, isBuiltIn: true, installedAt: 1700000000000 },
  { id: 'font-georgia', name: 'Georgia', family: 'Georgia', category: 'english', format: 'system', isFavorite: false, isBuiltIn: true, installedAt: 1700000000000 },
  { id: 'font-verdana', name: 'Verdana', family: 'Verdana', category: 'english', format: 'system', isFavorite: false, isBuiltIn: true, installedAt: 1700000000000 },
  { id: 'font-trebuchet', name: 'Trebuchet MS', family: 'Trebuchet MS', category: 'english', format: 'system', isFavorite: false, isBuiltIn: true, installedAt: 1700000000000 },
  { id: 'font-courier', name: 'Courier New', family: 'Courier New', category: 'english', format: 'system', isFavorite: false, isBuiltIn: true, installedAt: 1700000000000 },
];

/* ---------- Document CRUD ---------- */
export async function listDocuments(): Promise<StoredDocument[]> {
  const db = await getDB();
  const all = await db.getAll('documents');
  return all.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getDocumentById(id: string): Promise<StoredDocument | undefined> {
  const db = await getDB();
  return db.get('documents', id);
}

export async function saveDocument(doc: StoredDocument): Promise<void> {
  const db = await getDB();
  await db.put('documents', doc);
}

export async function deleteDocumentPermanently(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('documents', id);
}

/* ---------- Folder CRUD ---------- */
export async function listFolders(): Promise<FolderItem[]> {
  const db = await getDB();
  const all = await db.getAll('folders');
  return all.sort((a, b) => a.name.localeCompare(b.name));
}

export async function saveFolder(folder: FolderItem): Promise<void> {
  const db = await getDB();
  await db.put('folders', folder);
}

export async function deleteFolder(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('folders', id);
}

/* ---------- Font CRUD ---------- */
export async function listFonts(): Promise<StoredFont[]> {
  const db = await getDB();
  const stored = await db.getAll('fonts');
  const existingIds = new Set(stored.map((f) => f.id));
  const missing = builtInFonts.filter((bf) => !existingIds.has(bf.id));
  if (missing.length > 0) {
    const tx = db.transaction('fonts', 'readwrite');
    for (const f of missing) {
      await tx.store.put(f);
    }
    await tx.done;
    return [...missing, ...stored];
  }
  return stored;
}

export async function saveFont(font: StoredFont): Promise<void> {
  const db = await getDB();
  await db.put('fonts', font);
}

export async function deleteFont(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('fonts', id);
}

/* ---------- Settings ---------- */
export async function loadSettings(): Promise<AppSettings> {
  const db = await getDB();
  const row = await db.get('settings', 'main');
  if (!row) {
    await db.put('settings', { ...defaultSettings, id: 'main' });
    return defaultSettings;
  }
  return { ...defaultSettings, ...row };
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const db = await getDB();
  await db.put('settings', { ...settings, id: 'main' });
}

/* ---------- Notifications ---------- */
export async function listNotifications(): Promise<AppNotification[]> {
  const db = await getDB();
  const list = await db.getAll('notifications');
  return list.sort((a, b) => b.createdAt - a.createdAt);
}

export async function pushNotification(notification: AppNotification): Promise<void> {
  const db = await getDB();
  await db.put('notifications', notification);
}

export async function markAllNotificationsRead(): Promise<void> {
  const db = await getDB();
  const all = await db.getAll('notifications');
  const tx = db.transaction('notifications', 'readwrite');
  for (const n of all) {
    await tx.store.put({ ...n, read: true });
  }
  await tx.done;
}

/* ---------- Storage Estimate ---------- */
export async function getStorageStats(docs: StoredDocument[]): Promise<{
  totalBytesUsed: number;
  quotaBytes: number | null;
  browserUsageBytes: number | null;
}> {
  const docsBytes = docs.reduce((sum, d) => sum + (d.size || d.blob?.size || 0), 0);
  let quotaBytes: number | null = null;
  let browserUsageBytes: number | null = null;

  if (navigator.storage && navigator.storage.estimate) {
    try {
      const est = await navigator.storage.estimate();
      quotaBytes = est.quota ?? null;
      browserUsageBytes = est.usage ?? null;
    } catch {
      // Ignore quota estimation errors on restricted browsers
    }
  }

  return {
    totalBytesUsed: docsBytes,
    quotaBytes,
    browserUsageBytes,
  };
}

/* ---------- Sections / Custom Tabs CRUD ---------- */
export async function listSections(): Promise<SectionItem[]> {
  const db = await getDB();
  const all = await db.getAll('sections');
  return all.sort((a, b) => a.createdAt - b.createdAt);
}

export async function saveSection(section: SectionItem): Promise<void> {
  const db = await getDB();
  await db.put('sections', section);
}

export async function deleteSection(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('sections', id);
}

/* ---------- Custom Templates CRUD ---------- */
export async function listCustomTemplates(): Promise<CustomTemplateItem[]> {
  const db = await getDB();
  const all = await db.getAll('templates');
  return all.sort((a, b) => b.createdAt - a.createdAt);
}

export async function saveCustomTemplate(tpl: CustomTemplateItem): Promise<void> {
  const db = await getDB();
  await db.put('templates', tpl);
}

export async function deleteCustomTemplate(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('templates', id);
}
