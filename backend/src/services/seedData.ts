import { sequelize, User, Position, Nationality, Club, Player, PlayerStats, Injury, Transfer, Shortlist, ScoutingReport } from '../models/index';
import { connectDB } from '../config/db';
import fs from 'fs';
import path from 'path';

const mapClubId = (dbId: number): number => {
  if (dbId === 98) return 503; // FC Bayern Munich
  if (dbId === 99) return 505; // Bayer Leverkusen
  if (dbId === 100) return 504; // Borussia Dortmund
  if (dbId === 101) return 506; // RB Leipzig
  if (dbId === 116) return 3; // Liverpool
  if (dbId === 119) return 1; // Man City
  if (dbId === 120) return 2; // Arsenal
  if (dbId === 136) return 136; // Real Madrid CF (Keep original 136)
  if (dbId === 137) return 137; // FC Barcelona (Keep original 137)
  if (dbId === 157) return 201; // Inter Milan
  if (dbId === 176) return 301; // PSG
  return dbId;
};

const mapPositionId = (posName: string): number => {
  const name = (posName || '').toLowerCase();
  if (name.includes('goalkeeper')) return 1;
  if (name.includes('centre-back') || name.includes('center back')) return 2;
  if (name.includes('left-back') || name.includes('left back')) return 3;
  if (name.includes('right-back') || name.includes('right back')) return 4;
  if (name.includes('defensive midfield')) return 5;
  if (name.includes('central midfield')) return 6;
  if (name.includes('attacking midfield')) return 7;
  if (name.includes('left winger') || name.includes('left wing')) return 8;
  if (name.includes('right winger') || name.includes('right wing')) return 9;
  return 10; // CF / Centre-Forward / Striker / Second Striker fallback
};

const natCache = new Map<string, number>();
natCache.set('Germany', 1);
natCache.set('England', 2);
natCache.set('France', 3);
natCache.set('Portugal', 4);
natCache.set('Canada', 5);
natCache.set('Korea, South', 6);
natCache.set('Austria', 7);
natCache.set('Croatia', 8);
natCache.set('Morocco', 9);
natCache.set('Netherlands', 10);
natCache.set('Norway', 11);
natCache.set('Spain', 12);
natCache.set('Argentina', 13);
natCache.set('Belgium', 14);
natCache.set('Japan', 15);
natCache.set('Israel', 16);

const resolveNationalityId = async (name: string): Promise<number> => {
  if (!name) return 1; // Default Germany
  if (natCache.has(name)) return natCache.get(name)!;

  const nextId = natCache.size + 1;
  const code = name.substring(0, 2).toUpperCase();
  try {
    await Nationality.create({
      id: nextId,
      name,
      code,
      imagePath: `https://flagcdn.com/w80/${code.toLowerCase()}.png`
    });
    natCache.set(name, nextId);
    return nextId;
  } catch {
    return 1; // fallback on unique constraint or collision
  }
};

