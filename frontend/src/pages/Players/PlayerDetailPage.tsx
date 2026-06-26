import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPlayer } from '../../api';
import type { PlayerDetail } from '../../types';
import { ArrowLeft, Calendar, Ruler, Weight, Star } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { formatCurrency, formatDate } from '../../utils/format';

function StatRow({ label, value }: { label: string; value: string | number | undefined }) {
  return (
    <div className="flex justify-between py-2 border-b border-white/5">
      <span className="text-xs text-bayern-text-muted">{label}</span>
      <span className="text-xs font-medium text-white">{value ?? '—'}</span>
    </div>
  );
}

export default function PlayerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [player, setPlayer] = useState<PlayerDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getPlayer(Number(id))
      .then(res => setPlayer(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-bayern-red border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!player) return (
    <div className="card text-center py-16 text-bavaria-text-muted">Player not found.</div>
  );

  const statsChartData = player.statistics.slice(0, 5).map(s => ({
    season: s.seasonName?.replace('Season ', ''),
    goals: s.goals ?? 0,
    assists: s.assists ?? 0,
    apps: s.appearances ?? 0,
  }));

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 btn-ghost pl-0">
        <ArrowLeft size={16} /> Back
      </button>

      {/* Hero card */}
      <div className="card bg-gradient-to-br from-bayern-red/10 to-transparent border-bayern-red/20">
        <div className="flex flex-col sm:flex-row gap-6">
          {player.photoUrl ? (
            <img
              src={player.photoUrl}
              alt={player.name}
              className="w-28 h-28 rounded-2xl object-cover border-2 border-white/10 flex-shrink-0"
              style={{ objectPosition: 'center 10%' }}
              onError={e => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=DC052D&color=fff&size=112`;
              }}
            />
          ) : (
            <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-bayern-red/30 to-transparent border border-white/10 flex items-center justify-center text-3xl font-bold text-white flex-shrink-0">
              {player.name.charAt(0)}
            </div>
          )}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="badge badge-blue">{player.position}</span>
              {player.jerseyNumber && <span className="badge badge-gray">#{player.jerseyNumber}</span>}
              {player.currentClubName && <span className="badge badge-red">{player.currentClubName}</span>}
            </div>
            <h1 className="text-3xl font-black text-white mb-1">{player.name}</h1>
            <p className="text-bayern-text-secondary text-sm">{player.nationality} · {player.age} years old</p>
            <div className="flex flex-wrap gap-4 mt-4">
              {player.marketValue && (
                <div>
                  <div className="text-xs text-bayern-text-muted">Market Value</div>
                  <div className="text-lg font-bold text-gradient">{formatCurrency(player.marketValue)}</div>
                </div>
              )}
              {player.contractExpiry && (
                <div>
                  <div className="text-xs text-bayern-text-muted">Contract Until</div>
                  <div className="text-lg font-bold text-white">{formatDate(player.contractExpiry)}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile info */}
        <div className="card">
          <h2 className="section-title mb-4">Profile</h2>
          <StatRow label="Full Name" value={`${player.firstName ?? ''} ${player.lastName ?? ''}`} />
          <StatRow label="Birth Date" value={formatDate(player.birthDate)} />
          <StatRow label="Birth Country" value={player.birthCountry} />
          <StatRow label="Height" value={player.height ? `${player.height} cm` : undefined} />
          <StatRow label="Weight" value={player.weight ? `${player.weight} kg` : undefined} />
          <StatRow label="Preferred Foot" value={player.preferredFoot} />
          <StatRow label="Second Nationality" value={player.secondNationality} />
        </div>

        {/* Career stats chart */}
        <div className="lg:col-span-2 card">
          <h2 className="section-title mb-4">Career Statistics</h2>
          {statsChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={statsChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3E" />
                <XAxis dataKey="season" stroke="#6B7280" tick={{ fontSize: 11 }} />
                <YAxis stroke="#6B7280" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#1E1E2E', border: '1px solid #2A2A3E', borderRadius: 8 }}
                  labelStyle={{ color: '#9CA3AF' }}
                  itemStyle={{ color: '#FFFFFF' }}
                />
                <Bar dataKey="goals" name="Goals" fill="#DC052D" radius={[4,4,0,0]} />
                <Bar dataKey="assists" name="Assists" fill="#0066B2" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-sm text-bayern-text-muted">
              No statistics available for this player.
            </div>
          )}
          {/* Stats table */}
          {player.statistics.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="data-table text-xs">
                <thead>
                  <tr>
                    <th>Season</th><th>Apps</th><th>Goals</th><th>Assists</th>
                    <th>Min</th><th>Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {player.statistics.map(s => (
                    <tr key={s.id}>
                      <td>{s.seasonName}</td>
                      <td>{s.appearances ?? 0}</td>
                      <td className="text-bayern-red font-mono">{s.goals ?? 0}</td>
                      <td className="text-blue-400 font-mono">{s.assists ?? 0}</td>
                      <td className="font-mono">{s.minutesPlayed?.toLocaleString() ?? 0}</td>
                      <td>
                        {s.averageRating ? (
                          <span className="flex items-center gap-1">
                            <Star size={10} className="text-yellow-400" />
                            {Number(s.averageRating).toFixed(1)}
                          </span>
                        ) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Injuries */}
      {player.injuries.length > 0 && (
        <div className="card">
          <h2 className="section-title mb-4">Injury History</h2>
          <div className="space-y-2">
            {player.injuries.map(inj => (
              <div key={inj.id} className="flex items-center gap-4 p-3 rounded-lg bg-white/3">
                <span className={`badge ${inj.status === 'ACTIVE' ? 'badge-red' : 'badge-gray'}`}>
                  {inj.status}
                </span>
                <span className="text-sm text-white font-medium">{inj.type}</span>
                {inj.bodyPart && <span className="text-xs text-bayern-text-muted">({inj.bodyPart})</span>}
                <span className="ml-auto text-xs text-bayern-text-muted flex items-center gap-1">
                  <Calendar size={10} />
                  {formatDate(inj.startDate)} {inj.expectedReturn ? `→ ${formatDate(inj.expectedReturn)}` : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transfer history */}
      {player.transfers.length > 0 && (
        <div className="card">
          <h2 className="section-title mb-4">Transfer History</h2>
          <div className="space-y-2">
            {player.transfers.map(t => (
              <div key={t.id} className="flex items-center gap-4 p-3 rounded-lg bg-white/3">
                <span className={`badge ${t.type === 'PERMANENT' ? 'badge-red' : t.type === 'LOAN' ? 'badge-yellow' : 'badge-gray'}`}>
                  {t.type}
                </span>
                <span className="text-sm text-white">{t.fromClubName}</span>
                <span className="text-bayern-text-muted">→</span>
                <span className="text-sm text-white font-medium">{t.toClubName}</span>
                {t.fee && (
                  <span className="ml-auto text-sm font-mono text-green-400">{formatCurrency(t.fee)}</span>
                )}
                <span className="text-xs text-bayern-text-muted">{formatDate(t.transferDate)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
