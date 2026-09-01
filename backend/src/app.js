const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const config = require('./config');
const logger = require('./utils/logger');
const { rateLimiter } = require('./middleware/rateLimiter');
const { errorHandler } = require('./middleware/errorHandler');

// Routes
const authRoutes       = require('./routes/auth.routes');
const userRoutes       = require('./routes/user.routes');
const dashboardRoutes  = require('./routes/dashboard.routes');
const masterRoutes     = require('./routes/master.routes');
const gatewayRoutes    = require('./gateway/gateway.routes');
const settingsRoutes   = require('./routes/settings.routes');
const apiHubRoutes     = require('./routes/apiHub.routes');
const publicSyncRoutes = require('./routes/publicSync.routes');

const app = express();

// ============================================================
// Security & Utility Middleware
// ============================================================
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || config.cors.allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin ${origin} tidak diizinkan`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP request logging
app.use(morgan('combined', {
  stream: { write: (msg) => logger.info(msg.trim()) },
  skip: (req) => req.path === '/health',
}));

// Rate limiter global
app.use('/api/', rateLimiter);

// ============================================================
// Routes
// ============================================================
const API_PREFIX = '/api/v1';

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', app: config.app.name, version: '1.0.0', timestamp: new Date().toISOString() });
});

// API Routes
app.use(`${API_PREFIX}/auth`,      authRoutes);
app.use(`${API_PREFIX}/users`,     userRoutes);
app.use(`${API_PREFIX}/dashboard`, dashboardRoutes);
app.use(`${API_PREFIX}/master`,    masterRoutes);
app.use(`${API_PREFIX}/gateway`,   gatewayRoutes);
app.use(`${API_PREFIX}/settings`,  settingsRoutes);
app.use(`${API_PREFIX}/apihub`,    apiHubRoutes);
app.use(`${API_PREFIX}/public/sync`, publicSyncRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: `Route ${req.method} ${req.path} tidak ditemukan` });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
