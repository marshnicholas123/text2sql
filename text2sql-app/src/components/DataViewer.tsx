'use client'

import React, { useState, useEffect } from 'react'

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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Stored Database Schemas</h2>
        <div className="text-center py-8">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Stored Database Schemas</h2>
        <div className="text-center py-8 text-red-600">Error: {error}</div>
        <div className="text-center">
          <button 
            onClick={refreshData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Stored Database Schemas</h2>
        <button 
          onClick={refreshData}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {tables.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          No tables found. Create your first table using the wizard above.
        </div>
      ) : (
        <div className="space-y-6">
          {tables.map((table) => (
            <div key={table.id} className="border border-gray-200 rounded-lg p-6">
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{table.table_name}</h3>
                <p className="text-gray-600 mt-1">{table.table_description}</p>
                <div className="text-sm text-gray-500 mt-2">
                  Created: {new Date(table.createdAt).toLocaleString()}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">
                  Fields ({table.fields.length})
                </h4>
                <div className="space-y-2">
                  {table.fields.map((field, index) => (
                    <div key={field.id} className="bg-white p-3 rounded border">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">
                              {index + 1}. {field.field_name}
                            </span>
                            {field.data_type && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {field.data_type}
                              </span>
                            )}
                            {field.is_primary_key && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                PK
                              </span>
                            )}
                            {field.is_unique && (
                              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                UNIQUE
                              </span>
                            )}
                            {!field.is_nullable && (
                              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                NOT NULL
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm">
                            {field.field_description}
                          </p>
                          {(field.max_length || field.default_value) && (
                            <div className="text-xs text-gray-500 mt-1">
                              {field.max_length && `Max length: ${field.max_length}`}
                              {field.default_value && ` • Default: ${field.default_value}`}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">Database Information</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p>Total Tables: {tables.length}</p>
          <p>Total Fields: {tables.reduce((sum, table) => sum + table.fields.length, 0)}</p>
          <p>Database Location: <code className="bg-white px-1 rounded">prisma/dev.db</code></p>
        </div>
      </div>
    </div>
  )
}