# Sweet Shop Management System - Frontend

Frontend application for the Sweet Shop Management System built with React and Vite.

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the frontend directory:
```bash
cp .env.example .env
```

3. Update the `.env` file with your API URL.

### Running the Application

Development mode:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Check code linting
- `npm run lint:fix` - Fix linting issues
- `npm run format` - Format code with Prettier

## Project Structure

```
frontend/
├── public/             # Static files
├── src/
│   ├── api/           # API client and services
│   ├── assets/        # Images, fonts, etc.
│   ├── components/    # Reusable components
│   ├── context/       # React context providers
│   ├── hooks/         # Custom hooks
│   ├── pages/         # Page components
│   ├── utils/         # Utility functions
│   ├── App.jsx        # Main app component
│   ├── App.css        # App styles
│   ├── main.jsx       # Entry point
│   └── index.css      # Global styles
├── index.html
└── package.json
```

## Environment Variables

See `.env.example` for required environment variables.
