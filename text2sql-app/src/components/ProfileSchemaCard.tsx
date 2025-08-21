"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit3, Trash2, Download, Database, CheckCircle, Clock, Archive } from "lucide-react";

interface Schema {
  id: string;
  name: string;
  description: string;
  fieldCount: number;
  createdAt: Date;
  lastModified: Date;
  status: 'active' | 'draft' | 'archived';
}

interface ProfileSchemaCardProps {
  schema: Schema;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onExport?: (id: string) => void;
}

export default function ProfileSchemaCard({ schema, onEdit, onDelete, onExport }: ProfileSchemaCardProps) {
  const [showActions, setShowActions] = useState(false);

  const getStatusConfig = (status: Schema['status']) => {
    switch (status) {
      case 'active':
        return {
          color: 'bg-green-500',
          icon: CheckCircle,
          label: 'Active',
          gradient: 'from-green-400 to-emerald-500'
        };
      case 'draft':
        return {
          color: 'bg-blue-500',
          icon: Clock,
          label: 'Draft',
          gradient: 'from-blue-400 to-indigo-500'
        };
      case 'archived':
        return {
          color: 'bg-gray-500',
          icon: Archive,
          label: 'Archived',
          gradient: 'from-gray-400 to-slate-500'
        };
    }
  };

  const statusConfig = getStatusConfig(schema.status);
  const StatusIcon = statusConfig.icon;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  return (
    <div className="profile-card group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1 overflow-hidden">
      {/* Hero Banner */}
      <div className={`h-24 bg-gradient-to-r ${statusConfig.gradient} relative`}>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4 text-white" />
          </button>
          
          {/* Actions Dropdown */}
          {showActions && (
            <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[120px]">
              <button
                onClick={() => {
                  onEdit?.(schema.id);
                  setShowActions(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Edit3 className="w-3 h-3" />
                Edit
              </button>
              <button
                onClick={() => {
                  onExport?.(schema.id);
                  setShowActions(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Download className="w-3 h-3" />
                Export
              </button>
              <button
                onClick={() => {
                  onDelete?.(schema.id);
                  setShowActions(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Section */}
      <div className="p-6">
        {/* Avatar and Status */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center border-4 border-white -mt-8 shadow-md">
              <Database className="w-8 h-8 text-gray-600" />
            </div>
            <div className="absolute -bottom-1 -right-1">
              <div className={`w-5 h-5 ${statusConfig.color} rounded-full border-2 border-white flex items-center justify-center`}>
                <StatusIcon className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {schema.name}
              </h3>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusConfig.color} text-white`}>
                {statusConfig.label}
              </span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
              {schema.description || "No description provided"}
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-4">
            <div>
              <span className="font-semibold text-gray-900">{schema.fieldCount}</span>
              <span className="ml-1">Fields</span>
            </div>
            <div>
              <span className="font-semibold text-gray-900">{formatDate(schema.createdAt)}</span>
              <span className="ml-1">Created</span>
            </div>
            <div>
              <span className="text-gray-600">{getTimeAgo(schema.lastModified)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={() => onEdit?.(schema.id)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm h-9"
          >
            <Edit3 className="w-3.5 h-3.5 mr-1.5" />
            Edit
          </Button>
          <Button
            onClick={() => onExport?.(schema.id)}
            variant="outline"
            className="px-4 text-sm h-9 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Download className="w-3.5 h-3.5" />
          </Button>
          <Button
            onClick={() => onDelete?.(schema.id)}
            variant="outline"
            className="px-4 text-sm h-9 border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-red-600 hover:border-red-300"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}