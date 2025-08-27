'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Database, ExternalLink } from 'lucide-react'
import { 
  text2sqlApi, 
  type AppConfigurationSummary
} from '@/lib/text2sql-api'

interface Text2SQLQueryProps {
  className?: string
}

export function Text2SQLQuery({ className = '' }: Text2SQLQueryProps) {
  // State management
  const [configurations, setConfigurations] = useState<AppConfigurationSummary[]>([])
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null)
  const [sqlSyntax, setSqlSyntax] = useState<'SQLite' | 'PostgreSQL' | 'MySQL' | 'Microsoft SQL Server'>('SQLite')
  const [llmProvider, setLlmProvider] = useState<'openai' | 'anthropic'>('openai')

  // Load configurations on mount
  useEffect(() => {
    loadConfigurations()
  }, [])

  const loadConfigurations = async () => {
    try {
      const response = await text2sqlApi.getConfigurations()
      setConfigurations(response.data)
      
      // Auto-select first configuration if available
      if (response.data.length > 0 && !selectedAppId) {
        setSelectedAppId(response.data[0].id)
      }
    } catch (error) {
      console.error('Failed to load configurations:', error)
    }
  }

  const handleLoadApp = () => {
    if (!selectedAppId) {
      return
    }
    
    // Navigate to the Text2SQL app page with configuration
    const params = new URLSearchParams({
      appId: selectedAppId.toString(),
      sqlSyntax,
      llmProvider
    })
    window.open(`/text2sql-app?${params.toString()}`, '_blank')
  }

  const selectedConfig = configurations.find(c => c.id === selectedAppId)

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Configuration Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Configuration
          </CardTitle>
          <CardDescription>
            Select the app configuration that provides context for your queries.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                App Configuration
              </label>
              <Select value={selectedAppId?.toString()} onValueChange={(value) => setSelectedAppId(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select configuration" />
                </SelectTrigger>
                <SelectContent>
                  {configurations.map(config => (
                    <SelectItem key={config.id} value={config.id.toString()}>
                      {config.app_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SQL Syntax
              </label>
              <Select value={sqlSyntax} onValueChange={(value: any) => setSqlSyntax(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SQLite">SQLite</SelectItem>
                  <SelectItem value="PostgreSQL">PostgreSQL</SelectItem>
                  <SelectItem value="MySQL">MySQL</SelectItem>
                  <SelectItem value="Microsoft SQL Server">SQL Server</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LLM Provider
              </label>
              <Select value={llmProvider} onValueChange={(value: any) => setLlmProvider(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedConfig && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{selectedConfig.app_name}</h4>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{selectedConfig.table_count} tables</Badge>
                    <Badge variant="secondary">{selectedConfig.field_count} fields</Badge>
                  </div>
                </div>
                <Button 
                  onClick={handleLoadApp}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Load App
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}