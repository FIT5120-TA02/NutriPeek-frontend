# Main Project Frontend

This is the frontend for the Main Project built with Next.js 15, TypeScript, and Tailwind CSS 4.

## Architecture Overview

This project follows a modern, component-based architecture with an emphasis on maintainability, type safety, and responsive design. Key architectural features include:

- **Next.js App Router**: Page routing is handled using Next.js 15's App Router pattern
- **Component-Based Structure**: Modular components designed for reusability
- **Responsive Design**: Mobile-first approach using Tailwind CSS 4
- **TypeScript**: Type safety throughout the codebase
- **Theming**: Theme-aware components with light/dark mode support

## Project Structure

```
.
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Home page
│   ├── components/             # React components
│   │   ├── Header.tsx          # Site header
│   │   ├── Footer.tsx          # Site footer
│   │   ├── Hero.tsx            # Hero section
│   │   ├── FeatureSection.tsx  # Features display
│   │   ├── CTASection.tsx      # Call-to-action section
│   │   └── Icons.tsx           # SVG icons
│   ├── templates/              # Page templates
│   │   └── BaseTemplate.tsx    # Base layout template
│   ├── styles/                 # Global styles
│   │   └── globals.css         # Global CSS with Tailwind
│   ├── utils/                  # Utility functions
│   ├── libs/                   # 3rd party libraries config
│   ├── locales/                # i18n resources
│   ├── models/                 # Data models
│   ├── types/                  # TypeScript types
│   └── validations/            # Validation schemas
├── public/                     # Static assets
├── tailwind.config.js          # Tailwind CSS configuration
├── next.config.ts              # Next.js configuration
├── postcss.config.mjs          # PostCSS configuration
├── eslint.config.mjs           # ESLint configuration
└── tsconfig.json               # TypeScript configuration
```

## Prerequisites

- Node.js 20.x or higher
- npm 9.x or higher

## Getting Started

1. **Clone the repository**

```bash
git clone [repository-url]
cd main-project-frontend
```

2. **Install dependencies**

```bash
npm install
```

3. **Run the development server**

```bash
npm run dev
```

This starts the development server with Turbopack. The application will be available at [http://localhost:3000](http://localhost:3000).

4. **Build for production**

```bash
npm run build
```

5. **Start the production server**

```bash
npm start
```

## Development Workflow

- **Component Development**: Add new components in the `src/components` directory
- **Page Creation**: Add new pages in the appropriate directory under `src/app`
- **Styling**: Use Tailwind CSS utility classes for styling components
- **Code Quality**: Follow the project's code quality standards

## Code Quality

This project follows strict code quality standards:

- TypeScript for static type checking
- ESLint for code linting
- Husky for git hooks to ensure code quality
- Proper component typing with React.FC and interfaces

## Key Features

- Responsive layout that works across all device sizes
- Accessible components following WCAG guidelines
- Theme support with light and dark modes
- Reusable component architecture

## Deployment

The application can be deployed to any hosting platform that supports Next.js applications.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
