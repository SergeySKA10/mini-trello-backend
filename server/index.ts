import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { prisma } from './config/db'; // Импорт Prisma

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

// Тестовый роут для проверки БД
app.get('/api/test-db', async (req, res) => {
    try {
        const result = await prisma.$queryRaw`SELECT 1 as test`;
        res.json({
            status: 'DB connection successful',
            data: result,
        });
    } catch (error) {
        console.error('Database error:', error);

        if (error instanceof Error) {
            res.status(500).json({
                status: 'DB connection failed',
                error:
                    process.env.NODE_ENV === 'development'
                        ? error.message
                        : 'Internal server error',
            });
        }
    }
});

// Простой тестовый роут
app.get('/api/hello', (req, res) => {
    res.json({
        message: 'Hello from Express!',
        timestamp: new Date().toISOString(),
    });
});

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
