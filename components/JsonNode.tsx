import React, { useState, useEffect } from 'react';
import { DataType, JsonValue } from '../types';
import { getDataType, copyToClipboard } from '../utils/jsonUtils';
import { ChevronRight, ChevronDown } from './Icons';

interface JsonNodeProps {
  keyName: string | null;
  value: JsonValue;
  depth?: number;
  isLast?: boolean;
  expandAllSignal?: number; // Used to trigger mass expand/collapse
  collapseAllSignal?: number;
}

const INDENT_SIZE = 1.25; // rem

export const JsonNode: React.FC<JsonNodeProps> = ({ 
  keyName, 
  value, 
  depth = 0, 
  isLast = true,
  expandAllSignal = 0,
  collapseAllSignal = 0
}) => {
  const [expanded, setExpanded] = useState<boolean>(depth < 2);
  const [hovered, setHovered] = useState(false);
  const [copied, setCopied] = useState(false);

  const type = getDataType(value);
  const isExpandable = type === DataType.OBJECT || type === DataType.ARRAY;
  const isEmpty = isExpandable && Object.keys(value as object).length === 0;

  useEffect(() => {
    if (expandAllSignal > 0) setExpanded(true);
  }, [expandAllSignal]);

  useEffect(() => {
    if (collapseAllSignal > 0) setExpanded(false);
  }, [collapseAllSignal]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((prev) => !prev);
  };

  const handleCopyValue = (e: React.MouseEvent) => {
    e.stopPropagation();
    let textToCopy = '';
    if (type === DataType.STRING) textToCopy = String(value);
    else textToCopy = JSON.stringify(value, null, 2);

    copyToClipboard(textToCopy).then((success) => {
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    });
  };

  const renderValue = () => {
    switch (type) {
      case DataType.STRING:
        return <span className="text-emerald-600 dark:text-emerald-400 break-words whitespace-pre-wrap">"{String(value)}"</span>;
      case DataType.NUMBER:
        return <span className="text-amber-600 dark:text-amber-400">{String(value)}</span>;
      case DataType.BOOLEAN:
        return <span className="text-rose-600 dark:text-rose-400 font-bold">{String(value)}</span>;
      case DataType.NULL:
        return <span className="text-slate-500 dark:text-gray-500 italic">null</span>;
      case DataType.OBJECT:
      case DataType.ARRAY:
        return null; // Handled by container logic
      default:
        return <span className="text-slate-500 dark:text-gray-500">unknown</span>;
    }
  };

  const renderKey = () => {
    if (keyName === null) return null;
    return <span className="text-sky-600 dark:text-sky-400 mr-1">"{keyName}"</span>;
  };

  const getPreview = () => {
    if (type === DataType.ARRAY) {
      return <span className="text-slate-400 dark:text-gray-500 text-sm ml-2">Array({(value as any[]).length})</span>;
    }
    if (type === DataType.OBJECT) {
      const keys = Object.keys(value as object);
      return <span className="text-slate-400 dark:text-gray-500 text-sm ml-2">{`{ ${keys.length} items }`}</span>;
    }
    return null;
  };

  const openingBracket = type === DataType.ARRAY ? '[' : '{';
  const closingBracket = type === DataType.ARRAY ? ']' : '}';

  if (!isExpandable) {
    return (
      <div 
        className="font-mono text-sm leading-6 hover:bg-slate-200 dark:hover:bg-gray-800/50 px-1 rounded flex items-start group relative"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ paddingLeft: `${depth === 0 ? 0 : 1}rem` }}
      >
        <div className="flex-1 break-all">
           {renderKey()}
           {keyName !== null && <span className="text-slate-400 dark:text-gray-400 mr-2">:</span>}
           {renderValue()}
           {!isLast && <span className="text-slate-500 dark:text-gray-500">,</span>}
        </div>
        
        {/* Copy Button Primitive */}
        {hovered && (
          <button 
            onClick={handleCopyValue}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-700 text-slate-600 dark:text-gray-200 shadow-sm border border-slate-200 dark:border-transparent text-xs px-2 py-0.5 rounded opacity-100 dark:opacity-80 hover:opacity-100 transition-opacity z-10"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        )}
      </div>
    );
  }

  // Handle expandable Types (Object/Array)
  const childEntries = Object.entries(value as object);

  return (
    <div className="font-mono text-sm leading-6">
      <div 
        className={`flex items-center hover:bg-slate-200 dark:hover:bg-gray-800/50 px-1 rounded cursor-pointer group relative select-none`}
        onClick={handleToggle}
        style={{ paddingLeft: `${depth === 0 ? 0 : 0}rem` }}
      >
        {/* Toggle Icon */}
        <span className="text-slate-400 dark:text-gray-500 mr-1 w-4 h-4 flex items-center justify-center transition-transform duration-100">
           {!isEmpty && (expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />)}
        </span>

        {/* Key and Opening Bracket */}
        <div className="flex-1 flex items-center">
            {renderKey()}
            {keyName !== null && <span className="text-slate-400 dark:text-gray-400 mr-2">:</span>}
            <span className="text-amber-600 dark:text-yellow-500 font-bold">{openingBracket}</span>
            {!expanded && !isEmpty && getPreview()}
            {!expanded && !isEmpty && <span className="text-amber-600 dark:text-yellow-500 font-bold ml-1">{closingBracket}</span>}
            {isEmpty && <span className="text-amber-600 dark:text-yellow-500 font-bold">{closingBracket}</span>}
            {!isLast && (!expanded || isEmpty) && <span className="text-slate-500 dark:text-gray-500">,</span>}
        </div>
         
         {/* Controls for Object/Array */}
         <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 flex space-x-2 z-10">
            <button 
                onClick={(e) => { e.stopPropagation(); handleCopyValue(e); }}
                className="bg-white dark:bg-gray-700 text-slate-600 dark:text-gray-200 shadow-sm border border-slate-200 dark:border-transparent text-xs px-2 py-0.5 rounded opacity-100 dark:opacity-80 hover:opacity-100"
            >
                {copied ? 'Copied!' : 'Copy JSON'}
            </button>
         </div>
      </div>

      {/* Children */}
      {expanded && !isEmpty && (
        <div className="border-l border-slate-200 dark:border-gray-700 ml-2.5 pl-1" style={{ marginLeft: '0.6rem' }}> 
          {childEntries.map(([key, val], index) => (
            <JsonNode
              key={index}
              keyName={type === DataType.ARRAY ? null : key}
              value={val}
              depth={depth + 1}
              isLast={index === childEntries.length - 1}
              expandAllSignal={expandAllSignal}
              collapseAllSignal={collapseAllSignal}
            />
          ))}
          <div 
            className="hover:bg-slate-200 dark:hover:bg-gray-800/50 px-1 rounded cursor-pointer pl-6"
          >
             <span className="text-amber-600 dark:text-yellow-500 font-bold">{closingBracket}</span>
             {!isLast && <span className="text-slate-500 dark:text-gray-500">,</span>}
          </div>
        </div>
      )}
    </div>
  );
};