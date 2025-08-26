'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  RefreshCw, 
  Database, 
  FileText, 
  Brain,
  Server
} from 'lucide-react'
import { 
  text2sqlApi, 
  type HealthCheckResponse,
  isLLMConfigured,
  getConfiguredProviders
} from '@/lib/text2sql-api'

export function Text2SQLHealth() {
  const [health, setHealth] = useState<HealthCheckResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkHealth()
  }, [])

  const checkHealth = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const healthResult = await text2sqlApi.checkHealth()
      setHealth(healthResult)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to check health')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case 'unhealthy':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-100 text-green-800">Healthy</Badge>
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
      case 'unhealthy':
        return <Badge className="bg-red-100 text-red-800">Unhealthy</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  if (isLoading && !health) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Checking Service Health...
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <XCircle className="h-5 w-5" />
            Service Unavailable
          </CardTitle>
          <CardDescription className="text-red-600">
            {error}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={checkHealth}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!health) {
    return null
  }

  const configuredProviders = getConfiguredProviders(health)
  const hasLLMProvider = isLLMConfigured(health)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Text2SQL Service
            </CardTitle>
            <CardDescription>
              Backend service status and configuration
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(health.status)}
            <Button
              variant="outline"
              size="sm"
              onClick={checkHealth}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Overall Status */}
        <div className="flex items-center gap-2">
          {getStatusIcon(health.status)}
          <span className="font-medium">
            Service Status: {health.status}
          </span>
        </div>

        {/* Component Status */}
        {health.components && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Components</h4>
            
            {/* Database */}
            {health.components.database && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  <span className="font-medium">Database</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(health.components.database.status)}
                  <span className="text-sm text-gray-600">
                    {health.components.database.message || health.components.database.status}
                  </span>
                </div>
              </div>
            )}

            {/* Template */}
            {health.components.template && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">Template</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(health.components.template.status)}
                  <span className="text-sm text-gray-600">
                    {health.components.template.message || health.components.template.status}
                  </span>
                </div>
              </div>
            )}

            {/* LLM Providers */}
            {health.components.llm && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-4 w-4" />
                  <span className="font-medium">LLM Providers</span>
                </div>
                
                {health.components.llm.providers && Object.keys(health.components.llm.providers).length > 0 ? (
                  <div className="space-y-2 ml-6">
                    {Object.entries(health.components.llm.providers).map(([provider, status]) => (
                      <div key={provider} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{provider}</span>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(status.status)}
                          <span className="text-xs text-gray-500">
                            {status.configured ? 'Configured' : 'Not configured'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="ml-6 text-sm text-gray-500">
                    No LLM providers available
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Configuration Summary */}
        <div className="pt-3 border-t border-gray-200">
          <div className="flex flex-wrap gap-2 text-sm">
            {hasLLMProvider ? (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {configuredProviders.length} LLM provider(s) ready
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                No LLM providers configured
              </Badge>
            )}
          </div>
          
          {!hasLLMProvider && (
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Setup Required:</strong> Add your LLM API key to the backend .env file:
              </p>
              <ul className="mt-1 text-xs text-yellow-700 ml-4">
                <li>• OPENAI_API_KEY=your_openai_key_here</li>
                <li>• ANTHROPIC_API_KEY=your_anthropic_key_here</li>
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}