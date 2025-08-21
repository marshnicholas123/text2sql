'use client'

import React, { useState, useEffect } from 'react'
import { RefreshCw, Database, Clock, FileText, Plus, Search } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import SchemaCard from '@/components/SchemaCard'

interface Field {
  id: number
  field_name: string
  field_description: string
  data_type?: string
  max_length?: number
  is_nullable?: boolean
  is_primary_key?: boolean
  is_unique?: boolean
  default_value?: string
}

interface TableData {
  id: number
  table_name: string
  table_description: string
  fields: Field[]
  createdAt: string
  updatedAt: string
}

export default function DataViewer() {
  const [tables, setTables] = useState<TableData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchTables = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/tables')
      const result = await response.json()
      
      if (response.ok && result.success) {
        setTables(result.data)
        setError(null)
      } else {
        setError(result.error || 'Failed to fetch tables')
      }
    } catch (err) {
      setError('Error fetching data: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTables()
  }, [])

  const refreshData = () => {
    fetchTables()
  }

  const filteredTables = tables.filter(table => 
    table.table_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    table.table_description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Schema Library
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-muted-foreground">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Loading schemas...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="shadow-card border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Database className="w-5 h-5" />
            Schema Library
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-destructive mb-4">Error: {error}</p>
            <Button onClick={refreshData} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Schema Library
            </CardTitle>
            <CardDescription>
              Manage and explore your database schemas
            </CardDescription>
          </div>
          <Button onClick={refreshData} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {/* Search and Stats */}
        <div className="flex items-center justify-between gap-4 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search schemas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              <span>{tables.length} schemas</span>
            </div>
            <div className="flex items-center gap-1">
              <Database className="w-4 h-4" />
              <span>{tables.reduce((sum, table) => sum + table.fields.length, 0)} fields</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {tables.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Database className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No schemas yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Create your first database schema using the wizard to get started.
            </p>
            <Button variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Create Schema
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTables.map((table) => (
              <SchemaCard
                key={table.id}
                schema={{
                  id: table.id,
                  table_name: table.table_name,
                  table_description: table.table_description,
                  created_at: table.createdAt,
                  field_count: table.fields.length
                }}
                onEdit={(id) => console.log('Edit schema:', id)}
                onDelete={(id) => console.log('Delete schema:', id)}
              />
            ))}
            
            {filteredTables.length === 0 && searchQuery && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No schemas found matching &quot;{searchQuery}&quot;
                </p>
              </div>
            )}
          </div>
        )}
        
        {tables.length > 0 && (
          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-medium text-foreground">Database Info</h3>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Storage: <code className="bg-background px-1 rounded">prisma/dev.db</code></p>
              <p>Last updated: {tables.length > 0 ? new Date(Math.max(...tables.map(t => new Date(t.updatedAt).getTime()))).toLocaleString() : 'Never'}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}