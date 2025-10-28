import { z } from 'zod';

// DTO для создания карточки
export const CreateCardDto = z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
    content: z.string().max(1000, 'Content too long').optional(),
    order: z.number().int().min(0, 'Order must be positive'),
    columnId: z.string().uuid('Invalid column ID'),
});

// DTO для обновления карточки
export const UpdateCardDto = z.object({
    title: z
        .string()
        .min(1, 'Title is required')
        .max(200, 'Title too long')
        .optional(),
    content: z.string().max(1000, 'Content too long').optional().nullable(),
    order: z.number().int().min(0, 'Order must be positive').optional(),
    columnId: z.string().uuid('Invalid column ID').optional(),
});

// DTO для перемещения карточки
export const MoveCardDto = z.object({
    fromColumnId: z.string().uuid('Invalid source column ID'),
    toColumnId: z.string().uuid('Invalid target column ID'),
    newPosition: z.number().int().min(0, 'Position must be positive'),
});

// Типы TypeScript
export type CreateCardDto = z.infer<typeof CreateCardDto>;
export type UpdateCardDto = z.infer<typeof UpdateCardDto>;
export type MoveCardDto = z.infer<typeof MoveCardDto>;
