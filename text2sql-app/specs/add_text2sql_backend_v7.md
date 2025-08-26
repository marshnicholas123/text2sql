# Text2SQL FastAPI Backend Implementation - Version 7

## Overview

This specification describes the implementation of a FastAPI backend service that provides text-to-SQL conversion capabilities for the existing Text2SQL application. The service integrates with the current Next.js frontend and leverages the configured app configurations to provide context-aware SQL generation.

## Architecture Goals

### Primary Objectives
- **Seamless Integration**: Work with existing Next.js frontend and SQLite database
- **Multi-LLM Support**: Support OpenAI and Anthropic API providers
- **Template-Based Processing**: Use the existing `text2sql_prompt.txt` template
- **Context-Aware Generation**: Leverage app configurations for business context
- **Production Ready**: Robust error handling, health checks, and monitoring

### Key Features
- RESTful API with OpenAPI documentation
- Dynamic prompt template processing
- Database integration with existing schema
- Comprehensive test data generation
- Health monitoring and diagnostics
- CORS support for frontend integration

## Technical Specifications

### Technology Stack
- **Framework**: FastAPI 0.115.0 with Pydantic 2.9.0
- **ASGI Server**: Uvicorn with auto-reload for development
- **LLM Integration**: OpenAI and Anthropic client libraries
- **Database**: Direct SQLite integration (sharing with Prisma)
- **Environment Management**: python-dotenv for configuration

### API Design Principles
- **RESTful Routes**: Consistent URL patterns and HTTP methods
- **Pydantic Validation**: Strong typing for requests and responses
- **Error Handling**: Structured error responses with appropriate HTTP status codes
- **Documentation**: Auto-generated OpenAPI specs with examples

## Implementation Details

### 1. Project Structure

```
backend/
├── main.py                 # FastAPI application entry point
├── requirements.txt        # Python dependencies
├── .env.example           # Environment configuration template
├── README.md              # Setup and usage documentation
│
├── models/                # Pydantic request/response models
│   ├── request.py         # Input validation schemas
│   ├── response.py        # Output response schemas
│   └── __init__.py        # Model exports
│
├── routers/               # API route handlers
│   ├── text2sql.py        # Main text2sql endpoints
│   └── __init__.py
│
├── services/              # Core business logic services
│   ├── db_service.py      # Database operations
│   ├── template_service.py # Template processing
│   ├── llm_service.py     # LLM API integration
│   └── __init__.py        # Service exports
│
└── utils/                 # Utilities and helpers
    ├── test_data.py       # Test data generation
    └── __init__.py
```

### 2. Core Services Architecture

#### DatabaseService (`services/db_service.py`)
**Purpose**: Interface with the existing SQLite database

**Key Methods**:
- `get_all_app_configurations()`: List all app configs with summary info
- `get_app_configuration_detail(app_id)`: Get detailed config with tables/fields
- `get_table_schemas_for_app(app_id)`: Generate formatted schema strings
- `test_connection()`: Database health check

**Database Integration**:
- Uses raw SQLite connections with row factory for dict-like access
- Joins across `app_configurations`, `app_configuration_tables`, `tables`, and `fields`
- Generates human-readable schema descriptions for prompts
- Maintains compatibility with Prisma-managed database

#### TemplateService (`services/template_service.py`)
**Purpose**: Process the `text2sql_prompt.txt` template with dynamic variables

**Key Methods**:
- `substitute_variables(variables)`: Replace template placeholders
- `build_prompt()`: Create complete prompt with all variables
- `validate_template()`: Verify template structure and variables
- `get_template_variables()`: Extract all `{{VARIABLE}}` placeholders

**Template Processing**:
- Loads `text2sql_prompt.txt` from project root
- Supports variables: `SQL_SYNTAX`, `METRIC_DEFINITIONS`, `SEMANTIC_NOUNS`, `TABLE_SCHEMAS`, `PREVIOUS_CONTEXT`, `BUSINESS_INSTRUCTIONS`
- Validates expected variables are present
- Provides preview functionality with sample data

