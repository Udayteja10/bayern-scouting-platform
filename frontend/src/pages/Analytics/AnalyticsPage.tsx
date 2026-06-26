import { useEffect, useState } from 'react';
import {
  getSquadStrength, getAgeCurve, getPositionDepth,
  getInjuryRisk, getFinancialHealth, getTransferOpportunities
} from '../../api';
import type { SquadStrength, AgeCurvePoint, InjuryRisk, FinancialHealth } from '../../types';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { formatCurrency } from '../../utils/format';

function ScoreGauge({ score, label, color = '#DC052D' }: { score: number; label: string; color?: string }) {
  const pct = Math.min(100, score);
  const r = 40, cx = 50, cy = 50;
  const circumference = 2 * Math.PI * r;
  const strokeDash = (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width="100" height="100" className="-rotate-90">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#2A2A3E" strokeWidth="8" />
        <circle
          cx={cx} cy={cy} r={r} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={`${strokeDash} ${circumference}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s ease' }}
        />
      </svg>
      <div className="text-center -mt-16">
        <div className="text-2xl font-black text-white">{pct.toFixed(0)}</div>
        <div className="text-xs text-bayern-text-muted">{label}</div>
      </div>
    </div>
  );
}

const PIE_COLORS = ['#DC052D', '#0066B2', '#22C55E', '#F5A623'];

export default function AnalyticsPage() {
  const [strength, setStrength] = useState<SquadStrength | null>(null);
  const [ageCurve, setAgeCurve] = useState<AgeCurvePoint[]>([]);
  const [posDepth, setPosDepth] = useState<Record<string, number>>({});
  const [injuryRisk, setInjuryRisk] = useState<InjuryRisk | null>(null);
  const [financial, setFinancial] = useState<FinancialHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      getSquadStrength(),
      getAgeCurve(),
      getPositionDepth(),
      getInjuryRisk(),
      getFinancialHealth(),
    ]).then(([s, a, p, i, f]) => {
      if (s.status === 'fulfilled') setStrength(s.value.data);
      if (a.status === 'fulfilled') setAgeCurve(a.value.data);
      if (p.status === 'fulfilled') setPosDepth(p.value.data);
      if (i.status === 'fulfilled') setInjuryRisk(i.value.data);
      if (f.status === 'fulfilled') setFinancial(f.value.data);
    }).finally(() => setLoading(false));
  }, []);

  const radarData = strength ? [
    { subject: 'Overall', value: strength.overallScore },
    { subject: 'Depth', value: strength.depthScore },
    { subject: 'Age Balance', value: strength.ageBalanceScore },
    { subject: 'Squad Size', value: Math.min(100, (strength.squadSize / 30) * 100) },
  ] : [];

  const posData = Object.entries(posDepth).map(([name, value]) => ({ name, value }));

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-bayern-red border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white">Analytics</h1>
        <p className="text-bayern-text-secondary mt-1">AI-powered club intelligence and performance insights</p>
      </div>

      {/* Row 1: Squad Strength + Age Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Squad Strength Radar */}
        <div className="card">
          <h2 className="section-title mb-1">Squad Strength</h2>
          <p className="section-subtitle mb-4">Multi-dimensional performance scoring</p>
          {strength ? (
            <>
              <div className="flex justify-center gap-8 mb-4">
                <ScoreGauge score={strength.overallScore} label="Overall" />
                <ScoreGauge score={strength.depthScore} label="Depth" color="#0066B2" />
                <ScoreGauge score={strength.ageBalanceScore} label="Age Balance" color="#22C55E" />
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#2A2A3E" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                  <Radar name="Score" dataKey="value" stroke="#DC052D" fill="#DC052D" fillOpacity={0.2} />
                </RadarChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-4 gap-3 mt-4 text-center">
                {[
                  { label: 'GK', value: strength.gkCount, color: 'text-yellow-400' },
                  { label: 'DEF', value: strength.defCount, color: 'text-blue-400' },
                  { label: 'MID', value: strength.midCount, color: 'text-green-400' },
                  { label: 'FWD', value: strength.fwdCount, color: 'text-red-400' },
                ].map(s => (
                  <div key={s.label} className="p-2 bg-white/3 rounded-lg">
                    <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                    <div className="text-xs text-bayern-text-muted">{s.label}</div>
                  </div>
                ))}
              </div>
            </>
          ) : <div className="h-48 flex items-center justify-center text-sm text-bayern-text-muted">No data available</div>}
        </div>

        {/* Age Curve */}
        <div className="card">
          <h2 className="section-title mb-1">Age Distribution</h2>
          <p className="section-subtitle mb-4">Squad age curve analysis</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={ageCurve} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3E" />
              <XAxis dataKey="age" stroke="#6B7280" tick={{ fontSize: 11 }} />
              <YAxis stroke="#6B7280" tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#1E1E2E', border: '1px solid #2A2A3E', borderRadius: 8 }}
                labelStyle={{ color: '#9CA3AF' }}
                formatter={(v) => [v, 'Players']}
              />
              <Bar dataKey="count" name="Players" radius={[4,4,0,0]}>
                {ageCurve.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.age >= 23 && entry.age <= 29 ? '#DC052D' : '#0066B2'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-center text-bayern-text-muted mt-2">
            <span className="inline-block w-2 h-2 bg-red-600 rounded-full mr-1" />Peak age (23-29)
            <span className="inline-block w-2 h-2 bg-blue-600 rounded-full ml-3 mr-1" />Other
          </p>
        </div>
      </div>

      {/* Row 2: Position Depth + Injury Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Position Depth */}
        <div className="card">
          <h2 className="section-title mb-1">Position Depth</h2>
          <p className="section-subtitle mb-4">Players per position category</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={posData}
                cx="50%" cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={false}
              >
                {posData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1E1E2E', border: '1px solid #2A2A3E', borderRadius: 8 }}
                itemStyle={{ color: '#FFFFFF' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Injury Risk */}
        <div className="card">
          <h2 className="section-title mb-1">Injury Risk Analysis</h2>
          <p className="section-subtitle mb-4">Current injury load assessment</p>
          {injuryRisk ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className={`px-4 py-2 rounded-xl font-bold text-sm ${
                  injuryRisk.riskLevel === 'HIGH' ? 'bg-red-900/40 text-red-400 border border-red-500/30' :
                  injuryRisk.riskLevel === 'MEDIUM' ? 'bg-yellow-900/40 text-yellow-400 border border-yellow-500/30' :
                  'bg-green-900/40 text-green-400 border border-green-500/30'
                }`}>
                  {injuryRisk.riskLevel} RISK
                </div>
                <div>
                  <div className="text-2xl font-black text-white">{injuryRisk.activeInjuries}</div>
                  <div className="text-xs text-bayern-text-muted">Active injuries</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white">{injuryRisk.injuryRate.toFixed(1)}%</div>
                  <div className="text-xs text-bayern-text-muted">Injury rate</div>
                </div>
              </div>
              {injuryRisk.injuriesByType && Object.keys(injuryRisk.injuriesByType).length > 0 && (
                <>
                  <div className="text-xs font-medium text-bayern-text-muted uppercase tracking-wider">By Type</div>
                  {Object.entries(injuryRisk.injuriesByType).map(([type, count]) => (
                    <div key={type} className="flex items-center gap-3">
                      <div className="flex-1 text-sm text-white">{type}</div>
                      <div className="text-sm font-mono text-white">{count}</div>
                      <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-bayern-red to-orange-400 rounded-full"
                          style={{ width: `${Math.min(100, (Number(count) / Math.max(1, injuryRisk.activeInjuries)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          ) : <div className="text-sm text-bayern-text-muted">No injury data available.</div>}
        </div>
      </div>

      {/* Row 3: Financial Health */}
      {financial && (
        <div className="card bg-gradient-to-br from-green-900/10 to-transparent border-green-500/20">
          <h2 className="section-title mb-1">Financial Health</h2>
          <p className="section-subtitle mb-6">Squad valuation and transfer activity</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Squad Market Value', value: formatCurrency(financial.totalSquadMarketValue), color: 'text-green-400' },
              { label: 'Financial Score', value: `${financial.financialHealthScore.toFixed(0)}/100`, color: 'text-blue-400' },
              { label: 'Expiring Contracts', value: financial.expiringContracts.toString(), color: financial.expiringContracts > 3 ? 'text-red-400' : 'text-yellow-400' },
              { label: 'Total Spend', value: formatCurrency(financial.totalTransferSpend ?? 0), color: 'text-orange-400' },
            ].map(item => (
              <div key={item.label} className="p-4 bg-white/3 rounded-xl">
                <div className="text-xs text-bayern-text-muted mb-1">{item.label}</div>
                <div className={`text-xl font-black ${item.color}`}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
