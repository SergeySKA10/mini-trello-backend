import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import authRoutes from './routes/authRouters';
import oauthRoutes from './routes/oauthRoutes';
import boardRoutes from './routes/boardRoutes';
import columnRoutes from './routes/columnRoutes';
import cardRoutes from './routes/cardRoutes';
import { authenticateToken, AuthRequest } from './middleware/auth';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json()); // Парсинг JSON
app.use(
    cors({
        origin:
            process.env.NODE_ENV === 'production'
                ? 'https://mini-trello-gilt.vercel.app'
                : 'http://localhost:3000',
        credentials: true,
    })
);

app.get('/api/test', (req, res) => {
    res.json({ message: 'Test route works!' });
});

// Роуты аутентификации
app.use('/api/auth', authRoutes);

// Oauth роуты
app.use('/api/oauth', oauthRoutes);

// защищенный роут для теста
app.get(
    '/api/profile',
    authenticateToken,
    (req: AuthRequest, res: Response) => {
        res.json({ user: req.user });
    }
);

app.use('/api/boards', boardRoutes);
app.use('/api', columnRoutes);
app.use('/api', cardRoutes);

// Обработка 404
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Обработка ошибок
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        error: 'Internal server error',
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(
        `Database: ${process.env.DATABASE_URL ? 'Configured' : 'Missing'}`
    );
});
