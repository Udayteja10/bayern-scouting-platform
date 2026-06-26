import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db';

// ==========================================
// 1. USER MODEL
// ==========================================
export interface UserAttributes {
  id?: number;
  email: string;
  passwordHash: string;
  fullName: string;
  role: 'CLUB_OWNER' | 'SPORTING_DIRECTOR' | 'RECRUITMENT_ANALYST' | 'FINANCE_MANAGER';
}
export class User extends Model<UserAttributes> implements UserAttributes {
  public id!: number;
  public email!: string;
  public passwordHash!: string;
  public fullName!: string;
  public role!: 'CLUB_OWNER' | 'SPORTING_DIRECTOR' | 'RECRUITMENT_ANALYST' | 'FINANCE_MANAGER';
}
User.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  fullName: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, defaultValue: 'RECRUITMENT_ANALYST' },
}, { sequelize, modelName: 'user', timestamps: true });

// ==========================================
// 2. POSITION MODEL
// ==========================================
export interface PositionAttributes {
  id: number;
  name: string;
  code: string;
}
export class Position extends Model<PositionAttributes> implements PositionAttributes {
  public id!: number;
  public name!: string;
  public code!: string;
}
Position.init({
  id: { type: DataTypes.INTEGER, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  code: { type: DataTypes.STRING, allowNull: false },
}, { sequelize, modelName: 'position', timestamps: false });

// ==========================================
// 3. NATIONALITY MODEL
// ==========================================
export interface NationalityAttributes {
  id: number;
  name: string;
  code: string;
  imagePath: string;
}
export class Nationality extends Model<NationalityAttributes> implements NationalityAttributes {
  public id!: number;
  public name!: string;
  public code!: string;
  public imagePath!: string;
}
Nationality.init({
  id: { type: DataTypes.INTEGER, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  code: { type: DataTypes.STRING, allowNull: true },
  imagePath: { type: DataTypes.STRING(1000), allowNull: true },
}, { sequelize, modelName: 'nationality', timestamps: false });

// ==========================================
// 4. CLUB MODEL
// ==========================================
export interface ClubAttributes {
  id: number;
  name: string;
  shortCode: string;
  imagePath: string;
  countryId: number;
}
export class Club extends Model<ClubAttributes> implements ClubAttributes {
  public id!: number;
  public name!: string;
  public shortCode!: string;
  public imagePath!: string;
  public countryId!: number;
}
Club.init({
  id: { type: DataTypes.INTEGER, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  shortCode: { type: DataTypes.STRING, allowNull: true },
  imagePath: { type: DataTypes.STRING(1000), allowNull: true },
  countryId: { type: DataTypes.INTEGER, allowNull: false },
}, { sequelize, modelName: 'club', timestamps: false });

// ==========================================
// 5. PLAYER MODEL
// ==========================================
export interface PlayerAttributes {
  id: number;
  sportmonksId?: number;
  name: string;
  firstname: string;
  lastname: string;
  displayName: string;
  imagePath: string;
  dateOfBirth: string;
  age: number;
  height: number; // in cm
  weight: number; // in kg
  nationalityId: number;
  positionId: number;
  clubId: number;
  marketValue: number; // in EUR
  contractUntil: string;
  preferredFoot?: string;
  jerseyNumber?: string;
  status: string; // active, injured, suspended, etc.
  birthCountry?: string;
  secondNationality?: string;
}
export class Player extends Model<PlayerAttributes> implements PlayerAttributes {
  public id!: number;
  public sportmonksId?: number;
  public name!: string;
  public firstname!: string;
  public lastname!: string;
  public displayName!: string;
  public imagePath!: string;
  public dateOfBirth!: string;
  public age!: number;
  public height!: number;
  public weight!: number;
  public nationalityId!: number;
  public positionId!: number;
  public clubId!: number;
  public marketValue!: number;
  public contractUntil!: string;
  public preferredFoot?: string;
  public jerseyNumber?: string;
  public status!: string;
  public birthCountry?: string;
  public secondNationality?: string;
}
Player.init({
  id: { type: DataTypes.INTEGER, primaryKey: true },
  sportmonksId: { type: DataTypes.INTEGER, allowNull: true },
  name: { type: DataTypes.STRING, allowNull: false },
  firstname: { type: DataTypes.STRING, allowNull: true },
  lastname: { type: DataTypes.STRING, allowNull: true },
  displayName: { type: DataTypes.STRING, allowNull: false },
  imagePath: { type: DataTypes.STRING(1000), allowNull: true },
  dateOfBirth: { type: DataTypes.STRING, allowNull: true },
  age: { type: DataTypes.INTEGER, allowNull: true },
  height: { type: DataTypes.INTEGER, allowNull: true },
  weight: { type: DataTypes.INTEGER, allowNull: true },
  nationalityId: { type: DataTypes.INTEGER, allowNull: true },
  positionId: { type: DataTypes.INTEGER, allowNull: true },
  clubId: { type: DataTypes.INTEGER, allowNull: true },
  marketValue: { type: DataTypes.BIGINT, defaultValue: 0 },
  contractUntil: { type: DataTypes.STRING, allowNull: true },
  preferredFoot: { type: DataTypes.STRING, defaultValue: 'Right' },
  jerseyNumber: { type: DataTypes.STRING, defaultValue: '' },
  status: { type: DataTypes.STRING, defaultValue: 'active' },
  birthCountry: { type: DataTypes.STRING, allowNull: true },
  secondNationality: { type: DataTypes.STRING, allowNull: true },
}, { sequelize, modelName: 'player', timestamps: true });

// ==========================================
// 6. PLAYER STATISTICS MODEL
// ==========================================
export interface PlayerStatsAttributes {
  id?: number;
  playerId: number;
  season: string;
  appearances: number;
  goals: number;
  assists: number;
  minutesPlayed: number;
  yellowCards: number;
  redCards: number;
  passAccuracy: number; // percentage
  tacklesWon: number;
  shotsOnTarget: number;
  rating: number; // match rating e.g. 7.2
  saves?: number;
  cleanSheets?: number;
}
export class PlayerStats extends Model<PlayerStatsAttributes> implements PlayerStatsAttributes {
  public id!: number;
  public playerId!: number;
  public season!: string;
  public appearances!: number;
  public goals!: number;
  public assists!: number;
  public minutesPlayed!: number;
  public yellowCards!: number;
  public redCards!: number;
  public passAccuracy!: number;
  public tacklesWon!: number;
  public shotsOnTarget!: number;
  public rating!: number;
  public saves!: number;
  public cleanSheets!: number;
}
PlayerStats.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  playerId: { type: DataTypes.INTEGER, allowNull: false },
  season: { type: DataTypes.STRING, allowNull: false },
  appearances: { type: DataTypes.INTEGER, defaultValue: 0 },
  goals: { type: DataTypes.INTEGER, defaultValue: 0 },
  assists: { type: DataTypes.INTEGER, defaultValue: 0 },
  minutesPlayed: { type: DataTypes.INTEGER, defaultValue: 0 },
  yellowCards: { type: DataTypes.INTEGER, defaultValue: 0 },
  redCards: { type: DataTypes.INTEGER, defaultValue: 0 },
  passAccuracy: { type: DataTypes.FLOAT, defaultValue: 0 },
  tacklesWon: { type: DataTypes.INTEGER, defaultValue: 0 },
  shotsOnTarget: { type: DataTypes.INTEGER, defaultValue: 0 },
  rating: { type: DataTypes.FLOAT, defaultValue: 0 },
  saves: { type: DataTypes.INTEGER, defaultValue: 0 },
  cleanSheets: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { sequelize, modelName: 'player_stats', timestamps: false });

// ==========================================
// 7. INJURY MODEL
// ==========================================
export interface InjuryAttributes {
  id?: number;
  playerId: number;
  description: string;
  status: 'ACTIVE' | 'RECOVERED' | 'UNKNOWN';
  startDate: string;
  endDate: string;
}
export class Injury extends Model<InjuryAttributes> implements InjuryAttributes {
  public id!: number;
  public playerId!: number;
  public description!: string;
  public status!: 'ACTIVE' | 'RECOVERED' | 'UNKNOWN';
  public startDate!: string;
  public endDate!: string;
}
Injury.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  playerId: { type: DataTypes.INTEGER, allowNull: false },
  description: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'ACTIVE' },
  startDate: { type: DataTypes.STRING, allowNull: false },
  endDate: { type: DataTypes.STRING, allowNull: true },
}, { sequelize, modelName: 'injury', timestamps: false });

