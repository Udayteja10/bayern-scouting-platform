import { useEffect, useState } from 'react';
import { getTransfers } from '../../api';
import type { Transfer, PageResponse } from '../../types';
import { ArrowLeftRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/format';

const transferTypeColors: Record<string, string> = {
  PERMANENT: 'badge-red',
  LOAN: 'badge-yellow',
  FREE: 'badge-green',
  RETURN_FROM_LOAN: 'badge-blue',
};

const statusColors: Record<string, string> = {
  COMPLETED: 'badge-green',
  RUMOUR: 'badge-yellow',
  NEGOTIATING: 'badge-blue',
  FAILED: 'badge-gray',
};

export default function TransfersPage() {
  const [data, setData] = useState<PageResponse<Transfer> | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getTransfers(page)
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white">Transfers</h1>
        <p className="text-bayern-text-secondary mt-1">Bayern München transfer history and activity</p>
      </div>

      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-4 border-bayern-red border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Player</th>
                    <th>From</th>
                    <th></th>
                    <th>To</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th className="text-right">Fee</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.content.map(t => (
                    <tr key={t.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          {t.playerPhotoUrl ? (
                            <img
                              src={t.playerPhotoUrl}
                              alt={t.playerName}
                              className="w-8 h-8 rounded-full object-cover border border-white/10"
                              onError={e => {
                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(t.playerName)}&background=DC052D&color=fff&size=32`;
                              }}
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white">
                              {t.playerName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-white">{t.playerName}</div>
                            <div className="text-xs text-bayern-text-muted">{t.position}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-sm">{t.fromClubName}</td>
                      <td className="text-center text-bayern-text-muted">
                        <ArrowLeftRight size={12} />
                      </td>
                      <td className="text-sm font-medium text-white">{t.toClubName}</td>
                      <td>
                        <span className={`badge ${transferTypeColors[t.type] ?? 'badge-gray'}`}>
                          {t.type?.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${statusColors[t.status] ?? 'badge-gray'}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="text-right font-mono text-sm">
                        {t.fee ? (
                          <span className="text-green-400">{formatCurrency(t.fee)}</span>
                        ) : (
                          <span className="text-bayern-text-muted">Free</span>
                        )}
                      </td>
                      <td className="text-xs">{formatDate(t.transferDate)}</td>
                    </tr>
                  ))}
                  {data?.content.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-bayern-text-muted">
                        No transfers found. Trigger a transfer sync to import data.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-bayern-border">
                <span className="text-xs text-bayern-text-muted">
                  Page {data.number + 1} of {data.totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="btn-ghost p-2 disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(data.totalPages - 1, p + 1))}
                    disabled={page >= data.totalPages - 1}
                    className="btn-ghost p-2 disabled:opacity-40"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
