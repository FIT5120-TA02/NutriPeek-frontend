# Nurturing Healthy Kids - Frontend

This is the frontend application for the Nurturing Healthy Kids project, built with Next.js 15, React 19, TypeScript, and Tailwind CSS 4.

## Project Overview

The Nurturing Healthy Kids frontend is a modern web application focused on children's health, education, and community support. The application features:

- Multilingual support (English, Chinese)
- Responsive design for all device sizes
- Component-based architecture for maintainability
- Modern UI with light/dark mode support
- Type-safe codebase with TypeScript

## Project Structure

```
.
├── src/                       # Source code
│   ├── app/                   # Next.js App Router pages
│   │   ├── [locale]/          # Localized routes
│   │   │   ├── page.tsx       # Home page
│   │   │   ├── layout.tsx     # Main layout
│   │   │   └── about/         # About page
│   │   └── global-error.tsx   # Global error handler
│   ├── components/            # Reusable UI components
│   │   └── ui/                # Base UI components
│   │       ├── Button.tsx     # Button component
│   │       └── Card.tsx       # Card component
│   ├── libs/                  # Library configurations
│   │   ├── i18n.ts            # Internationalization setup
│   │   ├── i18nNavigation.ts  # Navigation with i18n
│   │   ├── Env.ts             # Environment variables
│   │   └── Logger.ts          # Logging utility
│   ├── locales/               # Translation files
│   │   ├── en.json            # English translations
│   │   └── zh.json            # Chinese translations
│   ├── models/                # Data models and types
│   ├── styles/                # Global styles
│   ├── templates/             # Page templates
│   │   └── BaseTemplate.tsx   # Base layout template
│   ├── types/                 # TypeScript type definitions
│   ├── utils/                 # Utility functions
│   │   ├── AppConfig.ts       # Application configuration
│   │   ├── Helpers.ts         # Helper functions
│   │   └── ThemeColors.ts     # Theme color definitions
│   └── validations/           # Form validation schemas
├── public/                    # Static assets
├── middleware.ts              # Next.js middleware (for i18n routing)
├── next.config.js             # Next.js configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── postcss.config.js          # PostCSS configuration
├── eslint.config.mjs          # ESLint configuration
└── tsconfig.json              # TypeScript configuration
```

## Prerequisites

- Node.js 20.x or higher
- npm 9.x or higher

## Setup and Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd main-project-frontend
```

2. **Environment Setup**

Create a `.env` file at the root of the project based on the `.env.example`:

```bash
cp .env.example .env
```

Update the environment variables:

```
DATABASE_URL=<your-database-url>
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

3. **Install Dependencies**

```bash
npm install
```

4. **Run Development Server**

```bash
npm run dev
```

This starts the development server with Turbopack. The application will be available at [http://localhost:3000](http://localhost:3000).

## Build and Deployment

1. **Build for Production**

```bash
npm run build
```

2. **Start Production Server**

```bash
npm start
```

## Development Guidelines

### Code Structure

- **Components**: All reusable UI components should be placed in `src/components/ui/`
- **Pages**: Pages are organized in the Next.js App Router format in `src/app/[locale]/`
- **Templates**: Page templates are in `src/templates/`
- **Styles**: Use Tailwind CSS utility classes for styling
- **Internationalization**: Update translation files in `src/locales/`

### Adding a New Feature

1. **Plan your feature**
   - Determine which components are needed
   - Identify translations required
   - Consider responsive design needs

2. **Create/Update Components**
   - Add new components in `src/components/`
   - Ensure components are type-safe with TypeScript
   - Follow the existing design patterns

3. **Add Translations**
   - Add new translation keys to `src/locales/en.json`
   - If you know both languages, update `zh.json` as well
   - Otherwise, mark untranslated keys for later translation

4. **Create New Pages (if needed)**
   - Add new pages in `src/app/[locale]/`
   - Use the appropriate template for consistency

5. **Test**
   - Test the feature in development mode
   - Test responsive behavior across device sizes
   - Test in different languages

### Internationalization

The project uses `next-intl` for internationalization. To use translations in your components:

```tsx
// In server components:
import { getTranslations } from 'next-intl/server';

export default async function MyComponent() {
  const t = await getTranslations('NamespaceName');
  
  return <div>{t('translation_key')}</div>;
}

// In client components:
import { useTranslations } from 'next-intl';

export function MyClientComponent() {
  const t = useTranslations('NamespaceName');
  
  return <div>{t('translation_key')}</div>;
}
```

To add new translations:
1. Add the new key to `src/locales/en.json`
2. Add the same key with translated content to `src/locales/zh.json`

### Styling

This project uses Tailwind CSS 4 for styling. Key styling practices:

- Use Tailwind utility classes directly in JSX
- For complex components, consider using composition patterns
- Theme colors are defined in `src/utils/ThemeColors.ts`
- Follow the mobile-first approach (design for mobile, then expand for larger screens)

## Testing

Run the linter to check for code quality issues:

```bash
npm run lint
```

## Contributing

1. Create a feature branch from the main branch
2. Make your changes following the development guidelines
3. Ensure all linting checks pass
4. Submit a pull request
## License

[Your License Here]
# retry deploy
