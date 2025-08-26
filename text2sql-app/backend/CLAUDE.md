# Backend Service - Text2SQL API

This directory contains the FastAPI backend service for the Text2SQL application that converts natural language queries into SQL using LLM providers.

## Technology Stack

### Core Framework & Dependencies
- **FastAPI** v0.115.0 - Modern Python web framework for building APIs
- **Uvicorn** v0.32.0 - ASGI server for production deployment
- **Pydantic** v2.9.0 - Data validation and serialization
- **Python-dotenv** v1.0.1 - Environment variable management

### LLM & AI Integration
- **OpenAI** v1.52.0 - OpenAI GPT models integration
- **Anthropic** v0.34.2 - Claude models integration
- **HTTPX** v0.27.2 - HTTP client for API requests

### Additional Utilities
- **aiofiles** v24.1.0 - Async file operations
- **python-multipart** v0.0.12 - Form data parsing

## Directory Structure

```
backend/
├── main.py                     # FastAPI application entry point
├── requirements.txt            # Production dependencies
├── requirements-minimal.txt    # Minimal dependencies for basic functionality
├── .env                       # Environment variables (API keys, config)
├── README.md                  # Backend-specific documentation
│
├── models/                    # Pydantic data models
│   ├── __init__.py           # Model exports
│   ├── request.py            # Request models (Text2SQLRequest, etc.)
│   └── response.py           # Response models (Text2SQLResponse, etc.)
│
├── routers/                   # FastAPI route handlers
│   ├── __init__.py
│   └── text2sql.py          # Main Text2SQL API endpoints
│
├── services/                  # Business logic and external service integrations
│   ├── __init__.py           # Service exports
│   ├── db_service.py         # Database operations (SQLite/Prisma integration)
│   ├── llm_service.py        # LLM provider integrations (OpenAI/Anthropic)
│   └── template_service.py   # Prompt template management and substitution
│
├── utils/                     # Utility functions and test data
│   ├── __init__.py
│   └── test_data.py          # Test data generation and sample queries
│
└── test_*.py                 # Test files for API endpoints and functionality
    ├── test_api_endpoints.py
    ├── test_basic_functionality.py
    ├── test_complete_flow.py
    └── show_final_prompt.py
```

## Architecture & Data Flow

### 1. Application Entry Point
**`main.py`** - FastAPI application setup with:
- CORS middleware for frontend communication (ports 3000/3001)
- Router registration with `/api/v1` prefix
- Global exception handling
- Health check endpoints
- Auto-generated OpenAPI documentation at `/docs`

### 2. API Endpoints (`routers/text2sql.py`)

#### Core Text2SQL Endpoints:
- **`POST /api/v1/text2sql/query`** - Convert natural language to SQL
- **`GET /api/v1/text2sql/configurations`** - List all app configurations
- **`GET /api/v1/text2sql/configurations/{app_id}`** - Get specific app details
- **`GET /api/v1/text2sql/test-data`** - Get sample test data
- **`GET /api/v1/text2sql/template/preview`** - Preview prompts with template substitution
- **`GET /api/v1/text2sql/health`** - Comprehensive health check
- **`GET /api/v1/text2sql/sample-queries`** - Get sample natural language queries

### 3. Service Layer Architecture

#### Database Service (`services/db_service.py`)
- **Purpose**: Interface with the frontend's Prisma SQLite database
- **Database Path**: `../prisma/dev.db` (shared with Next.js frontend)
- **Key Functions**:
  - `get_all_app_configurations()` - Fetch app configs with table/field counts
  - `get_app_configuration_detail(app_id)` - Get complete app details with schemas
  - `get_table_schemas_for_app(app_id)` - Extract formatted table schemas for prompts
  - `test_connection()` - Health check database connectivity

#### LLM Service (`services/llm_service.py`)
- **Purpose**: Multi-provider LLM integration for SQL generation
- **Supported Providers**: OpenAI (GPT models), Anthropic (Claude models)
- **Key Functions**:
  - `generate_sql(prompt, query, provider)` - Generate SQL using specified LLM
  - `extract_sql_from_response(text)` - Parse SQL and explanation from LLM response
  - `health_check()` - Test LLM provider connectivity and API key validation

