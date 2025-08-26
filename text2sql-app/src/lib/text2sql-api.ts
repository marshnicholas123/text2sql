/**
 * Text2SQL API Client
 * Service for communicating with the FastAPI backend
 */

export interface Text2SQLRequest {
  query: string
  app_configuration_id: number
  sql_syntax?: 'SQLite' | 'PostgreSQL' | 'MySQL' | 'Microsoft SQL Server'
  include_previous_context?: boolean
  llm_provider?: 'openai' | 'anthropic'
}

export interface Text2SQLResponse {
  success: boolean
  query: string
  generated_sql?: string
  explanation?: string
  execution_time_ms?: number
  llm_provider?: string
  sql_syntax?: string
  error?: string
  metadata?: {
    app_config_id: number
    app_name: string
    table_count: number
    [key: string]: any
  }
}

export interface AppConfigurationSummary {
  id: number
  app_name: string
  business_instructions: string
  table_count: number
  field_count: number
  created_at: string
  updated_at: string
}

export interface AppConfigurationDetail {
  id: number
  app_name: string
  business_instructions: string
  tables: {
    table_name: string
    table_description: string
    fields: any[]
  }[]
  created_at: string
  updated_at: string
}

export interface HealthCheckResponse {
  service: string
  status: string
  timestamp: string
  components?: {
    database?: { status: string; message?: string }
    template?: { status: string; message?: string; details?: any }
    llm?: {
      providers?: {
        [provider: string]: {
          configured: boolean
          status: string
        }
      }
    }
  }
}

class Text2SQLApiClient {
  private baseUrl: string
  
  constructor(baseUrl: string = 'http://localhost:8000') {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`API request failed: ${response.status} ${errorData}`)
    }

    return response.json()
  }

  /**
   * Convert natural language query to SQL
   */
  async convertQuery(request: Text2SQLRequest): Promise<Text2SQLResponse> {
    return this.request<Text2SQLResponse>('/api/v1/text2sql/query', {
      method: 'POST',
      body: JSON.stringify({
        ...request,
        sql_syntax: request.sql_syntax || 'SQLite',
        include_previous_context: request.include_previous_context || false,
        llm_provider: request.llm_provider || 'openai',
      }),
    })
  }

  /**
   * Get list of all app configurations
   */
  async getConfigurations(): Promise<{
    success: boolean
    data: AppConfigurationSummary[]
    count: number
  }> {
    return this.request('/api/v1/text2sql/configurations')
  }

  /**
   * Get detailed app configuration
   */
  async getConfigurationDetail(appId: number): Promise<{
    success: boolean
    data?: AppConfigurationDetail
    error?: string
  }> {
    return this.request(`/api/v1/text2sql/configurations/${appId}`)
  }

  /**
   * Get sample test data
   */
  async getTestData(sqlSyntax: string = 'SQLite'): Promise<{
    success: boolean
    sql_syntax: string
    metric_definitions: { raw: string; description: string }
    semantic_nouns: string[]
    table_schemas: string
    business_instructions: string
    sample_previous_context: string
  }> {
    return this.request(`/api/v1/text2sql/test-data?sql_syntax=${sqlSyntax}`)
  }

  /**
   * Get sample queries for testing
   */
  async getSampleQueries(): Promise<{
    success: boolean
    queries: string[]
    count: number
    description: string
  }> {
    return this.request('/api/v1/text2sql/sample-queries')
  }

  /**
   * Preview template with data substitution
   */
  async previewTemplate(options: {
    appId?: number
    sqlSyntax?: string
    useSampleData?: boolean
  } = {}): Promise<{
    success: boolean
    preview: string
    template_vars: { [key: string]: number }
    template_length: number
    app_id?: number
    using_sample_data: boolean
  }> {
    const params = new URLSearchParams()
    if (options.appId) params.append('app_id', options.appId.toString())
    if (options.sqlSyntax) params.append('sql_syntax', options.sqlSyntax)
    if (options.useSampleData) params.append('use_sample_data', 'true')

    return this.request(`/api/v1/text2sql/template/preview?${params}`)
  }

  /**
   * Check health of Text2SQL service
   */
  async checkHealth(): Promise<HealthCheckResponse> {
    return this.request('/api/v1/text2sql/health')
  }

  /**
   * Check basic server health
   */
  async checkServerHealth(): Promise<{ status: string; service: string }> {
    return this.request('/health')
  }
}

// Export singleton instance
export const text2sqlApi = new Text2SQLApiClient()

// Export class for custom instances
export { Text2SQLApiClient }

// Utility functions
export function isLLMConfigured(health: HealthCheckResponse): boolean {
  if (!health.components?.llm?.providers) return false
  
  return Object.values(health.components.llm.providers).some(
    provider => provider.configured && provider.status === 'ready'
  )
}

export function getConfiguredProviders(health: HealthCheckResponse): string[] {
  if (!health.components?.llm?.providers) return []
  
  return Object.entries(health.components.llm.providers)
    .filter(([_, provider]) => provider.configured && provider.status === 'ready')
    .map(([name, _]) => name)
}

export function formatExecutionTime(ms?: number): string {
  if (!ms) return 'N/A'
  
  if (ms < 1000) {
    return `${Math.round(ms)}ms`
  } else {
    return `${(ms / 1000).toFixed(1)}s`
  }
}

export function formatTokenUsage(metadata?: { tokens_used?: number }): string {
  if (!metadata?.tokens_used) return 'N/A'
  
  return `${metadata.tokens_used.toLocaleString()} tokens`
}