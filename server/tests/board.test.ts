import request from 'supertest';
import { app } from './app';
import { prisma } from '../config/db';
import jwt from 'jsonwebtoken';
import { beforeEach, describe, it, expect } from '@jest/globals';

describe('Boards API', () => {
    let authToken: string;
    let userId: string;

    beforeEach(async () => {
        // Создаем тестового пользователя
        const user = await prisma.user.create({
            data: {
                email: 'test@boards.com',
                name: 'Test User',
                password: 'hashed_password',
                provider: 'local',
            },
        });

        userId = user.id;
        authToken = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET!
        );
    });

    describe('GET /api/boards', () => {
        it('should return empty array for new user', async () => {
            const response = await request(app)
                .get('/api/boards')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
        });
    });

    describe('POST /api/boards', () => {
        it('should create a new board with default columns', async () => {
            const boardData = {
                title: 'Test Board',
                description: 'Test Description',
            };

            const response = await request(app)
                .post('/api/boards')
                .set('Authorization', `Bearer ${authToken}`)
                .send(boardData);

            expect(response.status).toBe(201);
            expect(response.body.title).toBe(boardData.title);
            expect(response.body.columns).toHaveLength(3);
            expect(response.body.columns[0].title).toBe('To Do');
        });

        it('should validate input data', async () => {
            const response = await request(app)
                .post('/api/boards')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ title: '' }); // Invalid data

            expect(response.status).toBe(400);
        });
    });
});
