"use client";

import { Button } from "@/components/ui/button";
import { Plus, Upload, Download, Database, BarChart3, CheckCircle, User, Building } from "lucide-react";

interface UserStats {
  totalSchemas: number;
  activeQueries: number;
  successRate: number;
}

interface UserInfo {
  name: string;
  role: string;
  organization: string;
  avatar?: string;
}

interface UserProfilePanelProps {
  user: UserInfo;
  stats: UserStats;
  onCreateSchema?: () => void;
  onImportCSV?: () => void;
  onExportAll?: () => void;
}

export default function UserProfilePanel({ 
  user, 
  stats, 
  onCreateSchema, 
  onImportCSV, 
  onExportAll 
}: UserProfilePanelProps) {
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* User Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-8 relative">
          <div className="absolute inset-0 bg-black/10"></div>
        </div>
        
        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="flex items-center gap-4 -mt-3 mb-4">
            <div className="w-16 h-16 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center relative z-10">
              {user.avatar ? (
                <div 
                  className="w-full h-full rounded-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${user.avatar})` }}
                />
              ) : (
                <span className="text-lg font-semibold text-gray-600">
                  {getInitials(user.name)}
                </span>
              )}
            </div>
          </div>

          {/* User Info */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-semibold text-gray-900">{user.name}</h2>
              <CheckCircle className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-sm text-gray-600 flex items-center gap-1.5 mb-1">
              <User className="w-3.5 h-3.5" />
              {user.role}
            </p>
            <p className="text-sm text-gray-500 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5" />
              {user.organization}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="font-semibold text-lg text-gray-900">{stats.totalSchemas}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Schemas</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-lg text-gray-900">{stats.activeQueries}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Queries</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-lg text-gray-900">{stats.successRate}%</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Success</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              onClick={onCreateSchema}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-9"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Schema
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={onImportCSV}
                variant="outline"
                className="text-sm h-9 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Upload className="w-3.5 h-3.5 mr-1.5" />
                Import
              </Button>
              <Button
                onClick={onExportAll}
                variant="outline"
                className="text-sm h-9 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-gray-600" />
          Quick Stats
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Database className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Active Schemas</div>
                <div className="text-xs text-gray-500">Currently in use</div>
              </div>
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {Math.floor(stats.totalSchemas * 0.7)}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">This Month</div>
                <div className="text-xs text-gray-500">Queries processed</div>
              </div>
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {stats.activeQueries * 30}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Accuracy</div>
                <div className="text-xs text-gray-500">Query success rate</div>
              </div>
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {stats.successRate}%
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}