import express, { Request, Response } from 'express';
import { Transfer, Player, Club } from '../models/index';

const router = express.Router();

/**
 * GET /api/transfers
 * Returns a paginated list of transfers: PageResponse<Transfer>
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string || '0', 10);
    const size = parseInt(req.query.size as string || '20', 10);

    const { count, rows } = await Transfer.findAndCountAll({
      include: [
        { model: Player, as: 'player' },
        { model: Club, as: 'fromClub' },
        { model: Club, as: 'toClub' }
      ],
      limit: size,
      offset: page * size,
      order: [['date', 'DESC']]
    });

    const mappedTransfers = rows.map(t => {
      const player = t.player;
      return {
        id: t.id,
        playerId: t.playerId,
        playerName: player ? player.name : 'Unknown Player',
        playerPhotoUrl: player ? player.imagePath : '',
        fromClubName: t.fromClubName || (t.fromClub ? t.fromClub.name : 'Unknown'),
        toClubName: t.toClubName || (t.toClub ? t.toClub.name : 'Unknown'),
        fee: t.amount ? Number(t.amount) : 0,
        type: t.type,
        status: t.status,
        transferDate: t.date,
        position: player ? 'Forward' : 'Unknown' // simplified
      };
    });

    const totalPages = Math.ceil(count / size);

    res.json({
      content: mappedTransfers,
      totalElements: count,
      totalPages: totalPages,
      size: size,
      number: page
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
