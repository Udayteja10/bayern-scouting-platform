import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'https://api.sportmonks.com/v3/football';
const API_TOKEN = process.env.SPORTMONKS_API_TOKEN || '';

export class SportmonksClient {
  private static isMockMode(): boolean {
    return !API_TOKEN || API_TOKEN.trim() === '';
  }

  /**
   * Helper to make rate-limited requests to Sportmonks
   */
  private static async request(endpoint: string, params: Record<string, string> = {}) {
    if (this.isMockMode()) {
      console.log(`[Sportmonks Mock Mode] Intercepted request to ${endpoint}`);
      return this.getMockResponse(endpoint, params);
    }

    try {
      // Sportmonks rate limits: usually 150 requests per minute.
      // Implement a slight delay to respect rate limit guidelines if multiple calls happen.
      await new Promise(resolve => setTimeout(resolve, 300));

      const response = await axios.get(`${BASE_URL}${endpoint}`, {
        params: {
          api_token: API_TOKEN,
          ...params
        }
      });
      return response.data;
    } catch (error: any) {
      console.error(`Sportmonks API error for ${endpoint}:`, error.message);
      throw error;
    }
  }

  /**
   * Fetches the squad for a team (domestic squad)
   */
  public static async getSquad(teamId: number) {
    // Current squad for team
    const endpoint = `/squads/teams/${teamId}`;
    return this.request(endpoint, { include: 'player.position,player.nationality' });
  }

  /**
   * Fetches player details and statistics
   */
  public static async getPlayerStats(playerId: number) {
    const endpoint = `/players/${playerId}`;
    return this.request(endpoint, { include: 'statistics,transfers,injuries' });
  }

  /**
   * Fetches data for top leagues (e.g. Bundesliga 82, PL 8, La Liga 564, Serie A 384, Ligue 1 301)
   */
  public static async getLeagueTeams(leagueId: number) {
    const endpoint = `/teams/countries/${leagueId === 82 ? 1 : 2}`; // simplified
    // In real app, you fetch /teams or /seasons/{season_id}/teams
    return this.request(endpoint);
  }

  /**
   * Mock responses mapping Sportmonks API structures for FC Bayern (team ID 503) and rivals
   */
  private static getMockResponse(endpoint: string, params: Record<string, string>) {
    // Return mock data according to Sportmonks structure
    if (endpoint.startsWith('/squads/teams/503')) {
      return {
        data: [
          {
            player_id: 132098,
            team_id: 503,
            number: 9,
            player: {
              id: 132098,
              name: 'Harry Kane',
              firstname: 'Harry',
              lastname: 'Kane',
              display_name: 'H. Kane',
              image_path: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Harry_Kane_on_October_10%2C_2023.jpg/250px-Harry_Kane_on_October_10%2C_2023.jpg',
              date_of_birth: '1993-07-28',
              height: 188,
              weight: 86,
              nationality: { id: 2, name: 'England', code: 'GB-ENG' },
              position: { id: 10, name: 'Center Forward', code: 'CF' }
            }
          },
          {
            player_id: 580195,
            team_id: 503,
            number: 42,
            player: {
              id: 580195,
              name: 'Jamal Musiala',
              firstname: 'Jamal',
              lastname: 'Musiala',
              display_name: 'J. Musiala',
              image_path: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Jamal_Musiala_2022_%28cropped%29.jpg/250px-Jamal_Musiala_2022_%28cropped%29.jpg',
              date_of_birth: '2003-02-26',
              height: 184,
              weight: 72,
              nationality: { id: 1, name: 'Germany', code: 'DE' },
              position: { id: 7, name: 'Attacking Midfielder', code: 'AM' }
            }
          },
          {
            player_id: 161056,
            team_id: 503,
            number: 6,
            player: {
              id: 161056,
              name: 'Joshua Kimmich',
              firstname: 'Joshua',
              lastname: 'Kimmich',
              display_name: 'J. Kimmich',
              image_path: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Joshua_Kimmich_Training_2018-05-08_FC_Bayern_Muenchen-1.jpg/250px-Joshua_Kimmich_Training_2018-05-08_FC_Bayern_Muenchen-1.jpg',
              date_of_birth: '1995-02-08',
              height: 177,
              weight: 75,
              nationality: { id: 1, name: 'Germany', code: 'DE' },
              position: { id: 6, name: 'Central Midfielder', code: 'CM' }
            }
          }
        ]
      };
    }

    if (endpoint.startsWith('/players/')) {
      const match = endpoint.match(/\/players\/(\d+)/);
      const reqPlayerId = match ? Number(match[1]) : 0;
      
      let name = 'Joshua Kimmich';
      let apps = 33, goals = 4, assists = 9, minutes = 2850, rating = 7.62;
      
      if (reqPlayerId === 132098) {
        name = 'Harry Kane';
        apps = 34; goals = 36; assists = 10; minutes = 2980; rating = 8.12;
      } else if (reqPlayerId === 580195) {
        name = 'Jamal Musiala';
        apps = 32; goals = 14; assists = 12; minutes = 2600; rating = 7.85;
      }

      return {
        data: {
          id: reqPlayerId,
          name: name,
          statistics: [
            {
              season_id: 2026,
              appearances: apps,
              goals: goals,
              assists: assists,
              minutes_played: minutes,
              yellow_cards: reqPlayerId === 132098 ? 2 : (reqPlayerId === 580195 ? 1 : 4),
              red_cards: 0,
              pass_accuracy: reqPlayerId === 161056 ? 89.5 : 82.0,
              tackles_won: reqPlayerId === 161056 ? 48 : 12,
              shots_on_target: reqPlayerId === 132098 ? 78 : 34,
              rating: rating
            }
          ],
          transfers: reqPlayerId === 132098 ? [
            {
              id: 9001,
              from_club_id: 116,
              to_club_id: 503,
              date: '2024-07-11',
              amount: 110000000,
              type: 'permanent'
            }
          ] : [],
          injuries: []
        }
      };
    }

    // Default empty array
    return { data: [] };
  }
}
export default SportmonksClient;
