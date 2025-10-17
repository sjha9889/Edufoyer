import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const app = express();

// Trust proxy for proper IP detection behind Nginx
app.set('trust proxy', true);

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create HTTP server and attach Socket.IO for real-time updates
import http from 'http';
import { initSocket } from './socket.js';
const server = http.createServer(app);

// Enhanced server configuration for stability
server.keepAliveTimeout = 65000; // 65 seconds
server.headersTimeout = 66000; // 66 seconds
server.maxConnections = 1000; // Maximum connections

// Initialize Socket.IO with error handling
try {
  initSocket(server);
} catch (error) {
  console.error('Socket.IO initialization error:', error);
}

// Security middleware
app.use(helmet());

// Rate limiting with better configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Increased limit for better user experience
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  },
  // Trust proxy for proper IP detection behind Nginx
  trustProxy: true,
  // Skip rate limiting for specific headers
  skipSuccessfulRequests: false,
  skipFailedRequests: false
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5000', 'https://edufoyer.com', 'http://edufoyer.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200 // For legacy browser support
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Enhanced health check endpoint
app.get('/health', (req, res) => {
  const healthCheck = {
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    connections: server.connections || 'N/A',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  };
  
  res.json(healthCheck);
});

// Graceful shutdown endpoint
app.post('/shutdown', (req, res) => {
  res.json({ message: 'Server shutting down gracefully...' });
  setTimeout(() => {
    process.exit(0);
  }, 1000);
});

// Import routes
import authRoutes from './routes/auth.js';
import doubtRoutes from './routes/doubt.js';
import solverRoutes from './routes/solver.js';
import profileRoutes from './routes/profile.js';
import notificationRoutes from './routes/notification.js';
import livekitRoutes from './routes/livekit.js';
import socialRoutes from './routes/social.js';

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/doubts', doubtRoutes);
app.use('/api/solver', solverRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/livekit', livekitRoutes);
app.use('/api/social', socialRoutes);

// Serve frontend build (single-port setup) if available
const frontendDistPath = path.resolve(__dirname, '../final/dist');
const isFrontendBuilt = fs.existsSync(path.join(frontendDistPath, 'index.html'));
if (isFrontendBuilt) {
  // Serve static files with proper headers
  app.use(express.static(frontendDistPath, {
    maxAge: '1d', // Cache static assets for 1 day
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
      // Set proper MIME types for CSS and JS files
      if (path.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
      } else if (path.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      } else if (path.endsWith('.svg')) {
        res.setHeader('Content-Type', 'image/svg+xml');
      }
    }
  }));
  
  // Handle favicon and other common assets
  app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'favicon.ico'));
  });
  
  app.get('/vite.svg', (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'vite.svg'));
  });
  
  // Handle assets directory requests
  app.get('/assets/*', (req, res) => {
    const assetPath = path.join(frontendDistPath, req.path);
    res.sendFile(assetPath);
  });
  
  // SPA fallback for non-API routes
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path === '/health') return next();
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  console.warn('Frontend build not found at', frontendDistPath, '- skipping static serve. Run "npm run build" in the final/ app.');
}

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error'
  });
});

// Enhanced MongoDB connection with retry logic
const connectDB = async () => {
  const maxRetries = 5;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/doubt-system', {
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        retryWrites: true,
        retryReads: true,
        maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
        connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
        heartbeatFrequencyMS: 10000 // Send a ping every 10 seconds
      });
      
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      
      // Handle connection events
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
      });
      
      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected. Attempting to reconnect...');
      });
      
      mongoose.connection.on('reconnected', () => {
        console.log('MongoDB reconnected successfully');
      });
      
      return;
    } catch (error) {
      retries++;
      console.error(`MongoDB connection attempt ${retries} failed:`, error.message);
      
      if (retries === maxRetries) {
        console.error('Max retries reached. MongoDB connection failed.');
        process.exit(1);
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 2000 * retries));
    }
  }
};

// Start server with enhanced error handling
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
      console.log(`❓ Doubts API: http://localhost:${PORT}/api/doubts`);
      console.log(`👨‍💼 Solver API: http://localhost:${PORT}/api/solver`);
      console.log(`👤 Profile API: http://localhost:${PORT}/api/profile`);
      console.log(`🔔 Notifications API: http://localhost:${PORT}/api/notifications`);
      console.log(`📹 LiveKit API: http://localhost:${PORT}/api/livekit`);
      console.log(`📱 Social API: http://localhost:${PORT}/api/social`);
      console.log(`\n📝 Test credentials:`);
      console.log(`   Email: test@example.com`);
      console.log(`   Password: password123`);
    });
    
    // Enhanced server event handling
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please try a different port.`);
      } else {
        console.error('Server error:', error);
      }
      process.exit(1);
    });
    
    server.on('close', () => {
      console.log('Server closed');
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Enhanced process error handling
process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Promise Rejection at:', promise, 'reason:', err);
  // Don't exit the process, just log the error
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Graceful shutdown
  server.close(() => {
    process.exit(1);
  });
});

// Graceful shutdown on SIGTERM and SIGINT
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close();
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close();
    process.exit(0);
  });
});

// Memory monitoring
setInterval(() => {
  const memUsage = process.memoryUsage();
  if (memUsage.heapUsed > 500 * 1024 * 1024) { // 500MB
    console.warn('High memory usage detected:', memUsage);
  }
}, 30000); // Check every 30 seconds
