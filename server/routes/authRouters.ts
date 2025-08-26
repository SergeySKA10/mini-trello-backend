import { Router } from 'express';
import { register, login } from '../controllers/authControllers';
import { validateData } from '../middleware/validation';
import { z } from 'zod';

const router = Router();

// схемы валидации
const registerSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must  be least 6 characters'),
    name: z.string().optional(),
});

const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
});

// Роуты
router.post('/register', validateData(registerSchema), register);
router.post('/login', validateData(loginSchema), login);

export default router;
