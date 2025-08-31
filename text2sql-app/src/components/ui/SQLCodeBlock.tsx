'use client';

import { useState } from 'react';
import { format } from 'sql-formatter';
import { Copy, Check } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface SQLCodeBlockProps {
  sql: string;
  className?: string;
}

export function SQLCodeBlock({ sql, className = '' }: SQLCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  // Format the SQL using sql-formatter
  const formatSQL = (rawSQL: string) => {
    try {
      return format(rawSQL, {
        language: 'sql',
        uppercase: true,
        linesBetweenQueries: 2,
        indentStyle: 'standard',
      });
    } catch (error) {
      // If formatting fails, return original SQL
      console.warn('SQL formatting failed:', error);
      return rawSQL;
    }
  };

  const formattedSQL = formatSQL(sql.trim());


  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedSQL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy SQL:', error);
    }
  };

  return (
    <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      {/* Header with copy button */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <span className="text-sm font-medium text-gray-300">SQL Query</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Formatted SQL Code */}
      <div className="overflow-x-auto">
        <SyntaxHighlighter
          language="sql"
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '1rem',
            background: 'transparent',
            fontSize: '0.875rem',
            lineHeight: '1.625'
          }}
          codeTagProps={{
            style: {
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
            }
          }}
        >
          {formattedSQL}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}