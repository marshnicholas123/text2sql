"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatItem {
  label: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon?: React.ReactNode;
  description?: string;
}

interface SchemaStatsProps {
  stats: StatItem[];
  className?: string;
}

export default function SchemaStats({ stats, className = "" }: SchemaStatsProps) {
  const getTrendIcon = (type: 'increase' | 'decrease' | 'neutral') => {
    switch (type) {
      case 'increase':
        return <TrendingUp className="w-3 h-3 text-green-600" />;
      case 'decrease':
        return <TrendingDown className="w-3 h-3 text-red-600" />;
      case 'neutral':
        return <Minus className="w-3 h-3 text-gray-400" />;
    }
  };

  const getTrendColor = (type: 'increase' | 'decrease' | 'neutral') => {
    switch (type) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      case 'neutral':
        return 'text-gray-400';
    }
  };

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {stat.icon && (
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  {stat.icon}
                </div>
              )}
              <h3 className="text-sm font-medium text-gray-600">{stat.label}</h3>
            </div>
            {stat.change && (
              <div className={`flex items-center gap-1 ${getTrendColor(stat.change.type)}`}>
                {getTrendIcon(stat.change.type)}
                <span className="text-xs font-medium">
                  {Math.abs(stat.change.value)}%
                </span>
              </div>
            )}
          </div>
          
          <div className="mb-1">
            <div className="text-2xl font-bold text-gray-900">
              {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
            </div>
          </div>
          
          {stat.description && (
            <p className="text-xs text-gray-500">{stat.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}