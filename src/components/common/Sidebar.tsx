import React from 'react';
import {
  FileText,
  FilePenLine,
  FolderOpen,
  Home,
  LayoutTemplate,
  Settings,
  Type,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppView } from '../../types';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { view, setView, t } = useApp();

  const navItems: Array<{ id: AppView; label: string; icon: React.ReactNode }> = [
    { id: 'dashboard', label: t('dashboard'), icon: <Home className="w-5 h-5" /> },
    { id: 'word-editor', label: t('wordEditor'), icon: <FileText className="w-5 h-5" /> },
    { id: 'pdf-editor', label: t('pdfEditor'), icon: <FilePenLine className="w-5 h-5" /> },
    { id: 'files', label: t('files'), icon: <FolderOpen className="w-5 h-5" /> },
    { id: 'templates', label: t('templates'), icon: <LayoutTemplate className="w-5 h-5" /> },
    { id: 'fonts', label: t('fonts'), icon: <Type className="w-5 h-5" /> },
    { id: 'settings', label: t('settings'), icon: <Settings className="w-5 h-5" /> },
  ];

  const handleSelect = (id: AppView) => {
    setView(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 bg-white dark:bg-navy-900 border-e border-slate-200 dark:border-navy-800 py-4 px-3 justify-between">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const active = view === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? 'bg-royal-600 text-white shadow-soft'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800'
                }`}
              >
                {item.icon}
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 rounded-2xl bg-navy-50 dark:bg-navy-800/70 border border-navy-100 dark:border-navy-700 text-xs">
          <div className="font-bold text-navy-800 dark:text-white">{t('appShort')} v1.0</div>
          <div className="text-slate-500 dark:text-slate-400 mt-0.5">{t('syncLocal')}</div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <aside className="relative z-10 w-64 max-w-[82vw] bg-white dark:bg-navy-900 h-full shadow-2xl flex flex-col p-4 safe-pt safe-pb">
            <div className="flex items-center justify-between pb-4 mb-3 border-b border-slate-100 dark:border-navy-800">
              <div className="flex items-center gap-2">
                <img src="/logo.svg" alt="AMR DOCS" className="w-7 h-7 rounded-lg" />
                <span className="font-bold text-navy-800 dark:text-white">{t('appShort')}</span>
              </div>
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="space-y-1 flex-1 overflow-y-auto">
              {navItems.map((item) => {
                const active = view === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      active
                        ? 'bg-royal-600 text-white shadow-soft'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
};
