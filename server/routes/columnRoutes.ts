import { Router } from 'express';
import { ColumnController } from '../controllers/columnController';
import { authenticateToken } from '../middleware/auth';
import { validateData } from '../middleware/validation';
import { CreateColumnDto, UpdateColumnDto } from '../types/column';

const router = Router();

router.use(authenticateToken);

// Получить все колонки доски
router.get('/boards/:boardId/columns', ColumnController.getColumnsByBoard);

// Создать колонку
router.post(
    '/boards/:boardId/columns',
    validateData(CreateColumnDto),
    ColumnController.createColumn
);

// Обновить колонку
router.put(
    '/columns/:id',
    validateData(UpdateColumnDto),
    ColumnController.updateColumn
);

// Удалить колонку
router.delete('/columns/:id', ColumnController.deleteColumn);

export default router;
