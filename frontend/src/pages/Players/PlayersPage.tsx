import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchPlayers } from '../../api';
import type { Player, PageResponse } from '../../types';
import { Search, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

const POSITIONS = ['', 'Goalkeeper', 'Defender', 'Midfielder', 'Forward'];

export default function PlayersPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<PageResponse<Player> | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [nationality, setNationality] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await searchPlayers({
        name: name || undefined,
        position: position || undefined,
        nationality: nationality || undefined,
        page, size: 20,
      });
      setData(res.data);
    } finally {
      setLoading(false);
    }
  }, [name, position, nationality, page]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white">Players</h1>
        <p className="text-bayern-text-secondary mt-1">Search across all synced football players</p>
      </div>

      {/* Search filters */}
      <form onSubmit={handleSearch} className="card">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-bayern-text-muted" />
            <input
              className="input-field pl-9"
              placeholder="Player name..."
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <select
            className="input-field"
            value={position}
            onChange={e => setPosition(e.target.value)}
          >
            {POSITIONS.map(p => (
              <option key={p} value={p}>{p || 'All Positions'}</option>
            ))}
          </select>
          <input
            className="input-field"
            placeholder="Nationality..."
            value={nationality}
            onChange={e => setNationality(e.target.value)}
          />
          <button type="submit" className="btn-primary" id="player-search-btn">
            Search
          </button>
        </div>
      </form>

      {/* Results */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-bayern-text-muted">
            {data ? `${data.totalElements} players found` : 'Loading...'}
          </span>
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
                  <th>Player</th>
                  <th>Position</th>
                  <th>Nationality</th>
                  <th>Age</th>
                  <th className="text-right">Market Value</th>
                  <th>Club</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data?.content.map(player => (
                  <tr key={player.id} className="cursor-pointer" onClick={() => navigate(`/players/${player.id}`)}>
                    <td>
                      <div className="flex items-center gap-3">
                        {player.photoUrl ? (
                          <img
                            src={player.photoUrl}
                            alt={player.name}
                            className="w-8 h-8 rounded-full object-cover border border-white/10"
                            style={{ objectPosition: 'center 10%' }}
                            onError={e => {
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=DC052D&color=fff&size=32`;
                            }}
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white">
                            {player.name.charAt(0)}
                          </div>
                        )}
                        <span className="font-medium text-white text-sm">{player.name}</span>
                      </div>
                    </td>
                    <td><span className="badge badge-blue">{player.position}</span></td>
                    <td>{player.nationality ?? '—'}</td>
                    <td>{player.age ?? '—'}</td>
                    <td className="text-right font-mono text-sm text-white">
                      {player.marketValue ? formatCurrency(player.marketValue) : '—'}
                    </td>
                    <td>{player.currentClubName ?? '—'}</td>
                    <td>
                      <ExternalLink size={14} className="text-bayern-text-muted" />
                    </td>
                  </tr>
                ))}
                {data?.content.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-bayern-text-muted">
                      No players found. Try adjusting your search filters or trigger a sync.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
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
      </div>
    </div>
  );
}
