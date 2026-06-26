import { useEffect, useState } from 'react';
import { getDashboardSummary } from '../../api';
import type { DashboardSummary } from '../../types';
import { useAuth } from '../../store/AuthContext';
import {
  Users, AlertTriangle, ArrowLeftRight, FileText,
  TrendingUp, Activity, Clock, CheckCircle, XCircle, RefreshCw,
  Trophy, Shield, Briefcase
} from 'lucide-react';

function KpiCard({ label, value, icon: Icon, color, sublabel }: {
  label: string; value: string | number; icon: React.ElementType;
  color: 'red' | 'blue' | 'green' | 'yellow'; sublabel?: string;
}) {
  const colors = {
    red: 'from-bayern-red/20 to-transparent border-bayern-red/30 text-bayern-red',
    blue: 'from-blue-600/20 to-transparent border-blue-500/30 text-blue-400',
    green: 'from-green-600/20 to-transparent border-green-500/30 text-green-400',
    yellow: 'from-yellow-600/20 to-transparent border-yellow-500/30 text-yellow-400',
  };

  return (
    <div className={`card bg-gradient-to-br ${colors[color]} animate-in`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-bayern-text-muted font-medium uppercase tracking-wider mb-1">{label}</p>
          <p className="stat-number text-3xl">{value}</p>
          {sublabel && <p className="text-xs text-bayern-text-secondary mt-1">{sublabel}</p>}
        </div>
        <div className={`p-3 rounded-xl bg-current/10`}>
          <Icon className={`${colors[color].split(' ').pop()}`} size={22} />
        </div>
      </div>
    </div>
  );
}

function SyncStatusBadge({ status }: { status: 'HEALTHY' | 'NEEDS_SYNC' }) {
  return status === 'HEALTHY' ? (
    <span className="flex items-center gap-1.5 text-green-400 text-xs font-medium">
      <CheckCircle size={13} /> Live
    </span>
  ) : (
    <span className="flex items-center gap-1.5 text-yellow-400 text-xs font-medium">
      <XCircle size={13} /> Needs Sync
    </span>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'club'>('overview');

  useEffect(() => {
    getDashboardSummary()
      .then(res => setData(res.data))
      .catch(() => setError('Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-bayern-red border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="card border-red-500/30 text-red-400 flex items-center gap-3">
      <AlertTriangle size={18} /> {error}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">
            Welcome back, <span className="text-gradient">{user?.fullName?.split(' ')[0]}</span>
          </h1>
          <p className="text-bayern-text-secondary mt-1">
            FC Bayern München — Club Intelligence Platform
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/5 self-start animate-in">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'overview'
                ? 'bg-bayern-red text-white shadow-lg shadow-bayern-red/20'
                : 'text-bayern-text-secondary hover:text-white'
            }`}
          >
            OVERVIEW
          </button>
          <button
            onClick={() => setActiveTab('club')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'club'
                ? 'bg-bayern-red text-white shadow-lg shadow-bayern-red/20'
                : 'text-bayern-text-secondary hover:text-white'
            }`}
          >
            CLUB INFO & BOARD
          </button>
        </div>
      </div>

      {activeTab === 'overview' ? (
        <div className="space-y-8 animate-in">
          {/* KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <KpiCard
              label="Squad Size" value={data?.squadSize ?? 0}
              icon={Users} color="blue" sublabel="Active players"
            />
            <KpiCard
              label="Active Injuries" value={data?.activeInjuries ?? 0}
              icon={AlertTriangle} color="red" sublabel="Currently sidelined"
            />
            <KpiCard
              label="Transfer Rumours" value={data?.activeTransferRumours ?? 0}
              icon={ArrowLeftRight} color="yellow" sublabel="Active negotiations"
            />
            <KpiCard
              label="Scouting Reports" value={data?.scoutingReports ?? 0}
              icon={FileText} color="green" sublabel="Total filed"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Alerts */}
            <div className="lg:col-span-2 card">
              <div className="flex items-center justify-between mb-5">
                <h2 className="section-title flex items-center gap-2">
                  <Activity size={18} className="text-bayern-red" />
                  Recent Alerts
                </h2>
              </div>
              {data?.recentAlerts && data.recentAlerts.length > 0 ? (
                <div className="space-y-3">
                  {data.recentAlerts.map((alert, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/3 border border-white/5 animate-in">
                      {alert.playerPhoto ? (
                        <img
                          src={alert.playerPhoto}
                          alt={alert.playerName}
                          className="w-10 h-10 rounded-full object-cover border border-white/10 flex-shrink-0"
                          onError={e => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40'; }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-white/10 flex-shrink-0 flex items-center justify-center">
                          <Users size={16} className="text-white/40" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-semibold text-white truncate">{alert.playerName}</span>
                          <span className={`badge text-xs ${
                            alert.severity === 'HIGH' ? 'badge-red' :
                            alert.severity === 'MEDIUM' ? 'badge-yellow' : 'badge-gray'
                          }`}>
                            {alert.severity}
                          </span>
                        </div>
                        <p className="text-xs text-bayern-text-secondary truncate">{alert.message}</p>
                        <span className="badge badge-red mt-1">{alert.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-bayern-text-muted">
                  <CheckCircle size={40} className="mx-auto mb-3 text-green-500/40" />
                  <p className="text-sm">No active alerts — all systems nominal</p>
                </div>
              )}
            </div>

            {/* Sync Status */}
            <div className="card">
              <h2 className="section-title flex items-center gap-2 mb-5">
                <RefreshCw size={18} className="text-blue-400" />
                Data Sync Status
              </h2>
              {data?.syncStatus && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-bayern-text-muted uppercase tracking-wider">Overall</span>
                    <SyncStatusBadge status={data.syncStatus.overallStatus} />
                  </div>
                  {[
                    { label: 'Squad', value: data.syncStatus.lastSquadSync, icon: Users },
                    { label: 'Injuries', value: data.syncStatus.lastInjurySync, icon: AlertTriangle },
                    { label: 'Transfers', value: data.syncStatus.lastTransferSync, icon: ArrowLeftRight },
                  ].map(item => (
                    <div key={item.label} className="flex items-start gap-3 p-3 rounded-lg bg-white/3">
                      <item.icon size={14} className="text-bayern-text-muted mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-white">{item.label}</div>
                        <div className="text-xs text-bayern-text-muted flex items-center gap-1 mt-0.5">
                          <Clock size={10} />
                          {item.value}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Shortlists count */}
          <div className="card bg-gradient-to-r from-bayern-blue/10 to-transparent border-blue-500/20">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-blue-600/20 rounded-xl">
                <TrendingUp size={24} className="text-blue-400" />
              </div>
              <div>
                <div className="text-sm text-bayern-text-muted">Active Transfer Shortlists</div>
                <div className="text-2xl font-bold text-white">{data?.shortlistCount ?? 0}</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in">
          {/* Honours Section */}
          <div>
            <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2 uppercase tracking-wide">
              <Trophy className="text-yellow-500" size={20} />
              National Honours & Trophies
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: 'German Championship', count: '35 Victories', desc: 'Bundesliga Record Holder', color: 'border-yellow-500/30' },
                { title: 'DFB German Cup', count: '21 Victories', desc: 'National Cup Record', color: 'border-yellow-500/20' },
                { title: 'German Supercup', count: '12 Victories', desc: 'Supercup Record Holder', color: 'border-yellow-500/20' },
                { title: 'League Cup', count: '6 Victories', desc: 'Historical Cup Title', color: 'border-yellow-500/10' }
              ].map((honour, i) => (
                <div key={i} className={`card bg-gradient-to-b from-yellow-500/10 to-transparent border ${honour.color} flex flex-col justify-between p-5`}>
                  <div>
                    <Trophy className="text-yellow-500 mb-4" size={28} />
                    <h3 className="text-base font-bold text-white leading-tight">{honour.title}</h3>
                    <p className="text-xs text-bayern-text-secondary mt-1">{honour.desc}</p>
                  </div>
                  <div className="text-2xl font-black text-yellow-500 mt-6 tracking-tight">{honour.count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Board Info Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Executive Committee */}
            <div className="card lg:col-span-2 space-y-5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3 uppercase tracking-wide">
                <Shield className="text-bayern-red" size={18} />
                Executive Committee / Advisory Board
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/3 border border-white/5">
                  <div className="text-xs text-bayern-text-muted uppercase tracking-wider font-semibold">Chairman</div>
                  <div className="text-base font-bold text-white mt-1">Alexander Sixt</div>
                </div>
                <div className="p-4 rounded-xl bg-white/3 border border-white/5">
                  <div className="text-xs text-bayern-text-muted uppercase tracking-wider font-semibold">Deputy Chairwoman</div>
                  <div className="text-base font-bold text-white mt-1">Alexandra Schörghuber</div>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white/3 border border-white/5">
                <div className="text-xs text-bayern-text-muted uppercase tracking-wider font-semibold mb-2.5">Members of the Board</div>
                <div className="flex flex-wrap gap-2">
                  {['Dorothee Bär', 'Georg Fahrenschon', 'Prof. Dr. med. Marion Kiechle', 'Lars Klingbeil', 'Hildegard Müller', 'Elisabeth Promberger', 'Dr. Klaus-Peter Röhler', 'Josef Schmid', 'Max Viessmann'].map((member, idx) => (
                    <span key={idx} className="badge badge-gray text-xs font-semibold py-1 px-3 bg-white/5 text-white/90 border border-white/5">{member}</span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/3 border border-white/5">
                  <div className="text-xs text-bayern-text-muted uppercase tracking-wider font-semibold">Honorary Chairman</div>
                  <div className="text-base font-bold text-white mt-1">Dr Edmund Stoiber</div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Managing Directors */}
              <div className="card space-y-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3 uppercase tracking-wide">
                  <Briefcase className="text-blue-400" size={18} />
                  Club Managing Directors
                </h2>
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-white/3 border border-white/5">
                    <div className="text-xs text-bayern-text-muted font-semibold uppercase">Managing Director</div>
                    <div className="text-base font-bold text-white mt-1">Benny Folkmann</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/3 border border-white/5">
                    <div className="text-xs text-bayern-text-muted font-semibold uppercase">Deputy Managing Director</div>
                    <div className="text-base font-bold text-white mt-1">Kiki Hasenpusch</div>
                  </div>
                </div>
              </div>

              {/* Sports Departments */}
              <div className="card space-y-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3 uppercase tracking-wide">
                  <Activity className="text-green-400" size={18} />
                  Sports Departments
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { dept: 'Basketball', head: 'Andreas Minges' },
                    { dept: 'Handball', head: 'Daniel Sack' },
                    { dept: 'Table Tennis', head: 'Matthias Stein' },
                    { dept: 'Chess', head: 'Jörg Wengler' },
                    { dept: 'Referees', head: 'Georgios Kechagias' },
                    { dept: 'Senior Football', head: 'Manfred Poppe' },
                    { dept: 'Sports Skittles', head: 'Ronald Schade' }
                  ].map((dept, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-white/3 border border-white/5">
                      <div className="text-[10px] text-bayern-text-muted uppercase tracking-wider font-semibold">{dept.dept}</div>
                      <div className="text-sm font-bold text-white mt-0.5 truncate">{dept.head}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Partners Section */}
          <div className="card space-y-4 bg-gradient-to-r from-bayern-red/5 to-transparent border-bayern-red/20">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3 uppercase tracking-wide">
              <Shield className="text-bayern-red" size={18} />
              Official Club Partners
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 pt-2">
              {[
                { name: 'Telekom', role: 'Main Partner' },
                { name: 'Adidas', role: 'Official Partner' },
                { name: 'Allianz', role: 'Official Partner' },
                { name: 'Audi', role: 'Official Partner' },
                { name: 'Betano', role: 'Official Partner' },
                { name: 'Bitpanda', role: 'Official Partner' },
                { name: 'Drutex', role: 'Official Partner' },
                { name: 'EA Sports', role: 'Official Partner' },
                { name: 'Einhell', role: 'Official Partner' },
                { name: 'Emirates', role: 'Official Partner' },
                { name: 'Paulaner', role: 'Official Partner' },
                { name: 'SAP', role: 'Official Partner' },
                { name: 'Schwarz Digits', role: 'Official Partner' },
                { name: 'Viessmann', role: 'Official Partner' },
                { name: 'Volksbank eG', role: 'Official Partner' },
                { name: 'Bundesliga', role: 'League Partner' }
              ].map((partner, idx) => (
                <div key={idx} className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 border border-white/5 text-center group hover:border-bayern-red/30 transition-all duration-300">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-black text-white text-xs tracking-tight group-hover:scale-110 transition-transform duration-300">
                    {partner.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="text-xs font-bold text-white mt-2 truncate max-w-full">{partner.name}</div>
                  <div className="text-[9px] text-bayern-text-muted mt-0.5">{partner.role}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
