'use client'

import React, { useState } from 'react'

interface Field {
  field_name: string
  field_description: string
}

interface TableData {
  table_name: string
  table_description: string
  fields: Field[]
}

export default function SimpleSchemaWizard() {
  const [tableData, setTableData] = useState<TableData>({
    table_name: '',
    table_description: '',
    fields: [{ field_name: '', field_description: '' }]
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleTableNameChange = (value: string) => {
    setTableData(prev => ({ ...prev, table_name: value }))
  }

  const handleTableDescriptionChange = (value: string) => {
    setTableData(prev => ({ ...prev, table_description: value }))
  }

  const handleFieldChange = (index: number, field: string, value: string) => {
    setTableData(prev => ({
      ...prev,
      fields: prev.fields.map((f, i) => 
        i === index ? { ...f, [field]: value } : f
      )
    }))
  }

  const addField = () => {
    setTableData(prev => ({
      ...prev,
      fields: [...prev.fields, { field_name: '', field_description: '' }]
    }))
  }

  const removeField = (index: number) => {
    if (tableData.fields.length > 1) {
      setTableData(prev => ({
        ...prev,
        fields: prev.fields.filter((_, i) => i !== index)
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    
    try {
      const response = await fetch('/api/tables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tableData),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setSubmitStatus('success')
        console.log('Table saved successfully:', result.data)
        
        // Reset form
        setTableData({
          table_name: '',
          table_description: '',
          fields: [{ field_name: '', field_description: '' }]
        })
      } else {
        console.error('Error saving table:', result.error)
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Database Schema Wizard</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Table Information */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Table Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Table Name
              </label>
              <input
                type="text"
                value={tableData.table_name}
                onChange={(e) => handleTableNameChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., users, products, orders"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Table Description
              </label>
              <input
                type="text"
                value={tableData.table_description}
                onChange={(e) => handleTableDescriptionChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of what this table stores"
                required
              />
            </div>
          </div>
        </div>

        {/* Fields Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Table Fields</h2>
            <button
              type="button"
              onClick={addField}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              + Add Field
            </button>
          </div>

          <div className="space-y-4">
            {tableData.fields.map((field, index) => (
              <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-medium text-gray-800">Field {index + 1}</h3>
                  {tableData.fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeField(index)}
                      className="text-red-600 hover:text-red-800 px-2 py-1"
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Field Name
                    </label>
                    <input
                      type="text"
                      value={field.field_name}
                      onChange={(e) => handleFieldChange(index, 'field_name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., id, email, created_at"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Field Description
                    </label>
                    <input
                      type="text"
                      value={field.field_description}
                      onChange={(e) => handleFieldChange(index, 'field_description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe what this field contains"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Section */}
        <div className="flex justify-between items-center">
          <div>
            {submitStatus === 'success' && (
              <p className="text-green-600 font-medium">Table schema saved successfully!</p>
            )}
            {submitStatus === 'error' && (
              <p className="text-red-600 font-medium">Error saving table schema. Please try again.</p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Table Schema'}
          </button>
        </div>
      </form>
    </div>
  )
}