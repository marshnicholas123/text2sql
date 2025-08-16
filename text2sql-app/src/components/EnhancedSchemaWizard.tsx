'use client'

import React, { useState, useEffect } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Trash2, 
  Save, 
  Database, 
  Table, 
  ChevronLeft, 
  ChevronRight, 
  Check,
  AlertCircle,
  Upload,
  Edit3,
  Archive
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import CSVUploader from '@/components/CSVUploader'
import CSVPreview from '@/components/CSVPreview'
import SchemaBrowser from '@/components/SchemaBrowser'
import { type CSVField } from '@/lib/csvUtils'

// Enhanced field schema with data types and constraints
const fieldSchema = z.object({
  field_name: z.string().min(1, 'Field name is required').regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'Invalid field name format'),
  field_description: z.string().min(1, 'Field description is required'),
  data_type: z.enum(['VARCHAR', 'INT', 'BIGINT', 'DECIMAL', 'BOOLEAN', 'DATE', 'DATETIME', 'TEXT', 'JSON']),
  max_length: z.number().optional(),
  is_nullable: z.boolean().default(true),
  is_primary_key: z.boolean().default(false),
  is_unique: z.boolean().default(false),
  default_value: z.string().optional(),
})

const tableSchema = z.object({
  table_name: z.string().min(1, 'Table name is required').regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'Invalid table name format'),
  table_description: z.string().min(1, 'Table description is required'),
  fields: z.array(fieldSchema).min(1, 'At least one field is required').max(50, 'Maximum 50 fields allowed'),
})

type TableFormData = z.infer<typeof tableSchema>
type FieldData = z.infer<typeof fieldSchema>

const WIZARD_STEPS = [
  { id: 1, title: 'Table Info', description: 'Basic table information' },
  { id: 2, title: 'Define Fields', description: 'Add and configure fields' },
  { id: 3, title: 'Review', description: 'Review and save schema' },
]

const DATA_TYPES = [
  { value: 'VARCHAR', label: 'VARCHAR - Text (variable length)' },
  { value: 'INT', label: 'INT - Integer number' },
  { value: 'BIGINT', label: 'BIGINT - Large integer' },
  { value: 'DECIMAL', label: 'DECIMAL - Decimal number' },
  { value: 'BOOLEAN', label: 'BOOLEAN - True/false' },
  { value: 'DATE', label: 'DATE - Date only' },
  { value: 'DATETIME', label: 'DATETIME - Date and time' },
  { value: 'TEXT', label: 'TEXT - Long text' },
  { value: 'JSON', label: 'JSON - JSON data' },
]

const COMMON_FIELD_TEMPLATES = [
  { name: 'id', description: 'Primary key identifier', data_type: 'INT' as const, is_primary_key: true, is_nullable: false },
  { name: 'name', description: 'Name field', data_type: 'VARCHAR' as const, max_length: 255 },
  { name: 'email', description: 'Email address', data_type: 'VARCHAR' as const, max_length: 255, is_unique: true },
  { name: 'created_at', description: 'Creation timestamp', data_type: 'DATETIME' as const, is_nullable: false },
  { name: 'updated_at', description: 'Last update timestamp', data_type: 'DATETIME' as const, is_nullable: false },
  { name: 'is_active', description: 'Active status flag', data_type: 'BOOLEAN' as const, default_value: 'true' },
]

