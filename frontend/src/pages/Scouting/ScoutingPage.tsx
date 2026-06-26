import { useEffect, useState } from 'react';
import { getReports, getShortlists, createReport, createShortlist } from '../../api';
import type { ScoutingReport, Shortlist, PageResponse } from '../../types';
import { Plus, Star, FileText, List } from 'lucide-react';
import { formatDate } from '../../utils/format';

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${i < Math.round(value) ? 'bg-yellow-400' : 'bg-white/10'}`}
        />
      ))}
      <span className="ml-1.5 text-xs font-mono text-yellow-400">{Number(value).toFixed(1)}</span>
    </div>
  );
}

const RECOMMENDATION_COLORS: Record<string, string> = {
  STRONGLY_RECOMMEND: 'badge-green',
  RECOMMEND: 'badge-blue',
  NEUTRAL: 'badge-gray',
  NOT_RECOMMEND: 'badge-yellow',
  REJECT: 'badge-red',
};

const RECOMMENDATION_LABELS: Record<string, string> = {
  STRONGLY_RECOMMEND: '★ Strongly Recommend',
  RECOMMEND: 'Recommend',
  NEUTRAL: 'Neutral',
  NOT_RECOMMEND: 'Not Recommend',
  REJECT: 'Reject',
};

export default function ScoutingPage() {
  const [reports, setReports] = useState<PageResponse<ScoutingReport> | null>(null);
  const [shortlists, setShortlists] = useState<Shortlist[]>([]);
  const [tab, setTab] = useState<'reports' | 'shortlists'>('reports');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getReports(), getShortlists()])
      .then(([rRes, sRes]) => {
        setReports(rRes.data);
        setShortlists(sRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Scouting</h1>
          <p className="text-bayern-text-secondary mt-1">Reports, shortlists, and transfer targets</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-bayern-border">
        {[
          { id: 'reports' as const, label: 'Scouting Reports', icon: FileText, count: reports?.totalElements },
          { id: 'shortlists' as const, label: 'Shortlists', icon: List, count: shortlists.length },
        ].map(tab_ => (
          <button
            key={tab_.id}
            onClick={() => setTab(tab_.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all ${
              tab === tab_.id
                ? 'border-bayern-red text-white'
                : 'border-transparent text-bayern-text-secondary hover:text-white'
            }`}
          >
            <tab_.icon size={15} />
            {tab_.label}
            {tab_.count !== undefined && (
              <span className={`badge ${tab === tab_.id ? 'badge-red' : 'badge-gray'} ml-1`}>
                {tab_.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-bayern-red border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tab === 'reports' ? (
        <div className="space-y-3">
          {reports?.content.length === 0 ? (
            <div className="card text-center py-16">
              <Star size={48} className="mx-auto mb-4 text-white/20" />
              <h3 className="text-lg font-semibold text-white mb-2">No Scouting Reports</h3>
              <p className="text-sm text-bayern-text-secondary">Reports created by scouts will appear here.</p>
            </div>
          ) : (
            reports?.content.map(report => (
              <div key={report.id} className="card hover:border-bayern-red/30 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {report.playerPhoto ? (
                    <img
                      src={report.playerPhoto}
                      alt={report.playerName}
                      className="w-14 h-14 rounded-xl object-cover border border-white/10 flex-shrink-0"
                      onError={e => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(report.playerName)}&background=DC052D&color=fff&size=56`;
                      }}
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-white/10 flex-shrink-0 flex items-center justify-center font-bold text-white text-lg">
                      {report.playerName.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-bold text-white">{report.playerName}</h3>
                      <span className="badge badge-blue">{report.playerPosition}</span>
                      {report.recommendation && (
                        <span className={`badge ${RECOMMENDATION_COLORS[report.recommendation]}`}>
                          {RECOMMENDATION_LABELS[report.recommendation]}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-bayern-text-muted mb-3">
                      By {report.createdByName} · {formatDate(report.createdAt)}
                      {report.matchObserved && ` · ${report.matchObserved}`}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: 'Technical', value: report.technicalRating },
                        { label: 'Physical', value: report.physicalRating },
                        { label: 'Mental', value: report.mentalRating },
                        { label: 'Tactical', value: report.tacticalRating },
                      ].map(r => (
                        <div key={r.label}>
                          <div className="text-xs text-bayern-text-muted mb-1">{r.label}</div>
                          <StarRating value={r.value} />
                        </div>
                      ))}
                    </div>
                    {report.notes && (
                      <p className="text-xs text-bayern-text-secondary mt-3 line-clamp-2">{report.notes}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs text-bayern-text-muted mb-1">Overall</div>
                    <div className="text-2xl font-black text-gradient">{Number(report.overallRating).toFixed(1)}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shortlists.length === 0 ? (
            <div className="col-span-3 card text-center py-16">
              <List size={48} className="mx-auto mb-4 text-white/20" />
              <h3 className="text-lg font-semibold text-white mb-2">No Shortlists</h3>
              <p className="text-sm text-bayern-text-secondary">Create shortlists to track transfer targets.</p>
            </div>
          ) : shortlists.map(sl => (
            <div key={sl.id} className="card hover:border-blue-500/30 transition-all">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-white">{sl.name}</h3>
                {sl.category && <span className="badge badge-blue">{sl.category}</span>}
              </div>
              {sl.description && (
                <p className="text-xs text-bayern-text-muted mb-3 line-clamp-2">{sl.description}</p>
              )}
              <div className="flex items-center justify-between mt-auto">
                <span className="text-xs text-bayern-text-secondary">
                  {sl.playerCount} players · {sl.createdByName}
                </span>
                <span className="text-xs text-bayern-text-muted">{formatDate(sl.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
