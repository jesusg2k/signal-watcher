import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { correlationMiddleware } from './middleware/correlation';
import { errorHandler } from './middleware/errorHandler';
import { connectRedis } from './utils/redis';
import logger from './utils/logger';

// Controllers
import * as watchListController from './controllers/watchListController';
import * as eventController from './controllers/eventController';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// General middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(correlationMiddleware);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    correlationId: req.correlationId 
  });
});

// API Routes
const router = express.Router();

// Watch Lists
router.post('/watch-lists', watchListController.createWatchList);
router.get('/watch-lists', watchListController.getWatchLists);
router.get('/watch-lists/:id', watchListController.getWatchList);
router.delete('/watch-lists/:id', watchListController.deleteWatchList);

// Events
router.post('/events', eventController.createEvent);
router.get('/events', eventController.getEvents);
router.get('/events/:id', eventController.getEvent);

app.use('/api', router);

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    correlationId: req.correlationId
  });
});

const startServer = async () => {
  try {
    // Connect to Redis
    await connectRedis();
    
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`, { port: PORT });
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
};

startServer();