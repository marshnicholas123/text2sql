'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Database, Clock, Cpu, Copy, CheckCircle, AlertCircle } from 'lucide-react'
import { 
  text2sqlApi, 
  type Text2SQLRequest, 
  type Text2SQLResponse, 
  type AppConfigurationSummary,
  formatExecutionTime,
  formatTokenUsage
} from '@/lib/text2sql-api'

interface Text2SQLQueryProps {
  className?: string
}

export function Text2SQLQuery({ className = '' }: Text2SQLQueryProps) {
  // State management
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<Text2SQLResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [configurations, setConfigurations] = useState<AppConfigurationSummary[]>([])
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null)
  const [sqlSyntax, setSqlSyntax] = useState<'SQLite' | 'PostgreSQL' | 'MySQL' | 'Microsoft SQL Server'>('SQLite')
  const [llmProvider, setLlmProvider] = useState<'openai' | 'anthropic'>('openai')
  const [sampleQueries, setSampleQueries] = useState<string[]>([])
  const [copied, setCopied] = useState(false)

  // Load configurations and sample queries on mount
  useEffect(() => {
    loadConfigurations()
    loadSampleQueries()
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

  const loadSampleQueries = async () => {
    try {
      const response = await text2sqlApi.getSampleQueries()
      setSampleQueries(response.queries)
    } catch (error) {
      console.error('Failed to load sample queries:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!query.trim()) {
      setError('Please enter a query')
      return
    }
    
    if (!selectedAppId) {
      setError('Please select an app configuration')
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const request: Text2SQLRequest = {
        query: query.trim(),
        app_configuration_id: selectedAppId,
        sql_syntax: sqlSyntax,
        llm_provider: llmProvider,
        include_previous_context: false
      }

      const response = await text2sqlApi.convertQuery(request)
      setResult(response)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const useSampleQuery = (sampleQuery: string) => {
    setQuery(sampleQuery)
    setResult(null)
    setError(null)
  }

  const selectedConfig = configurations.find(c => c.id === selectedAppId)

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Text2SQL Query</h2>
        <p className="text-gray-600 mt-1">
          Convert natural language questions into SQL queries using your configured business context.
        </p>
      </div>

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
              <h4 className="font-medium text-gray-900 mb-2">{selectedConfig.app_name}</h4>
              <p className="text-sm text-gray-600 mb-2">{selectedConfig.business_instructions}</p>
              <div className="flex gap-2">
                <Badge variant="secondary">{selectedConfig.table_count} tables</Badge>
                <Badge variant="secondary">{selectedConfig.field_count} fields</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Query Input */}
      <Card>
        <CardHeader>
          <CardTitle>Natural Language Query</CardTitle>
          <CardDescription>
            Enter your question in plain English. The system will convert it to SQL based on your selected configuration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., Show me total revenue for last month"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={isLoading}
              />
            </div>

            <div className="flex justify-between items-center">
              <div className="flex flex-wrap gap-2">
                {sampleQueries.slice(0, 3).map((sampleQuery, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => useSampleQuery(sampleQuery)}
                    disabled={isLoading}
                  >
                    {sampleQuery}
                  </Button>
                ))}
              </div>

              <Button 
                type="submit" 
                disabled={isLoading || !query.trim() || !selectedAppId}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Converting...
                  </>
                ) : (
                  'Convert to SQL'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Error</span>
            </div>
            <p className="text-red-700 mt-2">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Results Display */}
      {result && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  Query Result
                </CardTitle>
                <CardDescription>
                  {result.success ? 'SQL generated successfully' : 'Failed to generate SQL'}
                </CardDescription>
              </div>
              
              {result.success && result.generated_sql && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(result.generated_sql!)}
                >
                  {copied ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy SQL
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Metadata */}
            {result.success && (
              <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatExecutionTime(result.execution_time_ms)}
                </div>
                <div className="flex items-center gap-1">
                  <Cpu className="h-4 w-4" />
                  {result.llm_provider}
                </div>
                <div className="flex items-center gap-1">
                  <Database className="h-4 w-4" />
                  {result.sql_syntax}
                </div>
                {result.metadata && (
                  <div>
                    {formatTokenUsage(result.metadata)}
                  </div>
                )}
              </div>
            )}

            {/* Original Query */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Original Query</h4>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-700">{result.query}</p>
              </div>
            </div>

            {/* Generated SQL */}
            {result.success && result.generated_sql && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Generated SQL</h4>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                    {result.generated_sql}
                  </pre>
                </div>
              </div>
            )}

            {/* Explanation */}
            {result.success && result.explanation && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Explanation</h4>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-blue-800">{result.explanation}</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {!result.success && result.error && (
              <div>
                <h4 className="font-medium text-red-900 mb-2">Error Details</h4>
                <div className="bg-red-50 rounded-lg p-3">
                  <p className="text-red-800">{result.error}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}