# Sweet Shop Management System

A full-stack MERN application for managing a sweet shop business.

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Express Validator

### Frontend
- React 18
- Vite
- React Router
- Axios

## Project Structure

```
Sweet-Shop-Management-System/
├── backend/
│   ├── src/
│   │   ├── config/         # Database and app configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Custom middleware (auth, error handling)
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic layer
│   │   ├── utils/          # Helper functions
│   │   └── server.js       # Entry point
│   ├── tests/              # Test files
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/           # API client configuration
│   │   ├── assets/        # Static assets
│   │   ├── components/    # Reusable React components
│   │   ├── context/       # React context for state management
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page components
│   │   ├── utils/         # Helper functions
│   │   ├── App.jsx        # Root component
│   │   └── main.jsx       # Entry point
│   └── package.json
│
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Sweet-Shop-Management-System
```

2. Set up the backend:
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
```

3. Set up the frontend:
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your configuration
```

### Running the Application

1. Start MongoDB (if running locally)

2. Start the backend server:
```bash
cd backend
npm run dev
```

3. Start the frontend development server:
```bash
cd frontend
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Development

### Backend Development
- API runs on `http://localhost:5000`
- See `backend/README.md` for detailed backend documentation

### Frontend Development
- App runs on `http://localhost:5173`
- See `frontend/README.md` for detailed frontend documentation

## Code Quality

Both backend and frontend include:
- ESLint for code linting
- Prettier for code formatting

Run linting:
```bash
npm run lint
```

Fix linting issues:
```bash
npm run lint:fix
```

Format code:
```bash
npm run format
```

## Testing

Backend includes Jest for testing:
```bash
cd backend
npm test
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run linting and tests
4. Submit a pull request

## License

ISC
