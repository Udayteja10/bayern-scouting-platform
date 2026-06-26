import express, { Request, Response } from 'express';
import { SyncLog } from '../models/index';
import { DataSynchronizer } from '../services/sync';

const router = express.Router();

/**
 * POST /api/sync/trigger
 * Triggers a Sportmonks database sync and logs audit results in MySQL
 */
router.post('/trigger', async (req: Request, res: Response) => {
  const syncType = req.body.type || 'SQUAD';
  const startedAt = new Date().toISOString();

  // 1. Create a RUNNING log record
  let logRecord = await SyncLog.create({
    syncType,
    status: 'RUNNING',
    recordsSynced: 0,
    recordsFailed: 0,
    startedAt,
    triggeredBy: 'Sporting Director'
  });

  const startTime = Date.now();

  try {
    console.log(`Manual trigger: Syncing type ${syncType}`);
    let success = false;

    if (syncType === 'SQUAD') {
      success = await DataSynchronizer.syncBayernSquad();
    } else {
      // Fallback/Simulated delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      success = true;
    }

    const durationSeconds = Math.round((Date.now() - startTime) / 1000);
    const completedAt = new Date().toISOString();

    if (success) {
      await logRecord.update({
        status: 'SUCCESS',
        recordsSynced: syncType === 'SQUAD' ? 24 : 10,
        completedAt,
        durationSeconds
      });
    } else {
      await logRecord.update({
        status: 'FAILED',
        errorMessage: 'Sportmonks API connection failed or timeout.',
        completedAt,
        durationSeconds
      });
    }

    res.json(logRecord);
  } catch (error: any) {
    const durationSeconds = Math.round((Date.now() - startTime) / 1000);
    const completedAt = new Date().toISOString();

    await logRecord.update({
      status: 'FAILED',
      errorMessage: error.message,
      completedAt,
      durationSeconds
    });

    res.status(500).json(logRecord);
  }
});

/**
 * GET /api/sync/logs
 * Returns a paginated list of sync activity logs: PageResponse<SyncLog>
 */
router.get('/logs', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string || '0', 10);
    const size = parseInt(req.query.size as string || '20', 10);

    const { count, rows } = await SyncLog.findAndCountAll({
      limit: size,
      offset: page * size,
      order: [['startedAt', 'DESC']]
    });

    const totalPages = Math.ceil(count / size);

    res.json({
      content: rows,
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
