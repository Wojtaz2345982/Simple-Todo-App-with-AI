# TaskAI 1.0

# Builded with Lovable.dev

A modern web application built with React, TypeScript, and Vite, featuring a beautiful UI powered by Shadcn UI components and Tailwind CSS.

## Features

- Modern React (v18) with TypeScript support
- Fast development and build times with Vite
- Beautiful UI components from Shadcn UI
- Responsive design with Tailwind CSS
- Authentication with Supabase
- Form handling with React Hook Form and Zod validation
- State management with React Query
- Routing with React Router
- Modern date handling with date-fns
- Beautiful charts with Recharts
- Toast notifications with Sonner
- Markdown support
- Dark mode support

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn or bun

## Installation

1. Clone the repository
```bash
git clone [your-repo-url]
cd taskAI_1.0
```

2. Install dependencies
```bash
npm install
# or
yarn install
# or
bun install
```

3. Set up environment variables
```bash
cp .env.example .env
```
Fill in your environment variables in the `.env` file.

## Development

Start the development server:
```bash
npm run dev
# or
yarn dev
# or
bun dev
```

## Building for Production

```bash
npm run build
# or
yarn build
# or
bun run build
```

## Linting

```bash
npm run lint
# or
yarn lint
# or
bun run lint
```

## Project Structure

```
taskAI_1.0/
├── src/
│   ├── components/    # Reusable UI components
│   ├── hooks/         # Custom React hooks
│   ├── integrations/  # Third-party integrations
│   ├── lib/          # Utility functions and configurations
│   ├── pages/        # Application pages/routes
│   └── App.tsx       # Main application component
├── public/           # Static assets
└── supabase/        # Supabase configurations
```

## Tech Stack

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Supabase](https://supabase.com/)
- [React Query](https://tanstack.com/query/latest)
- [React Router](https://reactrouter.com/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [Recharts](https://recharts.org/)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions, issues, and feature requests are welcome!
