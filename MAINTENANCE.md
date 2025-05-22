# Maintenance Activities

This document provides comprehensive guidelines for maintaining, extending, and refactoring the NutriPeek frontend codebase. It is designed to ensure that all future development activities maintain the existing architectural integrity while allowing for growth and improvement.

## Table of Contents

- [Code Structure & Organization](#code-structure--organization)
  - [Current Architecture](#current-architecture)
- [Extension Guidelines](#extension-guidelines)
  - [Adding New Routes/Pages](#adding-new-routespages)
  - [Adding New API Services](#adding-new-api-services)
  - [Adding New UI Components](#adding-new-ui-components)
- [Coding Standards](#coding-standards)
  - [TypeScript Standards](#typescript-standards)
  - [Component Structure](#component-structure)
  - [Styling Guidelines](#styling-guidelines)
- [Refactoring Guidelines](#refactoring-guidelines)
  - [When to Refactor](#when-to-refactor)
  - [Refactoring Techniques](#refactoring-techniques)
    - [Component Refactoring](#component-refactoring)
    - [Performance Optimizations](#performance-optimizations)
- [Internationalization (i18n)](#internationalization-i18n)
- [Testing Guidelines](#testing-guidelines)
- [Documentation Requirements](#documentation-requirements)
- [Dependency Management](#dependency-management)
- [Continuous Integration](#continuous-integration)

## Code Structure & Organization

### Current Architecture

The NutriPeek frontend follows a feature-based architecture within the Next.js App Router framework:

```
src/
├── app/                       # Next.js App Router pages
│   ├── [locale]/              # Localized routes
│   │   ├── NutriScan/         # Food scanning feature
│   │   ├── NutriGap/          # Nutrition gap analysis
│   │   ├── NutriRecommend/    # Food recommendations
│   │   ├── SeasonalFood/      # Seasonal food information
│   │   ├── BuildPlate/        # Interactive meal planning
│   │   ├── MatchAndLearn/     # Educational game
│   │   ├── Profile/           # User profile management
│   │   ├── Note/              # Note-taking functionality
│   │   ├── session/           # Collaborative sessions
│   │   ├── Welcome/           # Landing page
│   │   ├── layout.tsx         # Localized layout wrapper
│   │   └── page.tsx           # Home page
├── components/                # React components
│   ├── ui/                    # Shared UI components
│   ├── NutriScan/             # Feature-specific components
│   ├── NutriGap/
│   └── ...                    # Other feature components
├── contexts/                  # React context providers
├── hooks/                     # Custom React hooks
├── utils/                     # Utility functions
├── api/                       # API integration layer
├── libs/                      # Library configurations
├── locales/                   # Translation files
└── middleware.ts              # Next.js middleware for i18n
```

## Extension Guidelines

### Adding New Routes/Pages

1. **Create a New Feature Directory**:

   ```bash
   mkdir -p src/app/[locale]/NewFeature
   ```

2. **Add the Page Component**:

   Create a `page.tsx` file in the new directory:

   ```tsx
   // src/app/[locale]/NewFeature/page.tsx
   
   import { getTranslations } from 'next-intl/server';
   
   export default async function NewFeaturePage() {
     // Get translations for this namespace
     const t = await getTranslations('NewFeature');
     
     return (
       <div className="container mx-auto px-4 py-8">
         <h1 className="text-2xl font-bold mb-4">{t('title')}</h1>
         {/* Page content */}
       </div>
     );
   }
   ```

3. **Add Route-specific Components**:

   ```bash
   mkdir -p src/components/NewFeature
   ```

   Create components related to this feature in the new directory.

4. **Add Translations**:

   Update both `src/locales/en.json` and `src/locales/zh.json` with new translation keys for your feature:

   ```json
   {
     "NewFeature": {
       "title": "New Feature Title",
       "description": "Description of the new feature"
     }
   }
   ```

5. **Update Navigation** (if applicable):

   Add links to your new feature in relevant navigation components.

### Adding New API Services

1. **Extend the API Service Class**:

   Add new methods to the `nutripeekApi.ts` file for your feature:

   ```typescript
   // src/api/nutripeekApi.ts
   
   /**
    * New feature API methods
    */
   async newFeatureMethod(param: NewFeatureParamType): Promise<NewFeatureResponseType> {
     return apiClient.get<NewFeatureResponseType>(`/api/v1/new-feature/${param}`);
   }
   ```

2. **Add Type Definitions**:

   Define request and response types in `src/api/types.ts`:

   ```typescript
   // src/api/types.ts
   
   export interface NewFeatureParamType {
     id: string;
     // Other parameters
   }
   
   export interface NewFeatureResponseType {
     data: string;
     // Response data structure
   }
   ```

3. **Create React Hooks** (if needed):

   Add hooks for the new API methods in `src/api/hooks.ts`:

   ```typescript
   // src/api/hooks.ts
   
   export function useNewFeature(param: string) {
     const [data, setData] = useState<NewFeatureResponseType | null>(null);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState<Error | null>(null);
     
     // Implementation
     
     return { data, loading, error };
   }
   ```

### Adding New UI Components

1. **Create Component File**:

   For shared UI components:

   ```bash
   touch src/components/ui/NewComponent.tsx
   ```

2. **Implement the Component**:

   ```tsx
   // src/components/ui/NewComponent.tsx
   
   import { ReactNode } from 'react';
   
   interface NewComponentProps {
     children: ReactNode;
     variant?: 'primary' | 'secondary';
     // Other props
   }
   
   export function NewComponent({ 
     children, 
     variant = 'primary',
     ...props 
   }: NewComponentProps) {
     return (
       <div 
         className={`
           p-4 rounded-md
           ${variant === 'primary' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-900'}
         `}
         {...props}
       >
         {children}
       </div>
     );
   }
   ```

3. **Document the Component**:

   Add JSDoc comments to explain component usage, props, and examples.

## Coding Standards

### TypeScript Standards

1. **Type Definitions**:
   - Prefer explicit typing over inferring
   - Use interfaces for API responses and complex objects
   - Use type aliases for unions, intersections, and simple types
   - Export all public types

   ```typescript
   // Good
   type ButtonVariant = 'primary' | 'secondary' | 'tertiary';
   
   interface ButtonProps {
     variant: ButtonVariant;
     onClick?: () => void;
     disabled?: boolean;
   }
   
   // Avoid
   interface ButtonProps {
     variant: string;
     onClick?: Function;
     disabled?: boolean;
   }
   ```

2. **Null Safety**:
   - Use optional chaining (`?.`) and nullish coalescing (`??`) operators
   - Avoid explicit null checks when possible
   - Initialize state with appropriate defaults

3. **Type Guards**:
   - Implement type guards for union types
   - Use discriminated unions when appropriate

   ```typescript
   // Example type guard
   function isErrorResponse(response: SuccessResponse | ErrorResponse): response is ErrorResponse {
     return 'error' in response;
   }
   ```

### Component Structure

1. **Functional Components**:
   - Use functional components with hooks
   - Implement proper memoization (`useMemo`, `useCallback`) for expensive operations
   - Destructure props for clarity

   ```tsx
   // Preferred pattern
   function MyComponent({ title, onClick }: MyComponentProps) {
     // Component implementation
   }
   ```

2. **Props Handling**:
   - Define prop interfaces with descriptive names
   - Use default props where appropriate
   - Document complex props with JSDoc comments

3. **State Management**:
   - Use React Context for global or shared state
   - Prefer local component state when possible
   - Consider data fetching hooks for API data

### Styling Guidelines

1. **Tailwind Usage**:
   - Follow utility-first approach with Tailwind CSS
   - Extract common patterns to custom component classes
   - Maintain responsive design principles
   - Use the existing color scheme defined in `ThemeColors.ts`

2. **Component Classes**:
   - Group related utilities with template literals
   - Use conditional classes based on props

   ```tsx
   <div
     className={`
       flex items-center p-4 rounded-lg
       ${isActive ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-900'}
       ${size === 'large' ? 'text-lg' : 'text-base'}
     `}
   >
     {children}
   </div>
   ```

## Refactoring Guidelines

### When to Refactor

Consider refactoring when:

1. **Code Duplication**: Similar code appears in multiple places
2. **Component Size**: Components exceed 300 lines
3. **Complexity**: Functions with too many parameters or nested logic
4. **Performance Issues**: Components causing excessive re-renders
5. **Tight Coupling**: Components or modules with too many dependencies

### Refactoring Techniques

#### Component Refactoring

1. **Extract Components**:
   - Identify reusable UI patterns
   - Create smaller, focused components
   - Ensure proper prop interfaces

   ```tsx
   // Before: Large monolithic component
   function Dashboard() {
     // 200+ lines of code with multiple responsibilities
   }
   
   // After: Extracted components
   function Dashboard() {
     return (
       <div>
         <DashboardHeader />
         <DashboardStats />
         <RecentActivities />
       </div>
     );
   }
   ```

2. **Custom Hooks**:
   - Extract complex logic into custom hooks
   - Follow the `use` prefix naming convention
   - Ensure hooks are testable in isolation

   ```tsx
   // Before: Logic embedded in component
   function Component() {
     const [data, setData] = useState(null);
     const [loading, setLoading] = useState(true);
     
     useEffect(() => {
       // Complex data fetching and transformation
     }, []);
     
     // Component rendering
   }
   
   // After: Custom hook
   function useDataFetching() {
     const [data, setData] = useState(null);
     const [loading, setLoading] = useState(true);
     
     useEffect(() => {
       // Complex data fetching and transformation
     }, []);
     
     return { data, loading };
   }
   
   function Component() {
     const { data, loading } = useDataFetching();
     // Simpler component rendering
   }
   ```

#### Performance Optimizations

1. **Memoization**:
   - Use `React.memo` for components that render often with the same props
   - Apply `useMemo` for expensive calculations
   - Implement `useCallback` for functions passed as props

2. **Data Fetching**:
   - Implement request caching when appropriate
   - Use pagination for large data sets
   - Consider implementing virtual scrolling for long lists

3. **Rendering Optimization**:
   - Avoid unnecessary re-renders
   - Keep state as local as possible
   - Use state management patterns like Zustand or Context API appropriately

## Internationalization (i18n)

When extending the application, always consider internationalization:

1. **Adding New Text**:
   - Never hardcode user-facing strings
   - Add all strings to both `en.json` and `zh.json` translation files
   - Use namespaces that match the feature or component

   ```tsx
   // In component
   const t = useTranslations('FeatureName');
   
   return <h1>{t('headingKey')}</h1>;
   
   // In locales/en.json
   {
     "FeatureName": {
       "headingKey": "Feature Heading"
     }
   }
   ```

2. **Date and Number Formatting**:
   - Use locale-aware formatters for dates and numbers
   - Consider cultural differences in formatting

## Testing Guidelines

When implementing new features or refactoring, maintain testability:

1. **Component Testing**:
   - Add `data-testid` attributes to key elements
   - Write tests for complex UI interactions
   - Test edge cases and error states

2. **Hook Testing**:
   - Create tests for custom hooks
   - Simulate different input scenarios
   - Verify state changes and side effects

3. **Integration Testing**:
   - Test feature workflows end-to-end
   - Verify interactions between components
   - Test API integration points

## Documentation Requirements

When extending or refactoring the codebase:

1. **Code Comments**:
   - Add JSDoc comments for functions and components
   - Document complex algorithms or business logic
   - Include usage examples for reusable components

2. **README Updates**:
   - Update feature documentation in relevant README files
   - Document any new configuration options
   - Provide usage examples for new components

3. **Change Documentation**:
   - Write clear commit messages explaining changes
   - Document breaking changes prominently
   - Update API documentation when endpoints change

## Dependency Management

When adding or updating dependencies:

1. **Adding Dependencies**:
   - Justify the need for new dependencies
   - Evaluate bundle size impact
   - Check for active maintenance and community support

2. **Updating Packages**:
   - Test thoroughly after updates
   - Update in manageable batches
   - Check for breaking changes in release notes

3. **Removing Dependencies**:
   - Identify unused or redundant packages
   - Replace with native solutions when possible
   - Ensure complete removal of related code

## Continuous Integration

For all code changes:

1. **Pre-commit Checks**:
   - Run linting before committing (`npm run lint`)
   - Ensure type checking passes
   - Fix failing tests before pushing

2. **Pull Requests**:
   - Create focused, single-purpose PRs
   - Include comprehensive PR descriptions
   - Reference related issues or requirements

3. **Code Reviews**:
   - Seek thorough code reviews
   - Address all review comments
   - Verify changes on different devices when applicable 