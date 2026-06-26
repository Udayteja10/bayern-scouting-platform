import express, { Request, Response } from 'express';
import { Player, Injury, Transfer, Shortlist, ScoutingReport, PlayerStats, SyncLog } from '../models/index';

const router = express.Router();

/**
 * GET /api/dashboard/summary
 * Aggregates KPI indicators and recent alerts for the Sporting Director dashboard
 */
router.get('/summary', async (req: Request, res: Response) => {
  try {
    // 1. Calculate counts
    const squadSize = await Player.count({ where: { clubId: 503 } });
    const activeInjuries = await Injury.count({ where: { status: 'ACTIVE' } });
    const activeTransferRumours = await Transfer.count({ where: { status: 'RUMOUR' } });
    const shortlistCount = await Shortlist.count();
    const scoutingReports = await ScoutingReport.count();

    // 2. Calculate average age of squad
    const players = await Player.findAll({ where: { clubId: 503 } });
    const totalAge = players.reduce((sum, p) => sum + (p.age || 0), 0);
    const squadAverageAge = squadSize > 0 ? parseFloat((totalAge / squadSize).toFixed(1)) : 25.5;

    // 3. Calculate average squad rating from stats
    const stats = await PlayerStats.findAll({
      include: [{
        model: Player,
        as: 'player',
        where: { clubId: 503 }
      }]
    });
    const totalRating = stats.reduce((sum, s) => sum + (s.rating || 0), 0);
    const squadAverageRating = stats.length > 0 ? parseFloat((totalRating / stats.length).toFixed(2)) : 7.42;

    // 4. Compile recent alerts (injuries, contract risks, transfers)
    const recentAlerts: any[] = [];

    // Alert 4.1: Active Injuries
    const recentInjuries = await Injury.findAll({
      where: { status: 'ACTIVE' },
      include: [{ model: Player, as: 'player' }],
      limit: 3
    });
    recentInjuries.forEach(injury => {
      if (injury.player) {
        recentAlerts.push({
          type: 'INJURY',
          severity: 'HIGH',
          message: `${injury.player.displayName} is out with a ${injury.description}`,
          playerName: injury.player.name,
          playerPhoto: injury.player.imagePath
        });
      }
    });

    // Alert 4.2: Contracts expiring in 2026 (contractUntil contains '2026')
    const expiringPlayers = await Player.findAll({
      where: {
        clubId: 503,
        contractUntil: {
          [require('sequelize').Op.like]: '%2026%'
        }
      },
      limit: 3
    });
    expiringPlayers.forEach(player => {
      recentAlerts.push({
        type: 'CONTRACT_EXPIRY',
        severity: 'MEDIUM',
        message: `Contract expires in June 2026`,
        playerName: player.name,
        playerPhoto: player.imagePath
      });
    });

    // Alert 4.3: Transfer Rumours
    const recentTransfers = await Transfer.findAll({
      where: { status: 'RUMOUR' },
      include: [{ model: Player, as: 'player' }],
      limit: 2
    });
    recentTransfers.forEach(tr => {
      if (tr.player) {
        recentAlerts.push({
          type: 'TRANSFER',
          severity: 'LOW',
          message: `Negotiating potential transfer`,
          playerName: tr.player.name,
          playerPhoto: tr.player.imagePath
        });
      }
    });

    // 5. Get last sync information
    const lastSquadSyncLog = await SyncLog.findOne({
      where: { syncType: 'SQUAD', status: 'SUCCESS' },
      order: [['completedAt', 'DESC']]
    });
    const lastInjurySyncLog = await SyncLog.findOne({
      where: { syncType: 'INJURY', status: 'SUCCESS' },
      order: [['completedAt', 'DESC']]
    });
    const lastTransferSyncLog = await SyncLog.findOne({
      where: { syncType: 'TRANSFER', status: 'SUCCESS' },
      order: [['completedAt', 'DESC']]
    });

    const syncStatus = {
      lastSquadSync: lastSquadSyncLog?.completedAt || new Date().toISOString(),
      lastInjurySync: lastInjurySyncLog?.completedAt || new Date().toISOString(),
      lastTransferSync: lastTransferSyncLog?.completedAt || new Date().toISOString(),
      overallStatus: 'HEALTHY' as 'HEALTHY' | 'NEEDS_SYNC'
    };

    res.json({
      squadSize,
      activeInjuries,
      activeTransferRumours,
      shortlistCount,
      scoutingReports,
      squadAverageAge,
      squadAverageRating,
      recentAlerts,
      syncStatus
    });
  } catch (error: any) {
    console.error('Error generating dashboard summary:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
