# API Routes Module Guidelines

This directory contains Next.js API routes for the Text2SQL application. Follow these conventions when working with API endpoints.

## Route Structure

### File Organization
- Use route.ts files for API endpoints
- Organize by resource (e.g., /api/tables/route.ts)
- Export named functions for HTTP methods (GET, POST, PUT, DELETE)

### Request Handling
- Import NextRequest and NextResponse from 'next/server'
- Use async functions for all route handlers
- Parse request body with `await request.json()`
- Access query parameters through request.nextUrl.searchParams

### Validation
- Define Zod schemas for request validation
- Validate request body using schema.parse(body)
- Handle ZodError specifically with 400 status and error details
- Use consistent schema patterns matching database models

### Database Operations
- Import prisma from '@/lib/prisma'
- Use Prisma client for all database operations
- Include related data with include option when needed
- Order results consistently (e.g., createdAt: 'desc')

### Error Handling
```typescript
try {
  // Main logic
} catch (error) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: 'Validation failed', details: error.issues },
      { status: 400 }
    )
  }
  
  console.error('Error description:', error)
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}
```

### Response Patterns
- Return consistent response structure: `{ success: true, data: result }`
- Use appropriate HTTP status codes (200, 400, 404, 500)
- Include error messages in response body
- Use NextResponse.json() for all responses

### Business Logic
- Check for existing resources before creating (e.g., unique table names)
- Use nullish coalescing (??) for optional fields with defaults
- Map arrays properly for nested creation (e.g., fields creation)
- Handle optional fields with fallback values

### Data Types
- Follow established enum values (VARCHAR, INT, BIGINT, DECIMAL, BOOLEAN, DATE, DATETIME, TEXT, JSON)
- Use consistent field naming conventions
- Apply proper type coercion and defaults

## API Endpoints

### Table Schema Management
**`/api/tables`** - Individual table schema operations

- **POST**: Create new table schema with fields
  - Request: `{ table_name, table_description, fields: [{ field_name, field_description, data_type, ... }] }`
  - Response: `{ success: true, data: { table with fields } }`
  - Validation: Unique table names, field name format, required fields

- **GET**: Retrieve all table schemas with field details
  - Response: `{ success: true, data: [{ table with fields }] }`
  - Ordering: `createdAt: 'desc'` for consistent results

### App Configuration Management  
**`/api/app-configurations`** - Text2SQL application configuration operations

- **POST**: Create new text2sql app configuration
  - Request: `{ app_name, business_instructions, tableIds: [1, 2, 3] }`
  - Response: `{ success: true, data: { app with tables and fields } }`
  - Validation: Unique app names, minimum business instructions length, valid table IDs

- **GET**: Retrieve all app configurations with associated tables
  - Response: `{ success: true, data: [{ app with tables and fields }] }`
  - Includes: Full table and field details for each associated table

### Request Validation Schemas

```typescript
// Table Schema Validation
const fieldSchema = z.object({
  field_name: z.string().min(1).regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/),
  field_description: z.string().min(1),
  data_type: z.enum(['VARCHAR', 'INT', 'BIGINT', 'DECIMAL', 'BOOLEAN', 'DATE', 'DATETIME', 'TEXT', 'JSON']).optional(),
  max_length: z.number().optional(),
  is_nullable: z.boolean().optional(),
  is_primary_key: z.boolean().optional(),
  is_unique: z.boolean().optional(),
  default_value: z.string().optional(),
})

const tableSchema = z.object({
  table_name: z.string().min(1).regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/),
  table_description: z.string().min(1),
  fields: z.array(fieldSchema).min(1).max(50),
})

// App Configuration Validation
const appConfigurationSchema = z.object({
  app_name: z.string().min(1, 'App name is required'),
  business_instructions: z.string().min(1, 'Business instructions are required'),
  tableIds: z.array(z.number()).min(1, 'At least one table must be selected'),
})
```

### Security Considerations
- Validate all input data with Zod schemas
- Use Prisma for SQL injection protection
- Check table ID existence before creating associations
- Verify unique constraints (table names, app names)
- Log errors for debugging but avoid exposing sensitive data
- Return generic error messages to clients