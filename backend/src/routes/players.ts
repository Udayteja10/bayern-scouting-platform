import express, { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Player, Club, Position, Nationality, PlayerStats, Injury, Transfer, ScoutingReport } from '../models/index';

const router = express.Router();

/**
 * GET /api/players
 * Get all players with pagination and advanced filtering.
 * Returns a PageResponse<Player> structure.
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string || '0', 10);
    const size = parseInt(req.query.size as string || '20', 10);
    const nameFilter = req.query.name as string;
    const positionFilter = req.query.position as string;
    const nationalityFilter = req.query.nationality as string;
    const clubIdFilter = req.query.clubId ? Number(req.query.clubId) : undefined;

    const whereClause: any = {};

    // Search by name
    if (nameFilter) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${nameFilter}%` } },
        { displayName: { [Op.like]: `%${nameFilter}%` } }
      ];
    }

    // Filter by club ID
    if (clubIdFilter) {
      whereClause.clubId = clubIdFilter;
    }

    const includeModels: any[] = [
      { model: Club, as: 'club' },
      { model: Position, as: 'position' },
      { model: Nationality, as: 'nationality' },
      { model: PlayerStats, as: 'statistics' }
    ];

    // Build sub-filters for Position code or Nationality name if passed
    if (positionFilter) {
      includeModels[1] = {
        model: Position,
        as: 'position',
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${positionFilter}%` } },
            { code: { [Op.like]: `%${positionFilter}%` } }
          ]
        }
      };
    }

    if (nationalityFilter) {
      includeModels[2] = {
        model: Nationality,
        as: 'nationality',
        where: { name: { [Op.like]: `%${nationalityFilter}%` } }
      };
    }

    // Perform query with pagination
    const { count, rows } = await Player.findAndCountAll({
      where: whereClause,
      include: includeModels,
      limit: size,
      offset: page * size,
      distinct: true, // Crucial for correct counts with associations
      order: [['marketValue', 'DESC']]
    });

    // Format output to match Player structure in frontend types
    const mappedPlayers = rows.map(player => {
      const stats = player.statistics && player.statistics.length > 0
        ? player.statistics[0]
        : null;

      return {
        id: player.id,
        sportmonksId: player.sportmonksId,
        name: player.name,
        position: player.position ? player.position.name : 'Unknown',
        detailedPosition: player.position ? player.position.name : 'Unknown',
        nationality: player.nationality ? player.nationality.name : 'Unknown',
        birthDate: player.dateOfBirth,
        age: player.age,
        height: player.height,
        weight: player.weight,
        preferredFoot: player.preferredFoot,
        jerseyNumber: player.jerseyNumber,
        photoUrl: player.imagePath,
        marketValue: player.marketValue ? Number(player.marketValue) : 0,
        contractExpiry: player.contractUntil,
        currentClubName: player.club ? player.club.name : 'FC Bayern Munich',
        currentClubId: player.clubId,
        averageRating: stats ? stats.rating : 7.0
      };
    });

    const totalPages = Math.ceil(count / size);

    res.json({
      content: mappedPlayers,
      totalElements: count,
      totalPages: totalPages,
      size: size,
      number: page
    });
  } catch (error: any) {
    console.error('Error fetching players:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/players/compare
 * Compare multiple players side-by-side
 */
