import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { CreateColumnDto, UpdateColumnDto } from '../types/column';

export class ColumnController {
    // Получить все колонки доски
    static async getColumnsByBoard(req: Request, res: Response) {
        try {
            const { boardId } = req.params;
            const userId = (req as any).user.userId;

            // Проверяем что доска принадлежит пользователю
            const board = await prisma.board.findFirst({
                where: {
                    id: boardId,
                    userId: userId,
                },
            });

            if (!board) {
                return res.status(404).json({ message: 'Board not found' });
            }

            const columns = await prisma.column.findMany({
                where: {
                    boardId: boardId,
                },
                include: {
                    cards: {
                        orderBy: {
                            order: 'asc',
                        },
                    },
                },
                orderBy: {
                    order: 'asc',
                },
            });

            res.json(columns);
        } catch (error) {
            console.error('Get columns error:', error);
            res.status(500).json({ message: 'Server error', error });
        }
    }

    // Создать колонку
    static async createColumn(req: Request, res: Response) {
        try {
            const { boardId } = req.params;
            const columnData: CreateColumnDto = req.body;
            const userId = (req as any).user.userId;

            // Проверяем что доска принадлежит пользователю
            const board = await prisma.board.findFirst({
                where: {
                    id: boardId,
                    userId: userId,
                },
            });

            if (!board) {
                return res.status(404).json({ message: 'Board not found' });
            }

            const column = await prisma.column.create({
                data: {
                    ...columnData,
                    boardId: boardId,
                },
                include: {
                    cards: true,
                },
            });

            res.status(201).json(column);
        } catch (error) {
            console.error('Create column error:', error);
            res.status(500).json({ message: 'Server error', error });
        }
    }

    // Обновить колонку
    static async updateColumn(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const columnData: UpdateColumnDto = req.body;
            const userId = (req as any).user.userId;

            // Находим колонку и проверяем права доступа
            const column = await prisma.column.findFirst({
                where: {
                    id: id,
                },
                include: {
                    board: true,
                },
            });

            if (!column) {
                return res.status(404).json({ message: 'Column not found' });
            }

            if (column.board.userId !== userId) {
                return res.status(403).json({ message: 'Access denied' });
            }

            const updatedColumn = await prisma.column.update({
                where: {
                    id: id,
                },
                data: columnData,
                include: {
                    cards: {
                        orderBy: {
                            order: 'asc',
                        },
                    },
                },
            });

            res.json(updatedColumn);
        } catch (error) {
            console.error('Update column error:', error);
            res.status(500).json({ message: 'Server error', error });
        }
    }

    // Удалить колонку
    static async deleteColumn(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const userId = (req as any).user.userId;

            // Находим колонку и проверяем права доступа
            const column = await prisma.column.findFirst({
                where: {
                    id: id,
                },
                include: {
                    board: true,
                },
            });

            if (!column) {
                return res.status(404).json({ message: 'Column not found' });
            }

            if (column.board.userId !== userId) {
                return res.status(403).json({ message: 'Access denied' });
            }

            // Удаляем колонку и все связанные карточки (каскадное удаление)
            await prisma.column.delete({
                where: {
                    id: id,
                },
            });

            res.status(204).send();
        } catch (error) {
            console.error('Delete column error:', error);
            res.status(500).json({ message: 'Server error', error });
        }
    }
}
