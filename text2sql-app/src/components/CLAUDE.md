# Components Module Guidelines

This directory contains React components for the Text2SQL application. Follow these conventions when working with components.

## Component Categories

### Schema Management Components
**Individual table schema creation and management**

- **EnhancedSchemaWizard**: 3-step wizard for creating table schemas
  - Table information with input method selection (manual/CSV/stored schemas)
  - Field definition with templates and validation
  - Review and confirmation with visual preview
- **DataViewer**: Display saved schemas with search and filtering
- **SchemaCard**: Individual schema preview cards with actions
- **SchemaBrowser**: Browse and import from existing schemas

### App Configuration Components
**Text2SQL application setup and management**

- **AppConfigurationWizard**: 4-step wizard for text2sql app setup
  - Step 1: Load tables with refresh functionality
  - Step 2: App name input with validation guidelines
  - Step 3: Table selection with interactive checkboxes
  - Step 4: Business instructions with comprehensive guidance
- **AppConfigurationViewer**: Display app configurations with expandable details
- **ProfileSchemaCard**: App configuration preview cards

### CSV Import Components
**File upload and data import functionality**

- **CSVUploader**: File upload with drag-and-drop, validation, and parsing
- **CSVPreview**: Preview parsed CSV data with field mapping options

### Layout & UI Components
**Application structure and user interface elements**

- **Header**: Application header with navigation and status indicators
- **UserProfilePanel**: User information panel with quick actions
- **SchemaStats**: Dashboard statistics and metrics display
- **TablesList**: List view for table schemas
- **UI Components**: Located in `ui/` subdirectory using Radix UI primitives

## Component Structure Standards

### Main Components
- Use TypeScript with explicit prop interfaces
- Use 'use client' directive for client-side components
- Import React hooks from 'react' package
- Use proper component naming (PascalCase)
- Export as default export with named type exports

### Wizard Components
- Multi-step flow with consistent progress indicators
- Step validation with specific error messages
- Loading states for async operations
- Form state management with React Hook Form
- Step navigation with disabled states for invalid steps

### Form Components
- Use React Hook Form with Zod validation
- Import zodResolver from '@hookform/resolvers/zod'
- Define schemas outside component function
- Use Controller for complex form fields (Select, etc.)
- Follow established field validation patterns:
  - Field names: `/^[a-zA-Z_][a-zA-Z0-9_]*$/`
  - App names: Minimum 1 character with uniqueness validation
  - Business instructions: Minimum 10 characters
  - Table selection: Minimum 1 table required

### Viewer Components  
- Expandable/collapsible interfaces with state management
- Loading skeletons for async data fetching
- Empty states with helpful messaging
- Action buttons with proper loading states
- Data formatting (dates, counts, etc.)

### UI Components (ui/ directory)
- Built on Radix UI primitives
- Use class-variance-authority (cva) for variant handling
- Import cn utility from '@/lib/utils'
- Use forwardRef pattern for proper ref handling
- Export both component and variants
- Include proper TypeScript interfaces extending HTML attributes

### Animation & Interactions
- Use framer-motion for step transitions and page animations
- Import icons from lucide-react with consistent sizing (w-4 h-4, w-5 h-5)
- Use consistent hover states and transitions
- Loading animations with spin classes
- Progress indicators with smooth transitions
- AnimatePresence for step transitions

### Styling Conventions
- Use Tailwind CSS classes with consistent patterns
- Hover shadows: `hover:shadow-card-hover`, `hover:shadow-md`
- Focus styles: `focus-visible:ring-2 focus-visible:ring-ring`
- Disabled states with `opacity-50` and `cursor-not-allowed`
- Consistent padding: `p-4`, `p-6` for cards; `px-3 py-2` for inputs
- Spacing patterns: `space-y-4`, `space-y-6` for vertical layouts
- Border radius: `rounded-lg` for cards, `rounded-md` for inputs

### Component Props & Interfaces
```typescript
// Example interface pattern
interface ComponentProps {
  // Required props first
  data: DataType
  onAction: (item: DataType) => void
  
  // Optional props with defaults
  isLoading?: boolean
  disabled?: boolean
  variant?: 'default' | 'outline'
  
  // HTML attributes extension
  className?: string
  children?: React.ReactNode
}
```

### State Management Patterns
- **Form state**: React Hook Form for complex forms with validation
- **UI state**: useState for component-level state (expanded, loading, etc.)
- **Loading states**: Consistent loading indicators across all async operations
- **Error states**: User-friendly error messages with recovery suggestions

### Error Handling
- Graceful error boundaries for component crashes
- User-friendly error messages with actionable suggestions
- Loading error states with retry functionality
- Form validation errors with field-specific messages

### File Organization
- One component per file matching component name
- Group related components logically by feature
- UI primitives in `ui/` subdirectory
- Complex wizard/form components at root level
- Export patterns:
  ```typescript
  export default ComponentName
  export type { ComponentProps }
  ```

### Import Patterns
- Use path aliases (@/components, @/lib, @/app)
- Group imports in order:
  1. React and React hooks
  2. Third-party libraries (react-hook-form, zod, framer-motion)
  3. UI components and utilities
  4. Local components and types
  5. Icons (lucide-react)

### Component Development Guidelines
- **Accessibility**: Proper ARIA labels, keyboard navigation, screen reader support
- **Performance**: Lazy loading for large lists, memo for expensive computations
- **Testing**: Props validation, user interactions, error scenarios
- **Documentation**: Clear prop interfaces, usage examples in comments
- **Reusability**: Generic props, configurable behavior, composable design

### Data Flow Patterns
- Props down, events up pattern
- Callback functions for user interactions
- Loading states passed down from parent
- Error handling at appropriate component level
- State hoisting for shared state between components