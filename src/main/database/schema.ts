import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';

export interface PokemonSpecies {
  id: number;
  national_dex_number: number;
  name: string;
  base_hp: number;
  base_attack: number;
  base_defense: number;
  base_sp_attack: number;
  base_sp_defense: number;
  base_speed: number;
  type1: string;
  type2?: string;
  ability1: string;
  ability2?: string;
  hidden_ability?: string;
  created_at: string;
  updated_at: string;
}

export interface Move {
  id: number;
  name: string;
  type: string;
  category: 'physical' | 'special' | 'status';
  power?: number;
  accuracy?: number;
  pp: number;
  priority: number;
  description?: string;
  effect?: string;
  created_at: string;
}

export interface Ability {
  id: number;
  name: string;
  description?: string;
  effect?: string;
  created_at: string;
}

export interface Team {
  id: number;
  name?: string;
  format: string;
  generation_method: 'manual' | 'ai-genetic' | 'ai-heuristic';
  parent_team_1_id?: number;
  parent_team_2_id?: number;
  generation_number: number;
  fitness_score?: number;
  total_battles: number;
  wins: number;
  losses: number;
  win_rate: number;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: number;
  team_id: number;
  position: number;
  pokemon_id: number;
  nickname?: string;
  level: number;
  gender?: 'M' | 'F';
  nature: string;
  ability: string;
  item?: string;
  tera_type: string;
  hp_iv: number;
  attack_iv: number;
  defense_iv: number;
  sp_attack_iv: number;
  sp_defense_iv: number;
  speed_iv: number;
  hp_ev: number;
  attack_ev: number;
  defense_ev: number;
  sp_attack_ev: number;
  sp_defense_ev: number;
  speed_ev: number;
  move1: string;
  move2: string;
  move3: string;
  move4: string;
}

export interface PokemonRating {
  pokemon_id: number;
  total_battles: number;
  wins: number;
  losses: number;
  rating: number;
  usage_count: number;
  last_used: string;
}

export class DatabaseSchema {
  private db: Database.Database;

  constructor(dbPath?: string) {
    const dataPath = dbPath || path.join(app.getPath('userData'), 'database.sqlite');
    this.db = new Database(dataPath);

    // Enable WAL mode for better concurrency
    this.db.pragma('journal_mode = WAL');

    this.initializeSchema();
  }

  private initializeSchema(): void {
    // Create all tables
    this.createPokemonSpeciesTable();
    this.createMovesTable();
    this.createAbilitiesTable();
    this.createItemsTable();
    this.createPokemonMovesetsTable();
    this.createTeamsTable();
    this.createTeamMembersTable();
    this.createPokemonRatingsTable();
    this.createSimulationsTable();
    this.createBattlesTable();
    this.createFormatsTable();
    this.createBattleLogsTable();
    this.createMoveEffectivenessTable();
    this.createAIPredictionsTable();
    this.createTriggers();
    this.insertDefaultFormats();
  }

  private createPokemonSpeciesTable(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS pokemon_species (
        id INTEGER PRIMARY KEY,
        national_dex_number INTEGER NOT NULL,
        name TEXT NOT NULL,
        base_hp INTEGER NOT NULL,
        base_attack INTEGER NOT NULL,
        base_defense INTEGER NOT NULL,
        base_sp_attack INTEGER NOT NULL,
        base_sp_defense INTEGER NOT NULL,
        base_speed INTEGER NOT NULL,
        type1 TEXT NOT NULL,
        type2 TEXT,
        ability1 TEXT NOT NULL,
        ability2 TEXT,
        hidden_ability TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_pokemon_name ON pokemon_species(name);
      CREATE INDEX IF NOT EXISTS idx_pokemon_dex ON pokemon_species(national_dex_number);
    `);
  }

  private createMovesTable(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS moves (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL,
        category TEXT NOT NULL CHECK(category IN ('physical', 'special', 'status')),
        power INTEGER,
        accuracy INTEGER,
        pp INTEGER NOT NULL,
        priority INTEGER DEFAULT 0,
        description TEXT,
        effect TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_move_name ON moves(name);
      CREATE INDEX IF NOT EXISTS idx_move_type ON moves(type);
    `);
  }

  private createAbilitiesTable(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS abilities (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        effect TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_ability_name ON abilities(name);
    `);
  }

  private createItemsTable(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        category TEXT,
        effect TEXT,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_item_name ON items(name);
    `);
  }

