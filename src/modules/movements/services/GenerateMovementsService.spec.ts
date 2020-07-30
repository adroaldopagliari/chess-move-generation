import 'reflect-metadata';

import FakeCacheProvider from '@shared/container/providers/CacheProvider/fakes/FakeCacheProvider';
import { Square } from 'chess.js';
import AppError from '@shared/errors/AppError';
import GenerateMovementsService from './GenerateMovementsService';

let generateMovements: GenerateMovementsService;
let fakeCacheProvider: FakeCacheProvider;

describe('ListProviderAppointments', () => {
  beforeEach(() => {
    fakeCacheProvider = new FakeCacheProvider();
    generateMovements = new GenerateMovementsService(fakeCacheProvider);
  });

  it('should be able to list the knight movements, given the current position', async () => {
    const movements = await generateMovements.execute({
      current_position: 'E2' as Square,
    });

    expect(movements.legal_moves).toEqual(['C3', 'D4', 'F4', 'G3']);
  });

  it('should be able to list other pieces movements', async () => {
    const movements = await generateMovements.execute({
      current_position: 'A2' as Square,
      piece: 'q',
      color: 'w',
    });

    expect(movements.legal_moves).toEqual([
      'A3',
      'A4',
      'A5',
      'A6',
      'A7',
      'B3',
      'C4',
      'D5',
      'E6',
      'F7',
    ]);
  });

  it('should not be able to move a piece to an invalid position', async () => {
    await expect(
      generateMovements.execute({
        current_position: 'B9' as Square,
        piece: 'n',
        color: 'w',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
