import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { apiRouter } from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Headers
app.use(helmet());

// CORS config
app.use(
  cors({
    origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// Body limiters
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Custom lightweight cookie parser
app.use((req: any, res: any, next: any) => {
  const cookieHeader = req.headers.cookie;
  req.cookies = {};
  if (cookieHeader) {
    cookieHeader.split(';').forEach((cookie: string) => {
      const parts = cookie.split('=');
      req.cookies[parts[0].trim()] = decodeURIComponent((parts[1] || '').trim());
    });
  }
  next();
});

// Custom XSS Sanitizer middleware (strips HTML tags to prevent scripting injections)
app.use((req: any, res: any, next: any) => {
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj.replace(/<[^>]*>/g, '');
    }
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        obj[key] = sanitize(obj[key]);
      }
    }
    return obj;
  };
  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  next();
});

// Rate limiting to prevent brute-forcing
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100,
  message: { error: 'Too many requests. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// Auth Specific Limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { error: 'Too many auth requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth', authLimiter);

// Main API Routing
app.use('/api', apiRouter);

// Fallback status check
app.get('/', (req, res) => {
  res.json({ status: 'healthy', message: 'DIU Cyber Security Center (CSC) API is active.' });
});

app.listen(PORT, () => {
  console.log(`[API] Server is booting on port ${PORT}`);
});
