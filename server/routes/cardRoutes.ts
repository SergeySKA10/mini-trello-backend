import { Router } from 'express';
import { CardController } from '../controllers/cardController';
import { authenticateToken } from '../middleware/auth';
import { validateData } from '../middleware/validation';
import { CreateCardDto, UpdateCardDto, MoveCardDto } from '../types/card';

const router = Router();

router.use(authenticateToken);

// Получить все карточки колонки
router.get('/columns/:columnId/cards', CardController.getCardsByColumn);

// Создать карточку
router.post(
    '/columns/:columnId/cards',
    validateData(CreateCardDto),
    CardController.createCard
);

// Обновить карточку
router.put(
    '/cards/:id',
    validateData(UpdateCardDto),
    CardController.updateCard
);

// Удалить карточку
router.delete('/cards/:id', CardController.deleteCard);

// Переместить карточку
router.post(
    '/cards/:cardId/move',
    validateData(MoveCardDto),
    CardController.moveCard
);

export default router;
