import { z } from 'zod';

// DTO для создания колонки
export const CreateColumnDto = z.object({
    title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
    order: z.number().int().min(0, 'Order must be positive'),
    boardId: z.string().uuid('Invalid board ID'),
});

// DTO для обновления колонки
export const UpdateColumnDto = z.object({
    title: z
        .string()
        .min(1, 'Title is required')
        .max(100, 'Title too long')
        .optional(),
    order: z.number().int().min(0, 'Order must be positive').optional(),
});

// Типы TypeScript
export type CreateColumnDto = z.infer<typeof CreateColumnDto>;
export type UpdateColumnDto = z.infer<typeof UpdateColumnDto>;
