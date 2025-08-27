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

  // Simple SQL syntax highlighting
  const highlightSQL = (sqlCode: string) => {
    if (!sqlCode) return '';
    
    let highlighted = sqlCode;
    
    // SQL Keywords (blue)
    const keywords = [
      'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN',
      'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'INSERT', 'UPDATE', 'DELETE', 
      'CREATE', 'DROP', 'ALTER', 'TABLE', 'DATABASE', 'INDEX', 'VIEW', 'UNION', 'DISTINCT',
      'COUNT', 'SUM', 'AVG', 'MAX', 'MIN', 'AS', 'AND', 'OR', 'NOT', 'IN', 'EXISTS', 'LIKE',
      'BETWEEN', 'IS', 'NULL', 'ON', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END'
    ];
    
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      highlighted = highlighted.replace(regex, `<span class="text-blue-400 font-semibold">${keyword}</span>`);
    });

    // String literals (green)
    highlighted = highlighted.replace(/'([^']*)'/g, '<span class="text-green-400">\'$1\'</span>');
    highlighted = highlighted.replace(/"([^"]*)"/g, '<span class="text-green-400">"$1"</span>');

    // Numbers (yellow)
    highlighted = highlighted.replace(/\b\d+(\.\d+)?\b/g, '<span class="text-yellow-400">$&</span>');

    // Comments (gray)
    highlighted = highlighted.replace(/--.*$/gm, '<span class="text-gray-500 italic">$&</span>');
    highlighted = highlighted.replace(/\/\*[\s\S]*?\*\//g, '<span class="text-gray-500 italic">$&</span>');

    return highlighted;
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
        <pre className="text-sm font-mono whitespace-pre-wrap p-4 leading-relaxed text-gray-300">
          <code 
            className="sql-code"
            dangerouslySetInnerHTML={{ 
              __html: highlightSQL(formattedSQL) 
            }} 
          />
        </pre>
      </div>
    </div>
  );
}