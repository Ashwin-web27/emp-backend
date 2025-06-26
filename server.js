require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerUI = require('swagger-ui-express');
const path = require('path');

// Initialize Express app
const app = express();

// Configure CORS
const allowedOrigins = [
  'http://localhost:5173',
  'https://mrgroup.com.co',
  'https://www.mrgroup.com.co'
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Simple test route to verify server is working
app.get('/', (req, res) => {
  res.send('Employee Management API is running');
});

// API Routes - Load them safely
const loadRoutes = () => {
  try {
    // Import route files
    const authRoutes = require('./routes/authRoutes');
    const employeeRoutes = require('./routes/employeeRoutes');
    const userRoutes = require('./routes/userRoutes');
    const subadminRoutes = require('./routes/subadminRoutes');
    const adminRoutes = require('./routes/adminRoutes');

    // Use routes
    app.use('/api/v1/auth', authRoutes);
    app.use('/api/employee', employeeRoutes);
    app.use('/api/v1/users', userRoutes);
    app.use('/api/v1/subadmin', subadminRoutes);
    app.use('/api/admin', adminRoutes);

    console.log('All routes loaded successfully');
  } catch (err) {
    console.error('Route loading error:', err);
    process.exit(1);
  }
};

// Load routes
loadRoutes();

// Swagger Documentation (if exists)
try {
  const swaggerDocument = require('./swagger/swagger.json');
  app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));
  console.log('Swagger UI available at /api-docs');
} catch (err) {
  console.warn('Swagger documentation not found or error loading it');
}

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    message: 'Service is healthy',
    timestamp: new Date().toISOString()
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'Origin not allowed'
    });
  }

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Server Configuration
const PORT = process.env.PORT || 5000;
const ENV = process.env.NODE_ENV || 'development';

const server = app.listen(PORT, () => {
  console.log(`Server running in ${ENV} mode on port ${PORT}`);
  console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
});

// Process handlers
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = server;