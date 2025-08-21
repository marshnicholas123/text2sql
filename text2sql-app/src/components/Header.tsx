'use client'

import React from 'react'
import { Database, Settings, User, Bell, ChevronRight, CheckCircle, Share, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Breadcrumb {
  label: string;
  href?: string;
}

interface HeaderAction {
  label: string;
  variant: 'primary' | 'secondary';
  onClick: () => void;
}

interface StatusMessage {
  message: string;
  type: 'success' | 'warning' | 'info';
}

interface ProfessionalHeaderProps {
  breadcrumbs?: Breadcrumb[];
  actions?: HeaderAction[];
  status?: StatusMessage;
}

export default function Header({ 
  breadcrumbs = [
    { label: 'Text2SQL Studio' },
    { label: 'Schemas' },
    { label: 'Database Management' }
  ],
  actions = [],
  status
}: ProfessionalHeaderProps) {
  
  const getStatusIcon = (type: StatusMessage['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <Bell className="w-4 h-4 text-yellow-600" />;
      case 'info':
        return <Bell className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
      <div className="container mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-semibold text-gray-900">Text2SQL Studio</h1>
              <p className="text-xs text-gray-500">Schema Management Platform</p>
            </div>
          </div>

          {/* Actions and Status */}
          <div className="flex items-center gap-4">
            {/* Status Message */}
            {status && (
              <div className="flex items-center gap-2 text-sm">
                {getStatusIcon(status.type)}
                <span className="text-gray-700">{status.message}</span>
              </div>
            )}

            {/* Action Buttons */}
            {actions.length > 0 && (
              <div className="flex items-center gap-2">
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    onClick={action.onClick}
                    variant={action.variant === 'primary' ? 'default' : 'outline'}
                    size="sm"
                    className={action.variant === 'primary' 
                      ? "bg-blue-600 hover:bg-blue-700 text-white" 
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }
                  >
                    {action.label === 'Share' && <Share className="w-3.5 h-3.5 mr-1.5" />}
                    {action.label === 'Export' && <Download className="w-3.5 h-3.5 mr-1.5" />}
                    {action.label}
                  </Button>
                ))}
              </div>
            )}

            {/* User Profile */}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-4 h-4 text-gray-600" />
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 text-xs bg-red-500 text-white">
                  2
                </Badge>
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4 text-gray-600" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">Admin User</p>
                  <p className="text-xs text-gray-500">Schema Designer</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 pb-4 pt-2">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
              {crumb.href ? (
                <a 
                  href={crumb.href}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {crumb.label}
                </a>
              ) : (
                <span className={`text-sm ${index === breadcrumbs.length - 1 ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </header>
  )
}