router.get('/compare', async (req: Request, res: Response) => {
  try {
    const idsParam = req.query.ids as string;
    if (!idsParam) {
      return res.status(400).json({ error: 'Player IDs are required (e.g. ?ids=1017,2001)' });
    }

    const ids = idsParam.split(',').map(id => Number(id));

    const players = await Player.findAll({
      where: { id: { [Op.in]: ids } },
      include: [
        { model: Club, as: 'club' },
        { model: Position, as: 'position' },
        { model: Nationality, as: 'nationality' },
        { model: PlayerStats, as: 'statistics' }
      ]
    });

    const mappedCompare = players.map(player => {
      const stats = player.statistics && player.statistics.length > 0 ? player.statistics[0] : null;
      return {
        id: player.id,
        name: player.name,
        position: player.position ? player.position.name : 'Unknown',
        detailedPosition: player.position ? player.position.name : 'Unknown',
        nationality: player.nationality ? player.nationality.name : 'Unknown',
        birthDate: player.dateOfBirth,
        age: player.age,
        height: player.height,
        weight: player.weight,
        preferredFoot: player.preferredFoot,
        jerseyNumber: player.jerseyNumber,
        photoUrl: player.imagePath,
        marketValue: player.marketValue ? Number(player.marketValue) : 0,
        contractExpiry: player.contractUntil,
        currentClubName: player.club ? player.club.name : 'Unknown',
        currentClubId: player.clubId,
        averageRating: stats ? stats.rating : 7.0,
        statistics: (player.statistics || []).map(s => ({
          id: s.id,
          seasonName: s.season,
          appearances: s.appearances,
          minutesPlayed: s.minutesPlayed,
          goals: s.goals,
          assists: s.assists,
          yellowCards: s.yellowCards,
          redCards: s.redCards,
          passAccuracy: s.passAccuracy,
          averageRating: s.rating,
          saves: s.saves,
          cleanSheets: s.cleanSheets
        }))
      };
    });

    res.json(mappedCompare);
  } catch (error: any) {
    console.error('Error comparing players:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/players/:id
 * Get single player profile details, stats, injuries, transfers, and scouting reports.
 * Returns PlayerDetail structure.
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const player = await Player.findByPk(Number(req.params.id), {
      include: [
        { model: Club, as: 'club' },
        { model: Position, as: 'position' },
        { model: Nationality, as: 'nationality' },
        { model: PlayerStats, as: 'statistics' },
        { model: Injury, as: 'injuries' },
        {
          model: Transfer,
          as: 'transfers',
          include: [
            { model: Club, as: 'fromClub' },
            { model: Club, as: 'toClub' }
          ]
        },
        { model: ScoutingReport, as: 'scoutingReport' }
      ]
    });

    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const mappedStats = (player.statistics || []).map(s => ({
      id: s.id,
      seasonName: s.season,
      appearances: s.appearances,
      minutesPlayed: s.minutesPlayed,
      goals: s.goals,
      assists: s.assists,
      yellowCards: s.yellowCards,
      redCards: s.redCards,
      passAccuracy: s.passAccuracy,
      averageRating: s.rating,
      saves: s.saves,
      cleanSheets: s.cleanSheets
    }));

    const mappedInjuries = (player.injuries || []).map(i => ({
      id: i.id,
      playerId: i.playerId,
      playerName: player.name,
      type: i.description,
      status: i.status,
      startDate: i.startDate,
      expectedReturn: i.endDate,
      description: i.description
    }));

    const mappedTransfers = (player.transfers || []).map(t => ({
      id: t.id,
      playerId: t.playerId,
      playerName: player.name,
      fromClubName: t.fromClubName || (t.fromClub ? t.fromClub.name : 'Unknown'),
      toClubName: t.toClubName || (t.toClub ? t.toClub.name : 'Unknown'),
      fee: t.amount ? Number(t.amount) : 0,
      type: t.type,
      status: t.status,
      transferDate: t.date
    }));

    const playerStats = player.statistics && player.statistics.length > 0 ? player.statistics[0] : null;

    res.json({
      id: player.id,
      sportmonksId: player.sportmonksId,
      name: player.name,
      firstName: player.firstname,
      lastName: player.lastname,
      position: player.position ? player.position.name : 'Unknown',
      detailedPosition: player.position ? player.position.name : 'Unknown',
      nationality: player.nationality ? player.nationality.name : 'Unknown',
      birthDate: player.dateOfBirth,
      age: player.age,
      height: player.height,
      weight: player.weight,
      preferredFoot: player.preferredFoot,
      jerseyNumber: player.jerseyNumber,
      photoUrl: player.imagePath,
      marketValue: player.marketValue ? Number(player.marketValue) : 0,
      contractExpiry: player.contractUntil,
      currentClubName: player.club ? player.club.name : 'Unknown',
      currentClubId: player.clubId,
      averageRating: playerStats ? playerStats.rating : 7.0,
      birthCountry: player.birthCountry || (player.nationality ? player.nationality.name : 'Unknown'),
      secondNationality: player.secondNationality || '',
      statistics: mappedStats,
      injuries: mappedInjuries,
      transfers: mappedTransfers
    });
  } catch (error: any) {
    console.error('Error fetching player detail:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Meta routes for filters
 */
router.get('/meta/clubs', async (req: Request, res: Response) => {
  try {
    const clubs = await Club.findAll({ order: [['name', 'ASC']] });
    res.json(clubs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/meta/positions', async (req: Request, res: Response) => {
  try {
    const positions = await Position.findAll();
    res.json(positions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/meta/nationalities', async (req: Request, res: Response) => {
  try {
    const nationalities = await Nationality.findAll({ order: [['name', 'ASC']] });
    res.json(nationalities);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
