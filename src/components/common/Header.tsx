import React, { useState } from 'react';
import {
  Bell,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  Wifi,
  WifiOff,
  CheckCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/fileHelpers';

interface HeaderProps {
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const {
    t,
    settings,
    updateSettings,
    notifications,
    readAllNotifications,
    setView,
    isOnline,
    searchQuery,
    setSearchQuery,
  } = useApp();

  const [showNotifs, setShowNotifs] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const isDark =
    settings.theme === 'dark' ||
    (settings.theme === 'auto' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <header className="sticky top-0 z-40 safe-pt bg-navy-800 dark:bg-navy-950 text-white border-b border-navy-700/60 shadow-ribbon">
      <div className="flex items-center justify-between gap-2 px-3 sm:px-5 h-14">
        {/* Brand + Mobile Menu */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onToggleMobileMenu}
            aria-label="Menu"
            className="md:hidden p-2 rounded-lg hover:bg-navy-700/70 transition-colors shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setView('dashboard')}
            className="flex items-center gap-2.5 min-w-0 text-start group"
          >
            <img
              src="/logo.svg"
              alt="AMR DOCS"
              className="w-8 h-8 rounded-lg shadow-sm shrink-0 group-hover:scale-105 transition-transform"
            />
            <div className="truncate">
              <div className="font-bold text-sm sm:text-base leading-tight tracking-tight truncate">
                {t('appName')}
              </div>
              <div className="text-[10px] text-royal-200 font-medium tracking-wider hidden sm:block">
                {t('appShort')}
              </div>
            </div>
          </button>
        </div>

        {/* Search Bar (hidden on tiny 320px, shown sm+) */}
        <div className="hidden sm:flex flex-1 max-w-md mx-2">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-300 absolute top-1/2 -translate-y-1/2 start-3 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && searchQuery.trim()) setView('files'); }}
              placeholder={t('searchPlaceholder')}
              className="w-full bg-navy-900/70 border border-navy-600/60 rounded-xl ps-9 pe-3 py-1.5 text-sm text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-royal-400 transition-all"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Online / Offline Badge */}
          <span
            title={isOnline ? t('online') : t('offline')}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium ${
              isOnline
                ? 'bg-emerald-500/15 text-emerald-200 border border-emerald-400/25'
                : 'bg-amber-500/20 text-amber-200 border border-amber-400/30'
            }`}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span className="hidden lg:inline">{isOnline ? t('online') : t('offline')}</span>
          </span>

          {/* Quick Theme Toggle */}
          <button
            type="button"
            onClick={() => updateSettings({ theme: isDark ? 'light' : 'dark' })}
            title={isDark ? t('themeLight') : t('themeDark')}
            className="p-2 rounded-lg hover:bg-navy-700/70 transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-royal-200" />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifs((v) => !v)}
              title={t('notifications')}
              className="p-2 rounded-lg hover:bg-navy-700/70 transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 end-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-navy-800" />
              )}
            </button>

            {showNotifs && (
              <div className="absolute end-0 mt-2 w-72 sm:w-80 bg-white dark:bg-navy-900 text-slate-800 dark:text-slate-100 rounded-2xl shadow-card border border-slate-200 dark:border-navy-700 overflow-hidden z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-navy-800">
                  <span className="font-bold text-sm">{t('notifications')}</span>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={readAllNotifications}
                      className="text-xs text-royal-600 dark:text-royal-400 hover:underline flex items-center gap-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      {t('markAllRead')}
                    </button>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-navy-800">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      {t('noNotifications')}
                    </div>
                  ) : (
                    notifications.slice(0, 10).map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 text-xs ${
                          n.read ? 'opacity-70' : 'bg-royal-50/60 dark:bg-navy-800/60'
                        }`}
                      >
                        <div className="font-semibold text-slate-900 dark:text-white">{n.title}</div>
                        <div className="text-slate-600 dark:text-slate-300 mt-0.5">{n.message}</div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          {formatDate(n.createdAt, settings.language)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <button
            type="button"
            onClick={() => setView('settings')}
            title={t('settings')}
            className="p-2 rounded-lg hover:bg-navy-700/70 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile search bar */}
      <div className="sm:hidden px-3 pb-2.5">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-300 absolute top-1/2 -translate-y-1/2 start-3 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full bg-navy-900/70 border border-navy-600/60 rounded-xl ps-9 pe-3 py-1.5 text-xs text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-royal-400"
          />
        </div>
      </div>
    </header>
  );
};
