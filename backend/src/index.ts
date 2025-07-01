import express, { Application } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import connectDB from './config/db';
import userRoutes from './routes/userRoutes';
import adminRoutes from './routes/adminRoutes';
import busesRoutes from './routes/busRoutes';
import dotenv from 'dotenv';
import { handleSocketConnection } from './controllers/socketController';
import cookieParser from "cookie-parser";
import dashboardRoutes from './routes/dashboardRoute';
import { log } from 'util';

dotenv.config();

// Connect to MongoDB
connectDB();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server and WebSocket server
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST"],
        credentials: true,
    },
});

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use(cookieParser())

// Routes
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/buses', busesRoutes)
app.use('/api/dashboard', dashboardRoutes)


// Handle WebSocket connections
handleSocketConnection(io);

// Start Server
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
