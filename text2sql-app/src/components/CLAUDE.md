# Components Module Guidelines

This directory contains React components for the Text2SQL application. Follow these conventions when working with components.

## Component Structure

### Main Components
- Use TypeScript with explicit prop interfaces
- Use 'use client' directive for client-side components
- Import React hooks from 'react' package
- Use proper component naming (PascalCase)

### Form Components
- Use React Hook Form with Zod validation
- Import zodResolver from '@hookform/resolvers/zod'
- Define schemas outside component function
- Use Controller for complex form fields
- Follow established field validation patterns:
  - Field names: `/^[a-zA-Z_][a-zA-Z0-9_]*$/`
  - Minimum lengths with descriptive error messages
  - Max limits (e.g., 50 fields maximum)

### UI Components (ui/ directory)
- Built on Radix UI primitives
- Use class-variance-authority (cva) for variant handling
- Import cn utility from '@/lib/utils'
- Use forwardRef pattern for proper ref handling
- Export both component and variants
- Include proper TypeScript interfaces extending HTML attributes

### Animation & Interactions
- Use framer-motion for animations
- Import icons from lucide-react
- Use consistent hover states and transitions
- Include active:scale-95 for button interactions
- Duration-200 for transitions

### Styling Conventions
- Use Tailwind CSS classes
- Consistent hover shadows (hover:shadow-card-hover)
- Ring focus styles for accessibility
- Disabled states with opacity-50
- Consistent padding and spacing patterns

### Component Props
- Use VariantProps from class-variance-authority
- Include asChild prop for polymorphic components
- Extend proper HTML attributes (e.g., ButtonHTMLAttributes)
- Use optional props with sensible defaults

### File Organization
- One component per file
- Match filename to component name
- Group related components logically
- UI primitives in ui/ subdirectory
- Complex form components at root level

### Import Patterns
- Use path aliases (@/components, @/lib)
- Group imports: React, third-party, local components, utilities
- Import types separately when needed