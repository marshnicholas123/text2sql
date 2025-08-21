# Professional Profile UI Redesign Specification v4

## Overview
Complete redesign of the Text2SQL Studio application inspired by the professional profile design from Untitled UI, featuring a sophisticated two-column layout with profile-style schema cards, user information panel, and enhanced professional aesthetics.

## Design Reference
Based on the Untitled UI profile page design featuring:
- Clean two-column layout (60/40 split)
- Professional profile cards with hero banners
- User information panel with statistics
- Modern typography and spacing
- Professional action buttons and interactions

## Core Design Principles

### 1. Professional Profile Aesthetic
- **Clean, card-based design** with proper shadows and spacing
- **Professional typography** with clear hierarchy
- **Neutral color palette** with subtle accent colors
- **Modern interaction patterns** following industry standards

### 2. Information Architecture
- **Primary content** (schemas) takes prominence in left column
- **User/context information** in dedicated right panel
- **Clear visual hierarchy** with proper content grouping
- **Logical action placement** following user workflow

## Detailed Component Specifications

### 1. Main Layout Structure (`page.tsx`)
```typescript
<div className="professional-layout">
  <ProfessionalHeader />
  <main className="two-column-layout">
    <div className="primary-content">       // 60% width
      <SchemasSection />
    </div>
    <div className="sidebar-content">       // 40% width
      <UserProfilePanel />
    </div>
  </main>
</div>
```

**Layout Features:**
- Responsive two-column grid (lg:grid-cols-5, primary takes cols 1-3, sidebar takes cols 4-5)
- Mobile: Single column with sidebar below primary content
- Consistent 24px gap between sections
- Container max-width with centered content

### 2. ProfileSchemaCard Component
```typescript
interface SchemaCardProps {
  schema: {
    id: string;
    name: string;
    description: string;
    fieldCount: number;
    createdAt: Date;
    lastModified: Date;
    status: 'active' | 'draft' | 'archived';
  };
}
```

**Visual Design:**
- **Hero banner area** with gradient background (similar to "Good Day Studio" banner)
- **Schema icon/avatar** with verification-style badge for status
- **Title and description** matching profile name/bio format
- **Statistics row** showing field count, creation date, usage metrics
- **Action buttons** (Edit, Delete, Export) styled like Follow/Message/Save buttons

**Color Coding:**
- Active schemas: Green accent
- Draft schemas: Blue accent  
- Archived schemas: Gray accent

### 3. UserProfilePanel Component
```typescript
interface UserPanelProps {
  user: {
    name: string;
    role: string;
    organization: string;
    avatar?: string;
  };
  stats: {
    totalSchemas: number;
    activeQueries: number;
    successRate: number;
  };
}
```

**Panel Sections:**
1. **User Information**
   - Avatar with name and role
   - Organization/company information
   - Professional styling matching profile header

2. **Statistics Display**
   - Schema count (like "862 Followers")
   - Active queries (like "416 Following") 
   - Success rate (like "32 Posts")

3. **Quick Actions**
   - "Create Schema" (primary button)
   - "Import CSV" (secondary button)
   - "Export All" (tertiary button)

4. **Recent Activity** (if space permits)
   - Recent schema modifications
   - System notifications

### 4. Enhanced Header Component (`ProfessionalHeader.tsx`)
```typescript
interface HeaderProps {
  breadcrumbs: Array<{label: string; href?: string}>;
  actions: Array<{label: string; variant: string; onClick: () => void}>;
  status?: {message: string; type: 'success' | 'warning' | 'info'};
}
```

**Header Features:**
- **Breadcrumb navigation** (Text2SQL Studio > Schemas > [Current View])
- **Status indicator** ("Changes saved" style notifications)
- **Action buttons** (Share/Export, Publish/Deploy equivalent)
- **Consistent with app branding** while matching professional aesthetic

### 5. SchemaStats Component
```typescript
interface StatsProps {
  stats: {
    label: string;
    value: string | number;
    change?: {value: number; type: 'increase' | 'decrease'};
    icon?: React.ReactNode;
  }[];
}
```

