import express        from 'express';
import cors           from 'cors';
import path           from 'path';
import { fileURLToPath } from 'url';
import errorHandler   from './interfaces/middleware/errorMiddleware.js';
import authRoutes     from './interfaces/routes/authRoutes.js';
import driverRoutes   from './interfaces/routes/driverRoutes.js';
import adminRoutes    from './interfaces/routes/adminRoutes.js';
import rideRoutes     from './interfaces/routes/rideRoutes.js';
import bookingRoutes  from './interfaces/routes/bookingRoutes.js';
import userRoutes     from './interfaces/routes/userRoutes.js';
import reviewRoutes   from './interfaces/routes/reviewRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://ride-link-mern-v1-0.vercel.app',
    process.env.CLIENT_URL,
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth',     authRoutes);
app.use('/api/driver',   driverRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/rides',    rideRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/reviews',  reviewRoutes);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'RideLink API is running' });
});

app.use(errorHandler);

export default app;