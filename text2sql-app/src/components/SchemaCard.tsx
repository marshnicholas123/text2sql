'use client'

import React from 'react'
import { Calendar, Database, Edit3, Trash2, Users, MoreHorizontal } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface SchemaCardProps {
  schema: {
    id: number
    table_name: string
    table_description: string
    created_at: string
    field_count?: number
  }
  onEdit?: (id: number) => void
  onDelete?: (id: number) => void
}

export default function SchemaCard({ schema, onEdit, onDelete }: SchemaCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <Card className="group relative overflow-hidden transition-all duration-200 hover:shadow-card-hover hover:-translate-y-1 shadow-card">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="relative">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
              <Database className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                {schema.table_name}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {schema.field_count || 0} fields
                </Badge>
                <span className="text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3 inline mr-1" />
                  {formatDate(schema.created_at)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit?.(schema.id)}
              className="h-8 w-8 p-0 hover:bg-primary/10"
            >
              <Edit3 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete?.(schema.id)}
              className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative">
        <CardDescription className="text-sm text-muted-foreground leading-relaxed mb-4">
          {schema.table_description}
        </CardDescription>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>Shared</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>Active</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}