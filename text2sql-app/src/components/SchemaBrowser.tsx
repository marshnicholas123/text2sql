'use client'

import React, { useState, useEffect } from 'react'
import { Search, Database, Calendar, Hash, Copy, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Field {
  id: string
  field_name: string
  field_description: string
  data_type: string
  max_length?: number
  is_nullable: boolean
  is_primary_key: boolean
  is_unique: boolean
  default_value?: string
}

interface Schema {
  id: string
  table_name: string
  table_description: string
  createdAt: string
  fields: Field[]
}

interface SchemaBrowserProps {
  onSchemaSelect: (schema: Schema) => void
  disabled?: boolean
}

export default function SchemaBrowser({ onSchemaSelect, disabled }: SchemaBrowserProps) {
  const [schemas, setSchemas] = useState<Schema[]>([])
  const [filteredSchemas, setFilteredSchemas] = useState<Schema[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [selectedSchema, setSelectedSchema] = useState<Schema | null>(null)

  useEffect(() => {
    fetchSchemas()
  }, [])

  useEffect(() => {
    // Filter schemas based on search term
    const filtered = schemas.filter(schema =>
      schema.table_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schema.table_description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredSchemas(filtered)
  }, [schemas, searchTerm])

  const fetchSchemas = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/tables')
      const result = await response.json()

      if (response.ok && result.success) {
        setSchemas(result.data)
        setError('')
      } else {
        setError('Failed to load schemas')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSchemaClick = (schema: Schema) => {
    setSelectedSchema(schema)
  }

  const handleUseSchema = () => {
    if (selectedSchema) {
      onSchemaSelect(selectedSchema)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading schemas...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-600 mb-4">{error}</div>
        <Button onClick={fetchSchemas} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  if (schemas.length === 0) {
    return (
      <div className="text-center p-8">
        <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Schemas Found</h3>
        <p className="text-muted-foreground">
          Create your first schema using manual entry or CSV upload.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search schemas by name or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Schema List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Available Schemas ({filteredSchemas.length})</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredSchemas.map((schema) => (
              <Card
                key={schema.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedSchema?.id === schema.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleSchemaClick(schema)}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{schema.table_name}</CardTitle>
                      <CardDescription className="text-sm">
                        {schema.table_description}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Hash className="w-3 h-3" />
                      {schema.fields.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3 mr-1" />
                    Created {formatDate(schema.createdAt)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Schema Preview */}
        <div className="space-y-4">
          {selectedSchema ? (
            <>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Schema Preview</h3>
                <Button
                  onClick={handleUseSchema}
                  disabled={disabled}
                  className="flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Use This Schema
                </Button>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>{selectedSchema.table_name}</CardTitle>
                  <CardDescription>{selectedSchema.table_description}</CardDescription>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-1" />
                    Created {formatDate(selectedSchema.createdAt)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <h4 className="font-semibold">Fields ({selectedSchema.fields.length})</h4>
                    <div className="space-y-2">
                      {selectedSchema.fields.map((field) => (
                        <div
                          key={field.id}
                          className="flex justify-between items-center p-3 bg-muted rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{field.field_name}</span>
                            <Badge variant="outline" className="text-xs">
                              {field.data_type}
                            </Badge>
                            {field.is_primary_key && (
                              <Badge variant="default" className="text-xs">
                                PK
                              </Badge>
                            )}
                            {field.is_unique && (
                              <Badge variant="secondary" className="text-xs">
                                UNIQUE
                              </Badge>
                            )}
                            {!field.is_nullable && (
                              <Badge variant="destructive" className="text-xs">
                                NOT NULL
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground text-right max-w-48 truncate">
                            {field.field_description}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center p-8 border-2 border-dashed border-muted rounded-lg">
              <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a Schema</h3>
              <p className="text-muted-foreground">
                Click on a schema from the list to preview its structure.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}