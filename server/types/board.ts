import { z } from 'zod';

// DTO для создания доски
export const CreateBoardDto = z.object({
    title: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional().nullable(),
});

export type CreateBoardDto = z.infer<typeof CreateBoardDto>;

// DTO для обновления доски
export const UpdateBoardDto = z.object({
    title: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional().nullable(),
});

export type UpdateBoardDto = z.infer<typeof UpdateBoardDto>;

// DTO для ответа API
export interface BoardResponse {
    id: string;
    title: string;
    description: string | null;
    columns: ColumnResponse[];
    createdAt: Date;
    updatedAt: Date;
}

export interface ColumnResponse {
    id: string;
    title: string;
    order: number;
    cards: CardResponse[];
}

export interface CardResponse {
    id: string;
    title: string;
    content: string | null;
    order: number;
}
