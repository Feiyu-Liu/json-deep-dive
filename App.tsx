import React, { useState, useEffect, useRef } from 'react';
import { JsonViewer } from './components/JsonViewer';
import { safeJsonParse } from './utils/jsonUtils';
import { JsonValue } from './types';
import { Braces, Plus, X, Sun, Moon, Monitor } from './components/Icons';

const DEFAULT_JSON = `{
  "welcome": "JSON Deep Dive",
  "tips": [
    "Paste your JSON directly with Ctrl+V",
    "Or click the 'Paste' button below",
    "Use tabs to manage multiple JSON files"
  ],
  "features": {
    "validation": true,
    "collapsible": true,
    "highlighting": "syntax",
    "tabs": {
      "enabled": true,
      "multiInstance": true
    }
  },
  "isSimple": true
}`;

interface Tab {
  id: string;
  title: string;
  content: string;
}

type ThemeMode = 'light' | 'dark' | 'auto';

// Internal Toast Component for Notifications
const Toast = ({ message, type, onClose }: { message: string, type: 'error' | 'success', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-2xl z-50 transition-all flex items-center space-x-3 border border-opacity-20 ${
      type === 'error' 
        ? 'bg-rose-100 border-rose-200 text-rose-800 dark:bg-rose-900/90 dark:border-rose-500 dark:text-rose-100 backdrop-blur-md' 
        : 'bg-emerald-100 border-emerald-200 text-emerald-800 dark:bg-emerald-900/90 dark:border-emerald-500 dark:text-emerald-100 backdrop-blur-md'
    }`}>
      {type === 'error' ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rose-600 dark:text-rose-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600 dark:text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )}
      <span className="font-medium text-sm">{message}</span>
    </div>
  );
};

export default function App() {
  const [tabs, setTabs] = useState<Tab[]>([{ id: '1', title: 'Tab 1', content: DEFAULT_JSON }]);
  const [activeTabId, setActiveTabId] = useState<string>('1');
  const [toast, setToast] = useState<{ msg: string, type: 'error' | 'success' } | null>(null);
  
  // Initialize theme from localStorage or default to 'auto'
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'auto') ? savedTheme : 'auto';
  });

  // Handle Theme Changes
  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      let isDark = false;
      if (theme === 'dark') isDark = true;
      else if (theme === 'light') isDark = false;
      else if (theme === 'auto') isDark = mediaQuery.matches;

      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();
    localStorage.setItem('theme', theme);

    // Listen for system changes only in auto mode
    if (theme === 'auto') {
      mediaQuery.addEventListener('change', applyTheme);
      return () => mediaQuery.removeEventListener('change', applyTheme);
    }
  }, [theme]);

  const cycleTheme = () => {
    setTheme(current => {
      if (current === 'light') return 'dark';
      if (current === 'dark') return 'auto';
      return 'light';
    });
  };

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  // Derived state for the active tab
  const [parsedData, setParsedData] = useState<JsonValue | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  // Update tab content helper
  const updateTabContent = (id: string, newContent: string) => {
    setTabs(prev => prev.map(tab => 
      tab.id === id ? { ...tab, content: newContent } : tab
    ));
  };

  // Add new tab
  const addTab = () => {
    const newId = Date.now().toString();
    const newTab: Tab = {
      id: newId,
      title: `Tab ${tabs.length + 1}`,
      content: ''
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newId);
  };

  // Close tab
  const closeTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newTabs = tabs.filter(t => t.id !== id);
    
    // If we closed the last tab, create a new empty one
    if (newTabs.length === 0) {
      const newId = Date.now().toString();
      setTabs([{ id: newId, title: 'Tab 1', content: '' }]);
      setActiveTabId(newId);
    } else {
      setTabs(newTabs);
      // If we closed the active tab, switch to the last available one
      if (activeTabId === id) {
        setActiveTabId(newTabs[newTabs.length - 1].id);
      }
    }
  };

  // Parse JSON when active tab content changes
  useEffect(() => {
    if (!activeTab.content.trim()) {
      setParsedData(undefined);
      setError(null);
      return;
    }
    const { parsed, error: parseError } = safeJsonParse(activeTab.content);
    setParsedData(parsed);
    setError(parseError);
  }, [activeTab.content]);

  // Handle global paste event
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      // Only paste if we are not focused on an input element (unless it's body/root)
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      const text = e.clipboardData?.getData('text');
      if (text) {
        updateTabContent(activeTabId, text);
        setToast({ msg: "JSON pasted successfully!", type: 'success' });
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [activeTabId]); 

  const handlePasteFromClipboard = async () => {
    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard API unavailable");
      }
      const text = await navigator.clipboard.readText();
      if (!text) throw new Error("Clipboard is empty");
      
      updateTabContent(activeTabId, text);
      setToast({ msg: "Pasted from clipboard!", type: 'success' });
    } catch (err) {
      console.error('Failed to read clipboard', err);
      setToast({ msg: "Browser blocked access. Please press Ctrl + V", type: 'error' });
    }
  };

  const handleClear = () => {
    updateTabContent(activeTabId, '');
    setToast({ msg: "Cleared workspace", type: 'success' });
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return <Sun className="w-4 h-4" />;
      case 'dark': return <Moon className="w-4 h-4" />;
      case 'auto': return <Monitor className="w-4 h-4" />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light': return 'Light Mode';
      case 'dark': return 'Dark Mode';
      case 'auto': return 'Auto Mode';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-gray-100 transition-colors duration-200">
      {/* Header */}
      <header className="flex flex-col border-b border-slate-200 dark:border-gray-800 shrink-0 bg-white dark:bg-gray-900 z-10 transition-colors">
        {/* Top Bar */}
        <div className="flex items-center px-6 py-3">
            <Braces className="w-6 h-6 text-sky-600 dark:text-sky-500 mr-3" />
            <h1 className="text-2xl font-bold font-hand bg-gradient-to-r from-sky-500 to-emerald-500 dark:from-sky-400 dark:to-emerald-400 bg-clip-text text-transparent pb-1">
            Json Deep Dive
            </h1>
            <div className="ml-auto flex items-center space-x-4">
                <span className="text-xs text-slate-500 dark:text-gray-500 font-mono hidden sm:block">
                    Paste JSON (Ctrl+V)
                </span>
                <button 
                  onClick={cycleTheme}
                  className="flex items-center gap-2 p-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-600 dark:text-gray-300 transition-colors text-xs font-medium"
                  title={`Current: ${getThemeLabel()} (Click to switch)`}
                >
                  {getThemeIcon()}
                  <span className="hidden sm:inline">{getThemeLabel()}</span>
                </button>
            </div>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center px-2 pt-2 bg-white dark:bg-gray-900 overflow-x-auto custom-scrollbar transition-colors">
            {tabs.map(tab => (
                <div 
                    key={tab.id}
                    onClick={() => setActiveTabId(tab.id)}
                    className={`
                        group relative flex items-center min-w-[120px] max-w-[200px] h-9 px-4 mr-1 rounded-t-lg cursor-pointer select-none transition-colors border-t border-x
                        ${activeTabId === tab.id 
                            ? 'bg-slate-50 dark:bg-gray-800 border-slate-200 dark:border-gray-700 text-sky-600 dark:text-sky-400' 
                            : 'bg-white dark:bg-gray-900/50 border-transparent hover:bg-slate-50 dark:hover:bg-gray-800/50 text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200'
                        }
                    `}
                >
                    <span className="text-xs font-medium truncate flex-1 mr-2">{tab.title}</span>
                    <button 
                        onClick={(e) => closeTab(e, tab.id)}
                        className={`p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-gray-700/80 hover:text-rose-500 dark:hover:text-rose-400 transition-opacity ${activeTabId === tab.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                    >
                        <X className="w-3 h-3" />
                    </button>
                    {/* Active Indicator Line */}
                    {activeTabId === tab.id && (
                        <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-sky-500 rounded-full"></div>
                    )}
                </div>
            ))}
            <button 
                onClick={addTab}
                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-400 dark:text-gray-500 hover:text-sky-600 dark:hover:text-sky-400 transition-colors ml-1 mb-1"
                title="New Tab"
            >
                <Plus className="w-5 h-5" />
            </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative bg-slate-50 dark:bg-gray-950 transition-colors">
        <JsonViewer 
          key={activeTab.id} // Force re-mount on tab switch to reset scroll/view state
          data={parsedData} 
          error={error} 
          onPaste={handlePasteFromClipboard}
          onClear={handleClear}
          rawInput={activeTab.content}
        />
        
        {/* Toast Notification */}
        {toast && (
          <Toast 
            message={toast.msg} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </main>
    </div>
  );
}