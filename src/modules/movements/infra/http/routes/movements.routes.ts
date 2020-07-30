import { Router } from 'express';
import { celebrate, Segments, Joi } from 'celebrate';

import MovementsController from '../controllers/MovementsController';

const movementsRouter = Router();
const movementsController = new MovementsController();

movementsRouter.post(
  '/',
  celebrate({
    [Segments.BODY]: {
      current_position: Joi.string()
        .regex(/^[A-H]{1}\d{1}$/)
        .required(),
      piece: Joi.string().regex(/^[pnbrqk]{1}$/),
      color: Joi.string().regex(/^[wb]{1}$/),
    },
  }),
  movementsController.index,
);

export default movementsRouter;
