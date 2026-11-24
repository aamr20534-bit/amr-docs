import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  AppLanguage,
  AppNotification,
  AppSettings,
  AppView,
  CustomTemplateItem,
  FolderItem,
  SectionItem,
  StoredDocument,
  StoredFont,
} from '../types';
import {
  defaultSettings,
  deleteCustomTemplate,
  deleteDocumentPermanently,
  deleteFolder,
  deleteFont,
  deleteSection,
  getStorageStats,
  listCustomTemplates,
  listDocuments,
  listFolders,
  listFonts,
  listSections,
  listNotifications,
  loadSettings,
  markAllNotificationsRead,
  pushNotification,
  saveCustomTemplate,
  saveDocument,
  saveFolder,
  saveFont,
  saveSection,
  saveSettings,
} from '../storage/db';
import { translations } from '../i18n/translations';
import { createId } from '../utils/fileHelpers';
import { initCapacitorUI } from '../utils/capacitorBridge';

interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextValue {
  view: AppView;
  setView: (v: AppView) => void;
  documents: StoredDocument[];
  folders: FolderItem[];
  sections: SectionItem[];
  customTemplates: CustomTemplateItem[];
  fonts: StoredFont[];
  settings: AppSettings;
  notifications: AppNotification[];
  activeDocId: string | null;
  setActiveDocId: (id: string | null) => void;
  openDocument: (doc: StoredDocument) => void;
  refreshAll: () => Promise<void>;
  upsertDocument: (doc: StoredDocument) => Promise<void>;
  softDeleteDocument: (id: string) => Promise<void>;
  restoreDocument: (id: string) => Promise<void>;
  removeDocumentForever: (id: string) => Promise<void>;
  createNewFolder: (name: string, parentId?: string | null) => Promise<void>;
  removeFolder: (id: string) => Promise<void>;
  createNewSection: (name: string, color?: string) => Promise<void>;
  removeSection: (id: string) => Promise<void>;
  addCustomTemplate: (tpl: CustomTemplateItem) => Promise<void>;
  removeCustomTemplate: (id: string) => Promise<void>;
  addFont: (font: StoredFont) => Promise<void>;
  toggleFavoriteFont: (id: string) => Promise<void>;
  removeFont: (id: string) => Promise<void>;
  updateSettings: (partial: Partial<AppSettings>) => Promise<void>;
  addNotification: (title: string, message: string, type?: AppNotification['type']) => Promise<void>;
  readAllNotifications: () => Promise<void>;
  showToast: (text: string, type?: ToastMessage['type']) => void;
  toasts: ToastMessage[];
  isOnline: boolean;
  storageInfo: { totalBytesUsed: number; quotaBytes: number | null };
  t: (key: string) => string;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isLoading: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [view, setView] = useState<AppView>('dashboard');
  const [documents, setDocuments] = useState<StoredDocument[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [customTemplates, setCustomTemplates] = useState<CustomTemplateItem[]>([]);
  const [fonts, setFonts] = useState<StoredFont[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [storageInfo, setStorageInfo] = useState<{ totalBytesUsed: number; quotaBytes: number | null }>({
    totalBytesUsed: 0,
    quotaBytes: null,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const showToast = useCallback((text: string, type: ToastMessage['type'] = 'info') => {
    const id = createId('toast');
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 3200);
  }, []);

  // Load custom @font-face rules for imported TTF/OTF fonts
  const registerCustomFontsInDOM = useCallback(async (fontList: StoredFont[]) => {
    for (const f of fontList) {
      if (f.data && !f.isBuiltIn) {
        try {
          const face = new FontFace(f.family, f.data.slice(0));
          await face.load();
          document.fonts.add(face);
        } catch {
          // Ignore malformed font
        }
      }
    }
  }, []);

  const refreshAll = useCallback(async () => {
    const [docs, flds, fnts, stg, notifs, secs, tpls] = await Promise.all([
      listDocuments(),
      listFolders(),
      listFonts(),
      loadSettings(),
      listNotifications(),
      listSections(),
      listCustomTemplates(),
    ]);
    setDocuments(docs);
    setFolders(flds);
    setFonts(fnts);
    setSettings(stg);
    setNotifications(notifs);
    setSections(secs);
    setCustomTemplates(tpls);
    const stats = await getStorageStats(docs);
    setStorageInfo({ totalBytesUsed: stats.totalBytesUsed, quotaBytes: stats.quotaBytes });
    await registerCustomFontsInDOM(fnts);
  }, [registerCustomFontsInDOM]);

  useEffect(() => {
    refreshAll().finally(() => setIsLoading(false));
  }, [refreshAll]);

  // Apply theme & direction to <html>
  useEffect(() => {
    const root = document.documentElement;
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = settings.theme === 'dark' || (settings.theme === 'auto' && prefersDark);
    root.classList.toggle('dark', isDark);
    root.lang = settings.language;
    root.dir = settings.direction;
    initCapacitorUI(isDark);
  }, [settings.theme, settings.language, settings.direction]);

  // Online / Offline listener
  useEffect(() => {
    const onUp = () => setIsOnline(true);
    const onDown = () => setIsOnline(false);
    window.addEventListener('online', onUp);
    window.addEventListener('offline', onDown);
    return () => {
      window.removeEventListener('online', onUp);
      window.removeEventListener('offline', onDown);
    };
  }, []);

  const upsertDocument = useCallback(async (doc: StoredDocument) => {
    await saveDocument(doc);
    const docs = await listDocuments();
    setDocuments(docs);
    const stats = await getStorageStats(docs);
    setStorageInfo({ totalBytesUsed: stats.totalBytesUsed, quotaBytes: stats.quotaBytes });
  }, []);

  const openDocument = useCallback(
    async (doc: StoredDocument) => {
      const updated = { ...doc, lastOpenedAt: Date.now() };
      await saveDocument(updated);
      setDocuments((prev) => prev.map((d) => (d.id === doc.id ? updated : d)));
      setActiveDocId(doc.id);
      setView(doc.type === 'docx' ? 'word-editor' : 'pdf-editor');
    },
    []
  );

  const softDeleteDocument = useCallback(async (id: string) => {
    const target = documents.find((d) => d.id === id);
    if (!target) return;
    await upsertDocument({ ...target, isDeleted: true, deletedAt: Date.now() });
  }, [documents, upsertDocument]);

  const restoreDocument = useCallback(async (id: string) => {
    const target = documents.find((d) => d.id === id);
    if (!target) return;
    await upsertDocument({ ...target, isDeleted: false, deletedAt: undefined });
  }, [documents, upsertDocument]);

  const removeDocumentForever = useCallback(async (id: string) => {
    await deleteDocumentPermanently(id);
    const docs = await listDocuments();
    setDocuments(docs);
    const stats = await getStorageStats(docs);
    setStorageInfo({ totalBytesUsed: stats.totalBytesUsed, quotaBytes: stats.quotaBytes });
  }, []);

  const createNewFolder = useCallback(async (name: string, parentId: string | null = null) => {
    const folder: FolderItem = {
      id: createId('fld'),
      name,
      parentId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await saveFolder(folder);
    setFolders(await listFolders());
  }, []);

  const removeFolder = useCallback(async (id: string) => {
    const docsInFolder = documents.filter((d) => d.folderId === id);
    for (const d of docsInFolder) {
      await saveDocument({ ...d, folderId: null, updatedAt: Date.now() });
    }
    await deleteFolder(id);
    setFolders(await listFolders());
    setDocuments(await listDocuments());
  }, [documents]);

  const createNewSection = useCallback(async (name: string, color = '#1D4ED8') => {
    await saveSection({ id: createId('sec'), name, color, createdAt: Date.now() });
    setSections(await listSections());
  }, []);

  const removeSection = useCallback(async (id: string) => {
    const docsInSec = documents.filter((d) => d.sectionId === id);
    for (const d of docsInSec) {
      await saveDocument({ ...d, sectionId: null, updatedAt: Date.now() });
    }
    await deleteSection(id);
    setSections(await listSections());
    setDocuments(await listDocuments());
  }, [documents]);

  const addCustomTemplate = useCallback(async (tpl: CustomTemplateItem) => {
    await saveCustomTemplate(tpl);
    setCustomTemplates(await listCustomTemplates());
  }, []);

  const removeCustomTemplate = useCallback(async (id: string) => {
    await deleteCustomTemplate(id);
    setCustomTemplates(await listCustomTemplates());
  }, []);

  const addFont = useCallback(
    async (font: StoredFont) => {
      await saveFont(font);
      const updated = await listFonts();
      setFonts(updated);
      await registerCustomFontsInDOM(updated);
    },
    [registerCustomFontsInDOM]
  );

  const toggleFavoriteFont = useCallback(async (id: string) => {
    const f = fonts.find((item) => item.id === id);
    if (!f) return;
    await saveFont({ ...f, isFavorite: !f.isFavorite });
    setFonts(await listFonts());
  }, [fonts]);

  const removeFont = useCallback(async (id: string) => {
    await deleteFont(id);
    setFonts(await listFonts());
  }, []);

  const updateSettings = useCallback(async (partial: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      saveSettings(next);
      return next;
    });
  }, []);

  const addNotification = useCallback(
    async (title: string, message: string, type: AppNotification['type'] = 'info') => {
      const n: AppNotification = {
        id: createId('notif'),
        title,
        message,
        type,
        createdAt: Date.now(),
        read: false,
      };
      await pushNotification(n);
      setNotifications(await listNotifications());
    },
    []
  );

  const readAllNotifications = useCallback(async () => {
    await markAllNotificationsRead();
    setNotifications(await listNotifications());
  }, []);

  const t = useCallback(
    (key: string) => {
      const lang: AppLanguage = settings.language || 'ar';
      return translations[lang][key] || translations.en[key] || key;
    },
    [settings.language]
  );

  return (
    <AppContext.Provider
      value={{
        view,
        setView,
        documents,
        folders,
        sections,
        customTemplates,
        fonts,
        settings,
        notifications,
        activeDocId,
        setActiveDocId,
        openDocument,
        refreshAll,
        upsertDocument,
        softDeleteDocument,
        restoreDocument,
        removeDocumentForever,
        createNewFolder,
        removeFolder,
        createNewSection,
        removeSection,
        addCustomTemplate,
        removeCustomTemplate,
        addFont,
        toggleFavoriteFont,
        removeFont,
        updateSettings,
        addNotification,
        readAllNotifications,
        showToast,
        toasts,
        isOnline,
        storageInfo,
        t,
        searchQuery,
        setSearchQuery,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
