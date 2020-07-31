import { injectable, inject } from 'tsyringe';

import { Chess, PieceType, Square } from 'chess.js';

import { uuid } from 'uuidv4';

import ICacheProvider from '@shared/container/providers/CacheProvider/models/ICacheProvider';
import { classToClass } from 'class-transformer';

import AppError from '@shared/errors/AppError';

interface IRequest {
  current_position: Square;
  piece?: PieceType;
  color?: 'b' | 'w';
}

interface IResponse {
  id: string;
  current_position: Square;
  piece: PieceType;
  color: 'b' | 'w';
  legal_moves: string[];
}

@injectable()
class GenerateMovementsService {
  constructor(
    @inject('CacheProvider')
    private cacheProvider: ICacheProvider,
  ) {}

  public async execute({
    current_position,
    piece = 'n',
    color = 'w',
  }: IRequest): Promise<IResponse> {
    const cacheKey = `move:${current_position}-${piece}`;

    let movements = await this.cacheProvider.recover<IResponse>(cacheKey);

    if (!movements) {
      const chess = new Chess();

      chess.clear();

      const formattedPosition = current_position.toLowerCase() as Square;

      const isValidPosition = chess.put(
        { type: piece, color },
        formattedPosition,
      );

      if (!isValidPosition) {
        throw new AppError(
          'Invalid current position, please, check the parameters.',
        );
      }

      const moves = chess.moves({
        square: formattedPosition,
      });

      /**
       * Remove special characters returned from chess.js lib
       *
       * The piece position, in algebric notation, is composed by the last two characters,
       * except when the movement is a promotion, in this case the last character must be
       * removed (the character + or # represents that state).
       */
      const legal_moves = moves.map(move => {
        if (move.endsWith('+') || move.endsWith('#')) {
          return move.substr(-3, 2).toUpperCase();
        }
        return move.substr(-2).toUpperCase();
      });

      movements = {
        id: uuid(),
        current_position,
        piece,
        color,
        legal_moves,
      };

      await this.cacheProvider.save(cacheKey, classToClass(movements));
    }

    return movements;
  }
}

export default GenerateMovementsService;
