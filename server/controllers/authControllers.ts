import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';
import { AuthResponse, LoginRequest, RegisterRequests } from '../types';

const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 12;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
}

export const register = async (
    req: Request<{}, {}, RegisterRequests>,
    res: Response
) => {
    try {
        const { email, password, name } = req.body;

        // проверяем существование пользователя
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(400).json({ error: 'User already exist' });
        }

        // Хешируем пароль
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // создаем пользователя
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
        });

        // генерируем JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        const response: AuthResponse = {
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name ?? undefined, // Преобразуем null в undefined
                role: user.role,
            },
        };

        res.status(201).json(response);
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const login = async (
    req: Request<{}, {}, LoginRequest>,
    res: Response
) => {
    try {
        const { email, password } = req.body;

        // ищем пользователя
        const user = await prisma.user.findFirst({
            where: { email },
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // проверяем пароль
        const validPassword = await bcrypt.compare(password, user.password!);

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // генерируем JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        const response: AuthResponse = {
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name ?? undefined,
                role: user.role,
            },
        };

        res.json(response);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
