import { Router } from 'express';
import movementsRouter from '@modules/movements/infra/http/routes/movements.routes';

const routes = Router();

routes.use('/movements', movementsRouter);

export default routes;
