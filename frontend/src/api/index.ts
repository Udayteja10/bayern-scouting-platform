import api from './axios';
import type {
  AuthResponse, DashboardSummary, Player, PlayerDetail, PageResponse,
  SquadMember, ScoutingReport, Shortlist, Transfer, SyncLog,
  SquadStrength, AgeCurvePoint, InjuryRisk, FinancialHealth
} from '../types';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const login = (email: string, password: string) =>
  api.post<AuthResponse>('/auth/login', { email, password });

export const register = (data: { email: string; password: string; fullName: string; role: string }) =>
  api.post<AuthResponse>('/auth/register', data);

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const getDashboardSummary = () =>
  api.get<DashboardSummary>('/dashboard/summary');

// ─── Squad ────────────────────────────────────────────────────────────────────
export const getSquad = () =>
  api.get<SquadMember[]>('/squad');

export const getDepthChart = () =>
  api.get<Record<string, SquadMember[]>>('/squad/depth-chart');

// ─── Players ──────────────────────────────────────────────────────────────────
export const searchPlayers = (params: {
  name?: string; position?: string; nationality?: string;
  clubId?: number; page?: number; size?: number;
}) => api.get<PageResponse<Player>>('/players', { params });

export const getPlayer = (id: number) =>
  api.get<PlayerDetail>(`/players/${id}`);

// ─── Scouting ─────────────────────────────────────────────────────────────────
export const getReports = (page = 0, size = 20) =>
  api.get<PageResponse<ScoutingReport>>('/scouting/reports', { params: { page, size } });

export const getReport = (id: number) =>
  api.get<ScoutingReport>(`/scouting/reports/${id}`);

export const createReport = (data: Partial<ScoutingReport>) =>
  api.post<ScoutingReport>('/scouting/reports', data);

export const deleteReport = (id: number) =>
  api.delete(`/scouting/reports/${id}`);

export const getShortlists = () =>
  api.get<Shortlist[]>('/scouting/shortlists');

export const createShortlist = (data: Partial<Shortlist>) =>
  api.post<Shortlist>('/scouting/shortlists', data);

export const addToShortlist = (shortlistId: number, playerId: number) =>
  api.post<Shortlist>(`/scouting/shortlists/${shortlistId}/players/${playerId}`);

export const removeFromShortlist = (shortlistId: number, playerId: number) =>
  api.delete<Shortlist>(`/scouting/shortlists/${shortlistId}/players/${playerId}`);

// ─── Transfers ────────────────────────────────────────────────────────────────
export const getTransfers = (page = 0, size = 20) =>
  api.get<PageResponse<Transfer>>('/transfers', { params: { page, size } });

// ─── Analytics ────────────────────────────────────────────────────────────────
export const getSquadStrength = () =>
  api.get<SquadStrength>('/analytics/squad-strength');

export const getAgeCurve = () =>
  api.get<AgeCurvePoint[]>('/analytics/age-curve');

export const getPositionDepth = () =>
  api.get<Record<string, number>>('/analytics/position-depth');

export const getInjuryRisk = () =>
  api.get<InjuryRisk>('/analytics/injury-risk');

export const getFinancialHealth = () =>
  api.get<FinancialHealth>('/analytics/financial-health');

export const getTransferOpportunities = () =>
  api.get<Record<string, unknown>>('/analytics/transfer-opportunities');

// ─── Sync ─────────────────────────────────────────────────────────────────────
export const triggerSync = (type: string) =>
  api.post<SyncLog>('/sync/trigger', { type });

export const getSyncLogs = (page = 0, size = 20) =>
  api.get<PageResponse<SyncLog>>('/sync/logs', { params: { page, size } });
