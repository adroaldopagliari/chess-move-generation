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
    const cacheKey = `move:${current_position}-${piece}-${color}`;

    let movements = await this.cacheProvider.recover<IResponse>(cacheKey);

    if (!movements) {
      const chess = new Chess();

      chess.clear();

      /**
       * Since the game is live and the library does not have any function
       * to change the turn, this workaround is necessary.
       *
       * The first turn is for whites, so a white piece is created
       * and moved manually, then that piece is removed to prevent
       * side effects on the board. After that move the turn goes to
       * the blacks.
       */
      if (color === 'b') {
        chess.put({ type: 'q', color: 'w' }, 'e4');
        chess.move({ from: 'e4', to: 'e5' });
        chess.remove('e5');
      }

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
       * The piece position, in algebric notation, is composed by the last
       * two characters, except when the movement is a capture or a promotion,
       * in this case, special characters must be removed
       * (the characters + # = represent those states).
       */
      const algebricMoves = moves.map(move => {
        if (move.includes('=')) {
          return move.substr(0, 2).toUpperCase();
        }

        if (move.endsWith('+') || move.endsWith('#')) {
          return move.substr(-3, 2).toUpperCase();
        }

        return move.substr(-2).toUpperCase();
      });

      /**
       * Remove noisy pawn moves
       *
       * When a pawn is promoted, it can be converted to
       * a queen, king, knight or a bishop, so the movements
       * are quadrupled by the chess.js library.
       */
      const legal_moves = Array.from(new Set(algebricMoves));

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
