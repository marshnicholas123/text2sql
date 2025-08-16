'use client'

import React from 'react'
import { Table, FileText, Edit3 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { type CSVField } from '@/lib/csvUtils'

interface CSVPreviewProps {
  fields: CSVField[]
  onEditClick?: () => void
}

export default function CSVPreview({ fields, onEditClick }: CSVPreviewProps) {
  if (!fields || fields.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">CSV Import Preview</CardTitle>
          </div>
          {onEditClick && (
            <button
              type="button"
              onClick={onEditClick}
              className="flex items-center space-x-1 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Fields</span>
            </button>
          )}
        </div>
        <CardDescription>
          {fields.length} field{fields.length !== 1 ? 's' : ''} imported from CSV. 
          Fields will be created with default settings (VARCHAR, nullable).
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-muted-foreground">Field Summary</span>
            <Badge variant="secondary">
              <Table className="w-3 h-3 mr-1" />
              {fields.length}/{50} fields
            </Badge>
          </div>
          
          <div className="grid gap-2">
            {fields.map((field, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm">
                      {field.field_name}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      VARCHAR
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {field.field_description}
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <span>Nullable</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Next Step:</strong> You can customize data types, constraints, and add more fields 
              in the field editor after proceeding to the next step.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}