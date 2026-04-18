const express = require('express');
const cors = require('cors');
const { testConnection } = require('./models/database');
const { initializeDatabase } = require('./models/migration');
const authRoutes = require('./routes/auth');
const truckRoutes = require('./routes/trucks');
const driverRoutes = require('./routes/drivers');
const deliveryRoutes = require('./routes/deliveries');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database on server start
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      throw new Error('Database connection failed');
    }

    // Initialize database schema and demo data
    await initializeDatabase();

    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/trucks', truckRoutes);
    app.use('/api/drivers', driverRoutes);
    app.use('/api/deliveries', deliveryRoutes);

    // Health check endpoint
    app.get('/api/health', (req, res) => {
      res.json({
        status: 'OK',
        message: 'Haulage Truck Management API is running',
        database: 'connected'
      });
    });

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({ error: 'Something went wrong!' });
    });

    // 404 handler
    app.use('*', (req, res) => {
      res.status(404).json({ error: 'Route not found' });
    });

    app.listen(PORT, () => {
      console.log(`🚚 Haulage Truck Management API running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🗄️  Database: Connected and initialized`);
    });

  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
};

startServer();