#### Template Service (`services/template_service.py`)
- **Purpose**: Dynamic prompt template management and variable substitution
- **Template Variables**:
  - `SQL_SYNTAX` - Target SQL dialect (SQLite, MySQL, PostgreSQL, etc.)
  - `TABLE_SCHEMAS` - Formatted database schemas from app configuration
  - `BUSINESS_INSTRUCTIONS` - Business context and rules from app setup
  - `METRIC_DEFINITIONS` - Business metric calculation methods
  - `SEMANTIC_NOUNS` - Domain-specific terminology
  - `PREVIOUS_CONTEXT` - Optional conversation history
- **Key Functions**:
  - `substitute_variables(template_vars)` - Replace placeholders with actual data
  - `validate_template()` - Ensure all required variables are present

### 4. Data Models (`models/`)

#### Request Models (`request.py`)
- **`Text2SQLRequest`** - Main query conversion request
  - `query`: Natural language question
  - `app_configuration_id`: Selected app configuration
  - `llm_provider`: OpenAI or Anthropic
  - `sql_syntax`: Target SQL dialect
  - `include_previous_context`: Boolean for conversation context

#### Response Models (`response.py`)
- **`Text2SQLResponse`** - SQL generation result
- **`ConfigurationListResponse`** - App configuration list
- **`ConfigurationDetailResponse`** - Detailed app configuration
- **`TestDataResponse`** - Sample data for testing
- **`ErrorResponse`** - Standardized error format

### 5. Test Data & Utilities (`utils/test_data.py`)
- **`TestDataGenerator`** class with sample business data:
  - E-commerce sample schemas (customers, orders, products, inventory)
  - Business metric definitions
  - Sample natural language queries
  - Previous conversation context examples

## Integration with Frontend

### Database Sharing
- Backend reads from the same SQLite database (`prisma/dev.db`) that the Next.js frontend manages
- Frontend handles schema creation/management via Prisma ORM
- Backend consumes the data for SQL generation context

### API Communication Flow
1. **Frontend** → Creates table schemas and app configurations via Next.js API routes
2. **Frontend** → Sends natural language queries to backend `/api/v1/text2sql/query`
3. **Backend** → Retrieves app configuration and table schemas from shared database
4. **Backend** → Builds context-aware prompt with business instructions
5. **Backend** → Calls LLM provider (OpenAI/Anthropic) to generate SQL
6. **Backend** → Parses and returns structured SQL response to frontend

### Environment Configuration
Required environment variables in `.env`:
```bash
# LLM Provider API Keys
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here

# Optional: Server configuration
PORT=8000                    # Backend server port
DATABASE_PATH=../prisma/dev.db  # Path to shared database
```

## Development Workflow

### Running the Backend
```bash
# Install dependencies
pip install -r requirements.txt

# Start development server with auto-reload
python main.py

# Or using uvicorn directly
uvicorn main:app --reload --port 8000
```

### Testing
```bash
# Run API endpoint tests
python test_api_endpoints.py

# Test basic functionality
python test_basic_functionality.py

# Test complete flow end-to-end
python test_complete_flow.py

# Show final prompt template
python show_final_prompt.py
```

### API Documentation
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## Business Logic Flow

### Text2SQL Conversion Process
1. **Configuration Retrieval**: Get app configuration by ID from database
2. **Schema Extraction**: Extract table schemas associated with the app
3. **Template Building**: Populate prompt template with:
   - Business instructions from app configuration
   - Table schemas with field details and constraints
   - Metric definitions and semantic terminology
   - Target SQL syntax preference
4. **LLM Generation**: Send context-rich prompt to selected LLM provider
5. **Response Processing**: Parse SQL code and explanation from LLM response
6. **Result Formatting**: Return structured response with metadata and timing

### Error Handling Strategy
- **Validation Errors** (400): Invalid request parameters or missing required fields
- **Not Found Errors** (404): App configuration or resource not found
- **LLM Service Errors** (503): Provider API failures or rate limiting
- **Internal Errors** (500): Database connection issues or unexpected exceptions

## Security Considerations
- API keys stored in environment variables, never committed to code
- CORS configured for specific frontend origins only
- Input validation using Pydantic models
- Database connections properly managed and closed
- Error messages sanitized to avoid information leakage

## Performance Optimization
- Database connections pooled and reused
- Template compilation cached for repeated use
- Async/await patterns for non-blocking I/O operations
- Structured logging for monitoring and debugging
- Health checks for all external dependencies