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

### Security Considerations
- Validate all input data
- Use Prisma for SQL injection protection
- Log errors for debugging but avoid exposing sensitive data
- Return generic error messages to clients