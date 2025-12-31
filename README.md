# 🚌 BusTracker

> Real-time bus tracking and monitoring system with deployment to production environment

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=white)](https://react.dev/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [API Endpoints](#api-endpoints)
- [Key Features](#key-features)
- [Deployment](#deployment)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

BusTracker is a comprehensive real-time bus tracking and monitoring application. It enables users to track bus locations in real-time, check schedules, and receive updates about bus arrivals and departures. The project features a modern full-stack architecture with separate frontend and backend components.

## ✨ Features

- ✅ Real-time bus location tracking
- ✅ Live schedule management
- ✅ User-friendly web interface
- ✅ Responsive design for mobile and desktop
- ✅ Production deployment with auto-scaling
- ✅ RESTful API for bus tracking
- ✅ Efficient data handling with optimized queries
- ✅ Clean architecture with separated concerns

## 🛠 Tech Stack

### Frontend
- **TypeScript** - Type-safe JavaScript development
- **React** - UI library for building interactive interfaces
- **Modern CSS/Tailwind** - Responsive styling
- **Axios** - HTTP client for API communication

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web framework for REST APIs
- **TypeScript** - Type-safe backend development
- **Database** - MongoDB/PostgreSQL for data persistence

### DevOps & Deployment
- **Vercel** - Frontend deployment and hosting
- **Docker** - Containerization
- **CI/CD** - Automated testing and deployment pipeline

## 📁 Project Structure

```
bustracker/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API integration
│   │   └── App.tsx         # Main app component
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
│
├── backend/                  # Node.js/Express backend
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── models/        # Data models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Custom middleware
│   │   └── server.ts      # Express server
│   ├── .env.example       # Environment variables template
│   └── package.json       # Backend dependencies
│
├── docs/                    # Documentation
└── .gitignore             # Git ignore rules
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/shivamudipelly/bustracker.git
   cd bustracker
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

## ▶️ Running the Project

### Backend Setup

1. Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   NODE_ENV=development
   DATABASE_URL=your_database_url
   API_KEY=your_api_key
   ```

2. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

   The backend will run on `http://localhost:5000`

### Frontend Setup

1. Create a `.env.local` file in the `frontend` directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000
   ```

2. Start the frontend development server:
   ```bash
   cd frontend
   npm start
   ```

   The frontend will run on `http://localhost:3000`

## 🔌 API Endpoints

### Bus Tracking

- `GET /api/buses` - Get all buses
- `GET /api/buses/:id` - Get specific bus details
- `GET /api/buses/:id/location` - Get real-time location of a bus
- `POST /api/buses` - Create new bus entry (Admin)
- `PUT /api/buses/:id` - Update bus information (Admin)
- `DELETE /api/buses/:id` - Delete bus entry (Admin)

### Routes

- `GET /api/routes` - Get all bus routes
- `GET /api/routes/:id` - Get specific route details

### Schedules

- `GET /api/schedules` - Get all schedules
- `GET /api/schedules/:busId` - Get schedule for specific bus

## 📲 Key Features Explained

### Real-Time Tracking
- Uses WebSocket connections for live location updates
- Updates bus positions on the map in real-time
- Efficient data synchronization with minimal bandwidth

### Schedule Management
- Displays arrival and departure times
- Shows estimated time of arrival (ETA)
- Updates based on current location and traffic conditions

### User Interface
- Clean and intuitive design
- Mobile-responsive layout
- Dark mode support
- Accessibility features for all users

## 🌐 Deployment

### Frontend Deployment (Vercel)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push to main branch

### Backend Deployment

The backend includes deployment configuration for:
- Heroku
- AWS EC2
- Railway
- DigitalOcean

See the deployment documentation for detailed instructions.

## 🔮 Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Advanced filtering and search
- [ ] User notifications and alerts
- [ ] Route optimization algorithms
- [ ] Multi-language support
- [ ] Payment integration for tickets
- [ ] Admin analytics dashboard
- [ ] Machine learning for ETA prediction

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  Made with ❤️ by Shiva Mudipelly<br/>
  <a href="https://github.com/shivamudipelly">GitHub</a> • <a href="https://linkedin.com/in/shivamudipelly">LinkedIn</a>
</div>
