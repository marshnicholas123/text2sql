'use client'

import React, { useState, useEffect } from 'react'
import { RefreshCw, Database, Search, ChevronDown, ChevronRight, Edit3, Trash2, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

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

  const handleEdit = async (id: string) => {
    // TODO: Implement edit functionality
    console.log('Edit schema:', id)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this schema? This action cannot be undone.')) {
      return
    }

    try {
      setActionLoading(`delete-${id}`)
      const response = await fetch(`/api/tables?id=${id}`, {
        method: 'DELETE',
      })
      const result = await response.json()
      
      if (response.ok && result.success) {
        // Refresh the table list
        await fetchTables()
        // Reset selected index if needed
        if (selectedIndex >= filteredTables.length - 1) {
          setSelectedIndex(Math.max(0, filteredTables.length - 2))
        }
      } else {
        alert(result.error || 'Failed to delete schema')
      }
    } catch (error) {
      alert('Error deleting schema: ' + (error as Error).message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDownload = async (id: string) => {
    try {
      setActionLoading(`download-${id}`)
      const table = tables.find(t => t.id.toString() === id)
      if (!table) return
      
      // Create downloadable JSON
      const schemaData = {
        table_name: table.table_name,
        table_description: table.table_description,
        fields: table.fields.map(field => ({
          field_name: field.field_name,
          field_description: field.field_description,
          data_type: field.data_type,
          max_length: field.max_length,
          is_nullable: field.is_nullable,
          is_primary_key: field.is_primary_key,
          is_unique: field.is_unique,
          default_value: field.default_value
        }))
      }
      
      const blob = new Blob([JSON.stringify(schemaData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${table.table_name}_schema.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      alert('Error downloading schema: ' + (error as Error).message)
    } finally {
      setActionLoading(null)
    }
  }

  const navigateSchema = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1)
    } else if (direction === 'next' && selectedIndex < filteredTables.length - 1) {
      setSelectedIndex(selectedIndex + 1)
    }
  }

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
      {/* Expandable Header */}
      <div className="border border-gray-200 rounded-lg bg-white">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-3 text-left hover:bg-gray-50 transition-colors rounded p-2 -m-2 flex-1"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
            <Database className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-medium text-gray-900">Your Table Schemas</h3>
              <p className="text-sm text-gray-500">{tables.length} schema{tables.length !== 1 ? 's' : ''} available</p>
            </div>
          </button>
          <Button onClick={refreshData} variant="ghost" size="sm" className="hover:bg-gray-100">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
        
        {isExpanded && (
          <div className="border-t border-gray-200 p-4 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search schemas..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setSelectedIndex(0) // Reset to first result
                }}
                className="pl-10 border-gray-300"
              />
            </div>
            
            {/* Schema Display */}
            {filteredTables.length === 0 ? (
              <div className="text-center py-8">
                {tables.length === 0 ? (
                  <div>
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                      <Database className="w-6 h-6 text-gray-400" />
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">No schemas yet</h4>
                    <p className="text-sm text-gray-500">Create your first database schema to get started.</p>
                  </div>
                ) : (
                  <p className="text-gray-500">No schemas found matching &quot;{searchQuery}&quot;</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Navigation */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Showing {selectedIndex + 1} of {filteredTables.length}</span>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => navigateSchema('prev')}
                      disabled={selectedIndex === 0}
                      variant="outline"
                      size="sm"
                      className="h-8 px-3"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => navigateSchema('next')}
                      disabled={selectedIndex === filteredTables.length - 1}
                      variant="outline"
                      size="sm"
                      className="h-8 px-3"
                    >
                      Next
                    </Button>
                  </div>
                </div>
                
                {/* Current Schema Card */}
                {filteredTables[selectedIndex] && (
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 text-lg">
                          {filteredTables[selectedIndex].table_name}
                        </h4>
                        <p className="text-gray-600 mt-1">
                          {filteredTables[selectedIndex].table_description}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEdit(filteredTables[selectedIndex].id.toString())}
                          disabled={actionLoading === `edit-${filteredTables[selectedIndex].id}`}
                          variant="outline"
                          size="sm"
                          className="h-8 px-3"
                        >
                          <Edit3 className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDownload(filteredTables[selectedIndex].id.toString())}
                          disabled={actionLoading === `download-${filteredTables[selectedIndex].id}`}
                          variant="outline"
                          size="sm"
                          className="h-8 px-3"
                        >
                          {actionLoading === `download-${filteredTables[selectedIndex].id}` ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <Download className="w-3 h-3" />
                          )}
                        </Button>
                        <Button
                          onClick={() => handleDelete(filteredTables[selectedIndex].id.toString())}
                          disabled={actionLoading === `delete-${filteredTables[selectedIndex].id}`}
                          variant="outline"
                          size="sm"
                          className="h-8 px-3 text-red-600 border-red-200 hover:bg-red-50"
                        >
                          {actionLoading === `delete-${filteredTables[selectedIndex].id}` ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    {/* Schema Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span>{filteredTables[selectedIndex].fields.length} fields</span>
                      <span>Created {new Date(filteredTables[selectedIndex].createdAt).toLocaleDateString()}</span>
                      <span>Updated {new Date(filteredTables[selectedIndex].updatedAt).toLocaleDateString()}</span>
                    </div>
                    
                    {/* Fields List */}
                    <div className="space-y-2">
                      <h5 className="font-medium text-gray-900 text-sm">Fields:</h5>
                      <div className="grid grid-cols-1 gap-2">
                        {filteredTables[selectedIndex].fields.map((field) => (
                          <div key={field.id} className="bg-white rounded border p-3 text-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                              <span className="font-mono text-blue-600 break-all">{field.field_name}</span>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded">
                                  {field.data_type}
                                  {field.max_length && `(${field.max_length})`}
                                </span>
                                {field.is_primary_key && (
                                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                                    PRIMARY KEY
                                  </span>
                                )}
                                {field.is_unique && !field.is_primary_key && (
                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                                    UNIQUE
                                  </span>
                                )}
                                {!field.is_nullable && (
                                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                                    NOT NULL
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-gray-600 text-xs leading-relaxed break-words">
                              {field.field_description}
                            </p>
                            {field.default_value && (
                              <p className="text-gray-500 text-xs mt-1">
                                <span className="font-medium">Default:</span> <code className="bg-gray-100 px-1 rounded">{field.default_value}</code>
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}