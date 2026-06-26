export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userId: number;
  email: string;
  fullName: string;
  role: Role;
  expiresIn: number;
}

export type Role = 'CLUB_OWNER' | 'SPORTING_DIRECTOR' | 'RECRUITMENT_ANALYST' | 'FINANCE_MANAGER';

export interface User {
  userId: number;
  email: string;
  fullName: string;
  role: Role;
}

export interface Player {
  id: number;
  sportmonksId?: number;
  name: string;
  position: string;
  detailedPosition?: string;
  nationality?: string;
  birthDate?: string;
  age?: number;
  height?: number;
  weight?: number;
  preferredFoot?: string;
  jerseyNumber?: string;
  photoUrl?: string;
  marketValue?: number;
  contractExpiry?: string;
  currentClubName?: string;
  currentClubId?: number;
  averageRating?: number;
}

export interface PlayerDetail extends Player {
  firstName?: string;
  lastName?: string;
  secondNationality?: string;
  birthCountry?: string;
  birthCity?: string;
  contractValue?: number;
  statistics: PlayerStatistics[];
  injuries: Injury[];
  transfers: Transfer[];
}

export interface PlayerStatistics {
  id: number;
  seasonName: string;
  appearances?: number;
  minutesPlayed?: number;
  goals?: number;
  assists?: number;
  yellowCards?: number;
  redCards?: number;
  passAccuracy?: number;
  averageRating?: number;
  saves?: number;
  cleanSheets?: number;
}

export interface Injury {
  id: number;
  playerId: number;
  playerName: string;
  type: string;
  bodyPart?: string;
  severity?: 'MINOR' | 'MODERATE' | 'MAJOR' | 'CRITICAL';
  startDate?: string;
  expectedReturn?: string;
  status: 'ACTIVE' | 'RECOVERED' | 'UNKNOWN';
  description?: string;
}

export interface Transfer {
  id: number;
  playerId: number;
  playerName: string;
  playerPhotoUrl?: string;
  fromClubName: string;
  toClubName: string;
  fee?: number;
  type: 'PERMANENT' | 'LOAN' | 'FREE' | 'RETURN_FROM_LOAN';
  status: 'COMPLETED' | 'RUMOUR' | 'NEGOTIATING' | 'FAILED';
  transferDate?: string;
  position?: string;
}

export interface SquadMember {
  id: number;
  playerId: number;
  playerName: string;
  photoUrl?: string;
  position: string;
  detailedPosition?: string;
  positionCategory: 'GK' | 'DEF' | 'MID' | 'FWD';
  jerseyNumber?: string;
  nationality?: string;
  age?: number;
  preferredFoot?: string;
  averageRating?: number;
  injured: boolean;
  teamName?: string;
}

export interface ScoutingReport {
  id: number;
  playerId: number;
  playerName: string;
  playerPhoto?: string;
  playerPosition?: string;
  createdById: number;
  createdByName: string;
  technicalRating: number;
  physicalRating: number;
  mentalRating: number;
  tacticalRating: number;
  overallRating: number;
  strengths?: string;
  weaknesses?: string;
  notes?: string;
  recommendation?: string;
  matchObserved?: string;
  observationDate?: string;
  createdAt: string;
}

export interface Shortlist {
  id: number;
  name: string;
  description?: string;
  category?: string;
  createdByName: string;
  playerCount: number;
  createdAt: string;
}

export interface SyncLog {
  id: number;
  syncType: string;
  status: 'RUNNING' | 'SUCCESS' | 'PARTIAL' | 'FAILED';
  recordsSynced?: number;
  recordsFailed?: number;
  errorMessage?: string;
  startedAt: string;
  completedAt?: string;
  triggeredBy?: string;
  durationSeconds?: number;
}

export interface DashboardSummary {
  squadSize: number;
  activeInjuries: number;
  activeTransferRumours: number;
  shortlistCount: number;
  scoutingReports: number;
  squadAverageAge?: number;
  squadAverageRating?: number;
  recentAlerts: DashboardAlert[];
  syncStatus: SyncStatus;
}

export interface DashboardAlert {
  type: 'INJURY' | 'CONTRACT_EXPIRY' | 'TRANSFER';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
  playerName?: string;
  playerPhoto?: string;
}

export interface SyncStatus {
  lastSquadSync: string;
  lastInjurySync: string;
  lastTransferSync: string;
  overallStatus: 'HEALTHY' | 'NEEDS_SYNC';
}

export interface SquadStrength {
  overallScore: number;
  depthScore: number;
  ageBalanceScore: number;
  squadSize: number;
  gkCount: number;
  defCount: number;
  midCount: number;
  fwdCount: number;
}

export interface AgeCurvePoint {
  age: number;
  count: number;
}

export interface InjuryRisk {
  activeInjuries: number;
  injuryRate: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  injuriesByType: Record<string, number>;
}

export interface FinancialHealth {
  totalSquadMarketValue: number;
  expiringContracts: number;
  totalTransferSpend: number;
  transfersIn: number;
  transfersOut: number;
  financialHealthScore: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
