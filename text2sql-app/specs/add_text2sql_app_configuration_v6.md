# Text2SQL App Configuration Feature Specification v5

## Overview

This specification outlines the Text2SQL App Configuration functionality that allows users to set up complete text-to-SQL applications by selecting relevant table schemas and providing business context that will guide the SQL generation process.

## Feature Description

### Core Concept
- **App Configuration**: Complete setup for a text2sql application including selected tables and business context
- **Business Instructions**: Detailed textual guidance that describes the business domain, relationships, and rules for SQL generation
- **Multi-Step Wizard**: Step-by-step process to configure the application properly

### User Workflow (4 Steps)
1. **Load Individual Tables**: Refresh and load available table schemas from the database
2. **Select App Name**: Provide a descriptive name for the text2sql application
3. **Select Table Schemas**: Choose which existing table schemas are relevant for this app
4. **Give Business Instructions**: Provide detailed business context and domain knowledge

## Database Schema Changes

### New Models

```prisma
model AppConfiguration {
  id                    Int     @id @default(autoincrement())
  app_name              String  @unique
  business_instructions String
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  tables                AppConfigurationTable[]
  
  @@map("app_configurations")
}

model AppConfigurationTable {
  id                   Int     @id @default(autoincrement())
  appConfigurationId   Int
  tableId              Int
  createdAt            DateTime @default(now())
  
  appConfiguration     AppConfiguration @relation(fields: [appConfigurationId], references: [id], onDelete: Cascade)
  table                Table       @relation(fields: [tableId], references: [id], onDelete: Cascade)
  
  @@unique([appConfigurationId, tableId])
  @@map("app_configuration_tables")
}
```

### Updated Models

```prisma
model Table {
  // ... existing fields
  appConfigurations    AppConfigurationTable[]
}
```

## API Endpoints

### POST /api/app-configurations
Creates a new app configuration with selected tables and business instructions.

**Request Body:**
```json
{
  "app_name": "E-commerce Platform",
  "business_instructions": "This is an e-commerce system with...",
  "tableIds": [1, 2, 3, 4]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "app_name": "E-commerce Platform",
    "business_instructions": "...",
    "tables": [...]
  }
}
```

### GET /api/app-configurations
Retrieves all app configurations with their associated tables and fields.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "app_name": "E-commerce Platform", 
      "business_instructions": "...",
      "tables": [
        {
          "table": {
            "id": 1,
            "table_name": "users",
            "table_description": "...",
            "fields": [...]
          }
        }
      ]
    }
  ]
}
```

## UI Components

### AppConfigurationWizard
Multi-step wizard for setting up text2sql apps:

**Step 1: Load Individual Tables**
- Refresh button to load available table schemas
- Loading indicator and status messages
- Confirmation when tables are successfully loaded

**Step 2: Select App Name**
- Input field for app name with validation
- Guidance on naming conventions
- Unique name validation

**Step 3: Select Table Schemas**
- Checkbox list of all available table schemas
- Each table shows name, description, and field count
- Visual indication of selected tables
- Minimum of 1 table required

**Step 4: Give Business Instructions**
- Large textarea for detailed business context
- Comprehensive placeholder with examples
- Selected tables summary
- Minimum character requirement (10+ characters)

### AppConfigurationViewer
Component for displaying existing app configurations:

- **Expandable Cards**: Each app configuration as a collapsible card
- **Summary View**: App name, table count, creation date
- **Instructions Preview**: Truncated business instructions with expand/collapse
- **Table Badges**: Visual indicators for included tables
- **Detailed View**: Expanded view showing all table details

### Updated Page Layout
- **Tab Navigation**: Switch between "Individual Tables" and "Text2SQL Apps"
- **Conditional Content**: Different wizards based on active tab
- **Unified Sidebar**: Single data viewer that adapts to current tab

## Business Instructions Guidance

The business instructions should include:

1. **Business Domain**: What is the main purpose of this system?
2. **Entity Relationships**: How do the tables relate to each other?
3. **Business Rules**: Any specific constraints or validation rules?
4. **Common Queries**: What types of questions are frequently asked?
5. **Terminology**: Business-specific terms and their meanings
6. **Data Context**: Time periods, geographical scope, etc.

## Technical Implementation Details

### Form Validation
- App names must be unique
- At least one table must be selected
- Business instructions minimum length validation
- All table IDs must exist in database

### Data Relationships
- Many-to-many relationship between App Configurations and Tables
- Cascade deletion: deleting an app configuration removes associations
- Tables can belong to multiple app configurations

### Error Handling
- Validation errors with specific field feedback
- Network error handling with retry suggestions
- Duplicate name prevention with clear messaging

### Performance Considerations
- Efficient queries using Prisma's include/select
- Pagination for large numbers of app configurations (future enhancement)
- Optimistic loading for table selection interface

## Future Enhancements

1. **Export Functionality**: Export app configurations as JSON/SQL
2. **Import Functionality**: Import existing app configurations
3. **Version Control**: Track changes to business instructions
4. **Collaborative Features**: Team-based app configuration management
5. **AI Suggestions**: Automatic business instruction generation
6. **Query Templates**: Pre-built query patterns for common business questions
7. **App Testing**: Test text-to-SQL conversion with sample queries

## Testing Considerations

- Unit tests for API endpoints
- Component testing for wizard flow
- Integration tests for database operations
- End-to-end tests for complete user workflow
- Validation testing for edge cases

## Migration Strategy

1. Run `npx prisma db push` to apply schema changes
2. Existing table schemas remain unchanged
3. New features are additive (no breaking changes)
4. Gradual rollout with feature flags if needed

---

This specification provides a comprehensive foundation for implementing the Text2SQL App Configuration feature, enabling users to create complete text-to-SQL applications with carefully selected table schemas and rich business context for enhanced SQL generation.