#### LLMService (`services/llm_service.py`)
**Purpose**: Multi-provider LLM integration with error handling

**Provider Architecture**:
- Abstract `BaseLLMProvider` class for consistent interface
- `OpenAIProvider`: GPT-4 and GPT-3.5-turbo support
- `AnthropicProvider`: Claude-3 model support
- Configurable models and parameters per provider

**Key Features**:
- Low temperature (0.1) for consistent SQL generation
- Token usage tracking and execution time monitoring
- Response parsing to extract SQL queries and explanations
- Comprehensive error handling and service health checks

### 3. API Endpoint Specifications

#### Core Text2SQL Endpoints

**`POST /api/v1/text2sql/query`**
- **Purpose**: Convert natural language to SQL query
- **Request Model**: `Text2SQLRequest`
  ```json
  {
    "query": "Show me total revenue for last month",
    "app_configuration_id": 1,
    "sql_syntax": "SQLite|PostgreSQL|MySQL|Microsoft SQL Server",
    "include_previous_context": false,
    "llm_provider": "openai|anthropic"
  }
  ```
- **Response Model**: `Text2SQLResponse`
  ```json
  {
    "success": true,
    "query": "Show me total revenue for last month",
    "generated_sql": "SELECT SUM(total_amount) FROM orders...",
    "explanation": "This query calculates...",
    "execution_time_ms": 1250.5,
    "llm_provider": "openai",
    "sql_syntax": "SQLite",
    "metadata": {...}
  }
  ```

**`GET /api/v1/text2sql/configurations`**
- **Purpose**: List all available app configurations
- **Response**: Array of configuration summaries with table/field counts

**`GET /api/v1/text2sql/configurations/{app_id}`**
- **Purpose**: Get detailed configuration with full table schemas
- **Response**: Complete configuration with tables and field definitions

#### Development & Testing Endpoints

**`GET /api/v1/text2sql/test-data`**
- **Purpose**: Generate comprehensive sample data for all template variables
- **Query Parameters**: `sql_syntax` (default: SQLite)
- **Response**: All template variables with realistic business data

**`GET /api/v1/text2sql/template/preview`**
- **Purpose**: Preview complete prompt with data substitution
- **Query Parameters**: `app_id`, `sql_syntax`, `use_sample_data`
- **Response**: Full prompt template with variable substitution

**`GET /api/v1/text2sql/sample-queries`**
- **Purpose**: Get sample natural language queries for testing
- **Response**: Array of realistic business questions

**`GET /api/v1/text2sql/health`**
- **Purpose**: Comprehensive health check for all services
- **Response**: Status of database, template service, and LLM providers

### 4. Data Models and Validation

#### Request Models (`models/request.py`)
- `Text2SQLRequest`: Main query conversion request
- `ConfigurationTestRequest`: Batch testing request
- `SQLSyntaxEnum`: Supported SQL dialects
- `LLMProviderEnum`: Available LLM providers

#### Response Models (`models/response.py`)
- `Text2SQLResponse`: Query conversion results
- `AppConfigurationSummary`: Configuration list item
- `AppConfigurationDetail`: Full configuration details
- `ErrorResponse`: Standardized error format

### 5. Test Data Generation

#### TestDataGenerator (`utils/test_data.py`)
**Comprehensive Sample Data**:

**Metric Definitions**: 10 key business metrics including:
- Revenue, Active Customers, Average Order Value
- Customer Lifetime Value, Conversion Rate, Churn Rate
- Each with detailed calculation formulas

**Semantic Nouns**: 75+ domain-specific terms for e-commerce:
- Customer, order, product, category terminology
- Revenue, marketing, fulfillment concepts
- Grouped by business domain

**Table Schemas**: 4 core tables with complete field definitions:
- `customers`: Demographics and account information
- `products`: Catalog with pricing and inventory
- `orders`: Transaction details and status
- `order_items`: Line item details