// ==========================================
// 8. TRANSFER MODEL
// ==========================================
export interface TransferAttributes {
  id: number;
  playerId: number;
  fromClubId?: number;
  toClubId?: number;
  fromClubName?: string;
  toClubName?: string;
  date: string;
  amount: number;
  type: 'PERMANENT' | 'LOAN' | 'FREE' | 'RETURN_FROM_LOAN';
  status: 'COMPLETED' | 'RUMOUR' | 'NEGOTIATING' | 'FAILED';
}
export class Transfer extends Model<TransferAttributes> implements TransferAttributes {
  public id!: number;
  public playerId!: number;
  public fromClubId!: number;
  public toClubId!: number;
  public fromClubName!: string;
  public toClubName!: string;
  public date!: string;
  public amount!: number;
  public type!: 'PERMANENT' | 'LOAN' | 'FREE' | 'RETURN_FROM_LOAN';
  public status!: 'COMPLETED' | 'RUMOUR' | 'NEGOTIATING' | 'FAILED';
}
Transfer.init({
  id: { type: DataTypes.INTEGER, primaryKey: true },
  playerId: { type: DataTypes.INTEGER, allowNull: false },
  fromClubId: { type: DataTypes.INTEGER, allowNull: true },
  toClubId: { type: DataTypes.INTEGER, allowNull: true },
  fromClubName: { type: DataTypes.STRING, defaultValue: 'Unknown' },
  toClubName: { type: DataTypes.STRING, defaultValue: 'Unknown' },
  date: { type: DataTypes.STRING, allowNull: false },
  amount: { type: DataTypes.BIGINT, defaultValue: 0 },
  type: { type: DataTypes.STRING, defaultValue: 'PERMANENT' },
  status: { type: DataTypes.STRING, defaultValue: 'COMPLETED' },
}, { sequelize, modelName: 'transfer', timestamps: false });

