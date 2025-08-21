'use client'

import React, { useState } from 'react'
import { Plus, Trash2, Save } from 'lucide-react'
import { z } from 'zod'

const fieldSchema = z.object({
  field_name: z.string().min(1, 'Field name is required'),
  field_description: z.string().min(1, 'Field description is required'),
})

const tableSchema = z.object({
  table_name: z.string().min(1, 'Table name is required'),
  table_description: z.string().min(1, 'Table description is required'),
  fields: z.array(fieldSchema).min(1, 'At least one field is required'),
})

type TableFormData = z.infer<typeof tableSchema>

export default function SchemaWizard() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const { register, control, handleSubmit, formState: { errors }, reset } = useForm<TableFormData>({
    resolver: zodResolver(tableSchema),
    defaultValues: {
      table_name: '',
      table_description: '',
      fields: [{ field_name: '', field_description: '' }]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'fields'
  })

  const onSubmit = async (data: TableFormData) => {
    setIsSubmitting(true)
    setSubmitStatus('idle')
    
    try {
      const response = await fetch('/api/tables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setSubmitStatus('success')
        reset()
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const addField = () => {
    append({ field_name: '', field_description: '' })
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Database Schema Wizard</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Table Information */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Table Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Table Name
              </label>
              <input
                {...register('table_name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., users, products, orders"
              />
              {errors.table_name && (
                <p className="mt-1 text-sm text-red-600">{errors.table_name.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Table Description
              </label>
              <input
                {...register('table_description')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of what this table stores"
              />
              {errors.table_description && (
                <p className="mt-1 text-sm text-red-600">{errors.table_description.message}</p>
              )}
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
              <Plus className="w-4 h-4 mr-2" />
              Add Field
            </button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-medium text-gray-800">Field {index + 1}</h3>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Field Name
                    </label>
                    <input
                      {...register(`fields.${index}.field_name` as const)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., id, email, created_at"
                    />
                    {errors.fields?.[index]?.field_name && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.fields[index]?.field_name?.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Field Description
                    </label>
                    <input
                      {...register(`fields.${index}.field_description` as const)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe what this field contains"
                    />
                    {errors.fields?.[index]?.field_description && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.fields[index]?.field_description?.message}
                      </p>
                    )}
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
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Saving...' : 'Save Table Schema'}
          </button>
        </div>
      </form>
    </div>
  )
}