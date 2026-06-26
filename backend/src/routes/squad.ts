import express, { Request, Response } from 'express';
import { Player, Club, Position, Nationality, PlayerStats, Injury } from '../models/index';

const router = express.Router();

/**
 * Maps DB positions to Category for depth chart rendering
 */
const getPositionCategory = (posCode: string): 'GK' | 'DEF' | 'MID' | 'FWD' => {
  const code = (posCode || '').toUpperCase();
  if (code === 'GK') return 'GK';
  if (['CB', 'LB', 'RB', 'LWB', 'RWB', 'DEFENDER', 'LEFT BACK', 'RIGHT BACK', 'CENTER BACK'].some(x => code.includes(x))) {
    return 'DEF';
  }
  if (['DM', 'CM', 'AM', 'MIDFIELDER', 'CENTRAL MIDFIELDER', 'ATTACKING MIDFIELDER', 'DEFENSIVE MIDFIELDER'].some(x => code.includes(x))) {
    return 'MID';
  }
  return 'FWD'; // Attacker / Forward
};

/**
 * Formats Player model to SquadMember JSON structure
 */
const mapToSquadMember = async (player: Player) => {
  const stats = await PlayerStats.findOne({
    where: { playerId: player.id },
    order: [['season', 'DESC']]
  });

  const activeInjury = await Injury.findOne({
    where: { playerId: player.id, status: 'ACTIVE' }
  });

  const posCode = player.position ? player.position.code : 'CF';
  const posName = player.position ? player.position.name : 'Center Forward';

  return {
    id: player.id,
    playerId: player.id,
    playerName: player.name,
    photoUrl: player.imagePath,
    position: posName,
    detailedPosition: posName,
    positionCategory: getPositionCategory(posCode),
    jerseyNumber: player.jerseyNumber || '99',
    nationality: player.nationality ? player.nationality.name : 'Unknown',
    age: player.age || 25,
    preferredFoot: player.preferredFoot || 'Right',
    averageRating: stats ? stats.rating : 7.0,
    injured: !!activeInjury,
    teamName: player.club ? player.club.name : 'FC Bayern Munich'
  };
};

/**
 * GET /api/squad
 * Get list of all players in managed club (FC Bayern, ID 503)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const players = await Player.findAll({
      where: { clubId: 503 },
      include: [
        { model: Position, as: 'position' },
        { model: Nationality, as: 'nationality' },
        { model: Club, as: 'club' }
      ]
    });

    const squadMembers = await Promise.all(players.map(p => mapToSquadMember(p)));
    res.json(squadMembers);
  } catch (error: any) {
    console.error('Error fetching squad:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/squad/depth-chart
 * Groups Bayern players by position categories (GK, DEF, MID, FWD)
 */
router.get('/depth-chart', async (req: Request, res: Response) => {
  try {
    const players = await Player.findAll({
      where: { clubId: 503 },
      include: [
        { model: Position, as: 'position' },
        { model: Nationality, as: 'nationality' },
        { model: Club, as: 'club' }
      ]
    });

    const members = await Promise.all(players.map(p => mapToSquadMember(p)));

    const depthChart: Record<string, typeof members> = {
      GK: [],
      DEF: [],
      MID: [],
      FWD: []
    };

    members.forEach(member => {
      depthChart[member.positionCategory].push(member);
    });

    res.json(depthChart);
  } catch (error: any) {
    console.error('Error fetching depth chart:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
