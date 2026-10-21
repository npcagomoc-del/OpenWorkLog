import { isTerminalStatus } from '../domain/models';
import { Suspense, useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  HardDrive,
  Maximize2,
  Menu,
  Minimize2,
  Monitor,
  Moon,
  MoonStar,
  MoreHorizontal,
  PanelLeftClose,
  Search,
  Sun,
} from 'lucide-react';
import { useWorkspace } from '../data/useWorkspace';
import { actions } from '../data/actions';
import { Brand } from '../components/Brand';
import { IconButton, Modal, Spinner, useToast } from '../components/ui';
import { navigation } from './navigation';
import { SearchDialog } from './SearchDialog';
import { ShellContext } from './ShellContext';
import { TimerDock } from './TimerDock';
const nextTheme = { system: 'light', light: 'dark', dark: 'black', black: 'system' } as const;
const themeIcons = { system: Monitor, light: Sun, dark: Moon, black: MoonStar } as const;
const themeLabels = {
  system: 'system',
  light: 'light',
  dark: 'dark',
  black: 'super dark',
} as const;
export function Shell() {
  const { settings, tasks } = useWorkspace();
  const { toast } = useToast();
  const location = useLocation();
  const [focusMode, setFocusMode] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [search, setSearch] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const current = navigation.find((item) => item.to === location.pathname);
  useEffect(() => {
    document.title = `${current?.label ?? 'OpenWorkLog'} · OpenWorkLog`;
  }, [current?.label]);
  useEffect(() => {
    const change = () => setOnline(navigator.onLine);
    window.addEventListener('online', change);
    window.addEventListener('offline', change);
    return () => {
      window.removeEventListener('online', change);
      window.removeEventListener('offline', change);
    };
  }, []);
  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setSearch((value) => !value);
      }
      if (event.key === 'Escape') setFocusMode(false);
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, []);
  async function toggleSidebar() {
    try {
      await actions.updateSettings({ sidebarCollapsed: !settings.sidebarCollapsed });
    } catch (error) {
      toast(
        error instanceof Error ? error.message : 'Could not save navigation preference.',
        'error',
      );
    }
  }
  async function toggleTheme() {
    try {
      await actions.updateSettings({
        theme: nextTheme[settings.theme],
      });
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Could not save appearance.', 'error');
    }
  }
  function navLinks(inDrawer = false) {
    return navigation.map((item) => {
      const Icon = item.icon;
      const count =
        item.to === '/tasks'
          ? tasks.filter((task) => !task.archived && !isTerminalStatus(task.status)).length
          : 0;
      return (
        <NavLink
          end={item.to === '/'}
          key={item.to}
          to={item.to}
          onClick={() => {
            if (inDrawer) setDrawer(false);
          }}
          title={item.label}
          className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}
        >
          <Icon size={21} />
          <span>{item.label}</span>
          {count > 0 && <small>{count}</small>}
        </NavLink>
      );
    });
  }
  const ThemeIcon = themeIcons[settings.theme];
  return (
    <ShellContext.Provider value={{ focusMode, setFocusMode }}>
      <div
        className={`app-shell ${settings.sidebarCollapsed ? 'sidebar-collapsed' : ''} ${focusMode ? 'focus-mode' : ''}`}
      >
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <aside className="sidebar">
          <div className="sidebar-brand">
            <Brand />
            <Brand compact />
          </div>
          <div className="workspace-label">Personal workspace</div>
          <nav className="main-navigation" aria-label="Main navigation">
            {navLinks()}
          </nav>
          <div className="sidebar-bottom">
            <div className="local-storage">
              <HardDrive size={17} />
              <span>
                Saved on this device
                <small>
                  {online ? 'Ready to work offline' : 'You’re offline · changes save here'}
                </small>
              </span>
            </div>
            <p className="developer-credit">
              Developed by <strong>NPC</strong>
            </p>
          </div>
        </aside>
        <div className="workspace">
          <header className="app-toolbar">
            <div className="toolbar-leading">
              <IconButton
                className="desktop-menu"
                label={settings.sidebarCollapsed ? 'Show navigation' : 'Collapse navigation'}
                onClick={() => void toggleSidebar()}
              >
                <PanelLeftClose size={20} />
              </IconButton>
              <IconButton
                className="mobile-menu"
                label="Show navigation"
                onClick={() => setDrawer(true)}
              >
                <Menu size={21} />
              </IconButton>
              <span className="toolbar-context">
                {focusMode ? 'Focus workspace' : (current?.label ?? 'Workspace')}
              </span>
            </div>
            <div className="toolbar-actions">
              <TimerDock />
              <div className="search-control">
                <button
                  type="button"
                  className="search-trigger"
                  aria-label="Search tasks and notes"
                  aria-keyshortcuts="Control+K Meta+K"
                  onClick={() => setSearch(true)}
                >
                  <Search size={18} />
                  <span>Search</span>
                </button>
                <span className="search-shortcut" aria-hidden="true">
                  <kbd>Ctrl K</kbd>
                </span>
              </div>
              <IconButton
                className="focus-toggle"
                label={focusMode ? 'Exit focus mode' : 'Enter focus mode'}
                onClick={() => setFocusMode(!focusMode)}
              >
                {focusMode ? <Minimize2 size={19} /> : <Maximize2 size={19} />}
              </IconButton>
              <IconButton
                label={`Toggle theme (currently ${themeLabels[settings.theme]})`}
                onClick={() => void toggleTheme()}
              >
                <ThemeIcon size={20} />
              </IconButton>
            </div>
          </header>
          <main id="main-content" className="main-scroll" tabIndex={-1}>
            <div className="page-content" key={location.pathname}>
              <Suspense fallback={<Spinner label="Opening this page…" />}>
                <Outlet />
              </Suspense>
            </div>
            <footer className="page-footer">
              <span>OpenWorkLog</span>
              <span>Developed by NPC</span>
            </footer>
          </main>
        </div>
        <nav className="bottom-navigation" aria-label="Mobile navigation">
          {navigation
            .filter((item) => ['/', '/tasks', '/daily', '/notes'].includes(item.to))
            .map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.to} end={item.to === '/'} to={item.to}>
                  <Icon size={21} />
                  <span>
                    {item.to === '/daily'
                      ? 'Daily Log'
                      : item.to === '/notes'
                        ? 'Notes'
                        : item.to === '/tasks'
                          ? 'Tasks'
                          : 'Today'}
                  </span>
                </NavLink>
              );
            })}
          <button type="button" onClick={() => setDrawer(true)}>
            <MoreHorizontal size={22} />
            <span>More</span>
          </button>
        </nav>
        <Modal open={drawer} onClose={() => setDrawer(false)} title="Your workspace" size="sm">
          <nav className="drawer-navigation" aria-label="All pages">
            {navLinks(true)}
          </nav>
          <p className="developer-credit">Developed by NPC</p>
        </Modal>
        <SearchDialog open={search} onClose={() => setSearch(false)} />
      </div>
    </ShellContext.Provider>
  );
}
