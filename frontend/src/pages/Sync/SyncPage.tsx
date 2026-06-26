import { useEffect, useState } from 'react';
import { getSyncLogs, triggerSync } from '../../api';
import type { SyncLog, PageResponse } from '../../types';
import { RefreshCw, Clock, CheckCircle, XCircle, AlertTriangle, Loader2, Play } from 'lucide-react';
import { formatDate } from '../../utils/format';
import { useAuth } from '../../store/AuthContext';

const SYNC_TYPES = [
  { id: 'SQUAD', label: 'Bayern Squad', description: 'Sync Bayern München full squad roster and player profiles' },
  { id: 'INJURIES', label: 'Injuries', description: 'Update current injury status for all squad players' },
  { id: 'TRANSFERS', label: 'Transfers', description: 'Import latest transfer history for Bayern München' },
  { id: 'LEAGUE_PLAYERS', label: 'League Players', description: 'Sync top 5 leagues player database (weekly)' },
];

function StatusBadge({ status }: { status: SyncLog['status'] }) {
  const configs = {
    RUNNING: { cls: 'badge-blue', icon: Loader2, spin: true },
    SUCCESS: { cls: 'badge-green', icon: CheckCircle, spin: false },
    PARTIAL: { cls: 'badge-yellow', icon: AlertTriangle, spin: false },
    FAILED: { cls: 'badge-red', icon: XCircle, spin: false },
  };
  const cfg = configs[status] ?? configs.FAILED;
  return (
    <span className={`badge ${cfg.cls} flex items-center gap-1`}>
      <cfg.icon size={10} className={cfg.spin ? 'animate-spin' : ''} />
      {status}
    </span>
  );
}

export default function SyncPage() {
  const { hasAnyRole } = useAuth();
  const canSync = hasAnyRole(['CLUB_OWNER', 'SPORTING_DIRECTOR']);

  const [logs, setLogs] = useState<PageResponse<SyncLog> | null>(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState<string | null>(null);

  const loadLogs = () => {
    getSyncLogs()
      .then(res => setLogs(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadLogs(); }, []);

  const handleTrigger = async (type: string) => {
    if (!canSync) return;
    setTriggering(type);
    try {
      await triggerSync(type);
      setTimeout(loadLogs, 1000); // refresh logs after sync
    } catch (e) {
      console.error(e);
    } finally {
      setTriggering(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white">Data Sync</h1>
        <p className="text-bayern-text-secondary mt-1">Manage Sportmonks API synchronization</p>
      </div>

      {/* Sync triggers */}
      <div className="card">
        <h2 className="section-title mb-1">Manual Sync Triggers</h2>
        <p className="section-subtitle mb-5">
          {canSync ? 'Click a sync job to run it immediately' : 'Requires CLUB_OWNER or SPORTING_DIRECTOR role'}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SYNC_TYPES.map(sync => (
            <div key={sync.id} className="flex items-center gap-4 p-4 bg-white/3 border border-white/5 rounded-xl">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white">{sync.label}</div>
                <div className="text-xs text-bayern-text-muted mt-0.5 line-clamp-2">{sync.description}</div>
              </div>
              <button
                onClick={() => handleTrigger(sync.id)}
                disabled={!canSync || triggering !== null}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all flex-shrink-0 ${
                  canSync
                    ? 'bg-gradient-to-r from-bayern-red to-red-700 text-white hover:shadow-glow-red disabled:opacity-50'
                    : 'bg-white/5 text-bayern-text-muted cursor-not-allowed'
                }`}
                id={`sync-${sync.id.toLowerCase()}`}
              >
                {triggering === sync.id ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Play size={13} />
                )}
                {triggering === sync.id ? 'Running...' : 'Run'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Scheduled jobs info */}
      <div className="card border-blue-500/20 bg-gradient-to-r from-blue-900/10 to-transparent">
        <div className="flex items-center gap-3 mb-4">
          <Clock size={16} className="text-blue-400" />
          <h2 className="section-title mb-0">Scheduled Jobs</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          {[
            { job: 'Bayern Squad', cron: 'Daily 3:00 AM' },
            { job: 'Injuries', cron: 'Every 6 hours' },
            { job: 'Transfers', cron: 'Daily 8:00 AM' },
            { job: 'League Players', cron: 'Monday 4:00 AM' },
          ].map(j => (
            <div key={j.job} className="p-3 bg-white/3 rounded-lg">
              <div className="font-medium text-white text-sm">{j.job}</div>
              <div className="text-xs text-blue-400 mt-0.5 flex items-center gap-1">
                <RefreshCw size={9} /> {j.cron}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sync Logs */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title mb-0">Sync History</h2>
          <button onClick={loadLogs} className="btn-ghost text-xs flex items-center gap-1.5">
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-4 border-bayern-red border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Records</th>
                  <th>Duration</th>
                  <th>Triggered By</th>
                  <th>Started</th>
                  <th>Error</th>
                </tr>
              </thead>
              <tbody>
                {logs?.content.map(log => (
                  <tr key={log.id}>
                    <td><span className="font-medium text-white">{log.syncType}</span></td>
                    <td><StatusBadge status={log.status} /></td>
                    <td>
                      <span className="font-mono text-xs">
                        {log.recordsSynced ?? 0}
                        {log.recordsFailed ? <span className="text-red-400"> / {log.recordsFailed} failed</span> : ''}
                      </span>
                    </td>
                    <td className="font-mono text-xs">
                      {log.durationSeconds != null ? `${log.durationSeconds}s` : '—'}
                    </td>
                    <td className="text-xs">{log.triggeredBy ?? '—'}</td>
                    <td className="text-xs">{formatDate(log.startedAt)}</td>
                    <td className="text-xs max-w-xs">
                      {log.errorMessage ? (
                        <span className="text-red-400 line-clamp-1" title={log.errorMessage}>
                          {log.errorMessage}
                        </span>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
                {logs?.content.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-bayern-text-muted">
                      No sync history yet. Trigger your first sync above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
