import React, { useEffect, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { ToastContainer } from './components/common/ToastContainer';
import { Dashboard } from './components/dashboard/Dashboard';
import { WordEditor } from './components/word-editor/WordEditor';
import { PdfEditor } from './components/pdf-editor/PdfEditor';
import { FileManager } from './components/files/FileManager';
import { FontLibrary } from './components/fonts/FontLibrary';
import { TemplatesGallery } from './components/templates/TemplatesGallery';
import { SettingsView } from './components/settings/SettingsView';
import { registerAndroidBackHandler } from './utils/capacitorBridge';

const AppShell: React.FC = () => {
  const { view, setView, isLoading } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    return registerAndroidBackHandler(() => {
      if (mobileMenuOpen) {
        setMobileMenuOpen(false);
        return true;
      }
      if (view !== 'dashboard') {
        setView('dashboard');
        return true;
      }
      return false;
    });
  }, [mobileMenuOpen, view, setView]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100">
      <Header onToggleMobileMenu={() => setMobileMenuOpen((v) => !v)} />

      <div className="flex-1 flex min-h-0">
        <Sidebar mobileOpen={mobileMenuOpen} onCloseMobile={() => setMobileMenuOpen(false)} />

        <main className="flex-1 min-w-0 overflow-y-auto safe-pb">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-royal-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div key={view} className="view-transition min-h-full">
              {view === 'dashboard' && <Dashboard />}
              {view === 'word-editor' && <WordEditor />}
              {view === 'pdf-editor' && <PdfEditor />}
              {view === 'files' && <FileManager />}
              {view === 'fonts' && <FontLibrary />}
              {view === 'templates' && <TemplatesGallery />}
              {view === 'settings' && <SettingsView />}
            </div>
          )}
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
};

export default App;
