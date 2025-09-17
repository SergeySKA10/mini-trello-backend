import { z } from 'zod';
import { Response } from 'express';
import { prisma } from '../config/db';
import { CreateBoardDto, UpdateBoardDto, BoardResponse } from '../types/board';
import { AuthRequest } from '../middleware/auth';

export class BoardController {
    // GET /api/boards - все доски пользователя
    static async getBoards(req: AuthRequest, res: Response) {
        try {
            const boards = await prisma.board.findMany({
                where: { userId: req.user!.id },
                include: {
                    columns: {
                        include: {
                            cards: { orderBy: { order: 'asc' as const } },
                        },
                        orderBy: { order: 'asc' },
                    },
                },
                orderBy: { createdAt: 'desc' as const },
            });

            res.json(boards);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch boards' });
        }
    }

    // GET /api/boards/:id - конкретная доска
    static async getBoard(req: AuthRequest, res: Response) {
        try {
            const board = await prisma.board.findFirst({
                where: {
                    id: req.params.id,
                    user: { id: req.user!.id },
                },
                include: {
                    columns: {
                        include: {
                            cards: { orderBy: { order: 'asc' as const } },
                        },
                        orderBy: { order: 'asc' },
                    },
                },
            });

            if (!board) {
                return res.status(404).json({ error: 'Board not found' });
            }

            res.json(board);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch board' });
        }
    }

    // POST /api/boards - создание доски
    static async createBoard(req: AuthRequest, res: Response) {
        try {
            const validatedData = CreateBoardDto.parse(req.body) as {
                title: string;
                description?: string | null;
            };

            const board = await prisma.board.create({
                data: {
                    ...validatedData,
                    user: {
                        connect: { id: req.user!.id },
                    },
                    columns: {
                        create: [
                            { title: 'To Do', order: 0 },
                            { title: 'In Progress', order: 1 },
                            { title: 'Done', order: 2 },
                        ],
                    },
                },
                include: {
                    columns: {
                        include: { cards: true },
                        orderBy: { order: 'asc' },
                    },
                },
            });

            res.status(201).json(board);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ error: error });
            }
            res.status(500).json({ error: 'Failed to create board' });
        }
    }

    // PUT /api/boards/:id - обновление доски
    static async updateBoard(req: AuthRequest, res: Response) {
        try {
            const validatedData = UpdateBoardDto.parse(req.body);

            const board = await prisma.board.update({
                where: {
                    id: req.params.id,
                    user: { id: req.user!.id },
                },
                data: validatedData,
                include: {
                    columns: {
                        include: {
                            cards: { orderBy: { order: 'asc' as const } },
                        },
                        orderBy: { order: 'asc' },
                    },
                },
            });

            res.json(board);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ error: error });
            }
            res.status(500).json({ error: 'Failed to update board' });
        }
    }

    // DELETE /api/boards/:id - удаление доски
    static async deleteBoard(req: AuthRequest, res: Response) {
        try {
            await prisma.board.delete({
                where: {
                    id: req.params.id,
                    user: { id: req.user!.id },
                },
            });

            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete board' });
        }
    }
}
