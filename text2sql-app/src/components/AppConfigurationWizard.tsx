'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle,
  Database,
  FileText,
  Settings,
  RefreshCw
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const appConfigurationSchema = z.object({
  app_name: z.string().min(1, 'App name is required'),
  business_instructions: z.string().min(10, 'Business instructions must be at least 10 characters'),
  tableIds: z.array(z.number()).min(1, 'At least one table must be selected'),
})

type AppConfigurationFormData = z.infer<typeof appConfigurationSchema>

interface Table {
  id: number
  table_name: string
  table_description: string
  fields: Array<{
    field_name: string
    field_description: string
    data_type: string
  }>
  createdAt: string
}

const WIZARD_STEPS = [
  { id: 1, title: 'Load Tables', description: 'Refresh available tables' },
  { id: 2, title: 'App Name', description: 'Name your text2sql app' },
  { id: 3, title: 'Select Tables', description: 'Choose relevant schemas' },
  { id: 4, title: 'Instructions', description: 'Add business context' },
]

export default function AppConfigurationWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [availableTables, setAvailableTables] = useState<Table[]>([])
  const [isLoadingTables, setIsLoadingTables] = useState(false)
  const [tablesLoaded, setTablesLoaded] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')

  const { register, handleSubmit, formState: { errors }, reset, watch, trigger, setValue } = useForm<AppConfigurationFormData>({
    resolver: zodResolver(appConfigurationSchema),
    defaultValues: {
      app_name: '',
      business_instructions: '',
      tableIds: []
    },
    mode: 'onChange'
  })

  const watchedFields = watch()

  // Load tables on component mount
  useEffect(() => {
    loadTables()
  }, [])

  const loadTables = async () => {
    try {
      setIsLoadingTables(true)
      const response = await fetch('/api/tables')
      if (response.ok) {
        const result = await response.json()
        setAvailableTables(result.data || [])
        setTablesLoaded(true)
      }
    } catch (err) {
      console.error('Failed to fetch tables:', err)
    } finally {
      setIsLoadingTables(false)
    }
  }

  const nextStep = async () => {
    let isValid = false
    
    if (currentStep === 1) {
      // Step 1: Just check if tables are loaded
      isValid = tablesLoaded && availableTables.length > 0
    } else if (currentStep === 2) {
      // Step 2: Validate app name
      isValid = await trigger(['app_name'])
    } else if (currentStep === 3) {
      // Step 3: Validate table selection
      isValid = await trigger(['tableIds'])
      if (!watchedFields.tableIds || watchedFields.tableIds.length === 0) {
        isValid = false
      }
    } else if (currentStep === 4) {
      // Step 4: Validate business instructions
      isValid = await trigger(['business_instructions'])
    } else {
      isValid = true
    }
    
    if (isValid && currentStep < WIZARD_STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const toggleTable = (tableId: number) => {
    const currentTableIds = watchedFields.tableIds || []
    const newTableIds = currentTableIds.includes(tableId)
      ? currentTableIds.filter(id => id !== tableId)
      : [...currentTableIds, tableId]
    
    setValue('tableIds', newTableIds)
    trigger('tableIds')
  }

  const onSubmit = async (data: AppConfigurationFormData) => {
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')
    
    try {
      const response = await fetch('/api/app-configurations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setSubmitStatus('success')
        
        // Reset form after short delay
        setTimeout(() => {
          reset()
          setCurrentStep(1)
          setSubmitStatus('idle')
          setTablesLoaded(false)
        }, 2000)
      } else {
        setSubmitStatus('error')
        setErrorMessage(result.error || 'Failed to save app configuration')
      }
    } catch (err) {
      setSubmitStatus('error')
      setErrorMessage('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedTables = availableTables.filter(table => 
    watchedFields.tableIds?.includes(table.id)
  )

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
              <h2 className="text-2xl font-bold">Load Individual Tables</h2>
              <p className="text-muted-foreground">Load your available table schemas to configure your text2sql app</p>
            </div>

            <Card>
              <CardContent className="py-8">
                <div className="text-center space-y-4">
                  {isLoadingTables ? (
                    <>
                      <div className="flex justify-center">
                        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                      </div>
                      <p className="text-muted-foreground">Loading your table schemas...</p>
                    </>
                  ) : tablesLoaded ? (
                    <>
                      <Check className="w-12 h-12 text-green-600 mx-auto" />
                      <h3 className="text-lg font-semibold text-green-800">
                        {availableTables.length} Table{availableTables.length !== 1 ? 's' : ''} Loaded
                      </h3>
                      <p className="text-muted-foreground">
                        Your table schemas are ready for configuration
                      </p>
                      {availableTables.length === 0 && (
                        <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                          <p className="text-orange-800">
                            No table schemas found. Please create some table schemas first.
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto" />
                      <h3 className="text-lg font-semibold mb-2">Ready to Load</h3>
                      <p className="text-muted-foreground">
                        Click the refresh button to load your available table schemas
                      </p>
                    </>
                  )}
                  
                  <Button
                    type="button"
                    onClick={loadTables}
                    disabled={isLoadingTables}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={cn("w-4 h-4", isLoadingTables && "animate-spin")} />
                    {isLoadingTables ? 'Loading...' : 'Refresh Tables'}
                  </Button>
                </div>
              </CardContent>
            </Card>
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
              <Settings className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold">App Name</h2>
              <p className="text-muted-foreground">Give your text2sql app a descriptive name</p>
            </div>

            <div className="max-w-md mx-auto space-y-4">
              <div className="space-y-2">
                <Label htmlFor="app_name">Application Name *</Label>
                <Input
                  id="app_name"
                  {...register('app_name')}
                  placeholder="e.g., E-commerce Platform, CRM System, Blog Application"
                  className={errors.app_name ? 'border-destructive' : ''}
                />
                {errors.app_name && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.app_name.message}
                  </p>
                )}
              </div>
              
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Naming Guidelines</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Use a descriptive name that reflects your business domain</li>
                  <li>• Keep it concise but meaningful</li>
                  <li>• This name will be used to identify your text2sql configuration</li>
                </ul>
              </div>
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
              <Database className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Select Table Schemas</h2>
              <p className="text-muted-foreground">Choose which table schemas are relevant for your app</p>
            </div>

            {availableTables.length === 0 ? (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Tables Available</h3>
                    <p className="text-muted-foreground">
                      Go back to step 1 and refresh your tables, or create some table schemas first.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {availableTables.map((table) => (
                  <Card
                    key={table.id}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      watchedFields.tableIds?.includes(table.id)
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50"
                    )}
                    onClick={() => toggleTable(table.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={watchedFields.tableIds?.includes(table.id) || false}
                          onChange={() => toggleTable(table.id)}
                          className="mt-1 rounded border-input"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{table.table_name}</h4>
                          <p className="text-muted-foreground text-sm mb-2">
                            {table.table_description}
                          </p>
                          <div className="text-xs text-muted-foreground">
                            {table.fields.length} field{table.fields.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {watchedFields.tableIds && watchedFields.tableIds.length > 0 && (
              <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                <p className="text-sm text-primary">
                  {watchedFields.tableIds.length} table{watchedFields.tableIds.length !== 1 ? 's' : ''} selected for your app
                </p>
              </div>
            )}

            {errors.tableIds && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                At least one table must be selected
              </p>
            )}
          </motion.div>
        )

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <FileText className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Business Instructions</h2>
              <p className="text-muted-foreground">
                Provide business context that will guide the text-to-SQL conversion for your app
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="business_instructions">Business Instructions *</Label>
                <textarea
                  id="business_instructions"
                  {...register('business_instructions')}
                  placeholder={`Describe your business domain and provide context for SQL generation. Include:

• What is the main purpose of this application?
• Key business entities and their relationships
• Important business rules or constraints
• Common query patterns or questions users might ask
• Any specific terminology or naming conventions
• Time-based or geographical context

Example for E-commerce:
"This is an e-commerce platform that manages products, customers, orders, and inventory. Products belong to categories and can have multiple variants. Customers place orders containing multiple items. Key business rules: Orders must have valid payment before processing, inventory should be checked before confirming orders. Common queries involve sales analytics, inventory levels, customer behavior analysis, and order status tracking."`}
                  className={cn(
                    "min-h-[250px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y",
                    errors.business_instructions ? 'border-destructive' : ''
                  )}
                />
                {errors.business_instructions && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.business_instructions.message}
                  </p>
                )}
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Selected Tables for {watchedFields.app_name || 'Your App'}</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTables.map((table) => (
                    <div
                      key={table.id}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                    >
                      {table.table_name}
                      <span className="text-primary/70">
                        ({table.fields.length} fields)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {submitStatus === 'success' && (
              <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                <Check className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-green-800 font-medium">App configuration saved successfully!</p>
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
    <Card className="shadow-card border-0 overflow-hidden">
      <div className="bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <CardHeader className="pb-8">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-primary-foreground" />
                </div>
                Text2SQL App Setup
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Configure your text-to-SQL application with table schemas and business context
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Step {currentStep} of {WIZARD_STEPS.length}</span>
            </div>
          </div>
          
          {/* Progress Indicator */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              {WIZARD_STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 border-2",
                      currentStep >= step.id 
                        ? "bg-primary text-primary-foreground border-primary shadow-glow" 
                        : "bg-background text-muted-foreground border-border hover:border-primary/50"
                    )}>
                      {currentStep > step.id ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        step.id
                      )}
                    </div>
                    <div className="mt-3 text-center">
                      <div className={cn(
                        "font-medium text-sm transition-colors",
                        currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {step.title}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 max-w-20">
                        {step.description}
                      </div>
                    </div>
                  </div>
                  
                  {index < WIZARD_STEPS.length - 1 && (
                    <div className="flex-1 mx-4 mt-[-20px]">
                      <div className={cn(
                        "h-0.5 w-full transition-all duration-500",
                        currentStep > step.id 
                          ? "bg-gradient-to-r from-primary to-primary/60" 
                          : "bg-border"
                      )} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardHeader>
      </div>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            {renderStepContent()}
          </AnimatePresence>

          <div className="flex justify-between items-center mt-8 pt-6 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="gap-2 hover:shadow-card-hover transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex flex-col items-end gap-2">
              {currentStep === 1 && (!tablesLoaded || availableTables.length === 0) && (
                <div className="text-right">
                  <p className="text-sm text-destructive">
                    Please load tables to continue
                  </p>
                </div>
              )}
              
              {currentStep === 2 && !watchedFields.app_name?.trim() && (
                <div className="text-right">
                  <p className="text-sm text-destructive">
                    Please enter an app name to continue
                  </p>
                </div>
              )}
              
              {currentStep === 3 && (!watchedFields.tableIds || watchedFields.tableIds.length === 0) && (
                <div className="text-right">
                  <p className="text-sm text-destructive">
                    Please select at least one table to continue
                  </p>
                </div>
              )}

              {currentStep === 4 && !watchedFields.business_instructions?.trim() && (
                <div className="text-right">
                  <p className="text-sm text-destructive">
                    Please provide business instructions to continue
                  </p>
                </div>
              )}
              
              {currentStep < WIZARD_STEPS.length ? (
                <Button 
                  type="button" 
                  onClick={nextStep}
                  disabled={
                    (currentStep === 1 && (!tablesLoaded || availableTables.length === 0)) ||
                    (currentStep === 2 && !watchedFields.app_name?.trim()) ||
                    (currentStep === 3 && (!watchedFields.tableIds || watchedFields.tableIds.length === 0)) ||
                    (currentStep === 4 && !watchedFields.business_instructions?.trim())
                  }
                  className="gap-2 hover:shadow-card-hover transition-all"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-w-32 gap-2 hover:shadow-card-hover transition-all gradient-primary text-primary-foreground border-0"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </div>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Save App Configuration
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