import express, { Request, Response } from 'express';
import { Shortlist, Player, ScoutingReport, Club, Position, Nationality } from '../models/index';

const router = express.Router();

// ==========================================
// SHORTLIST ENDPOINTS
// ==========================================

/**
 * GET /api/scouting/shortlists
 * Returns all shortlists with their associated players
 */
router.get('/shortlists', async (req: Request, res: Response) => {
  try {
    const lists = await Shortlist.findAll({
      include: [
        {
          model: Player,
          as: 'players',
          include: [
            { model: Club, as: 'club' },
            { model: Position, as: 'position' },
            { model: Nationality, as: 'nationality' }
          ]
        }
      ]
    });

    const mappedLists = lists.map(list => {
      const pCount = list.players ? list.players.length : 0;
      return {
        id: list.id,
        name: list.name,
        description: list.description,
        category: list.category,
        createdByName: list.createdByName,
        playerCount: pCount,
        createdAt: (list as any).createdAt || new Date().toISOString()
      };
    });

    res.json(mappedLists);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/scouting/shortlists
 * Create a new shortlist
 */
router.post('/shortlists', async (req: Request, res: Response) => {
  try {
    const { name, description, category, createdByName } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Shortlist name is required.' });
    }
    const list = await Shortlist.create({
      name,
      description: description || '',
      category: category || 'General',
      createdByName: createdByName || 'Scouting Team'
    });
    res.status(201).json({
      id: list.id,
      name: list.name,
      description: list.description,
      category: list.category,
      createdByName: list.createdByName,
      playerCount: 0,
      createdAt: (list as any).createdAt || new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/scouting/shortlists/:id/players/:playerId
 * Add a player to a shortlist
 */
router.post('/shortlists/:id/players/:playerId', async (req: Request, res: Response) => {
  try {
    const listId = Number(req.params.id);
    const playerId = Number(req.params.playerId);

    const list = await Shortlist.findByPk(listId);
    if (!list) {
      return res.status(404).json({ error: 'Shortlist not found' });
    }

    const player = await Player.findByPk(playerId);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    await (list as any).addPlayer(player);
    res.json({ success: true, message: `Added ${player.name} to shortlist ${list.name}.` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/scouting/shortlists/:id/players/:playerId
 * Remove a player from a shortlist
 */
router.delete('/shortlists/:id/players/:playerId', async (req: Request, res: Response) => {
  try {
    const listId = Number(req.params.id);
    const playerId = Number(req.params.playerId);

    const list = await Shortlist.findByPk(listId);
    if (!list) {
      return res.status(404).json({ error: 'Shortlist not found' });
    }

    const player = await Player.findByPk(playerId);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    await (list as any).removePlayer(player);
    res.json({ success: true, message: `Removed ${player.name} from shortlist ${list.name}.` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// SCOUTING REPORT ENDPOINTS
// ==========================================

/**
 * GET /api/scouting/reports
 * Returns paginated scouting reports: PageResponse<ScoutingReport>
 */
router.get('/reports', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string || '0', 10);
    const size = parseInt(req.query.size as string || '20', 10);

    const { count, rows } = await ScoutingReport.findAndCountAll({
      include: [
        {
          model: Player,
          as: 'player',
          include: [
            { model: Club, as: 'club' },
            { model: Position, as: 'position' }
          ]
        }
      ],
      limit: size,
      offset: page * size,
      order: [['updatedAt', 'DESC']]
    });

    const mappedReports = rows.map(report => {
      const player = report.player;
      return {
        id: report.id,
        playerId: report.playerId,
        playerName: player ? player.name : 'Unknown Player',
        playerPhoto: player ? player.imagePath : '',
        playerPosition: player && player.position ? player.position.name : 'Unknown',
        createdById: report.createdById,
        createdByName: report.createdByName,
        technicalRating: report.technicalRating,
        physicalRating: report.physicalRating,
        mentalRating: report.mentalRating,
        tacticalRating: report.tacticalRating,
        overallRating: report.overallRating,
        strengths: report.strengths,
        weaknesses: report.weaknesses,
        notes: report.notes || '',
        recommendation: report.recommendation,
        matchObserved: report.matchObserved,
        observationDate: report.observationDate,
        createdAt: (report as any).createdAt || new Date().toISOString()
      };
    });

    const totalPages = Math.ceil(count / size);

    res.json({
      content: mappedReports,
      totalElements: count,
      totalPages: totalPages,
      size: size,
      number: page
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/scouting/reports/:id
 * Fetch a single scouting report by its Report ID
 */
router.get('/reports/:id', async (req: Request, res: Response) => {
  try {
    const report = await ScoutingReport.findByPk(Number(req.params.id), {
      include: [
        {
          model: Player,
          as: 'player',
          include: [
            { model: Club, as: 'club' },
            { model: Position, as: 'position' }
          ]
        }
      ]
    });

    if (!report) {
      return res.status(404).json({ error: 'Scouting report not found' });
    }

    const player = report.player;

    res.json({
      id: report.id,
      playerId: report.playerId,
      playerName: player ? player.name : 'Unknown Player',
      playerPhoto: player ? player.imagePath : '',
      playerPosition: player && player.position ? player.position.name : 'Unknown',
      createdById: report.createdById,
      createdByName: report.createdByName,
      technicalRating: report.technicalRating,
      physicalRating: report.physicalRating,
      mentalRating: report.mentalRating,
      tacticalRating: report.tacticalRating,
      overallRating: report.overallRating,
      strengths: report.strengths,
      weaknesses: report.weaknesses,
      notes: report.notes || '',
      recommendation: report.recommendation,
      matchObserved: report.matchObserved,
      observationDate: report.observationDate,
      createdAt: (report as any).createdAt || new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/scouting/reports
 * Create or update a scouting report
 */
router.post('/reports', async (req: Request, res: Response) => {
  try {
    const {
      playerId,
      notes,
      technicalRating,
      physicalRating,
      mentalRating,
      tacticalRating,
      overallRating,
      strengths,
      weaknesses,
      recommendation,
      matchObserved,
      observationDate
    } = req.body;

    if (!playerId || !notes) {
      return res.status(400).json({ error: 'Player ID and analyst notes are required.' });
    }

    const player = await Player.findByPk(Number(playerId));
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    // Set upsert parameters
    const [report] = await ScoutingReport.upsert({
      playerId: Number(playerId),
      notes: notes,
      technicalRating: technicalRating ? Number(technicalRating) : 7,
      physicalRating: physicalRating ? Number(physicalRating) : 7,
      mentalRating: mentalRating ? Number(mentalRating) : 7,
      tacticalRating: tacticalRating ? Number(tacticalRating) : 7,
      overallRating: overallRating ? Number(overallRating) : 7,
      strengths: strengths || '',
      weaknesses: weaknesses || '',
      recommendation: recommendation || 'Monitor',
      matchObserved: matchObserved || 'General Observation',
      observationDate: observationDate || new Date().toISOString().split('T')[0]
    });

    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/scouting/reports/:id
 * Delete a scouting report
 */
router.delete('/reports/:id', async (req: Request, res: Response) => {
  try {
    const report = await ScoutingReport.findByPk(Number(req.params.id));
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    await report.destroy();
    res.json({ success: true, message: 'Scouting report deleted.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
