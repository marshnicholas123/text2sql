# Text2SQL FastAPI Backend

A FastAPI service that converts natural language queries to SQL using configurable business contexts and multiple LLM providers.

## Features

- **Multi-LLM Support**: OpenAI GPT and Anthropic Claude integration
- **Template Processing**: Dynamic prompt generation using `text2sql_prompt.txt`
- **Database Integration**: Direct connection to existing SQLite database
- **App Configuration**: Uses app configurations defined in the frontend
- **Test Data Generation**: Comprehensive sample data for development
- **Health Monitoring**: Built-in health checks and service monitoring
- **CORS Support**: Ready for frontend integration

## Quick Start

### 1. Installation

```bash
cd backend
pip install -r requirements.txt
```

### 2. Environment Setup

Copy the example environment file and configure your API keys:

```bash
cp .env.example .env
```

Edit `.env` and add at least one LLM API key:
```env
OPENAI_API_KEY=your_openai_key_here
# OR
ANTHROPIC_API_KEY=your_anthropic_key_here
```

### 3. Start the Server

```bash
# Development mode with auto-reload
python main.py

# Or using uvicorn directly
uvicorn main:app --reload --port 8000
```

The API will be available at:
- **API Base**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Core Text2SQL Endpoints

#### `POST /api/v1/text2sql/query`
Convert natural language to SQL query.

**Request:**
```json
{
  "query": "Show me total revenue for last month",
  "app_configuration_id": 1,
  "sql_syntax": "SQLite",
  "include_previous_context": false,
  "llm_provider": "openai"
}
```

**Response:**
```json
{
  "success": true,
  "query": "Show me total revenue for last month",
  "generated_sql": "SELECT SUM(total_amount) FROM orders WHERE order_date >= date('now', '-1 month') AND status = 'completed'",
  "explanation": "This query calculates total revenue...",
  "execution_time_ms": 1250.5,
  "llm_provider": "openai",
  "sql_syntax": "SQLite"
}
```

#### `GET /api/v1/text2sql/configurations`
List all available app configurations.

#### `GET /api/v1/text2sql/configurations/{app_id}`
Get detailed configuration with table schemas.

### Development & Testing Endpoints

#### `GET /api/v1/text2sql/test-data`
Get sample data for all template variables.

#### `GET /api/v1/text2sql/template/preview`
Preview the complete prompt template with data substitution.

#### `GET /api/v1/text2sql/sample-queries`
Get sample natural language queries for testing.

#### `GET /api/v1/text2sql/health`
Comprehensive health check for all services.

## Architecture

### Services

- **DatabaseService**: SQLite database operations
- **TemplateService**: Prompt template processing
- **LLMService**: Multi-provider LLM integration

### Models

- **Request Models**: Pydantic validation for API inputs
- **Response Models**: Structured API responses
- **Enums**: SQL syntax and LLM provider options

### Template System

The service uses the `text2sql_prompt.txt` template with these variables:
- `{{SQL_SYNTAX}}`: Target SQL dialect
- `{{METRIC_DEFINITIONS}}`: Business metric definitions
- `{{SEMANTIC_NOUNS}}`: Domain-specific terminology
- `{{TABLE_SCHEMAS}}`: Database schema information
- `{{PREVIOUS_CONTEXT}}`: Conversation history
- `{{BUSINESS_INSTRUCTIONS}}`: App-specific business context

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 8000 |
| `OPENAI_API_KEY` | OpenAI API key | None |
| `ANTHROPIC_API_KEY` | Anthropic API key | None |
| `DATABASE_URL` | Database path | `../prisma/dev.db` |
| `OPENAI_MODEL` | OpenAI model | `gpt-4` |
| `ANTHROPIC_MODEL` | Anthropic model | `claude-3-sonnet-20240229` |

### LLM Providers

#### OpenAI Configuration
- Models: GPT-4, GPT-3.5-turbo
- Low temperature (0.1) for consistent SQL generation
- Max tokens: 1500

#### Anthropic Configuration  
- Models: Claude-3 Sonnet, Claude-3 Haiku
- System prompt support
- Structured output handling

## Development

### Project Structure

```
backend/
├── main.py              # FastAPI application
├── requirements.txt     # Python dependencies
├── .env.example        # Environment template
│
├── models/             # Pydantic models
│   ├── request.py      # Request schemas
│   ├── response.py     # Response schemas
│   └── __init__.py
│
├── routers/            # API route handlers
│   ├── text2sql.py     # Main text2sql endpoints
│   └── __init__.py
│
├── services/           # Core business logic
│   ├── db_service.py   # Database operations
│   ├── template_service.py # Template processing
│   ├── llm_service.py  # LLM integration
│   └── __init__.py
│
└── utils/              # Utilities and helpers
    ├── test_data.py    # Test data generation
    └── __init__.py
```

### Running Tests

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests (when implemented)
pytest tests/
```

### Health Monitoring

The `/api/v1/text2sql/health` endpoint provides detailed status:

```json
{
  "service": "text2sql",
  "status": "healthy",
  "components": {
    "database": {"status": "healthy"},
    "template": {"status": "healthy"},
    "llm": {
      "providers": {
        "openai": {"configured": true, "status": "ready"},
        "anthropic": {"configured": false}
      }
    }
  }
}
```

## Integration

### With Frontend

The service is designed to integrate with the existing Next.js frontend:

1. **CORS Configuration**: Allows requests from `http://localhost:3000`
2. **Database Sharing**: Uses the same SQLite database as the frontend
3. **Configuration Context**: Leverages app configurations created in the frontend

### API Client Example

```javascript
// Frontend API client example
const response = await fetch('http://localhost:8000/api/v1/text2sql/query', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    query: "What were our top selling products last month?",
    app_configuration_id: 1,
    sql_syntax: "SQLite",
    llm_provider: "openai"
  })
});

const result = await response.json();
console.log(result.generated_sql);
```

## Production Deployment

### Docker Deployment

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

ENV PORT=8000
EXPOSE 8000

CMD ["python", "main.py"]
```

### Environment Considerations

- Set `DEBUG=false` in production
- Use proper secret management for API keys
- Configure appropriate CORS origins
- Set up proper logging and monitoring
- Consider rate limiting for LLM API calls

## Troubleshooting

### Common Issues

1. **Database Not Found**
   - Ensure the SQLite database exists at `../prisma/dev.db`
   - Run `npx prisma db push` in the frontend directory

2. **LLM API Errors**
   - Verify API keys are correctly set in `.env`
   - Check API rate limits and quotas
   - Monitor API usage costs

3. **Template Processing Errors**
   - Verify `text2sql_prompt.txt` exists in the project root
   - Check template variable syntax `{{VARIABLE_NAME}}`

4. **CORS Issues**
   - Update `ALLOWED_ORIGINS` in environment variables
   - Check frontend URL matches CORS configuration

### Debugging

Enable debug logging:
```env
DEBUG=true
LOG_LEVEL=DEBUG
```

Check service health:
```bash
curl http://localhost:8000/api/v1/text2sql/health
```

## Contributing

1. Follow PEP 8 style guidelines
2. Add type hints to all functions
3. Include docstrings for public methods
4. Test with multiple LLM providers
5. Update API documentation for new endpoints

## License

This project is part of the Text2SQL application suite.