**Business Instructions**: Comprehensive e-commerce context:
- Business model and operations description
- Key business rules and constraints
- Common query patterns and terminology
- Temporal and geographical context

**Previous Context**: Sample conversation history for context-aware queries

### 6. Environment Configuration

#### Required Environment Variables
```env
# LLM API Keys (at least one required)
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Optional Configuration
PORT=8000
DATABASE_URL=../prisma/dev.db
OPENAI_MODEL=gpt-4
ANTHROPIC_MODEL=claude-3-sonnet-20240229
```

#### CORS Configuration
- Default allowed origins: `http://localhost:3000`, `http://127.0.0.1:3000`
- Configurable via `ALLOWED_ORIGINS` environment variable
- Supports credentials and all HTTP methods

### 7. Error Handling Strategy

#### Error Categories
- **Validation Errors** (400): Pydantic validation failures with detailed field errors
- **Not Found Errors** (404): Invalid app configuration IDs
- **Service Errors** (503): LLM API failures, rate limiting, or connectivity issues
- **Server Errors** (500): Database errors, template processing failures

#### Error Response Format
```json
{
  "success": false,
  "error": "Human-readable error message",
  "detail": "Technical details when appropriate",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 8. Integration Specifications

#### Database Integration
- **Connection**: Direct SQLite connection to `prisma/dev.db`
- **Schema Compatibility**: Works with existing Prisma-managed schema
- **Read-Only Operations**: No database modifications, only queries
- **Connection Management**: Connection pooling with proper cleanup

#### Frontend Integration
- **API Base URL**: `http://localhost:8000` for development
- **Authentication**: None required (internal service)
- **Request Format**: JSON with standard HTTP headers
- **Response Format**: Consistent JSON with success/error indicators

#### LLM Provider Integration
- **OpenAI**: Chat Completions API with system/user messages
- **Anthropic**: Messages API with system prompts
- **Fallback Strategy**: Configurable primary/secondary providers
- **Rate Limiting**: Built-in retry logic and error handling

## Development Workflow

### Setup Process
1. **Environment Preparation**
   ```bash
   cd text2sql-app/backend
   pip install -r requirements.txt
   cp .env.example .env
   # Configure API keys in .env
   ```

2. **Service Startup**
   ```bash
   python main.py
   # Or: uvicorn main:app --reload --port 8000
   ```

3. **Health Verification**
   ```bash
   curl http://localhost:8000/api/v1/text2sql/health
   ```

### Testing Strategy

#### Manual Testing
- **Health Endpoint**: Verify all services are configured
- **Test Data Endpoint**: Validate sample data generation
- **Template Preview**: Check prompt template processing
- **Query Conversion**: Test with sample queries

#### Integration Testing
- **Database Connectivity**: Test with actual app configurations
- **LLM Integration**: Verify responses from both providers
- **Error Scenarios**: Test invalid inputs and service failures

### Monitoring and Debugging

#### Health Monitoring
- **Service Health**: Overall service status
- **Component Health**: Individual service status (DB, template, LLM)
- **Provider Status**: LLM provider configuration and availability

#### Logging Strategy
- **Request Logging**: API calls with execution times
- **Error Logging**: Detailed error information without sensitive data
- **LLM Usage Logging**: Token usage and costs for monitoring

## Production Considerations

### Performance Optimization
- **Connection Pooling**: Efficient database connection management
- **Response Caching**: Cache frequently accessed configurations
- **Async Operations**: Non-blocking LLM API calls
- **Token Management**: Monitor and optimize prompt token usage

### Security Measures
- **Environment Variables**: Secure API key management
- **Input Validation**: Comprehensive request validation with Pydantic
- **Error Handling**: No sensitive information exposure in error messages
- **CORS Configuration**: Restrictive origin policies for production