// ==========================================
// 9. SHORTLIST MODEL
// ==========================================
export interface ShortlistAttributes {
  id?: number;
  name: string;
  description?: string;
  category?: string;
  createdByName: string;
}
export class Shortlist extends Model<ShortlistAttributes> implements ShortlistAttributes {
  public id!: number;
  public name!: string;
  public description!: string;
  public category!: string;
  public createdByName!: string;
}
Shortlist.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING, defaultValue: '' },
  category: { type: DataTypes.STRING, defaultValue: 'General' },
  createdByName: { type: DataTypes.STRING, defaultValue: 'Admin' },
}, { sequelize, modelName: 'shortlist', timestamps: true });

// ==========================================
// 10. SHORTLIST_PLAYERS JOIN TABLE
// ==========================================
export class ShortlistPlayer extends Model {}
ShortlistPlayer.init({}, { sequelize, modelName: 'shortlist_player', timestamps: false });

// ==========================================
// 11. SCOUTING REPORT MODEL
// ==========================================
export interface ScoutingReportAttributes {
  id?: number;
  playerId: number;
  createdById: number;
  createdByName: string;
  technicalRating: number; // 1 to 10
  physicalRating: number;  // 1 to 10
  mentalRating: number;    // 1 to 10
  tacticalRating: number;   // 1 to 10
  overallRating: number;   // 1 to 10
  strengths?: string;
  weaknesses?: string;
  notes?: string;
  recommendation?: string;
  matchObserved?: string;
  observationDate?: string;
}
export class ScoutingReport extends Model<ScoutingReportAttributes> implements ScoutingReportAttributes {
  public id!: number;
  public playerId!: number;
  public createdById!: number;
  public createdByName!: string;
  public technicalRating!: number;
  public physicalRating!: number;
  public mentalRating!: number;
  public tacticalRating!: number;
  public overallRating!: number;
  public strengths!: string;
  public weaknesses!: string;
  public notes!: string;
  public recommendation!: string;
  public matchObserved!: string;
  public observationDate!: string;
}
ScoutingReport.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  playerId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  createdById: { type: DataTypes.INTEGER, defaultValue: 1 },
  createdByName: { type: DataTypes.STRING, defaultValue: 'Scouting Team' },
  technicalRating: { type: DataTypes.INTEGER, defaultValue: 7 },
  physicalRating: { type: DataTypes.INTEGER, defaultValue: 7 },
  mentalRating: { type: DataTypes.INTEGER, defaultValue: 7 },
  tacticalRating: { type: DataTypes.INTEGER, defaultValue: 7 },
  overallRating: { type: DataTypes.INTEGER, defaultValue: 7 },
  strengths: { type: DataTypes.STRING, defaultValue: '' },
  weaknesses: { type: DataTypes.STRING, defaultValue: '' },
  notes: { type: DataTypes.TEXT, allowNull: true },
  recommendation: { type: DataTypes.STRING, defaultValue: 'Monitor' },
  matchObserved: { type: DataTypes.STRING, defaultValue: 'General Observation' },
  observationDate: { type: DataTypes.STRING, defaultValue: '' },
}, { sequelize, modelName: 'scouting_report', timestamps: true });

