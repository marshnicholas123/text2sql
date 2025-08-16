# Product Specifications: CSV Schema Upload Feature v2

## Overview
Add the ability for users to upload a CSV file containing field definitions instead of manually entering them through the wizard. The CSV should have exactly 2 columns: field name and field description.

## Current State Analysis
Your app currently has:
- A 3-step wizard (Table Info → Define Fields → Review)
- Manual field entry with full schema definition (data types, constraints, etc.)
- Form validation using Zod and react-hook-form
- Auto-save to localStorage
- Field templates for common fields

## Feature Requirements

### 1. User Interface Changes

**Step 1 Enhancement - Upload Option**
- Add a toggle/tab system to choose between "Manual Entry", "CSV Upload", and "Stored Database Schemas"
- When CSV Upload is selected, show:
  - File upload dropzone with drag-and-drop support
  - File format requirements (CSV, 2 columns, max file size)
  - Sample CSV download link
  - Preview of uploaded CSV data
- When Stored Database Schemas is selected, show:
  - List of previously created schemas from the database
  - Search/filter functionality to find schemas
  - Preview of schema fields and structure
  - Option to clone/duplicate existing schemas

**Step 2 Enhancement - Hybrid Mode**
- After CSV upload, show imported fields in the existing field editor
- Allow users to:
  - Edit imported field descriptions
  - Set data types (defaults to VARCHAR)
  - Configure constraints (nullable, primary key, unique)
  - Add/remove fields
  - Reorder fields

### 2. CSV Format Specifications

**Required Format:**
```csv
field_name,field_description
id,Primary key identifier
email,User email address
created_at,Record creation timestamp
```

**Validation Rules:**
- Exactly 2 columns: `field_name`, `field_description`
- Header row required
- Field names must match regex: `^[a-zA-Z_][a-zA-Z0-9_]*$`
- Max 50 fields (matching current limit)
- Max file size: 1MB
- Supported format: CSV only
- No empty rows allowed

### 3. Technical Implementation

**New Components:**
- `CSVUploader` component with file validation
- `CSVPreview` component to show parsed data
- CSV parsing utility functions

**File Processing Flow:**
1. File upload → validation → parsing
2. Display preview with field count
3. Import to form state with default values:
   - `data_type`: 'VARCHAR'
   - `is_nullable`: true
   - `is_primary_key`: false
   - `is_unique`: false

**Error Handling:**
- Invalid file format
- Missing/incorrect headers
- Duplicate field names
- Invalid field name format
- File too large
- Parse errors

### 4. User Experience Flow

**Happy Path:**
1. User selects "CSV Upload" option
2. Uploads valid CSV file
3. Sees preview of imported fields
4. Proceeds to Step 2 with pre-populated fields
5. Can edit/modify imported fields
6. Continues through normal wizard flow

**Error Scenarios:**
- Show clear error messages for validation failures
- Allow user to fix CSV and re-upload
- Provide sample CSV for reference

### 5. Dependencies & Libraries

**New Dependencies Needed:**
- `papaparse` - CSV parsing library
- `react-dropzone` - File upload with drag-and-drop

**File Upload Considerations:**
- Client-side processing only (no server upload needed)
- File size validation
- MIME type validation
- Progress indicators for large files

### 6. Sample CSV Template

Provide downloadable template:
```csv
field_name,field_description
id,Unique identifier for the record
name,Full name of the entity
email,Email address
phone,Phone number
created_at,When the record was created
updated_at,When the record was last modified
is_active,Whether the record is currently active
```

### 7. Stored Database Schemas Section

**Overview:**
Add a third input option that allows users to select and clone existing database schemas that have been previously created in the application.

**User Interface:**
- Schema browser with list view of all existing tables
- Search and filter functionality by table name, creation date, or field count
- Schema preview showing table structure (fields, data types, constraints)
- Clone/duplicate button to import schema as starting point

**Technical Requirements:**
- Query existing tables from the database via API
- Display table metadata (name, creation date, field count)
- Allow full schema import with all field definitions
- Maintain referential integrity when cloning

**API Endpoints:**
- `GET /api/schemas` - List all existing schemas
- `GET /api/schemas/:id` - Get detailed schema structure
- `POST /api/schemas/:id/clone` - Clone schema for editing

**User Experience Flow:**
1. User selects "Stored Database Schemas" tab
2. Browses list of existing schemas with search/filter
3. Previews selected schema structure
4. Clicks "Use This Schema" to import
5. Proceeds to Step 2 with pre-populated fields
6. Can modify imported schema as needed

### 8. Validation & Error Messages

