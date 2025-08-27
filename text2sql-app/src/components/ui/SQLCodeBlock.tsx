'use client';

import { useState } from 'react';
import { format } from 'sql-formatter';
import { Copy, Check } from 'lucide-react';

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

  // Render SQL with basic formatting (no syntax highlighting for now)
  const renderFormattedSQL = (sqlCode: string) => {
    return sqlCode.split('\n').map((line, index) => (
      <div key={index}>
        {line || '\u00A0'}
      </div>
    ));
  };

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
        <pre className="text-sm font-mono p-4 leading-relaxed text-green-400">
          <code className="sql-code">
            {renderFormattedSQL(formattedSQL)}
          </code>
        </pre>
      </div>
    </div>
  );
}