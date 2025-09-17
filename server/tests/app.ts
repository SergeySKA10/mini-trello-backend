import express from 'express';
import cors from 'cors';
import authRoutes from '../routes/authRouters';
import oauthRoutes from '../routes/oauthRoutes';
import boardRoutes from '../routes/boardRoutes';
import { authenticateToken } from '../middleware/auth';

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Роуты
app.use('/api/auth', authRoutes);
app.use('/api/oauth', oauthRoutes);
app.use('/api/boards', boardRoutes);

// Тестовый роут
app.get('/api/test', (req, res) => {
    res.json({ message: 'Test route works!' });
});

export { app };
