'use client'

import React, { useState, useEffect } from 'react'
import { RefreshCw, Database, Clock, FileText, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ProfileSchemaCard from '@/components/ProfileSchemaCard'

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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-gray-500" />
            <span className="text-sm text-gray-600">Loading schemas...</span>
          </div>
        </div>
        {/* Loading skeleton cards */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="h-24 bg-gray-200 rounded-lg mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 bg-white rounded-xl shadow-sm border border-red-200">
        <div className="text-red-600 mb-4">
          <Database className="w-8 h-8 mx-auto mb-2" />
          <p className="font-medium">Error loading schemas</p>
          <p className="text-sm text-red-500">{error}</p>
        </div>
        <Button onClick={refreshData} variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search and Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search schemas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-gray-300"
          />
        </div>
        <Button onClick={refreshData} variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="flex items-center gap-6 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
        <div className="flex items-center gap-1">
          <FileText className="w-4 h-4" />
          <span>{tables.length} schemas</span>
        </div>
        <div className="flex items-center gap-1">
          <Database className="w-4 h-4" />
          <span>{tables.reduce((sum, table) => sum + table.fields.length, 0)} fields</span>
        </div>
        {tables.length > 0 && (
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>Updated {new Date(Math.max(...tables.map(t => new Date(t.updatedAt).getTime()))).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Schema Cards */}
      {tables.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <Database className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No schemas yet</h3>
          <p className="text-gray-600 mb-6 max-w-sm mx-auto">
            Create your first database schema using the wizard to get started.
          </p>
          <Button variant="outline" className="gap-2 border-gray-300 text-gray-700 hover:bg-gray-50">
            <Plus className="w-4 h-4" />
            Create Schema
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTables.map((table) => (
            <ProfileSchemaCard
              key={table.id}
              schema={{
                id: table.id.toString(),
                name: table.table_name,
                description: table.table_description,
                fieldCount: table.fields.length,
                createdAt: new Date(table.createdAt),
                lastModified: new Date(table.updatedAt),
                status: 'active' // Default status, could be dynamic based on usage
              }}
              onEdit={(id) => console.log('Edit schema:', id)}
              onDelete={(id) => console.log('Delete schema:', id)}
              onExport={(id) => console.log('Export schema:', id)}
            />
          ))}
          
          {filteredTables.length === 0 && searchQuery && (
            <div className="text-center py-8 bg-white rounded-xl shadow-sm border border-gray-200">
              <p className="text-gray-600">
                No schemas found matching &quot;{searchQuery}&quot;
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}