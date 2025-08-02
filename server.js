import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import taskRoutes from './routes/taskRoutes.js';
import tokenRoutes from './routes/tokenRoutes.js';
import authRoutes from './routes/authRoutes.js';
dotenv.config();

/*const allowedOrigins = [
  'https://focusgate.onrender.com', // ✅ Your frontend
  'https://your-backend-service.onrender.com' // ✅ Your backend if needed for testing
];
*/
const app = express();
/*
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
*/
app.use(cors());

app.use(express.json());

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ✅ Serve static files like index.html, dashboard.html, countdown.html
app.use(express.static(path.join(__dirname, 'public')));

// ✅ API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/tokens', tokenRoutes);

// ❌ Do NOT add a catch-all route like app.get('*') if you're using multiple HTML files manually

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to connect to DB. Server not started.');
  }
};

startServer();
