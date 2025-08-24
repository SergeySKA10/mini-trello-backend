import { Request, Response, NextFunction } from 'express';
import { z, ZodTypeAny } from 'zod';

export const validateData = (schema: ZodTypeAny) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            // обработка ошибок
            if (error instanceof z.ZodError) {
                res.status(400).json({
                    error: 'Invalid input data',
                    details: {
                        path: error.name,
                        message: error.message,
                    },
                });
            } else {
                res.status(500).json({
                    error: 'Internal server error',
                    details: 'Unexpected validation error',
                });
            }
        }
    };
};

// Схемы валидации
export const registerSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
});

// экспортируeм типы
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
