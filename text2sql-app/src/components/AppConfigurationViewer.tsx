'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Settings, Database, FileText, Calendar, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AppConfiguration {
  id: number
  app_name: string
  business_instructions: string
  createdAt: string
  updatedAt: string
  tables: Array<{
    id: number
    table: {
      id: number
      table_name: string
      table_description: string
      fields: Array<{
        field_name: string
        field_description: string
        data_type: string
      }>
    }
  }>
}

export default function AppConfigurationViewer() {
  const [appConfigurations, setAppConfigurations] = useState<AppConfiguration[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedApps, setExpandedApps] = useState<Set<number>>(new Set())
  const [expandedInstructions, setExpandedInstructions] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetchAppConfigurations()
  }, [])

  const fetchAppConfigurations = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/app-configurations')
      if (response.ok) {
        const result = await response.json()
        setAppConfigurations(result.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch app configurations:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleAppExpanded = (appId: number) => {
    const newExpanded = new Set(expandedApps)
    if (newExpanded.has(appId)) {
      newExpanded.delete(appId)
    } else {
      newExpanded.add(appId)
    }
    setExpandedApps(newExpanded)
  }

  const toggleInstructionsExpanded = (appId: number) => {
    const newExpanded = new Set(expandedInstructions)
    if (newExpanded.has(appId)) {
      newExpanded.delete(appId)
    } else {
      newExpanded.add(appId)
    }
    setExpandedInstructions(newExpanded)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-muted rounded w-full mb-2"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (appConfigurations.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Text2SQL Apps Yet</h3>
            <p className="text-muted-foreground">
              Create your first text2sql app configuration by setting up table schemas and business context.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {appConfigurations.map((app) => {
        const isExpanded = expandedApps.has(app.id)
        const isInstructionsExpanded = expandedInstructions.has(app.id)
        
        return (
          <Card key={app.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Settings className="w-5 h-5 text-primary" />
                    {app.app_name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1">
                      <Database className="w-4 h-4" />
                      {app.tables.length} table{app.tables.length !== 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Created {formatDate(app.createdAt)}
                    </span>
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleAppExpanded(app.id)}
                  className="flex items-center gap-1"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Collapse
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Expand
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>

            <CardContent className={cn("transition-all duration-200", !isExpanded && "pb-6")}>
              {/* Business Instructions Preview */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    Business Instructions
                  </h4>
                  {app.business_instructions.length > 200 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleInstructionsExpanded(app.id)}
                      className="text-xs"
                    >
                      {isInstructionsExpanded ? 'Show less' : 'Show more'}
                    </Button>
                  )}
                </div>
                <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded whitespace-pre-wrap">
                  {isInstructionsExpanded || app.business_instructions.length <= 200
                    ? app.business_instructions
                    : truncateText(app.business_instructions, 200)
                  }
                </div>
              </div>

              {/* Tables Summary */}
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-1">
                  <Database className="w-4 h-4" />
                  Configured Tables
                </h4>
                <div className="flex flex-wrap gap-2">
                  {app.tables.map((tableRel) => (
                    <div
                      key={tableRel.id}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                    >
                      {tableRel.table.table_name}
                      <span className="text-primary/70">
                        ({tableRel.table.fields.length} fields)
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="mt-6 space-y-4 border-t pt-4">
                  <h4 className="font-medium">Table Details</h4>
                  {app.tables.map((tableRel) => (
                    <Card key={tableRel.id} className="border-dashed">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">{tableRel.table.table_name}</CardTitle>
                        <CardDescription>{tableRel.table.table_description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {tableRel.table.fields.map((field, index) => (
                            <div key={index} className="text-sm p-2 bg-muted/30 rounded">
                              <span className="font-medium">{field.field_name}</span>
                              <span className="text-muted-foreground ml-1">({field.data_type})</span>
                              <div className="text-xs text-muted-foreground mt-1">
                                {field.field_description}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}