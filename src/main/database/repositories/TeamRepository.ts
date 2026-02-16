import Database from 'better-sqlite3';
import { Team, TeamMember } from '../schema';

export class TeamRepository {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  createTeam(
    name: string,
    format: string,
    members: Omit<TeamMember, 'id' | 'team_id'>[]
  ): Team {
    const insertTeam = this.db.prepare(`
      INSERT INTO teams (name, format, generation_method)
      VALUES (?, ?, ?)
    `);

    const insertMember = this.db.prepare(`
      INSERT INTO team_members (
        team_id, position, pokemon_id, nickname, level, gender,
        nature, ability, item, tera_type,
        hp_iv, attack_iv, defense_iv, sp_attack_iv, sp_defense_iv, speed_iv,
        hp_ev, attack_ev, defense_ev, sp_attack_ev, sp_defense_ev, speed_ev,
        move1, move2, move3, move4
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const transaction = this.db.transaction(() => {
      const result = insertTeam.run(name, format, 'manual');
      const teamId = result.lastInsertRowid as number;

      for (const member of members) {
        insertMember.run(
          teamId,
          member.position,
          member.pokemon_id,
          member.nickname || null,
          member.level,
          member.gender || null,
          member.nature,
          member.ability,
          member.item || null,
          member.tera_type,
          member.hp_iv,
          member.attack_iv,
          member.defense_iv,
          member.sp_attack_iv,
          member.sp_defense_iv,
          member.speed_iv,
          member.hp_ev,
          member.attack_ev,
          member.defense_ev,
          member.sp_attack_ev,
          member.sp_defense_ev,
          member.speed_ev,
          member.move1,
          member.move2,
          member.move3,
          member.move4
        );
      }

      return teamId;
    });

    const teamId = transaction();
    return this.getTeam(teamId)!;
  }

  getTeam(id: number): Team | null {
    const team = this.db
      .prepare('SELECT * FROM teams WHERE id = ?')
      .get(id) as Team | undefined;

    return team || null;
  }

  getAllTeams(): Team[] {
    return this.db
      .prepare('SELECT * FROM teams ORDER BY created_at DESC')
      .all() as Team[];
  }

  getTeamWithMembers(id: number): { team: Team; members: TeamMember[] } | null {
    const team = this.getTeam(id);
    if (!team) return null;

    const members = this.db
      .prepare('SELECT * FROM team_members WHERE team_id = ? ORDER BY position')
      .all(id) as TeamMember[];

    return { team, members };
  }

  deleteTeam(id: number): void {
    this.db.prepare('DELETE FROM teams WHERE id = ?').run(id);
  }
}
