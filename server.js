import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import taskRoutes from './routes/taskRoutes.js';
import tokenRoutes from './routes/tokenRoutes.js';
import authRoutes from './routes/authRoutes.js';
const allowedOrigins = ['https://focusgate.onrender.com'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true, // only if you're using cookies/auth headers
}));
dotenv.config();

const app = express();

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