**Statistics Design:**
- Clean number display with labels
- Optional trend indicators (↑ ↓)
- Icon support for visual context
- Responsive layout for different screen sizes

## Technical Implementation Details

### Color Palette
```css
/* Professional neutral palette */
--color-neutral-50: #fafafa;
--color-neutral-100: #f5f5f5;
--color-neutral-200: #e5e5e5;
--color-neutral-300: #d4d4d4;
--color-neutral-500: #737373;
--color-neutral-700: #404040;
--color-neutral-900: #171717;

/* Professional accent colors */
--color-blue-500: #3b82f6;
--color-blue-600: #2563eb;
--color-green-500: #10b981;
--color-purple-500: #8b5cf6;
```

### Typography Scale
```css
/* Matching professional profile typography */
.heading-profile: 32px, font-weight: 700, line-height: 1.2
.heading-section: 24px, font-weight: 600, line-height: 1.3
.body-large: 18px, font-weight: 400, line-height: 1.6
.body-regular: 16px, font-weight: 400, line-height: 1.5
.caption: 14px, font-weight: 500, line-height: 1.4
.label: 12px, font-weight: 600, line-height: 1.3, text-transform: uppercase
```

### Card Design System
```css
.profile-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 200ms ease;
}

.profile-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.card-hero-banner {
  height: 120px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px 12px 0 0;
}
```

### Button System
```css
/* Professional button styles matching Follow/Message patterns */
.btn-primary {
  background: #2563eb;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
}

.btn-secondary {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
}

.btn-tertiary {
  background: transparent;
  color: #6b7280;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
}
```

## Responsive Design Strategy

### Desktop (1024px+)
- Two-column layout with 60/40 split
- Full feature set with all components visible
- Hover interactions and animations enabled

### Tablet (768px - 1023px)
- Maintained two-column but adjusted ratios (70/30)
- Condensed user panel with essential info only
- Touch-friendly button sizes

### Mobile (< 768px)
- Single column layout
- User panel moves below primary content
- Simplified card design with essential info
- Bottom navigation for actions

## User Experience Enhancements

### Micro-Interactions
1. **Card hover effects** with subtle elevation and shadow
2. **Button press feedback** with scale animation
3. **Loading states** with skeleton placeholders
4. **Success animations** for actions (create, edit, delete)

### Information Hierarchy
1. **Visual scanning** - F-pattern layout with clear entry points
2. **Progressive disclosure** - Show essential info first, details on demand
3. **Contextual actions** - Actions appear near relevant content
4. **Status communication** - Clear feedback for all user actions

### Accessibility Features
- **Keyboard navigation** support for all interactive elements
- **Screen reader** optimized with proper ARIA labels
- **High contrast** mode support
- **Focus indicators** clearly visible
- **Touch targets** minimum 44px for mobile

## Performance Considerations
- **Optimized images** for hero banners and avatars
- **Lazy loading** for schema cards beyond viewport
- **Efficient animations** using CSS transforms
- **Minimal bundle impact** - reuse existing component patterns
- **Fast interactions** - 200ms max for UI feedback

## Implementation Priority

### Phase 1 (Core Layout)
1. ProfileSchemaCard component
2. UserProfilePanel component  
3. Main layout restructure
4. Basic styling implementation

### Phase 2 (Enhanced Features)
1. SchemaStats component
2. Enhanced header with breadcrumbs
3. Micro-interactions and animations
4. Mobile responsive optimizations

### Phase 3 (Polish)
1. Advanced hover effects
2. Loading and error states
3. Accessibility improvements
4. Performance optimizations

## Success Metrics
- **Visual Quality**: Matches professional design standards
- **User Engagement**: Improved interaction with schema management
- **Usability**: Reduced time to complete common tasks
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: No degradation in load times or interactions

## Browser Support
- Chrome 88+ (95% market share)
- Firefox 85+ (4% market share)  
- Safari 14+ (15% market share)
- Edge 88+ (4% market share)

---

**Implementation Date**: August 2025  
**Version**: 4.0  
**Status**: In Progress  
**Designer**: Based on Untitled UI Profile Design
**Next Review**: September 2025