### Deployment Architecture
- **Container Deployment**: Docker-ready with proper environment handling
- **Load Balancing**: Stateless design supports horizontal scaling
- **Health Checks**: Built-in endpoints for orchestration platforms
- **Monitoring Integration**: Structured logging for observability platforms

### Cost Management
- **LLM Usage Tracking**: Monitor token consumption per request
- **Model Selection**: Configurable models for cost/performance balance
- **Rate Limiting**: Prevent excessive API usage
- **Fallback Strategies**: Graceful degradation during service issues

## Migration and Integration Plan

### Phase 1: Backend Service Setup
1. **Service Implementation**: Complete FastAPI service with all endpoints
2. **Database Integration**: Verify connectivity with existing SQLite database
3. **LLM Configuration**: Test both OpenAI and Anthropic integrations
4. **Local Testing**: Comprehensive testing with sample data

### Phase 2: Frontend Integration
1. **API Client**: Create service layer in Next.js application
2. **UI Components**: Add text-to-SQL interface to existing application
3. **Configuration Selection**: Integrate with app configuration system
4. **Error Handling**: Implement user-friendly error displays

### Phase 3: Production Deployment
1. **Environment Configuration**: Production-ready environment variables
2. **Monitoring Setup**: Health checks and logging configuration
3. **Performance Testing**: Load testing and optimization
4. **Documentation**: User guides and operational runbooks

## Success Criteria

### Functional Requirements
- ✅ Convert natural language queries to SQL using configured app contexts
- ✅ Support multiple SQL dialects (SQLite, PostgreSQL, MySQL, SQL Server)
- ✅ Integrate with both OpenAI and Anthropic LLM providers
- ✅ Process template variables with business context
- ✅ Provide comprehensive health monitoring

### Non-Functional Requirements
- **Performance**: Sub-2 second response times for typical queries
- **Reliability**: 99.9% uptime with proper error handling
- **Scalability**: Support concurrent requests with async processing
- **Security**: Secure API key management and input validation
- **Maintainability**: Clear code structure with comprehensive documentation

### Integration Requirements
- ✅ Seamless integration with existing Next.js frontend
- ✅ Compatible with current SQLite database schema
- ✅ CORS configuration for local development
- ✅ Consistent API patterns with existing application

## Appendix

### A. Template Variable Reference

| Variable | Description | Source |
|----------|-------------|---------|
| `SQL_SYNTAX` | Target SQL dialect | Request parameter |
| `METRIC_DEFINITIONS` | Business metrics and calculations | Test data generator |
| `SEMANTIC_NOUNS` | Domain-specific terminology | Test data generator |
| `TABLE_SCHEMAS` | Database schema descriptions | App configuration |
| `PREVIOUS_CONTEXT` | Conversation history | Session management |
| `BUSINESS_INSTRUCTIONS` | App-specific business context | App configuration |

### B. Sample API Workflows

#### Basic Query Conversion
```bash
# 1. List available configurations
curl http://localhost:8000/api/v1/text2sql/configurations

# 2. Convert natural language query
curl -X POST http://localhost:8000/api/v1/text2sql/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Show me top 5 products by revenue",
    "app_configuration_id": 1,
    "sql_syntax": "SQLite",
    "llm_provider": "openai"
  }'
```

#### Development and Testing
```bash
# Get sample test data
curl http://localhost:8000/api/v1/text2sql/test-data?sql_syntax=SQLite

# Preview template with app data
curl "http://localhost:8000/api/v1/text2sql/template/preview?app_id=1"

# Get sample queries for testing
curl http://localhost:8000/api/v1/text2sql/sample-queries
```

### C. Error Response Examples

```json
{
  "success": false,
  "error": "App configuration 999 not found",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

```json
{
  "success": false,
  "error": "Validation failed",
  "detail": [
    {
      "field": "query",
      "message": "Query must be at least 1 character"
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

This specification provides a complete blueprint for implementing a robust, production-ready FastAPI backend service that seamlessly integrates with the existing Text2SQL application while providing powerful text-to-SQL conversion capabilities.