import { Router } from 'express';
import { BoardController } from '../controllers/boardController';
import { authenticateToken } from '../middleware/auth';
import { validateData } from '../middleware/validation';
import { CreateBoardDto, UpdateBoardDto } from '../types/board';

const router = Router();

router.use(authenticateToken);

router.get('/', BoardController.getBoards);
router.get('/:id', BoardController.getBoard);
router.post('/', validateData(CreateBoardDto), BoardController.createBoard);
router.put('/:id', validateData(UpdateBoardDto), BoardController.updateBoard);
router.delete('/:id', BoardController.deleteBoard);

export default router;
