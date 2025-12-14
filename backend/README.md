# Sweet Shop Management System - Backend

Backend API for the Sweet Shop Management System built with Node.js, Express, and MongoDB.

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the backend directory:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration.

### Running the Application

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

### Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Check code linting
- `npm run lint:fix` - Fix linting issues
- `npm run format` - Format code with Prettier

## Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Custom middleware
│   ├── models/         # Mongoose models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   └── server.js       # Entry point
├── tests/              # Test files
└── package.json
```

## API Endpoints

TODO: Document API endpoints here

## Environment Variables

See `.env.example` for required environment variables.