export default function EnhancedSchemaWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [inputMode, setInputMode] = useState<'manual' | 'csv' | 'schema'>('manual')
  const [csvFields, setCsvFields] = useState<CSVField[]>([])
  const [showCSVPreview, setShowCSVPreview] = useState(false)
  const [selectedSchemaForImport, setSelectedSchemaForImport] = useState<any>(null)

  const { register, control, handleSubmit, formState: { errors }, reset, watch, trigger, setValue } = useForm<TableFormData>({
    resolver: zodResolver(tableSchema),
    defaultValues: {
      table_name: '',
      table_description: '',
      fields: [{ 
        field_name: '', 
        field_description: '', 
        data_type: 'VARCHAR',
        is_nullable: true,
        is_primary_key: false,
        is_unique: false
      }]
    },
    mode: 'onChange'
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'fields'
  })

  const watchedFields = watch()

  // Auto-save to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      if (watchedFields.table_name || watchedFields.table_description || watchedFields.fields.some(f => f.field_name)) {
        localStorage.setItem('schema-wizard-draft', JSON.stringify(watchedFields))
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [watchedFields])

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('schema-wizard-draft')
    if (draft) {
      try {
        const parsedDraft = JSON.parse(draft)
        reset(parsedDraft)
      } catch (error) {
        console.error('Failed to load draft:', error)
      }
    }
  }, [reset])

  const addField = (template?: typeof COMMON_FIELD_TEMPLATES[0]) => {
    const newField: FieldData = template ? {
      field_name: template.name,
      field_description: template.description,
      data_type: template.data_type,
      max_length: template.max_length,
      is_nullable: template.is_nullable ?? true,
      is_primary_key: template.is_primary_key ?? false,
      is_unique: template.is_unique ?? false,
      default_value: template.default_value,
    } : {
      field_name: '',
      field_description: '',
      data_type: 'VARCHAR',
      is_nullable: true,
      is_primary_key: false,
      is_unique: false,
    }
    
    append(newField)
  }

  const removeField = (index: number) => {
    if (fields.length > 1) {
      remove(index)
    }
  }

  const handleCSVParsed = (csvFieldsData: CSVField[]) => {
    setCsvFields(csvFieldsData)
    setShowCSVPreview(true)
    
    // Convert CSV fields to form fields with default values
    const formFields: FieldData[] = csvFieldsData.map(csvField => ({
      field_name: csvField.field_name,
      field_description: csvField.field_description,
      data_type: 'VARCHAR',
      is_nullable: true,
      is_primary_key: false,
      is_unique: false,
    }))
    
    // Clear existing fields and set the new ones
    setValue('fields', formFields)
  }

  const switchToManualMode = () => {
    setInputMode('manual')
    setShowCSVPreview(false)
    setSelectedSchemaForImport(null)
  }

  const editCSVFields = () => {
    setInputMode('manual')
    setShowCSVPreview(false)
    // Fields are already loaded in the form from CSV
  }

  const handleSchemaSelected = (schema: any) => {
    setSelectedSchemaForImport(schema)
    
    // Convert schema fields to form fields
    const formFields: FieldData[] = schema.fields.map((field: any) => ({
      field_name: field.field_name,
      field_description: field.field_description,
      data_type: field.data_type,
      max_length: field.max_length,
      is_nullable: field.is_nullable,
      is_primary_key: field.is_primary_key,
      is_unique: field.is_unique,
      default_value: field.default_value,
    }))
    
    // Set the fields in the form
    setValue('fields', formFields)
    
    // Optionally pre-fill table name with a modified version
    if (!watchedFields.table_name) {
      setValue('table_name', `${schema.table_name}_copy`)
    }
    if (!watchedFields.table_description) {
      setValue('table_description', `Copy of ${schema.table_description}`)
    }
  }

  const nextStep = async () => {
    let isValid = false
    
    if (currentStep === 1) {
      // Validate table info
      const tableInfoValid = await trigger(['table_name', 'table_description'])
      
      // Check if we have fields (either from manual entry or CSV)
      const hasFields = watchedFields.fields && watchedFields.fields.length > 0 && 
        watchedFields.fields.some(field => field.field_name?.trim())
      
      // For CSV mode, we need fields imported
      if (inputMode === 'csv' && !hasFields) {
        console.log('CSV mode but no fields imported yet')
        return
      }
      
      // For schema mode, we need a schema selected and fields imported
      if (inputMode === 'schema' && !selectedSchemaForImport) {
        console.log('Schema mode but no schema selected yet')
        return
      }
      
      isValid = tableInfoValid && (inputMode === 'manual' || hasFields || (inputMode === 'schema' && selectedSchemaForImport))
    } else if (currentStep === 2) {
      // Validate all fields
      isValid = await trigger('fields')
      
      // Additional check for required fields
      const currentFields = watchedFields.fields
      const hasValidFields = currentFields.every(field => 
        field.field_name && field.field_name.trim() !== '' &&
        field.field_description && field.field_description.trim() !== ''
      )
      
      if (!hasValidFields) {
        console.log('Field validation failed - missing required fields')
        isValid = false
      }
      
      console.log('Step 2 validation:', { isValid, hasValidFields, currentFields })
    } else {
      isValid = true // Step 3 doesn't need validation to proceed
    }
    
    if (isValid && currentStep < WIZARD_STEPS.length) {
      setCurrentStep(currentStep + 1)
    } else {
      console.log('Validation failed or at last step', { isValid, currentStep, maxSteps: WIZARD_STEPS.length })
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const onSubmit = async (data: TableFormData) => {
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')
    
    try {
      const response = await fetch('/api/tables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setSubmitStatus('success')
        localStorage.removeItem('schema-wizard-draft')
        
        // Reset form after short delay
        setTimeout(() => {
          reset()
          setCurrentStep(1)
          setSubmitStatus('idle')
        }, 2000)
      } else {
        setSubmitStatus('error')
        setErrorMessage(result.error || 'Failed to save schema')
      }
    } catch (error) {
      setSubmitStatus('error')
      setErrorMessage('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStepProgress = () => (currentStep / WIZARD_STEPS.length) * 100

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <Database className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Table Information</h2>
              <p className="text-muted-foreground">Define the basic properties of your database table</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="table_name">Table Name *</Label>
                <Input
                  id="table_name"
                  {...register('table_name')}
                  placeholder="e.g., users, products, orders"
                  className={errors.table_name ? 'border-destructive' : ''}
                />
                {errors.table_name && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.table_name.message}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="table_description">Table Description *</Label>
                <Input
                  id="table_description"
                  {...register('table_description')}
                  placeholder="Brief description of what this table stores"
                  className={errors.table_description ? 'border-destructive' : ''}
                />
                {errors.table_description && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.table_description.message}
                  </p>
                )}
              </div>
            </div>

            {/* Field Input Method Selection */}
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Choose Field Input Method</h3>
                <p className="text-sm text-muted-foreground">Select how you want to define your table fields</p>
              </div>
              
              <div className="flex justify-center gap-3">
                <Button
                  type="button"
                  variant={inputMode === 'manual' ? 'default' : 'outline'}
                  onClick={switchToManualMode}
                  className="flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Manual Entry
                </Button>
                <Button
                  type="button"
                  variant={inputMode === 'csv' ? 'default' : 'outline'}
                  onClick={() => {
                    setInputMode('csv')
                    setSelectedSchemaForImport(null)
                  }}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  CSV Upload
                </Button>
                <Button
                  type="button"
                  variant={inputMode === 'schema' ? 'default' : 'outline'}
                  onClick={() => {
                    setInputMode('schema')
                    setShowCSVPreview(false)
                    setCsvFields([])
                  }}
                  className="flex items-center gap-2"
                >
                  <Archive className="w-4 h-4" />
                  Stored Schemas
                </Button>
              </div>

              {inputMode === 'csv' && (
                <div className="mt-6">
                  <CSVUploader 
                    onCSVParsed={handleCSVParsed}
                    disabled={isSubmitting}
                  />
                </div>
              )}

              {showCSVPreview && csvFields.length > 0 && (
                <div className="mt-6">
                  <CSVPreview 
                    fields={csvFields}
                    onEditClick={editCSVFields}
                  />
                </div>
              )}

              {inputMode === 'schema' && (
                <div className="mt-6">
                  <SchemaBrowser 
                    onSchemaSelect={handleSchemaSelected}
                    disabled={isSubmitting}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <Table className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Define Fields</h2>
              <p className="text-muted-foreground">Add and configure fields for your table</p>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex gap-2 flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addField()}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Field
                </Button>
                {COMMON_FIELD_TEMPLATES.slice(0, 3).map((template) => (
                  <Button
                    key={template.name}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addField(template)}
                  >
                    + {template.name}
                  </Button>
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                {fields.length}/50 fields
              </div>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {fields.map((field, index) => (
                <Card key={field.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Field {index + 1}</CardTitle>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeField(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Field Name *</Label>
                        <Input
                          {...register(`fields.${index}.field_name` as const)}
                          placeholder="e.g., id, email, created_at"
                          className={errors.fields?.[index]?.field_name ? 'border-destructive' : ''}
                        />
                        {errors.fields?.[index]?.field_name && (
                          <p className="text-sm text-destructive">
                            {errors.fields[index]?.field_name?.message}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Data Type *</Label>
                        <Controller
                          name={`fields.${index}.data_type` as const}
                          control={control}
                          render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {DATA_TYPES.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Field Description *</Label>
                      <Input
                        {...register(`fields.${index}.field_description` as const)}
                        placeholder="Describe what this field contains"
                        className={errors.fields?.[index]?.field_description ? 'border-destructive' : ''}
                      />
                      {errors.fields?.[index]?.field_description && (
                        <p className="text-sm text-destructive">
                          {errors.fields[index]?.field_description?.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`nullable-${index}`}
                          {...register(`fields.${index}.is_nullable` as const)}
                          className="rounded border-input"
                        />
                        <Label htmlFor={`nullable-${index}`} className="text-sm">
                          Nullable
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`primary-${index}`}
                          {...register(`fields.${index}.is_primary_key` as const)}
                          className="rounded border-input"
                        />
                        <Label htmlFor={`primary-${index}`} className="text-sm">
                          Primary Key
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`unique-${index}`}
                          {...register(`fields.${index}.is_unique` as const)}
                          className="rounded border-input"
                        />
                        <Label htmlFor={`unique-${index}`} className="text-sm">
                          Unique
                        </Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <Check className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Review Schema</h2>
              <p className="text-muted-foreground">Review your table schema before saving</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{watchedFields.table_name || 'Untitled Table'}</CardTitle>
                <CardDescription>{watchedFields.table_description || 'No description'}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <h4 className="font-semibold">Fields ({fields.length})</h4>
                  {fields.map((field, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <div>
                        <span className="font-medium">{watchedFields.fields[index]?.field_name || 'Unnamed Field'}</span>
                        <span className="text-muted-foreground ml-2">
                          ({watchedFields.fields[index]?.data_type})
                        </span>
                        {watchedFields.fields[index]?.is_primary_key && (
                          <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                            PK
                          </span>
                        )}
                        {watchedFields.fields[index]?.is_unique && (
                          <span className="ml-2 text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                            UNIQUE
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {watchedFields.fields[index]?.field_description}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {submitStatus === 'success' && (
              <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                <Check className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-green-800 font-medium">Schema saved successfully!</p>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <p className="text-red-800 font-medium">Error: {errorMessage}</p>
              </div>
            )}
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center mb-4">
          <CardTitle className="text-3xl">Database Schema Wizard</CardTitle>
          <div className="text-sm text-muted-foreground">
            Step {currentStep} of {WIZARD_STEPS.length}
          </div>
        </div>
        
        <div className="space-y-4">
          <Progress value={getStepProgress()} className="w-full" />
          <div className="flex justify-between">
            {WIZARD_STEPS.map((step) => (
              <div
                key={step.id}
                className={cn(
                  "flex flex-col items-center text-center flex-1",
                  step.id <= currentStep ? "text-primary" : "text-muted-foreground"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-2",
                    step.id < currentStep && "bg-primary text-primary-foreground",
                    step.id === currentStep && "bg-primary text-primary-foreground",
                    step.id > currentStep && "bg-muted text-muted-foreground"
                  )}
                >
                  {step.id < currentStep ? <Check className="w-4 h-4" /> : step.id}
                </div>
                <div className="text-sm font-medium">{step.title}</div>
                <div className="text-xs text-muted-foreground">{step.description}</div>
              </div>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit as any)}>
          <AnimatePresence mode="wait">
            {renderStepContent()}
          </AnimatePresence>

          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="flex flex-col items-end gap-2">
              {currentStep === 1 && inputMode === 'csv' && !showCSVPreview && (
                <div className="text-right">
                  <p className="text-sm text-destructive">
                    Please upload a CSV file to continue
                  </p>
                </div>
              )}
              
              {currentStep === 1 && inputMode === 'schema' && !selectedSchemaForImport && (
                <div className="text-right">
                  <p className="text-sm text-destructive">
                    Please select a schema to continue
                  </p>
                </div>
              )}
              
              {currentStep === 2 && watchedFields.fields.some(field => 
                !field.field_name?.trim() || !field.field_description?.trim()
              ) && (
                <div className="text-right">
                  <p className="text-sm text-destructive">
                    Please fill in all required fields to continue
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Missing: {watchedFields.fields.map((field, i) => 
                      (!field.field_name?.trim() || !field.field_description?.trim()) ? `Field ${i + 1}` : null
                    ).filter(Boolean).join(', ')}
                  </p>
                </div>
              )}
              
              {currentStep < WIZARD_STEPS.length ? (
                <Button 
                  type="button" 
                  onClick={nextStep}
                  disabled={
                    (currentStep === 1 && inputMode === 'csv' && !showCSVPreview) ||
                    (currentStep === 1 && inputMode === 'schema' && !selectedSchemaForImport) ||
                    (currentStep === 2 && 
                    watchedFields.fields.some(field => 
                      !field.field_name?.trim() || !field.field_description?.trim()
                    ))
                  }
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-w-32"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </div>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Schema
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}