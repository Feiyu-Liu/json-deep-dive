import React, { useState } from 'react';
import { JsonValue } from '../types';
import { JsonNode } from './JsonNode';
import { Expand, Minimize, Clipboard, Trash, Copy, Check } from './Icons';
import { copyToClipboard } from '../utils/jsonUtils';

interface JsonViewerProps {
  data: JsonValue | undefined;
  error: string | null;
  onPaste: () => void;
  onClear: () => void;
  rawInput: string;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({ data, error, onPaste, onClear, rawInput }) => {
  const [expandSignal, setExpandSignal] = useState(0);
  const [collapseSignal, setCollapseSignal] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleCopyRaw = () => {
    copyToClipboard(rawInput).then((success) => {
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    });
  };

  // Error State
  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-gray-950">
        <div className="bg-white dark:bg-gray-900/50 border border-rose-200 dark:border-rose-900/50 rounded-xl p-8 max-w-2xl text-center shadow-xl dark:shadow-2xl">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 mx-auto text-rose-500 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-bold mb-2 text-rose-600 dark:text-rose-400">Invalid JSON</h3>
          <p className="font-mono text-sm opacity-80 break-words text-rose-700 dark:text-rose-300/80 mb-6 bg-rose-50 dark:bg-rose-950/30 p-4 rounded border border-rose-100 dark:border-transparent">
            {error}
          </p>
          <div className="flex justify-center space-x-4">
             <button 
               onClick={onClear}
               className="bg-slate-200 hover:bg-slate-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-800 dark:text-white px-4 py-2 rounded-lg transition-colors flex items-center"
             >
               <Trash className="w-4 h-4 mr-2" /> Clear & Try Again
             </button>
             <button 
               onClick={onPaste}
               className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-lg transition-colors flex items-center shadow-lg shadow-sky-900/20"
             >
               <Clipboard className="w-4 h-4 mr-2" /> Paste from Clipboard
             </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty State
  if (data === undefined) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-gray-400 p-8">
        <div className="text-center p-12 border-2 border-dashed border-slate-300 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900/30 max-w-lg w-full hover:border-slate-400 dark:hover:border-gray-700 transition-colors">
          <Clipboard className="w-16 h-16 mx-auto mb-6 text-slate-300 dark:text-gray-600" />
          <h2 className="text-2xl font-bold text-slate-700 dark:text-gray-300 mb-2">Ready for JSON</h2>
          <p className="mb-8 text-slate-500 dark:text-gray-500">
             Press <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-gray-800 rounded text-slate-600 dark:text-gray-300 font-mono text-xs border border-slate-200 dark:border-gray-700">Ctrl + V</span> to paste directly
          </p>
          <button 
            onClick={onPaste}
            className="bg-sky-600 hover:bg-sky-500 text-white font-medium py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-sky-900/20 active:scale-95 flex items-center mx-auto"
          >
            <Clipboard className="w-5 h-5 mr-2" />
            Paste from Clipboard
          </button>
        </div>
      </div>
    );
  }

  // Loaded State
  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      {/* Floating Toolbar */}
      <div className="absolute top-4 right-4 z-20 flex space-x-2 bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm p-1.5 rounded-lg border border-slate-200 dark:border-gray-700/50 shadow-lg dark:shadow-xl">
          <button 
            onClick={() => setExpandSignal(prev => prev + 1)}
            className="flex items-center text-xs text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-gray-700/80 transition-colors"
            title="Expand All"
          >
            <Expand className="w-4 h-4 mr-1.5" /> Expand
          </button>
          <button 
            onClick={() => setCollapseSignal(prev => prev + 1)}
            className="flex items-center text-xs text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-gray-700/80 transition-colors"
            title="Collapse All"
          >
            <Minimize className="w-4 h-4 mr-1.5" /> Collapse
          </button>
          <div className="w-px bg-slate-200 dark:bg-gray-600/50 my-1 mx-1"></div>
          <button 
            onClick={handleCopyRaw}
            className="flex items-center text-xs text-slate-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 px-3 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-gray-700/80 transition-colors"
            title="Copy Raw JSON"
          >
            {copied ? <Check className="w-4 h-4 mr-1.5" /> : <Copy className="w-4 h-4 mr-1.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button 
            onClick={onClear}
            className="flex items-center text-xs text-slate-600 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 px-3 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-gray-700/80 transition-colors"
            title="Clear JSON"
          >
            <Trash className="w-4 h-4 mr-1.5" /> Clear
          </button>
      </div>

      {/* Tree Content */}
      <div className="flex-1 overflow-auto p-4 sm:p-8 custom-scrollbar pt-16">
        <JsonNode 
          keyName={null} 
          value={data} 
          isLast={true} 
          expandAllSignal={expandSignal}
          collapseAllSignal={collapseSignal}
        />
      </div>
    </div>
  );
};