# Library Utilities Module Guidelines

This directory contains utility functions and configurations for the Text2SQL application. Follow these conventions when working with utility modules.

## File Organization

### Database Configuration (prisma.ts)
- Use singleton pattern for Prisma client
- Handle development vs production environments
- Store client in globalThis for development hot reloading
- Export named export `prisma` for consistency

### Styling Utilities (utils.ts)
- Export `cn` function for className merging using clsx and tailwind-merge
- Use ClassValue type from clsx for proper typing
- Include date formatting utilities with consistent locale settings
- Provide ID generation utilities using safe random methods

### Domain-Specific Utilities (csvUtils.ts)
- Define TypeScript interfaces for data structures
- Export result types with success/error patterns
- Use Zod schemas for validation
- Define constants at module level (MAX_FILE_SIZE, MAX_FIELDS, etc.)

## Code Patterns

### Interface Definitions
```typescript
export interface CSVField {
  field_name: string
  field_description: string
}

export interface CSVParseResult {
  success: boolean
  data?: CSVField[]
  error?: string
  details?: string[]
}
```

### Validation Patterns
- Use Zod schemas for data validation
- Consistent regex patterns: `/^[a-zA-Z_][a-zA-Z0-9_]*$/` for field names
- Provide descriptive error messages
- Handle validation errors with detailed feedback

### Error Handling
- Return result objects with success/error patterns
- Include detailed error information in `details` array
- Use try/catch blocks for external library operations
- Provide meaningful error messages for user feedback

### Constants and Configuration
- Define limits as named constants (MAX_FILE_SIZE, MAX_FIELDS)
- Use consistent naming conventions for required fields
- Keep configuration values at module level for easy modification

### Async Operations
- Return Promises for file operations
- Use Promise constructor for callback-based APIs (Papa Parse)
- Handle both success and error cases in promise resolution
- Validate results before returning

### Browser APIs
- Check for feature support before using (link.download !== undefined)
- Clean up DOM elements after use
- Use proper MIME types for file downloads
- Handle browser-specific behaviors gracefully

### Type Safety
- Use strict TypeScript typing throughout
- Define proper interfaces for all data structures
- Use type guards and validation for external data
- Export types for use in other modules

### Function Design
- Use pure functions where possible
- Separate validation from business logic
- Keep functions focused on single responsibilities
- Use descriptive function names that indicate purpose