// ==========================================
// 12. SYNC LOG MODEL
// ==========================================
export interface SyncLogAttributes {
  id?: number;
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
export class SyncLog extends Model<SyncLogAttributes> implements SyncLogAttributes {
  public id!: number;
  public syncType!: string;
  public status!: 'RUNNING' | 'SUCCESS' | 'PARTIAL' | 'FAILED';
  public recordsSynced!: number;
  public recordsFailed!: number;
  public errorMessage!: string;
  public startedAt!: string;
  public completedAt!: string;
  public triggeredBy!: string;
  public durationSeconds!: number;
}
SyncLog.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  syncType: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'RUNNING' },
  recordsSynced: { type: DataTypes.INTEGER, defaultValue: 0 },
  recordsFailed: { type: DataTypes.INTEGER, defaultValue: 0 },
  errorMessage: { type: DataTypes.STRING, allowNull: true },
  startedAt: { type: DataTypes.STRING, allowNull: false },
  completedAt: { type: DataTypes.STRING, allowNull: true },
  triggeredBy: { type: DataTypes.STRING, defaultValue: 'System' },
  durationSeconds: { type: DataTypes.INTEGER, allowNull: true },
}, { sequelize, modelName: 'sync_log', timestamps: false });

// ==========================================
// DEFINING RELATIONSHIPS & ASSOCIATIONS
// ==========================================

// Player <-> Club
Player.belongsTo(Club, { foreignKey: 'clubId', as: 'club' });
Club.hasMany(Player, { foreignKey: 'clubId', as: 'players' });

// Player <-> Position
Player.belongsTo(Position, { foreignKey: 'positionId', as: 'position' });
Position.hasMany(Player, { foreignKey: 'positionId', as: 'players' });

// Player <-> Nationality
Player.belongsTo(Nationality, { foreignKey: 'nationalityId', as: 'nationality' });
Nationality.hasMany(Player, { foreignKey: 'nationalityId', as: 'players' });

// Player <-> PlayerStats
Player.hasMany(PlayerStats, { foreignKey: 'playerId', as: 'statistics' });
PlayerStats.belongsTo(Player, { foreignKey: 'playerId', as: 'player' });

// Player <-> Injuries
Player.hasMany(Injury, { foreignKey: 'playerId', as: 'injuries' });
Injury.belongsTo(Player, { foreignKey: 'playerId', as: 'player' });

// Player <-> Transfers
Player.hasMany(Transfer, { foreignKey: 'playerId', as: 'transfers' });
Transfer.belongsTo(Player, { foreignKey: 'playerId', as: 'player' });

// Transfers <-> Clubs (for details on from and to clubs)
Transfer.belongsTo(Club, { foreignKey: 'fromClubId', as: 'fromClub' });
Transfer.belongsTo(Club, { foreignKey: 'toClubId', as: 'toClub' });

// Player <-> Shortlist (Many-to-Many)
Player.belongsToMany(Shortlist, { through: ShortlistPlayer, as: 'shortlists' });
Shortlist.belongsToMany(Player, { through: ShortlistPlayer, as: 'players' });

// Player <-> ScoutingReport (One-to-One)
Player.hasOne(ScoutingReport, { foreignKey: 'playerId', as: 'scoutingReport' });
ScoutingReport.belongsTo(Player, { foreignKey: 'playerId', as: 'player' });

export {
  sequelize
};
