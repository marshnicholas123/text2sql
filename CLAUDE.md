# CLAUDE.md

This file provides project-specific guidance for the Text2SQL application architecture and conventions.

## Development Commands

```bash
# Development
npm run dev          # Start development server with turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database (Note: These commands are documented in README but not in package.json)
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema to database
npx prisma studio    # Open Prisma Studio
```

## Architecture Overview

This is a Next.js 15 application for creating and managing database schemas and configuring complete text-to-SQL applications. The application uses:

- **Frontend**: Next.js 15 with React 19, TypeScript, and Tailwind CSS v4
- **Database**: SQLite with Prisma ORM
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Custom components built with Radix UI primitives
- **Animations**: Framer Motion for smooth transitions

## Key Features

### 1. Schema Designer (Individual Table Schema Management)
Create and manage individual database table schemas with detailed field definitions using an intuitive form builder.

### 2. Text2SQL App Setup Configuration
Configure complete text-to-SQL applications by selecting relevant table schemas and providing business context through a 4-step wizard:
1. **Load Tables** - Refresh available table schemas
2. **App Name** - Name your text2sql application
3. **Select Tables** - Choose relevant schemas for your app
4. **Business Instructions** - Provide detailed business context

### 3. Query Generator
Convert natural language questions into SQL queries using configured business contexts and table schemas.

## Database Schema

### Core Models
- **Table model**: Stores table metadata (name, description, timestamps) in `prisma/schema.prisma:13-24`
- **Field model**: Stores field information with detailed attributes (data_type, constraints, etc.) in `prisma/schema.prisma:26-43`
- **AppConfiguration model**: Stores text2sql app configurations (app_name, business_instructions) in `prisma/schema.prisma:45-55`
- **AppConfigurationTable model**: Junction table for many-to-many relationship between apps and tables in `prisma/schema.prisma:57-68`

### Database Relationships
- Tables have many Fields (one-to-many)
- AppConfigurations have many Tables through AppConfigurationTable (many-to-many)
- Tables can belong to multiple AppConfigurations
- Cascade deletion ensures data consistency

### Prisma Client
- **Singleton pattern** in `src/lib/prisma.ts` for database connections
- **Development hot-reload** handling with globalThis storage
- **Production-ready** client instantiation

## Core Components

### Schema Management Components
- **EnhancedSchemaWizard**: 3-step wizard for creating individual table schemas
  - Step 1: Table Information with input method selection (manual/CSV/stored schemas)
  - Step 2: Field Definition with templates and validation
  - Step 3: Review and confirmation
- **DataViewer**: Expandable schema viewer with enhanced functionality
  - Collapsible section with search bar
  - Single schema display with navigation (Previous/Next)
  - Integrated CRUD operations (Edit, Delete, Download)
  - Connected to Prisma database for real-time operations
  - Enhanced field information display with constraints and data types

### App Configuration Components  
- **AppConfigurationWizard**: 4-step wizard for text2sql app setup
  - Step 1: Load available table schemas with refresh capability
  - Step 2: App name input with validation and guidelines
  - Step 3: Table selection with interactive checkboxes
  - Step 4: Business instructions with comprehensive guidance
- **AppConfigurationViewer**: Display and manage app configurations with expandable details

### CSV Import Components
- **CSVUploader**: File upload with drag-and-drop, validation, and parsing
- **CSVPreview**: Preview parsed CSV data with field mapping options
- **SchemaBrowser**: Browse and import from existing saved schemas

### UI Layout Components
- **Header**: Streamlined application header (breadcrumbs removed for cleaner interface)
- **UserProfilePanel**: User information and quick action panel (About section removed)
- **SchemaStats**: Dashboard statistics and metrics display
- **UI Components**: Located in `src/components/ui/` using Radix UI primitives

### Text2SQL Query Components
- **Text2SQLQuery**: Main query interface for natural language to SQL conversion
- **Text2SQLHealth**: Service health monitoring and status display

## API Routes

### Table Schema Management
- `POST /api/tables` - Create new table schema with fields
- `GET /api/tables` - Retrieve all table schemas with field details
- `DELETE /api/tables?id={id}` - Delete table schema and associated fields

### App Configuration Management
- `POST /api/app-configurations` - Create new text2sql app configuration
- `GET /api/app-configurations` - Retrieve all app configurations with associated tables

