import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { CreateCardDto, UpdateCardDto, MoveCardDto } from '../types/card';

export class CardController {
    // Получить все карточки колонки
    static async getCardsByColumn(req: Request, res: Response) {
        try {
            const { columnId } = req.params;
            const userId = (req as any).user.userId;

            console.log('Get cards for column:', columnId, 'user:', userId);

            // Проверяем права доступа к колонке
            const column = await prisma.column.findFirst({
                where: {
                    id: columnId,
                },
                include: {
                    board: true,
                },
            });

            if (!column) {
                console.log('Column not found');
                return res.status(404).json({ message: 'Column not found' });
            }

            if (column.board.userId !== userId) {
                console.log('Access denied - user does not own board');
                return res.status(403).json({ message: 'Access denied' });
            }

            const cards = await prisma.card.findMany({
                where: {
                    columnId: columnId,
                },
                orderBy: {
                    order: 'asc',
                },
            });

            console.log('Found cards:', cards.length);
            res.json(cards);
        } catch (error) {
            console.error('Get cards error:', error);
            res.status(500).json({ message: 'Server error', error });
        }
    }

    // Создать карточку
    static async createCard(req: Request, res: Response) {
        try {
            const { columnId } = req.params;
            const cardData: CreateCardDto = req.body;
            const userId = (req as any).user.userId;

            console.log(
                'Create card for column:',
                columnId,
                'data:',
                cardData,
                'user:',
                userId
            );

            // Проверяем права доступа к колонке
            const column = await prisma.column.findFirst({
                where: {
                    id: columnId,
                },
                include: {
                    board: true,
                },
            });

            if (!column) {
                console.log('Column not found for card creation');
                return res.status(404).json({ message: 'Column not found' });
            }

            if (column.board.userId !== userId) {
                console.log('Access denied for card creation');
                return res.status(403).json({ message: 'Access denied' });
            }

            const card = await prisma.card.create({
                data: {
                    ...cardData,
                    columnId: columnId,
                },
            });

            console.log('Card created:', card.id);
            res.status(201).json(card);
        } catch (error) {
            console.error('Create card error:', error);
            res.status(500).json({ message: 'Server error', error });
        }
    }

    // Обновить карточку
    static async updateCard(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const cardData: UpdateCardDto = req.body;
            const userId = (req as any).user.userId;
            console.log('Update card:', id, 'data:', cardData, 'user:', userId);

            // Находим карточку и проверяем права доступа
            const card = await prisma.card.findFirst({
                where: {
                    id: id,
                },
                include: {
                    column: {
                        include: {
                            board: true,
                        },
                    },
                },
            });

            if (!card) {
                console.log('Card not found for update:', id);
                return res.status(404).json({ message: 'Card not found' });
            }

            if (card.column.board.userId !== userId) {
                console.log('Access denied for card update');
                return res.status(403).json({ message: 'Access denied' });
            }

            const updatedCard = await prisma.card.update({
                where: {
                    id: id,
                },
                data: cardData,
            });

            console.log('Card updated:', updatedCard.id);
            res.json(updatedCard);
        } catch (error) {
            console.error('Update card error:', error);
            res.status(500).json({ message: 'Server error', error });
        }
    }

    // Удалить карточку
    static async deleteCard(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const userId = (req as any).user.userId;
            console.log('Delete card:', id, 'user:', userId);

            // Находим карточку и проверяем права доступа
            const card = await prisma.card.findFirst({
                where: {
                    id: id,
                },
                include: {
                    column: {
                        include: {
                            board: true,
                        },
                    },
                },
            });

            if (!card) {
                console.log('Card not found for deletion:', id);
                return res.status(404).json({ message: 'Card not found' });
            }

            if (card.column.board.userId !== userId) {
                console.log('Access denied for card deletion');
                return res.status(403).json({ message: 'Access denied' });
            }

            await prisma.card.delete({
                where: {
                    id: id,
                },
            });

            console.log('Card deleted:', id);
            res.status(204).send();
        } catch (error) {
            console.error('Delete card error:', error);
            res.status(500).json({ message: 'Server error', error });
        }
    }

    // Переместить карточку
    static async moveCard(req: Request, res: Response) {
        try {
            const { cardId } = req.params;
            const moveData: MoveCardDto = req.body;
            const userId = (req as any).user.userId;
            console.log(
                'Move card:',
                cardId,
                'data:',
                moveData,
                'user:',
                userId
            );

            // Находим карточку и проверяем права доступа
            const card = await prisma.card.findFirst({
                where: {
                    id: cardId,
                },
                include: {
                    column: {
                        include: {
                            board: true,
                        },
                    },
                },
            });

            if (!card) {
                console.log('Card not found for move:', cardId);
                return res.status(404).json({ message: 'Card not found' });
            }

            if (card.column.board.userId !== userId) {
                console.log('Access denied for card move');
                return res.status(403).json({ message: 'Access denied' });
            }

            // Проверяем целевую колонку
            const targetColumn = await prisma.column.findFirst({
                where: {
                    id: moveData.toColumnId,
                },
                include: {
                    board: true,
                },
            });

            if (!targetColumn) {
                console.log('Target column not found:', moveData.toColumnId);
                return res
                    .status(404)
                    .json({ message: 'Target column not found' });
            }

            if (targetColumn.board.userId !== userId) {
                console.log('Access denied to target column');
                return res
                    .status(403)
                    .json({ message: 'Access denied to target column' });
            }

            // Обновляем порядок карточек в исходной колонке (если колонка изменилась)
            if (moveData.fromColumnId !== moveData.toColumnId) {
                await prisma.card.updateMany({
                    where: {
                        columnId: moveData.fromColumnId,
                        order: {
                            gt: card.order,
                        },
                    },
                    data: {
                        order: {
                            decrement: 1,
                        },
                    },
                });
            }

            // Обновляем порядок карточек в целевой колонке
            await prisma.card.updateMany({
                where: {
                    columnId: moveData.toColumnId,
                    order: {
                        gte: moveData.newPosition,
                    },
                },
                data: {
                    order: {
                        increment: 1,
                    },
                },
            });

            // Перемещаем карточку
            const movedCard = await prisma.card.update({
                where: {
                    id: cardId,
                },
                data: {
                    columnId: moveData.toColumnId,
                    order: moveData.newPosition,
                },
            });

            console.log('Card moved successfully:', movedCard.id);
            res.json(movedCard);
        } catch (error) {
            console.error('Move card error:', error);
            res.status(500).json({ message: 'Server error', error });
        }
    }
}