**CSV Validation:**
- "Invalid file format. Please upload a CSV file."
- "File too large. Maximum size is 1MB."
- "Missing required headers: field_name, field_description"
- "Duplicate field name found: {field_name}"
- "Invalid field name: {field_name}. Must start with letter/underscore."
- "Maximum 50 fields allowed. Found {count} fields."

**Schema Import Validation:**
- "No schemas found. Create your first schema using manual entry or CSV upload."
- "Failed to load schema. Please try again."
- "Schema not found or has been deleted."

**Integration Points:**
- Preserve existing form validation
- Maintain auto-save functionality
- Keep field templates available for manual addition
- Ensure CSV import works with existing API endpoints
- Integrate schema browser with existing database queries

## Implementation Status: 🔄 IN PROGRESS

### CSV Upload Feature: ✅ COMPLETED
### Stored Database Schemas Feature: ✅ COMPLETED

### Implementation Details

**Phase 1: Dependencies & Utilities ✅**
- ✅ Installed required packages (`papaparse`, `react-dropzone`, `@types/papaparse`)
- ✅ Created CSV parsing utility functions in `src/lib/csvUtils.ts`
- ✅ Added comprehensive CSV validation logic

**Phase 2: UI Components ✅**
- ✅ Created `CSVUploader` component with drag-and-drop functionality
- ✅ Created `CSVPreview` component for data display
- ✅ Added upload/manual toggle to Step 1
- ✅ Created `Badge` UI component for field type display

**Phase 3: Integration ✅**
- ✅ Modified `EnhancedSchemaWizard` to support CSV import
- ✅ Updated form state management for CSV data
- ✅ Integrated CSV import with existing validation

**Phase 4: Error Handling & UX ✅**
- ✅ Added comprehensive error handling with detailed messages
- ✅ Created sample CSV template download functionality
- ✅ Added loading states and progress indicators
- ✅ Tested integration with existing wizard flow

### Files Created/Modified

**New Files:**
- `src/lib/csvUtils.ts` - CSV parsing and validation utilities
- `src/components/CSVUploader.tsx` - File upload component
- `src/components/CSVPreview.tsx` - Preview component for imported data
- `src/components/ui/badge.tsx` - UI component for tags/labels
- `test_sample.csv` - Sample CSV file for testing

**Modified Files:**
- `src/components/EnhancedSchemaWizard.tsx` - Added CSV upload and schema import functionality
- `package.json` - Added new dependencies

**Schema Import Feature - New Files:**
- `src/components/SchemaBrowser.tsx` - Schema browser component with search and preview

### Technical Architecture

**CSV Processing Flow:**
```
File Upload → Validation → Parsing → Preview → Form Integration → Field Editor
```

**State Management:**
- `inputMode`: 'manual' | 'csv' | 'schema' - tracks current input method
- `csvFields`: CSVField[] - stores parsed CSV data
- `showCSVPreview`: boolean - controls preview display
- `selectedSchemaForImport`: Schema | null - stores selected schema for import

**Schema Import Processing Flow:**
```
Schema List → Search/Filter → Selection → Preview → Import → Field Editor
```

**Error Handling:**
- File validation (size, type, format)
- CSV structure validation (headers, content)
- Field name validation (regex, duplicates)
- Schema loading and network errors
- Integration with existing form validation

### User Experience Features

1. **Seamless Mode Switching:** Users can switch between manual, CSV, and schema import at any time
2. **Visual Feedback:** Clear indicators for upload status, validation errors, and success states
3. **Preview Before Commit:** Users see exactly what will be imported before proceeding
4. **Edit After Import:** Full editing capabilities for imported fields
5. **Sample Template:** Easy access to properly formatted example CSV
6. **Schema Search & Filter:** Quick search through existing schemas by name or description
7. **Live Schema Preview:** Real-time preview of selected schema structure and fields
8. **Intelligent Cloning:** Automatic table name modification to avoid conflicts when cloning

### Performance Considerations

- **Client-side Processing:** All CSV parsing happens in the browser
- **File Size Limits:** 1MB maximum to ensure responsive performance
- **Validation Feedback:** Real-time validation with immediate user feedback
- **Memory Efficient:** Streaming CSV parsing with Papa Parse

This comprehensive feature set significantly improves user experience by providing three flexible input methods:

1. **Manual Entry** - Traditional field-by-field input with templates
2. **CSV Upload** - Bulk field import from structured files  
3. **Schema Import** - Clone and modify existing database schemas

The implementation preserves all existing functionality while adding these powerful alternatives. Users can seamlessly switch between input methods and have full editing capabilities regardless of the source. The schema import feature is particularly valuable for iterating on existing designs and maintaining consistency across related tables.