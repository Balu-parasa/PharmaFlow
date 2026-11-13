import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import medicineRoutes from './routes/medicine.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import saleRoutes from './routes/sale.routes.js';
import prescriptionRoutes from './routes/prescription.routes.js';
import supplierRoutes from './routes/supplier.routes.js';
import reportRoutes from './routes/report.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';

dotenv.config();

const app = express();

// Render and standard reverse proxies place exactly 1 proxy hop in front of the container.
// Setting 'trust proxy', 1 ensures Express resolves req.ip from the rightmost client hop in X-Forwarded-For
// without trusting spoofed upstream headers.
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
app.use(cors({
  origin: clientOrigin,
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(morgan('dev'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/reports', reportRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Capsulix API',
    tagline: 'Precision Pharmacy, Zero Errors.'
  });
});

app.use(errorHandler);

export default app;

