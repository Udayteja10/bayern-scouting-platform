import { SportmonksClient } from './sportmonks';
import { Player, Club, Position, Nationality, PlayerStats, Injury, Transfer } from '../models/index';

export class DataSynchronizer {
  /**
   * Synchronize FC Bayern Munich squad data from Sportmonks to local MySQL
   */
  public static async syncBayernSquad() {
    console.log('Starting Sportmonks sync for FC Bayern Munich...');
    try {
      const response = await SportmonksClient.getSquad(503);
      if (!response || !response.data) {
        console.warn('Sportmonks returned empty squad data.');
        return false;
      }

      // Ensure FC Bayern club exists in DB
      await Club.findOrCreate({
        where: { id: 503 },
        defaults: {
          id: 503,
          name: 'FC Bayern Munich',
          shortCode: 'FCB',
          imagePath: 'https://images.sportmonks.com/images/soccer/teams/23/503.png',
          countryId: 1 // Germany
        }
      });

      let updatedCount = 0;

      for (const squadMember of response.data) {
        const { player } = squadMember;
        if (!player) continue;

        // 1. Sync Nationality if available
        if (player.nationality) {
          await Nationality.findOrCreate({
            where: { id: player.nationality.id },
            defaults: {
              id: player.nationality.id,
              name: player.nationality.name,
              code: player.nationality.code || '',
              imagePath: player.nationality.image_path || `https://flagcdn.com/w80/${(player.nationality.code || 'de').toLowerCase()}.png`
            }
          });
        }

        // 2. Sync Position if available
        if (player.position) {
          await Position.findOrCreate({
            where: { id: player.position.id },
            defaults: {
              id: player.position.id,
              name: player.position.name,
              code: player.position.code || 'CB'
            }
          });
        }

        // 3. Upsert Player
        const existingPlayer = await Player.findByPk(player.id);
        const imagePath = (existingPlayer && existingPlayer.imagePath && (existingPlayer.imagePath.includes('wikipedia') || existingPlayer.imagePath.includes('wikimedia')))
          ? existingPlayer.imagePath
          : (player.image_path || '');
        const contractUntil = player.contract_until || (existingPlayer ? existingPlayer.contractUntil : '2027-06-30');
        const marketValue = player.market_value || (existingPlayer ? existingPlayer.marketValue : 15000000);
        const preferredFoot = (player.preferred_foot || player.foot) || (existingPlayer ? existingPlayer.preferredFoot : 'Right');
        const jerseyNumber = squadMember.number ? String(squadMember.number) : (existingPlayer ? existingPlayer.jerseyNumber : '');

        const [dbPlayer] = await Player.upsert({
          id: player.id,
          name: player.name,
          firstname: player.firstname || '',
          lastname: player.lastname || '',
          displayName: player.display_name || player.name,
          imagePath: imagePath,
          dateOfBirth: player.date_of_birth || '',
          age: player.age || this.calculateAge(player.date_of_birth),
          height: player.height || 180,
          weight: player.weight || 75,
          nationalityId: player.nationality ? player.nationality.id : null,
          positionId: player.position ? player.position.id : null,
          clubId: 503, // Hardcoded as we are syncing Bayern
          marketValue: marketValue,
          contractUntil: contractUntil,
          preferredFoot: preferredFoot,
          jerseyNumber: jerseyNumber,
          status: 'active'
        });

        // 4. Sync player statistics
        await this.syncPlayerStats(player.id);
        updatedCount++;
      }

      console.log(`Sync completed successfully. Synced ${updatedCount} players.`);
      return true;
    } catch (error) {
      console.error('Error during Sportmonks sync:', error);
      return false;
    }
  }

  /**
   * Fetch and sync individual player stats, transfers, and injuries
   */
  public static async syncPlayerStats(playerId: number) {
    try {
      const response = await SportmonksClient.getPlayerStats(playerId);
      if (!response || !response.data) return;

      const playerInfo = response.data;

      // Sync Statistics
      if (playerInfo.statistics && Array.isArray(playerInfo.statistics)) {
        for (const stat of playerInfo.statistics) {
          // Sync season stats
          await PlayerStats.upsert({
            playerId: playerId,
            season: stat.season_id ? String(stat.season_id) : '2025/26',
            appearances: stat.appearances || 0,
            goals: stat.goals || 0,
            assists: stat.assists || 0,
            minutesPlayed: stat.minutes_played || 0,
            yellowCards: stat.yellow_cards || 0,
            redCards: stat.red_cards || 0,
            passAccuracy: stat.pass_accuracy || 85.0,
            tacklesWon: stat.tackles_won || 10,
            shotsOnTarget: stat.shots_on_target || 5,
            rating: stat.rating || 7.0
          });
        }
      }

      // Sync Injuries
      if (playerInfo.injuries && Array.isArray(playerInfo.injuries)) {
        for (const injury of playerInfo.injuries) {
          await Injury.upsert({
            playerId: playerId,
            description: injury.description || 'Injury details',
            status: injury.status || 'recovered',
            startDate: injury.start_date || '2025-01-01',
            endDate: injury.end_date || null
          });
        }
      }

      // Sync Transfers
      if (playerInfo.transfers && Array.isArray(playerInfo.transfers)) {
        for (const tr of playerInfo.transfers) {
          await Transfer.upsert({
            id: tr.id,
            playerId: playerId,
            fromClubId: tr.from_club_id || null,
            toClubId: tr.to_club_id || null,
            date: tr.date || '2025-01-01',
            amount: tr.amount || 0,
            type: tr.type || 'permanent'
          });
        }
      }

    } catch (error) {
      console.error(`Failed to sync stats for player ID ${playerId}:`, error);
    }
  }

  private static calculateAge(dob: string): number {
    if (!dob) return 25;
    const birthDate = new Date(dob);
    const difference = Date.now() - birthDate.getTime();
    const ageDate = new Date(difference);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }
}
export default DataSynchronizer;