export const seedDatabase = async (force: boolean = false) => {
  try {
    console.log('Seeding Database... (force=' + force + ')');
    await sequelize.sync({ force });

    // 1. Seed base Position records
    const positions = [
      { id: 1, name: 'Goalkeeper', code: 'GK' },
      { id: 2, name: 'Center Back', code: 'CB' },
      { id: 3, name: 'Left Back', code: 'LB' },
      { id: 4, name: 'Right Back', code: 'RB' },
      { id: 5, name: 'Defensive Midfielder', code: 'DM' },
      { id: 6, name: 'Central Midfielder', code: 'CM' },
      { id: 7, name: 'Attacking Midfielder', code: 'AM' },
      { id: 8, name: 'Left Winger', code: 'LW' },
      { id: 9, name: 'Right Winger', code: 'RW' },
      { id: 10, name: 'Center Forward', code: 'CF' },
    ];
    await Position.bulkCreate(positions, { ignoreDuplicates: true });
    console.log('Seeded Positions.');

    // 2. Seed base Nationality records
    const nationalities = [
      { id: 1, name: 'Germany', code: 'DE', imagePath: 'https://flagcdn.com/w80/de.png' },
      { id: 2, name: 'England', code: 'GB-ENG', imagePath: 'https://flagcdn.com/w80/gb-eng.png' },
      { id: 3, name: 'France', code: 'FR', imagePath: 'https://flagcdn.com/w80/fr.png' },
      { id: 4, name: 'Portugal', code: 'PT', imagePath: 'https://flagcdn.com/w80/pt.png' },
      { id: 5, name: 'Canada', code: 'CA', imagePath: 'https://flagcdn.com/w80/ca.png' },
      { id: 6, name: 'Korea, South', code: 'KR', imagePath: 'https://flagcdn.com/w80/kr.png' },
      { id: 7, name: 'Austria', code: 'AT', imagePath: 'https://flagcdn.com/w80/at.png' },
      { id: 8, name: 'Croatia', code: 'HR', imagePath: 'https://flagcdn.com/w80/hr.png' },
      { id: 9, name: 'Morocco', code: 'MA', imagePath: 'https://flagcdn.com/w80/ma.png' },
      { id: 10, name: 'Netherlands', code: 'NL', imagePath: 'https://flagcdn.com/w80/nl.png' },
      { id: 11, name: 'Norway', code: 'NO', imagePath: 'https://flagcdn.com/w80/no.png' },
      { id: 12, name: 'Spain', code: 'ES', imagePath: 'https://flagcdn.com/w80/es.png' },
      { id: 13, name: 'Argentina', code: 'AR', imagePath: 'https://flagcdn.com/w80/ar.png' },
      { id: 14, name: 'Belgium', code: 'BE', imagePath: 'https://flagcdn.com/w80/be.png' },
      { id: 15, name: 'Japan', code: 'JP', imagePath: 'https://flagcdn.com/w80/jp.png' },
      { id: 16, name: 'Israel', code: 'IL', imagePath: 'https://flagcdn.com/w80/il.png' },
    ];
    await Nationality.bulkCreate(nationalities, { ignoreDuplicates: true });
    console.log('Seeded Nationalities.');

    // 3. Migrate Users
    console.log('Migrating Users from fcbayern_db...');
    const [dbUsers] = await sequelize.query('SELECT * FROM fcbayern_db.users');
    for (const u of dbUsers as any[]) {
      await User.findOrCreate({
        where: { email: u.email },
        defaults: {
          email: u.email,
          passwordHash: 'miasanmia', // Set uniform developer password
          fullName: u.full_name,
          role: u.role
        }
      });
    }

    // 4. Migrate Clubs
    console.log('Migrating Clubs from fcbayern_db...');
    const [dbClubs] = await sequelize.query('SELECT * FROM fcbayern_db.clubs');
    for (const c of dbClubs as any[]) {
      await Club.findOrCreate({
        where: { id: mapClubId(c.id) },
        defaults: {
          id: mapClubId(c.id),
          name: c.name,
          shortCode: c.short_name || '',
          imagePath: c.logo_url || '',
          countryId: 1
        }
      });
    }

    // 5. Migrate Players
    console.log('Migrating Players from fcbayern_db...');
    const [dbPlayers] = await sequelize.query('SELECT * FROM fcbayern_db.players');
    
    // Load squad members to get real jersey numbers for FC Bayern Munich
    const [dbSquadMembers] = await sequelize.query('SELECT player_id, jersey_number FROM fcbayern_db.squad_members');
    const jerseyMap = new Map<number, string>();
    for (const sm of dbSquadMembers as any[]) {
      if (sm.jersey_number) {
        jerseyMap.set(Number(sm.player_id), String(sm.jersey_number));
      }
    }

    // Load tm_players.json for contracts/market values
    const tmMap = new Map<number, any>();
    try {
      const tmPlayersPath = path.resolve(__dirname, '../../../tm_players.json');
      if (fs.existsSync(tmPlayersPath)) {
        const tmDataRaw = fs.readFileSync(tmPlayersPath, 'utf-8');
        const tmData = JSON.parse(tmDataRaw);
        if (tmData && Array.isArray(tmData.players)) {
          for (const p of tmData.players) {
            tmMap.set(Number(p.id), p);
          }
          console.log(`Loaded ${tmMap.size} players from tm_players.json for contract mapping.`);
        }
      } else {
        console.warn(`tm_players.json not found at ${tmPlayersPath}`);
      }
    } catch (err) {
      console.error('Error loading tm_players.json:', err);
    }

    const oldToNewPlayerIdMap = new Map<number, number>();

    for (const p of dbPlayers as any[]) {
      // ONLY migrate authentic FC Bayern Munich first-team players from fcbayern_db
      if (p.current_club_id !== 98) {
        continue;
      }

      const nId = await resolveNationalityId(p.nationality);
      const posId = mapPositionId(p.position);
      const newId = p.sportmonks_id;
      oldToNewPlayerIdMap.set(p.id, newId);

      const tmPlayer = tmMap.get(newId);
      const contractUntil = tmPlayer && tmPlayer.contract ? tmPlayer.contract : (p.contract_expiry || '');
      const marketValue = tmPlayer && tmPlayer.marketValue ? tmPlayer.marketValue : (p.market_value ? Number(p.market_value) : 0);
      const preferredFoot = tmPlayer && tmPlayer.foot ? (tmPlayer.foot.charAt(0).toUpperCase() + tmPlayer.foot.slice(1)) : (p.preferred_foot || 'Right');
      const jerseyNumber = jerseyMap.get(p.id) || p.jersey_number || '';
      
      const birthCountry = tmPlayer && tmPlayer.nationality && tmPlayer.nationality.length > 0 ? tmPlayer.nationality[0] : (p.nationality || 'Germany');
      const secondNationality = tmPlayer && tmPlayer.nationality && tmPlayer.nationality.length > 1 ? tmPlayer.nationality[1] : '';

      await Player.upsert({
        id: newId,
        sportmonksId: newId,
        name: p.name,
        firstname: p.first_name || '',
        lastname: p.last_name || '',
        displayName: p.display_name || p.name,
        imagePath: p.photo_url || '',
        dateOfBirth: p.birth_date || '',
        age: p.age || (tmPlayer ? tmPlayer.age : 25),
        height: p.height || (tmPlayer ? tmPlayer.height : 180),
        weight: p.weight || 75,
        nationalityId: nId,
        positionId: posId,
        clubId: 503, // Bayern Munich
        marketValue: marketValue,
        contractUntil: contractUntil,
        preferredFoot: preferredFoot,
        jerseyNumber: jerseyNumber,
        status: p.active ? 'active' : 'inactive',
        birthCountry: birthCountry,
        secondNationality: secondNationality
      });
    }

    // Curate and seed real world-class target players for scouting database
    const realScoutingPlayers = [
      {
        id: 37402687, name: 'Kylian Mbappé', firstname: 'Kylian', lastname: 'Mbappé', displayName: 'K. Mbappé',
        imagePath: 'https://img.a.transfermarkt.technology/portrait/header/342229-1682683695.jpg?lm=1',
        dateOfBirth: '1998-12-20', age: 27, height: 180, weight: 73, nationality: 'France', position: 'Center Forward',
        clubId: 136, marketValue: 180000000, contractUntil: '2029-06-30', preferredFoot: 'Right', jerseyNumber: '10',
        birthCountry: 'France', secondNationality: 'Cameroon'
      },
      {
        id: 31920857, name: 'Jude Bellingham', firstname: 'Jude', lastname: 'Bellingham', displayName: 'J. Bellingham',
        imagePath: 'https://img.a.transfermarkt.technology/portrait/header/581678-1748102891.jpg?lm=1',
        dateOfBirth: '2003-06-29', age: 22, height: 186, weight: 75, nationality: 'England', position: 'Attacking Midfielder',
        clubId: 136, marketValue: 180000000, contractUntil: '2029-06-30', preferredFoot: 'Right', jerseyNumber: '5',
        birthCountry: 'England', secondNationality: ''
      },
      {
        id: 28549234, name: 'Vinícius Júnior', firstname: 'Vinícius', lastname: 'Júnior', displayName: 'Vinícius Jr.',
        imagePath: 'https://img.a.transfermarkt.technology/portrait/header/371998-1761575144.jpg?lm=1',
        dateOfBirth: '2000-07-12', age: 25, height: 176, weight: 73, nationality: 'Brazil', position: 'Left Winger',
        clubId: 136, marketValue: 180000000, contractUntil: '2027-06-30', preferredFoot: 'Right', jerseyNumber: '7',
        birthCountry: 'Brazil', secondNationality: 'Spain'
      },
      {
        id: 25890258, name: 'Erling Haaland', firstname: 'Erling', lastname: 'Haaland', displayName: 'E. Haaland',
        imagePath: 'https://img.a.transfermarkt.technology/portrait/header/418560-1709108116.png?lm=1',
        dateOfBirth: '2000-07-21', age: 25, height: 194, weight: 88, nationality: 'Norway', position: 'Center Forward',
        clubId: 1, marketValue: 180000000, contractUntil: '2027-06-30', preferredFoot: 'Left', jerseyNumber: '9',
        birthCountry: 'England', secondNationality: 'Norway'
      },
      {
        id: 3849102, name: 'Kevin De Bruyne', firstname: 'Kevin', lastname: 'De Bruyne', displayName: 'K. De Bruyne',
        imagePath: 'https://img.a.transfermarkt.technology/portrait/header/88755-1713391485.jpg?lm=1',
        dateOfBirth: '1991-06-28', age: 34, height: 181, weight: 70, nationality: 'Belgium', position: 'Central Midfielder',
        clubId: 1, marketValue: 50000000, contractUntil: '2026-06-30', preferredFoot: 'Right', jerseyNumber: '17',
        birthCountry: 'Belgium', secondNationality: ''
      },
      {
        id: 17290144, name: 'Rodri', firstname: 'Rodrigo', lastname: 'Hernández', displayName: 'Rodri',
        imagePath: 'https://img.a.transfermarkt.technology/portrait/header/357565-1682587890.jpg?lm=1',
        dateOfBirth: '1996-06-22', age: 29, height: 191, weight: 82, nationality: 'Spain', position: 'Defensive Midfielder',
        clubId: 1, marketValue: 120000000, contractUntil: '2027-06-30', preferredFoot: 'Right', jerseyNumber: '16',
        birthCountry: 'Spain', secondNationality: ''
      },
      {
        id: 18902844, name: 'Phil Foden', firstname: 'Phil', lastname: 'Foden', displayName: 'P. Foden',
        imagePath: 'https://img.a.transfermarkt.technology/portrait/header/406635-1668524492.jpg?lm=1',
        dateOfBirth: '2000-05-28', age: 25, height: 171, weight: 70, nationality: 'England', position: 'Right Winger',
        clubId: 1, marketValue: 150000000, contractUntil: '2027-06-30', preferredFoot: 'Left', jerseyNumber: '47',
        birthCountry: 'England', secondNationality: ''
      },
      {
        id: 18290299, name: 'Bukayo Saka', firstname: 'Bukayo', lastname: 'Saka', displayName: 'B. Saka',
        imagePath: 'https://img.a.transfermarkt.technology/portrait/header/433177-1684155052.jpg?lm=1',
        dateOfBirth: '2001-09-05', age: 24, height: 178, weight: 72, nationality: 'England', position: 'Right Winger',
        clubId: 2, marketValue: 140000000, contractUntil: '2027-06-30', preferredFoot: 'Left', jerseyNumber: '7',
        birthCountry: 'England', secondNationality: 'Nigeria'
      },
      {
        id: 3948122, name: 'Martin Ødegaard', firstname: 'Martin', lastname: 'Ødegaard', displayName: 'M. Ødegaard',
        imagePath: 'https://img.a.transfermarkt.technology/portrait/header/316264-1678877651.jpg?lm=1',
        dateOfBirth: '1998-12-17', age: 27, height: 178, weight: 68, nationality: 'Norway', position: 'Attacking Midfielder',
        clubId: 2, marketValue: 110000000, contractUntil: '2028-06-30', preferredFoot: 'Left', jerseyNumber: '8',
        birthCountry: 'Norway', secondNationality: ''
      },
      {
        id: 1492049, name: 'Declan Rice', firstname: 'Declan', lastname: 'Rice', displayName: 'D. Rice',
        imagePath: 'https://img.a.transfermarkt.technology/portrait/header/357662-1687962936.jpg?lm=1',
        dateOfBirth: '1999-01-14', age: 27, height: 185, weight: 80, nationality: 'England', position: 'Defensive Midfielder',
        clubId: 2, marketValue: 120000000, contractUntil: '2028-06-30', preferredFoot: 'Right', jerseyNumber: '41',
        birthCountry: 'England', secondNationality: 'Ireland'
      },
      {
        id: 17291122, name: 'William Saliba', firstname: 'William', lastname: 'Saliba', displayName: 'W. Saliba',
        imagePath: 'https://img.a.transfermarkt.technology/portrait/header/495666-1718697201.jpg?lm=1',
        dateOfBirth: '2001-03-24', age: 25, height: 192, weight: 92, nationality: 'France', position: 'Center Back',
        clubId: 2, marketValue: 80000000, contractUntil: '2027-06-30', preferredFoot: 'Right', jerseyNumber: '2',
        birthCountry: 'France', secondNationality: 'Cameroon'
      },
      {
        id: 129029, name: 'Mohamed Salah', firstname: 'Mohamed', lastname: 'Salah', displayName: 'M. Salah',
        imagePath: 'https://img.a.transfermarkt.technology/portrait/header/148455-1727337594.jpg?lm=1',
        dateOfBirth: '1992-06-15', age: 33, height: 175, weight: 71, nationality: 'Egypt', position: 'Right Winger',
        clubId: 3, marketValue: 65000000, contractUntil: '2026-06-30', preferredFoot: 'Left', jerseyNumber: '11',
        birthCountry: 'Egypt', secondNationality: ''
      },
      {
        id: 14920, name: 'Virgil van Dijk', firstname: 'Virgil', lastname: 'van Dijk', displayName: 'V. van Dijk',
        imagePath: 'https://img.a.transfermarkt.technology/portrait/header/139208-1702049837.jpg?lm=1',
        dateOfBirth: '1991-07-08', age: 34, height: 193, weight: 92, nationality: 'Netherlands', position: 'Center Back',
        clubId: 3, marketValue: 30000000, contractUntil: '2026-06-30', preferredFoot: 'Right', jerseyNumber: '4',
        birthCountry: 'Netherlands', secondNationality: 'Suriname'
      },
      {
        id: 429105, name: 'Cole Palmer', firstname: 'Cole', lastname: 'Palmer', displayName: 'C. Palmer',
        imagePath: 'https://img.a.transfermarkt.technology/portrait/header/568177-1712320986.jpg?lm=1',
        dateOfBirth: '2002-05-06', age: 24, height: 189, weight: 74, nationality: 'England', position: 'Attacking Midfielder',
        clubId: 122, marketValue: 100000000, contractUntil: '2033-06-30', preferredFoot: 'Left', jerseyNumber: '20',
        birthCountry: 'England', secondNationality: ''
      },
      {
        id: 39102855, name: 'Florian Wirtz', firstname: 'Florian', lastname: 'Wirtz', displayName: 'F. Wirtz',
        imagePath: 'https://img.a.transfermarkt.technology/portrait/header/598577-1781163178.jpg?lm=1',
        dateOfBirth: '2003-05-03', age: 23, height: 176, weight: 71, nationality: 'Germany', position: 'Attacking Midfielder',
        clubId: 505, marketValue: 130000000, contractUntil: '2027-06-30', preferredFoot: 'Right', jerseyNumber: '10',
        birthCountry: 'Germany', secondNationality: ''
      },
      {
        id: 2849102, name: 'Jeremie Frimpong', firstname: 'Jeremie', lastname: 'Frimpong', displayName: 'J. Frimpong',
        imagePath: 'https://img.a.transfermarkt.technology/portrait/header/484547-1689710682.jpg?lm=1',
        dateOfBirth: '2000-12-10', age: 25, height: 171, weight: 64, nationality: 'Netherlands', position: 'Right Back',
        clubId: 505, marketValue: 50000000, contractUntil: '2028-06-30', preferredFoot: 'Right', jerseyNumber: '30',
        birthCountry: 'Netherlands', secondNationality: 'Ghana'
      },
      {
        id: 192049, name: 'Alejandro Grimaldo', firstname: 'Alejandro', lastname: 'Grimaldo', displayName: 'A. Grimaldo',
        imagePath: 'https://img.a.transfermarkt.technology/portrait/header/193082-1689710805.jpg?lm=1',
        dateOfBirth: '1995-09-20', age: 30, height: 171, weight: 63, nationality: 'Spain', position: 'Left Back',
        clubId: 505, marketValue: 45000000, contractUntil: '2027-06-30', preferredFoot: 'Left', jerseyNumber: '20',
        birthCountry: 'Spain', secondNationality: ''
      },
      {
        id: 42918501, name: 'Lamine Yamal', firstname: 'Lamine', lastname: 'Yamal', displayName: 'Lamine Yamal',
        imagePath: 'https://img.a.transfermarkt.technology/portrait/header/937958-1773173768.jpg?lm=1',
        dateOfBirth: '2007-07-13', age: 18, height: 180, weight: 69, nationality: 'Spain', position: 'Right Winger',
        clubId: 137, marketValue: 120000000, contractUntil: '2026-06-30', preferredFoot: 'Left', jerseyNumber: '19',
        birthCountry: 'Spain', secondNationality: 'Morocco'
      },
      {
        id: 3910582, name: 'Pedri', firstname: 'Pedro', lastname: 'González', displayName: 'Pedri',
        imagePath: 'https://img.a.transfermarkt.technology/portrait/header/683840-1744278342.jpg?lm=1',
        dateOfBirth: '2002-11-25', age: 23, height: 174, weight: 61, nationality: 'Spain', position: 'Central Midfielder',
        clubId: 137, marketValue: 80000000, contractUntil: '2026-06-30', preferredFoot: 'Right', jerseyNumber: '8',
        birthCountry: 'Spain', secondNationality: ''
      },
      {
        id: 28492, name: 'Robert Lewandowski', firstname: 'Robert', lastname: 'Lewandowski', displayName: 'R. Lewandowski',
        imagePath: 'https://img.a.transfermarkt.technology/portrait/header/38253-1760445524.jpg?lm=1',
        dateOfBirth: '1988-08-21', age: 37, height: 185, weight: 81, nationality: 'Poland', position: 'Center Forward',
        clubId: 137, marketValue: 15000000, contractUntil: '2026-06-30', preferredFoot: 'Right', jerseyNumber: '9',
        birthCountry: 'Poland', secondNationality: ''
      },
      {
        id: 29401, name: 'Lautaro Martínez', firstname: 'Lautaro', lastname: 'Martínez', displayName: 'L. Martínez',
        imagePath: 'https://img.a.transfermarkt.technology/portrait/header/406625-1695024988.jpg?lm=1',
        dateOfBirth: '1997-08-22', age: 28, height: 174, weight: 72, nationality: 'Argentina', position: 'Center Forward',
        clubId: 201, marketValue: 110000000, contractUntil: '2029-06-30', preferredFoot: 'Right', jerseyNumber: '10',
        birthCountry: 'Argentina', secondNationality: ''
      },
      {
        id: 18949, name: 'Nicolò Barella', firstname: 'Nicolò', lastname: 'Barella', displayName: 'N. Barella',
        imagePath: 'https://img.a.transfermarkt.technology/portrait/header/255942-1725531625.jpg?lm=1',
        dateOfBirth: '1997-02-07', age: 29, height: 172, weight: 68, nationality: 'Italy', position: 'Central Midfielder',
        clubId: 201, marketValue: 80000000, contractUntil: '2029-06-30', preferredFoot: 'Right', jerseyNumber: '23',
        birthCountry: 'Italy', secondNationality: ''
      },
      {
        id: 29102, name: 'Rafael Leão', firstname: 'Rafael', lastname: 'Leão', displayName: 'Rafael Leão',
        imagePath: 'https://img.a.transfermarkt.technology/portrait/header/357164-1730126553.jpg?lm=1',
        dateOfBirth: '1999-06-10', age: 26, height: 188, weight: 81, nationality: 'Portugal', position: 'Left Winger',
        clubId: 158, marketValue: 90000000, contractUntil: '2028-06-30', preferredFoot: 'Right', jerseyNumber: '10',
        birthCountry: 'Portugal', secondNationality: 'Angola'
      },
      {
        id: 19482, name: 'Theo Hernández', firstname: 'Theo', lastname: 'Hernández', displayName: 'T. Hernández',
        imagePath: 'https://img.a.transfermarkt.technology/portrait/header/339808-1725532072.jpg?lm=1',
        dateOfBirth: '1997-10-06', age: 28, height: 184, weight: 81, nationality: 'France', position: 'Left Back',
        clubId: 158, marketValue: 60000000, contractUntil: '2026-06-30', preferredFoot: 'Left', jerseyNumber: '19',
        birthCountry: 'France', secondNationality: 'Spain'
      },
      {
        id: 29402, name: 'Ousmane Dembélé', firstname: 'Ousmane', lastname: 'Dembélé', displayName: 'O. Dembélé',
        imagePath: 'https://img.a.transfermarkt.technology/portrait/header/288230-1684148641.jpg?lm=1',
        dateOfBirth: '1997-05-15', age: 29, height: 178, weight: 67, nationality: 'France', position: 'Right Winger',
        clubId: 301, marketValue: 60000000, contractUntil: '2028-06-30', preferredFoot: 'both', jerseyNumber: '10',
        birthCountry: 'France', secondNationality: 'Mauritania'
      },
      {
        id: 18491, name: 'Julian Brandt', firstname: 'Julian', lastname: 'Brandt', displayName: 'J. Brandt',
        imagePath: 'https://img.a.transfermarkt.technology/portrait/header/187492-1709560849.jpg?lm=1',
        dateOfBirth: '1996-05-02', age: 30, height: 185, weight: 83, nationality: 'Germany', position: 'Central Midfielder',
        clubId: 504, marketValue: 40000000, contractUntil: '2026-06-30', preferredFoot: 'Right', jerseyNumber: '10',
        birthCountry: 'Germany', secondNationality: ''
      },
      {
        id: 39481, name: 'Xavi Simons', firstname: 'Xavi', lastname: 'Simons', displayName: 'X. Simons',
        imagePath: 'https://img.a.transfermarkt.technology/portrait/header/566931-1729778226.jpg?lm=1',
        dateOfBirth: '2003-04-21', age: 23, height: 179, weight: 70, nationality: 'Netherlands', position: 'Attacking Midfielder',
        clubId: 506, marketValue: 80000000, contractUntil: '2027-06-30', preferredFoot: 'Right', jerseyNumber: '10',
        birthCountry: 'Netherlands', secondNationality: 'Suriname'
      },
      {
        id: 149102, name: 'Son Heung-min', firstname: 'Heung-min', lastname: 'Son', displayName: 'H. M. Son',
        imagePath: 'https://img.a.transfermarkt.technology/portrait/header/91845-1771690023.jpg?lm=1',
        dateOfBirth: '1992-07-08', age: 33, height: 183, weight: 77, nationality: 'Korea, South', position: 'Left Winger',
        clubId: 123, marketValue: 45000000, contractUntil: '2026-06-30', preferredFoot: 'both', jerseyNumber: '7',
        birthCountry: 'Korea, South', secondNationality: ''
      },
      {
        id: 1334812, name: 'Ismael Saibari', firstname: 'Ismael', lastname: 'Saibari', displayName: 'I. Saibari',
        imagePath: 'https://img.a.transfermarkt.technology/portrait/header/702869-1765214009.jpg?lm=1',
        dateOfBirth: '2001-01-28', age: 25, height: 185, weight: 82, nationality: 'Morocco', position: 'Attacking Midfielder',
        clubId: 503, marketValue: 40000000, contractUntil: '2029-06-30', preferredFoot: 'Right', jerseyNumber: '34',
        birthCountry: 'Spain', secondNationality: 'Belgium'
      }
    ];

    for (const cur of realScoutingPlayers) {
      const nId = await resolveNationalityId(cur.nationality);
      const posId = mapPositionId(cur.position);

      await Player.upsert({
        id: cur.id,
        sportmonksId: cur.id,
        name: cur.name,
        firstname: cur.firstname,
        lastname: cur.lastname,
        displayName: cur.displayName,
        imagePath: cur.imagePath,
        dateOfBirth: cur.dateOfBirth,
        age: cur.age,
        height: cur.height,
        weight: cur.weight,
        nationalityId: nId,
        positionId: posId,
        clubId: cur.clubId,
        marketValue: cur.marketValue,
        contractUntil: cur.contractUntil,
        preferredFoot: cur.preferredFoot,
        jerseyNumber: cur.jerseyNumber,
        status: 'active',
        birthCountry: cur.birthCountry,
        secondNationality: cur.secondNationality
      });
    }

    // Seed stats for Saibari manually
    await PlayerStats.create({
      playerId: 1334812,
      season: '2025/2026',
      appearances: 34,
      goals: 8,
      assists: 9,
      minutesPlayed: 2450,
      yellowCards: 2,
      redCards: 0,
      passAccuracy: 88.2,
      tacklesWon: 25,
      shotsOnTarget: 29,
      rating: 7.42
    });
    console.log('Seeded manual stats for Ismael Saibari.');

    // 6. Migrate Statistics
    console.log('Migrating Player Statistics from fcbayern_db...');
    const [dbStats] = await sequelize.query('SELECT * FROM fcbayern_db.player_statistics');
    for (const s of dbStats as any[]) {
      const newPlayerId = oldToNewPlayerIdMap.get(s.player_id);
      if (!newPlayerId) continue;
      await PlayerStats.create({
        playerId: newPlayerId,
        season: '2025/2026',
        appearances: s.appearances || 0,
        goals: s.goals || 0,
        assists: s.assists || 0,
        minutesPlayed: s.minutes_played || 0,
        yellowCards: s.yellow_cards || 0,
        redCards: s.red_cards || 0,
        passAccuracy: s.pass_accuracy ? Number(s.pass_accuracy) : 85.0,
        tacklesWon: s.tackles || 10,
        shotsOnTarget: s.shots_on_target || 5,
        rating: s.average_rating ? Number(s.average_rating) : 7.0,
        saves: s.saves || 0,
        cleanSheets: s.clean_sheets || 0
      });
    }

    // 7. Migrate Injuries
    console.log('Migrating Injuries from fcbayern_db...');
    const [dbInjuries] = await sequelize.query('SELECT * FROM fcbayern_db.injuries');
    for (const i of dbInjuries as any[]) {
      const newPlayerId = oldToNewPlayerIdMap.get(i.player_id);
      if (!newPlayerId) continue;
      await Injury.create({
        playerId: newPlayerId,
        description: i.description || 'Injury',
        status: i.status || 'ACTIVE',
        startDate: i.start_date || '',
        endDate: i.expected_return || ''
      });
    }

    // 8. Migrate Transfers
    console.log('Migrating Transfers from fcbayern_db...');
    const [dbTransfers] = await sequelize.query('SELECT * FROM fcbayern_db.transfers');
    for (const t of dbTransfers as any[]) {
      const newPlayerId = oldToNewPlayerIdMap.get(t.player_id);
      if (!newPlayerId) continue;
      await Transfer.create({
        id: t.id,
        playerId: newPlayerId,
        fromClubId: t.from_club_id ? mapClubId(t.from_club_id) : null as any,
        toClubId: t.to_club_id ? mapClubId(t.to_club_id) : null as any,
        date: t.transfer_date || '',
        amount: t.fee ? Number(t.fee) : 0,
        type: t.type || 'PERMANENT',
        status: t.status || 'COMPLETED'
      });
    }

    // 9. Migrate Scouting Reports
    console.log('Migrating Scouting Reports from fcbayern_db...');
    const [dbReports] = await sequelize.query('SELECT * FROM fcbayern_db.scouting_reports');
    for (const r of dbReports as any[]) {
      const newPlayerId = oldToNewPlayerIdMap.get(r.player_id);
      if (!newPlayerId) continue;
      await ScoutingReport.create({
        playerId: newPlayerId,
        createdById: r.created_by_id || 1,
        createdByName: 'Scouting Team',
        technicalRating: r.technical_rating ? Number(r.technical_rating) : 7,
        physicalRating: r.physical_rating ? Number(r.physical_rating) : 7,
        mentalRating: r.mental_rating ? Number(r.mental_rating) : 7,
        tacticalRating: r.tactical_rating ? Number(r.tactical_rating) : 7,
        overallRating: r.overall_rating ? Number(r.overall_rating) : 7,
        strengths: r.strengths || '',
        weaknesses: r.weaknesses || '',
        notes: r.notes || '',
        recommendation: r.recommendation || 'Monitor',
        matchObserved: r.match_observed || 'General',
        observationDate: r.observation_date || ''
      });
    }

    // 10. Migrate Shortlists & Associations
    console.log('Migrating Shortlists from fcbayern_db...');
    const [dbShortlists] = await sequelize.query('SELECT * FROM fcbayern_db.shortlists');
    for (const s of dbShortlists as any[]) {
      const list = await Shortlist.create({
        id: s.id,
        name: s.name,
        description: s.description || '',
        category: s.category || 'General',
        createdByName: 'Thomas Müller'
      });

      const [dbShortlistPlayers] = await sequelize.query(`SELECT player_id FROM fcbayern_db.shortlist_players WHERE shortlist_id = ${s.id}`);
      const playerIds = (dbShortlistPlayers as any[]).map(sp => sp.player_id);
      if (playerIds.length > 0) {
        const mappedPlayerIds = playerIds.map(oldId => oldToNewPlayerIdMap.get(oldId)).filter(id => id !== undefined) as number[];
        if (mappedPlayerIds.length > 0) {
          const players = await Player.findAll({ where: { id: mappedPlayerIds } });
          await (list as any).addPlayers(players);
        }
      }
    }

    console.log('Database Seeding & Migration Completed successfully!');
  } catch (error) {
    console.error('Error seeding and migrating database:', error);
  }
};

if (require.main === module) {
  (async () => {
    await connectDB();
    await seedDatabase(true);
    process.exit(0);
  })();
}
