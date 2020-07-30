import { Router } from 'express';

import MovementsController from '../controllers/MovementsController';

const movementsRouter = Router();
const movementsController = new MovementsController();

movementsRouter.post('/', movementsController.index);

export default movementsRouter;
