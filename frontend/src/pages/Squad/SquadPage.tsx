import { useEffect, useState } from 'react';
import { getSquad, getDepthChart } from '../../api';
import type { SquadMember } from '../../types';
import { Users, AlertTriangle, Filter } from 'lucide-react';

const positionColors: Record<string, string> = {
  GK: 'badge-yellow',
  DEF: 'badge-blue',
  MID: 'badge-green',
  FWD: 'badge-red',
};

const positionLabels: Record<string, string> = {
  GK: 'Goalkeepers',
  DEF: 'Defenders',
  MID: 'Midfielders',
  FWD: 'Forwards',
};

function PlayerCard({ member }: { member: SquadMember }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5 hover:border-bayern-red/30 hover:bg-white/5 transition-all duration-200 group">
      <div className="relative flex-shrink-0">
        {member.photoUrl ? (
          <img
            src={member.photoUrl}
            alt={member.playerName}
            className="w-12 h-12 rounded-full object-cover object-top border-2 border-white/10 group-hover:border-bayern-red/50 transition-colors"
            style={{ objectPosition: 'center 10%' }}
            onError={e => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.playerName)}&background=DC052D&color=fff&size=48`;
            }}
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-bayern-red/20 to-transparent border border-white/10 flex items-center justify-center">
            <span className="text-white font-bold text-sm">{member.playerName.charAt(0)}</span>
          </div>
        )}
        {member.injured && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-bayern-dark-2 flex items-center justify-center">
            <AlertTriangle size={8} className="text-white" />
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white truncate">{member.playerName}</span>
          {member.jerseyNumber && (
            <span className="text-xs text-bayern-text-muted font-mono">#{member.jerseyNumber}</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-bayern-text-secondary truncate">{member.position || member.positionCategory}</span>
          {member.nationality && (
            <span className="text-xs text-bayern-text-muted">· {member.nationality}</span>
          )}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        {member.age && <div className="text-xs text-white font-medium">{member.age}y</div>}
        {member.injured && (
          <div className="text-xs text-red-400 font-medium">Injured</div>
        )}
      </div>
    </div>
  );
}

export default function SquadPage() {
  const [squad, setSquad] = useState<SquadMember[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<'first' | 'academy'>('first');
  const [view, setView] = useState<'by-position' | 'all'>('by-position');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSquad()
      .then((squadRes) => {
        setSquad(squadRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredSquad = squad.filter(m => 
    selectedTeam === 'first' 
      ? m.teamName !== 'FC Bayern II' 
      : m.teamName === 'FC Bayern II'
  );

  const filteredDepthChart = filteredSquad.reduce<Record<string, SquadMember[]>>((acc, member) => {
    const cat = member.positionCategory || 'MID';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(member);
    return acc;
  }, {});

  const injured = filteredSquad.filter(m => m.injured);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-bayern-red border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Squad</h1>
          <p className="text-bayern-text-secondary mt-1">{filteredSquad.length} registered players</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Team Switcher */}
          <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setSelectedTeam('first')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                selectedTeam === 'first'
                  ? 'bg-bayern-red text-white shadow-lg shadow-bayern-red/20'
                  : 'text-bayern-text-secondary hover:text-white'
              }`}
            >
              First Team
            </button>
            <button
              onClick={() => setSelectedTeam('academy')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                selectedTeam === 'academy'
                  ? 'bg-bayern-red text-white shadow-lg shadow-bayern-red/20'
                  : 'text-bayern-text-secondary hover:text-white'
              }`}
            >
              FC Bayern II (Academy)
            </button>
          </div>

          {/* View Switcher */}
          <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setView('by-position')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                view === 'by-position'
                  ? 'bg-bayern-red text-white shadow-lg shadow-bayern-red/20'
                  : 'text-bayern-text-secondary hover:text-white'
              }`}
            >
              By Position
            </button>
            <button
              onClick={() => setView('all')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                view === 'all'
                  ? 'bg-bayern-red text-white shadow-lg shadow-bayern-red/20'
                  : 'text-bayern-text-secondary hover:text-white'
              }`}
            >
              All Players
            </button>
          </div>
        </div>
      </div>

      {/* Injury banner */}
      {injured.length > 0 && (
        <div className="card border-red-500/30 bg-gradient-to-r from-red-900/20 to-transparent">
          <div className="flex items-center gap-3">
            <AlertTriangle size={18} className="text-red-400 flex-shrink-0" />
            <div>
              <span className="font-semibold text-white">{injured.length} player{injured.length > 1 ? 's' : ''} currently injured: </span>
              <span className="text-red-400 text-sm">{injured.map(m => m.playerName).join(', ')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Depth chart view */}
      {view === 'by-position' ? (
        <div className="space-y-6">
          {['GK', 'DEF', 'MID', 'FWD'].map(pos => {
            const members = filteredDepthChart[pos] ?? [];
            if (members.length === 0) return null;
            return (
              <div key={pos} className="card">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`badge ${positionColors[pos]} text-sm px-3 py-1`}>
                    {positionLabels[pos]}
                  </span>
                  <span className="text-xs text-bayern-text-muted">{members.length} players</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                  {members.map(member => (
                    <PlayerCard key={member.id} member={member} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={16} className="text-bayern-text-muted" />
            <span className="text-sm text-bayern-text-muted">All {filteredSquad.length} Squad Members</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
            {filteredSquad.map(member => (
              <PlayerCard key={member.id} member={member} />
            ))}
          </div>
        </div>
      )}

      {squad.length === 0 && (
        <div className="card text-center py-16">
          <Users size={48} className="mx-auto mb-4 text-white/20" />
          <h3 className="text-lg font-semibold text-white mb-2">No Squad Data</h3>
          <p className="text-sm text-bayern-text-secondary">Trigger a squad sync from the Sync page to import Bayern's roster.</p>
        </div>
      )}
    </div>
  );
}