## Application Navigation

The application features a clean tab-based navigation system:

### Main Tabs
- **Schema Designer** - Create and manage individual database table schemas
- **Text2SQL App Setup** - Configure complete text2sql applications with business context
- **Query Generator** - Convert natural language to SQL using configured contexts

### User Interface Improvements
- **Streamlined Header**: Removed default breadcrumbs for cleaner interface
- **Expandable Schema Viewer**: Collapsible "Your Table Schemas" section with search and navigation
- **Single Schema Display**: Navigate through schemas one at a time with Previous/Next controls
- **Enhanced Field Display**: Proper text wrapping, constraint badges, and responsive design
- **Integrated Actions**: Direct database operations (Edit, Delete, Download) with loading states

### Backend Integration
- **FastAPI Service**: Located in `/backend` directory with comprehensive documentation
- **Shared Database**: Backend reads from same SQLite database for Text2SQL functionality
- **API Documentation**: Available at `http://localhost:8000/docs` when backend is running
- **Health Monitoring**: Service health checks for database, templates, and LLM providers

## Project-Specific Guidelines

### Deployment & Configuration
- Application designed for Vercel deployment with SQLite database
- Uses Tailwind CSS v4 with PostCSS configuration
- Database file located at `prisma/dev.db`
- Environment-specific Prisma client handling

### Feature Implementation Standards
- **CSV upload functionality**: Follows specifications in `specs/add_csv_upload_v2.md`
- **App configuration feature**: Follows specifications in `specs/add_text2sql_app_configuration_v6.md`
- **Form validation**: Uses React Hook Form + Zod patterns established in wizards
- **UI components**: Follow Radix UI primitive patterns in `src/components/ui/`
- **Step wizards**: Use consistent progress indicators and validation flow
- **Schema viewer**: Expandable interface with single-item navigation and database operations
- **Text overflow handling**: Proper text wrapping and responsive design for field displays

### Database Conventions
- **Table model**: Stores metadata with timestamps and field relationships
- **Field model**: Contains detailed attributes (data_type, constraints, etc.)
- **AppConfiguration model**: Stores app-level configuration with business context
- **Junction tables**: Use unique constraints for many-to-many relationships
- **Prisma client**: Always use singleton pattern from `src/lib/prisma.ts`

### API Conventions
- **Response format**: `{ success: boolean, data?: any, error?: string }`
- **Error handling**: Zod validation errors with 400 status, generic 500 for server errors
- **HTTP status codes**: 200 (success), 400 (validation), 404 (not found), 500 (server error)
- **Request validation**: Use Zod schemas for all API endpoints
- **Database operations**: Include related data with Prisma include/select patterns

### Component Architecture
- **Client components**: Use 'use client' directive for interactive components
- **Form components**: React Hook Form with Zod validation and proper error handling
- **Wizard components**: Multi-step flow with progress indicators and validation
- **Expandable components**: Collapsible sections with chevron indicators and smooth transitions
- **Navigation components**: Previous/Next controls for single-item browsing
- **Animation**: Framer Motion for step transitions and loading states
- **Icons**: Lucide React for consistent iconography
- **CRUD operations**: Database-connected actions with loading states and error handling

### Validation Patterns
- **Field names**: `/^[a-zA-Z_][a-zA-Z0-9_]*$/` for database compatibility
- **App names**: Unique constraint with descriptive naming guidelines
- **Business instructions**: Minimum 10 characters with comprehensive guidance
- **Table selection**: Minimum 1 table required for app configurations
- **File uploads**: Size limits, format validation, and error handling

### State Management
- **Form state**: React Hook Form for complex forms with validation
- **UI state**: React useState for component-level state (expanded/collapsed, selected items)
- **Loading states**: Consistent loading indicators across components with action-specific states
- **Error states**: User-friendly error messages with recovery suggestions
- **Navigation state**: Index tracking for single-item navigation through filtered results
- **Search state**: Real-time filtering with automatic result pagination

### Testing Strategy
- **Unit tests**: Component logic and utility functions
- **Integration tests**: API endpoints and database operations
- **E2E tests**: Complete user workflows through wizards
- **Validation tests**: Form validation and error scenarios
- **CRUD operation tests**: Database interaction testing for create, read, update, delete operations
- **UI interaction tests**: Expandable components, navigation controls, and search functionality