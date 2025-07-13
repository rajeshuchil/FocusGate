import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import taskRoutes from './routes/taskRoutes.js';
import tokenRoutes from './routes/tokenRoutes.js';

dotenv.config();
const app = express();
connectDB();

app.use(cors());
app.use(express.json());
const _dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.static(path.join(_dirname,'client')));
app.use('/api',taskRoutes);
app.use('/api',tokenRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{
    console.log(`server is running on http://localhost:${PORT}`);
})

