import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(
    cors({
        origin: 'https://mini-trello-gilt.vercel.app/',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    })
); // Разрешаем запросы с фронта

// Тестовый роут
app.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello from Express!' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
