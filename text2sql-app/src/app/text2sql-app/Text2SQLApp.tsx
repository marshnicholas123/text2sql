'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Loader2, Database, Clock, Cpu, Copy, CheckCircle, AlertCircle, Send } from 'lucide-react'
import { 
  text2sqlApi, 
  type Text2SQLRequest, 
  type Text2SQLResponse, 
  type AppConfigurationSummary,
  formatExecutionTime
} from '@/lib/text2sql-api'

export default function Text2SQLApp() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Get configuration from URL params
  const appId = searchParams.get('appId')
  const sqlSyntax = (searchParams.get('sqlSyntax') as 'SQLite' | 'PostgreSQL' | 'MySQL' | 'Microsoft SQL Server') || 'SQLite'
  const llmProvider = (searchParams.get('llmProvider') as 'openai' | 'anthropic') || 'openai'

  // State management
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<Text2SQLResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [appConfig, setAppConfig] = useState<AppConfigurationSummary | null>(null)
  const [copied, setCopied] = useState(false)
  const [queryHistory, setQueryHistory] = useState<Array<{ query: string; result: Text2SQLResponse }>>([])

  // Load app configuration
  useEffect(() => {
    if (appId) {
      loadAppConfiguration(parseInt(appId))
    }
  }, [appId])

  const loadAppConfiguration = async (id: number) => {
    try {
      const response = await text2sqlApi.getConfigurations()
      const config = response.data.find(c => c.id === id)
      if (config) {
        setAppConfig(config)
      } else {
        setError(`App configuration with ID ${id} not found`)
      }
    } catch (error) {
      setError('Failed to load app configuration: ' + (error as Error).message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!query.trim()) {
      setError('Please enter a query')
      return
    }
    
    if (!appId) {
      setError('No app configuration selected')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const request: Text2SQLRequest = {
        query: query.trim(),
        app_configuration_id: parseInt(appId),
        sql_syntax: sqlSyntax,
        llm_provider: llmProvider,
        include_previous_context: false
      }

      const response = await text2sqlApi.convertQuery(request)
      setResult(response)
      
      // Add to history if successful
      if (response.success) {
        setQueryHistory(prev => [...prev, { query: query.trim(), result: response }])
      }
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

  const clearQuery = () => {
    setQuery('')
    setResult(null)
    setError(null)
  }

  const goBack = () => {
    router.back()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={goBack}
                className="hover:bg-gray-100"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Text2SQL Application</h1>
                {appConfig && (
                  <p className="text-gray-600">{appConfig.app_name}</p>
                )}
              </div>
            </div>
            {appConfig && (
              <div className="flex gap-2">
                <Badge variant="secondary">{appConfig.table_count} tables</Badge>
                <Badge variant="secondary">{appConfig.field_count} fields</Badge>
                <Badge variant="outline">{sqlSyntax}</Badge>
                <Badge variant="outline">{llmProvider}</Badge>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Natural Language Query */}
          <div className="space-y-6">
            <div className="sticky top-6">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Natural Language Query</h2>
                </div>
                <p className="text-gray-600 text-sm">
                  Enter your question in plain English. The system will convert it to SQL based on your selected configuration.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g., Show me total revenue for last month by product category"
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-base"
                    disabled={isLoading}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={clearQuery}
                    disabled={isLoading}
                  >
                    Clear
                  </Button>
                  
                  <Button 
                    type="submit" 
                    disabled={isLoading || !query.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Converting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Convert to SQL
                      </>
                    )}
                  </Button>
                </div>
              </form>

              {/* Error Display */}
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">Error</span>
                  </div>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
              )}

            </div>
          </div>

          {/* Right Column - Query Results */}
          <div className="lg:col-span-3 space-y-6">
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
                        <p className="text-blue-800 text-sm leading-relaxed">{result.explanation}</p>
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {!result.success && result.error && (
                    <div>
                      <h4 className="font-medium text-red-900 mb-2">Error Details</h4>
                      <div className="bg-red-50 rounded-lg p-3">
                        <p className="text-red-800 text-sm">{result.error}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Query History */}
            {queryHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Query History</CardTitle>
                  <CardDescription>
                    Recent successful queries in this session
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {queryHistory.slice(-3).reverse().map((item, index) => (
                      <div key={index} className="border-l-2 border-blue-200 pl-4 py-2">
                        <p className="text-sm font-medium text-gray-900 mb-1">{item.query}</p>
                        <div className="text-xs text-gray-500 flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {formatExecutionTime(item.result.execution_time_ms)}
                          <span className="mx-1">•</span>
                          {item.result.llm_provider}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}