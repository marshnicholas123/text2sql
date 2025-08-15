'use client'

import React, { useState, useEffect } from 'react'
import { Database, Table, Eye } from 'lucide-react'

interface Field {
  id: number
  field_name: string
  field_description: string
}

interface TableData {
  id: number
  table_name: string
  table_description: string
  fields: Field[]
  createdAt: string
}

export default function TablesList() {
  const [tables, setTables] = useState<TableData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null)

  useEffect(() => {
    fetchTables()
  }, [])

  const fetchTables = async () => {
    try {
      const response = await fetch('/api/tables')
      const result = await response.json()
      
      if (result.success) {
        setTables(result.data)
      }
    } catch (error) {
      console.error('Error fetching tables:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">Loading tables...</div>
      </div>
    )
  }

  if (tables.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center py-8">
          <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tables yet</h3>
          <p className="text-gray-600">Create your first table using the wizard above.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <Database className="w-6 h-6 mr-2" />
        Saved Tables ({tables.length})
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tables.map((table) => (
          <div
            key={table.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedTable(table)}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center">
                <Table className="w-4 h-4 text-blue-600 mr-2" />
                <h3 className="font-semibold text-gray-900 text-sm">{table.table_name}</h3>
              </div>
              <Eye className="w-4 h-4 text-gray-400" />
            </div>
            
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {table.table_description}
            </p>
            
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>{table.fields.length} fields</span>
              <span>{new Date(table.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Table Details Modal */}
      {selectedTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedTable.table_name}</h3>
                  <p className="text-gray-600 mt-1">{selectedTable.table_description}</p>
                </div>
                <button
                  onClick={() => setSelectedTable(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-3">Fields ({selectedTable.fields.length})</h4>
                <div className="space-y-3">
                  {selectedTable.fields.map((field, index) => (
                    <div key={field.id} className="bg-gray-50 p-3 rounded">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <span className="font-medium text-gray-900">
                            {index + 1}. {field.field_name}
                          </span>
                          <p className="text-gray-600 text-sm mt-1">{field.field_description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <div className="text-xs text-gray-500">
                  Created: {new Date(selectedTable.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}