  private createPokemonMovesetsTable(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS pokemon_movesets (
        id INTEGER PRIMARY KEY,
        pokemon_id INTEGER NOT NULL,
        move_id INTEGER NOT NULL,
        learn_method TEXT NOT NULL,
        level_learned INTEGER,
        generation INTEGER NOT NULL,
        FOREIGN KEY (pokemon_id) REFERENCES pokemon_species(id),
        FOREIGN KEY (move_id) REFERENCES moves(id),
        UNIQUE(pokemon_id, move_id, learn_method)
      );

      CREATE INDEX IF NOT EXISTS idx_moveset_pokemon ON pokemon_movesets(pokemon_id);
      CREATE INDEX IF NOT EXISTS idx_moveset_move ON pokemon_movesets(move_id);
    `);
  }

  private createTeamsTable(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS teams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        format TEXT NOT NULL,
        generation_method TEXT NOT NULL CHECK(generation_method IN ('manual', 'ai-genetic', 'ai-heuristic')),
        parent_team_1_id INTEGER,
        parent_team_2_id INTEGER,
        generation_number INTEGER DEFAULT 1,
        fitness_score REAL,
        total_battles INTEGER DEFAULT 0,
        wins INTEGER DEFAULT 0,
        losses INTEGER DEFAULT 0,
        win_rate REAL GENERATED ALWAYS AS (
          CASE WHEN total_battles > 0
          THEN CAST(wins AS REAL) / total_battles
          ELSE 0 END
        ) STORED,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_team_1_id) REFERENCES teams(id),
        FOREIGN KEY (parent_team_2_id) REFERENCES teams(id)
      );

      CREATE INDEX IF NOT EXISTS idx_team_format ON teams(format);
      CREATE INDEX IF NOT EXISTS idx_team_generation ON teams(generation_number);
      CREATE INDEX IF NOT EXISTS idx_team_fitness ON teams(fitness_score DESC);
      CREATE INDEX IF NOT EXISTS idx_team_win_rate ON teams(win_rate DESC);
    `);
  }

  private createTeamMembersTable(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS team_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        team_id INTEGER NOT NULL,
        position INTEGER NOT NULL CHECK(position BETWEEN 1 AND 6),
        pokemon_id INTEGER NOT NULL,
        nickname TEXT,
        level INTEGER DEFAULT 100,
        gender TEXT CHECK(gender IN ('M', 'F') OR gender IS NULL),
        nature TEXT NOT NULL,
        ability TEXT NOT NULL,
        item TEXT,
        tera_type TEXT NOT NULL,
        hp_iv INTEGER DEFAULT 31 CHECK(hp_iv BETWEEN 0 AND 31),
        attack_iv INTEGER DEFAULT 31 CHECK(attack_iv BETWEEN 0 AND 31),
        defense_iv INTEGER DEFAULT 31 CHECK(defense_iv BETWEEN 0 AND 31),
        sp_attack_iv INTEGER DEFAULT 31 CHECK(sp_attack_iv BETWEEN 0 AND 31),
        sp_defense_iv INTEGER DEFAULT 31 CHECK(sp_defense_iv BETWEEN 0 AND 31),
        speed_iv INTEGER DEFAULT 31 CHECK(speed_iv BETWEEN 0 AND 31),
        hp_ev INTEGER DEFAULT 0 CHECK(hp_ev >= 0 AND hp_ev <= 252),
        attack_ev INTEGER DEFAULT 0 CHECK(attack_ev >= 0 AND attack_ev <= 252),
        defense_ev INTEGER DEFAULT 0 CHECK(defense_ev >= 0 AND defense_ev <= 252),
        sp_attack_ev INTEGER DEFAULT 0 CHECK(sp_attack_ev >= 0 AND sp_attack_ev <= 252),
        sp_defense_ev INTEGER DEFAULT 0 CHECK(sp_defense_ev >= 0 AND sp_defense_ev <= 252),
        speed_ev INTEGER DEFAULT 0 CHECK(speed_ev >= 0 AND speed_ev <= 252),
        move1 TEXT NOT NULL,
        move2 TEXT NOT NULL,
        move3 TEXT NOT NULL,
        move4 TEXT NOT NULL,
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
        FOREIGN KEY (pokemon_id) REFERENCES pokemon_species(id),
        UNIQUE(team_id, position),
        CHECK(hp_ev + attack_ev + defense_ev + sp_attack_ev + sp_defense_ev + speed_ev <= 510)
      );

      CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
      CREATE INDEX IF NOT EXISTS idx_team_members_pokemon ON team_members(pokemon_id);
    `);
  }

  private createPokemonRatingsTable(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS pokemon_ratings (
        pokemon_id INTEGER PRIMARY KEY,
        total_battles INTEGER DEFAULT 0,
        wins INTEGER DEFAULT 0,
        losses INTEGER DEFAULT 0,
        rating REAL DEFAULT 1500.0,
        usage_count INTEGER DEFAULT 0,
        last_used DATETIME,
        FOREIGN KEY (pokemon_id) REFERENCES pokemon_species(id)
      );

      CREATE INDEX IF NOT EXISTS idx_rating_score ON pokemon_ratings(rating DESC);
      CREATE INDEX IF NOT EXISTS idx_usage_count ON pokemon_ratings(usage_count);
    `);
  }

  private createSimulationsTable(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS simulations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        format TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('running', 'paused', 'completed', 'stopped')),
        total_battles_planned INTEGER NOT NULL,
        battles_completed INTEGER DEFAULT 0,
        concurrent_workers INTEGER DEFAULT 4,
        use_ai_teams INTEGER DEFAULT 1,
        ai_algorithm TEXT,
        ai_population_size INTEGER,
        ai_generation_count INTEGER,
        started_at DATETIME,
        completed_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_simulation_status ON simulations(status);
      CREATE INDEX IF NOT EXISTS idx_simulation_format ON simulations(format);
    `);
  }

  private createBattlesTable(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS battles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        simulation_id INTEGER NOT NULL,
        team1_id INTEGER NOT NULL,
        team2_id INTEGER NOT NULL,
        winner_team_id INTEGER,
        battle_format TEXT NOT NULL,
        turn_count INTEGER NOT NULL,
        team1_pokemon_fainted INTEGER DEFAULT 0,
        team2_pokemon_fainted INTEGER DEFAULT 0,
        battle_data_json TEXT,
        duration_ms INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (simulation_id) REFERENCES simulations(id) ON DELETE CASCADE,
        FOREIGN KEY (team1_id) REFERENCES teams(id),
        FOREIGN KEY (team2_id) REFERENCES teams(id),
        FOREIGN KEY (winner_team_id) REFERENCES teams(id)
      );

      CREATE INDEX IF NOT EXISTS idx_battle_simulation ON battles(simulation_id);
      CREATE INDEX IF NOT EXISTS idx_battle_team1 ON battles(team1_id);
      CREATE INDEX IF NOT EXISTS idx_battle_team2 ON battles(team2_id);
      CREATE INDEX IF NOT EXISTS idx_battle_winner ON battles(winner_team_id);
    `);
  }

  private createFormatsTable(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS formats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        ruleset TEXT NOT NULL CHECK(ruleset IN ('singles', 'doubles', 'triples')),
        generation INTEGER NOT NULL,
        restricted_pokemon TEXT,
        restricted_moves TEXT,
        restricted_abilities TEXT,
        restricted_items TEXT,
        special_clauses TEXT,
        description TEXT,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  private createBattleLogsTable(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS battle_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        battle_id INTEGER NOT NULL,
        turn_number INTEGER NOT NULL,
        action_type TEXT NOT NULL CHECK(action_type IN ('switch', 'move', 'faint', 'status', 'weather', 'field')),
        acting_pokemon TEXT NOT NULL,
        target_pokemon TEXT,
        move_used TEXT,
        damage_dealt INTEGER,
        effectiveness REAL,
        critical_hit INTEGER DEFAULT 0,
        succeeded INTEGER DEFAULT 1,
        log_message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (battle_id) REFERENCES battles(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_battle_logs_battle ON battle_logs(battle_id);
      CREATE INDEX IF NOT EXISTS idx_battle_logs_turn ON battle_logs(turn_number);
      CREATE INDEX IF NOT EXISTS idx_battle_logs_move ON battle_logs(move_used);
    `);
  }

  private createMoveEffectivenessTable(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS move_effectiveness (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        attacker_pokemon_id INTEGER NOT NULL,
        defender_pokemon_id INTEGER NOT NULL,
        move_name TEXT NOT NULL,
        total_uses INTEGER DEFAULT 0,
        successful_uses INTEGER DEFAULT 0,
        total_damage REAL DEFAULT 0,
        average_damage REAL DEFAULT 0,
        ko_count INTEGER DEFAULT 0,
        critical_hits INTEGER DEFAULT 0,
        effectiveness_rating REAL DEFAULT 1.0,
        last_used DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (attacker_pokemon_id) REFERENCES pokemon_species(id),
        FOREIGN KEY (defender_pokemon_id) REFERENCES pokemon_species(id),
        UNIQUE(attacker_pokemon_id, defender_pokemon_id, move_name)
      );

      CREATE INDEX IF NOT EXISTS idx_effectiveness_attacker ON move_effectiveness(attacker_pokemon_id);
      CREATE INDEX IF NOT EXISTS idx_effectiveness_defender ON move_effectiveness(defender_pokemon_id);
      CREATE INDEX IF NOT EXISTS idx_effectiveness_move ON move_effectiveness(move_name);
      CREATE INDEX IF NOT EXISTS idx_effectiveness_rating ON move_effectiveness(effectiveness_rating DESC);
    `);
  }

  private createAIPredictionsTable(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS ai_predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        situation_hash TEXT NOT NULL UNIQUE,
        my_pokemon TEXT NOT NULL,
        opponent_pokemon TEXT NOT NULL,
        my_hp_percentage REAL NOT NULL,
        opponent_hp_percentage REAL NOT NULL,
        recommended_move TEXT NOT NULL,
        confidence_score REAL DEFAULT 0.5,
        times_used INTEGER DEFAULT 0,
        successful_outcomes INTEGER DEFAULT 0,
        win_rate REAL DEFAULT 0.0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_predictions_hash ON ai_predictions(situation_hash);
      CREATE INDEX IF NOT EXISTS idx_predictions_confidence ON ai_predictions(confidence_score DESC);
      CREATE INDEX IF NOT EXISTS idx_predictions_winrate ON ai_predictions(win_rate DESC);
    `);
  }

  private createTriggers(): void {
    // Auto-update team stats after battle completes
    this.db.exec(`
      CREATE TRIGGER IF NOT EXISTS update_team_stats_after_battle
      AFTER INSERT ON battles
      BEGIN
        UPDATE teams
        SET total_battles = total_battles + 1,
            wins = wins + CASE WHEN NEW.winner_team_id = NEW.team1_id THEN 1 ELSE 0 END,
            losses = losses + CASE WHEN NEW.winner_team_id = NEW.team2_id THEN 1 ELSE 0 END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.team1_id;

        UPDATE teams
        SET total_battles = total_battles + 1,
            wins = wins + CASE WHEN NEW.winner_team_id = NEW.team2_id THEN 1 ELSE 0 END,
            losses = losses + CASE WHEN NEW.winner_team_id = NEW.team1_id THEN 1 ELSE 0 END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.team2_id;

        UPDATE simulations
        SET battles_completed = battles_completed + 1,
            updated_at = CURRENT_TIMESTAMP,
            status = CASE
              WHEN battles_completed + 1 >= total_battles_planned THEN 'completed'
              ELSE status
            END,
            completed_at = CASE
              WHEN battles_completed + 1 >= total_battles_planned THEN CURRENT_TIMESTAMP
              ELSE completed_at
            END
        WHERE id = NEW.simulation_id;
      END;
    `);

    // Auto-update timestamps
    this.db.exec(`
      CREATE TRIGGER IF NOT EXISTS update_teams_timestamp
      AFTER UPDATE ON teams
      BEGIN
        UPDATE teams SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END;

      CREATE TRIGGER IF NOT EXISTS update_simulations_timestamp
      AFTER UPDATE ON simulations
      BEGIN
        UPDATE simulations SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END;
    `);
  }

  private insertDefaultFormats(): void {
    const formats = [
      {
        name: 'VGC 2025 Reg G',
        ruleset: 'doubles',
        generation: 9,
        description: 'Official VGC 2025 Regulation G format'
      },
      {
        name: 'Smogon Doubles OU',
        ruleset: 'doubles',
        generation: 9,
        description: 'Smogon Doubles Overused tier'
      },
      {
        name: 'Battle Stadium Doubles',
        ruleset: 'doubles',
        generation: 9,
        description: 'Ranked Battle Stadium format'
      },
      {
        name: 'Custom Singles',
        ruleset: 'singles',
        generation: 9,
        description: 'Custom singles format'
      },
      {
        name: 'Custom Triples',
        ruleset: 'triples',
        generation: 9,
        description: 'Custom triples format'
      }
    ];

    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO formats (name, ruleset, generation, description)
      VALUES (?, ?, ?, ?)
    `);

    for (const format of formats) {
      stmt.run(format.name, format.ruleset, format.generation, format.description);
    }
  }

  public getDatabase(): Database.Database {
    return this.db;
  }

  public close(): void {
    this.db.close();
  }
}
