import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { classToClass } from 'class-transformer';

import GenerateMovementsService from '@modules/movements/services/GenerateMovementsService';

export default class MovementsController {
  public async index(request: Request, response: Response): Promise<Response> {
    const { current_position, piece, color } = request.body;

    const generateMovements = container.resolve(GenerateMovementsService);

    const calls = await generateMovements.execute({
      current_position,
      piece,
      color,
    });

    return response.json(classToClass(calls));
  }
}
