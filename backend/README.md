# Bus Tracking System Backend

A professional, production-ready Express.js backend built with TypeScript following industry best practices.

## 🚀 Features

- **Clean Architecture**: Separation of concerns with controllers, services, repositories
- **Type Safety**: Full TypeScript implementation with comprehensive type definitions
- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Real-time Updates**: Socket.IO integration for live bus tracking
- **Email Services**: Automated verification and password reset emails
- **Input Validation**: Joi schema validation for all endpoints
- **Error Handling**: Centralized error handling with custom error classes
- **Logging**: Structured logging with Winston
- **Security**: Helmet, rate limiting, CORS protection
- **Testing**: Jest setup with MongoDB Memory Server
- **Code Quality**: ESLint, Prettier, and TypeScript strict mode

## 🏗️ Architecture

\`\`\`
src/
├── config/          # Configuration files (database, logger, environment)
├── controllers/     # Request handlers
├── middleware/      # Custom middleware (auth, validation, error handling)
├── models/          # Mongoose models
├── repositories/    # Data access layer
├── routes/          # Route definitions
├── services/        # Business logic layer
├── socket/          # Socket.IO handlers
├── types/           # TypeScript type definitions
├── utils/           # Utility functions and helpers
├── __tests__/       # Test files
├── app.ts           # Express app configuration
└── server.ts        # Application entry point
\`\`\`

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.IO
- **Authentication**: JWT
- **Validation**: Joi
- **Logging**: Winston
- **Testing**: Jest
- **Code Quality**: ESLint, Prettier

## 📦 Installation

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Copy environment variables:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

4. Update the `.env` file with your configuration

5. Start development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## 🔧 Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (development/production) | No |
| `PORT` | Server port | No |
| `MONGO_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `FRONTEND_URL` | Frontend application URL | Yes |
| `EMAIL_USER` | Email service username | Yes |
| `EMAIL_PASS` | Email service password | Yes |
| `LOG_LEVEL` | Logging level | No |

## 📡 API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users/verify-email` - Verify email address
- `POST /api/users/forgot-password` - Request password reset
- `POST /api/users/reset-password` - Reset password
- `GET /api/users/profile` - Get user profile
- `POST /api/users/logout` - User logout

### Admin
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create user
- `GET /api/admin/users/:id` - Get user by ID
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

### Buses
- `GET /api/buses` - Get all buses
- `GET /api/buses/:busId` - Get bus details
- `POST /api/buses` - Create bus (Admin only)
- `PUT /api/buses/:busId` - Update bus (Admin only)
- `DELETE /api/buses/:busId` - Delete bus (Admin only)

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/buses` - Get all buses for dashboard
- `GET /api/dashboard/bus-by-email` - Get bus by driver email

## 🔌 Socket.IO Events

### Client to Server
- `joinBus` - Join bus tracking room
- `leaveBus` - Leave bus tracking room
- `locationUpdate` - Update bus location

### Server to Client
- `busLocationUpdate` - Receive bus location updates

## 🚀 Deployment

1. Build the project:
   \`\`\`bash
   npm run build
   \`\`\`

2. Set production environment variables

3. Start the server:
   \`\`\`bash
   npm start
   \`\`\`

## 📝 Code Quality

The project enforces code quality through:

- **TypeScript**: Strict type checking
- **ESLint**: Code linting with TypeScript rules
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit checks

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
