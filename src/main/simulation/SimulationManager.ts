import Database from 'better-sqlite3';
import { BattleEngine, TeamData } from './BattleEngine';
import { EventEmitter } from 'events';

export interface SimulationConfig {
  name?: string;
  format: string;
  totalBattles: number;
  teamIds: number[];
  concurrentWorkers?: number;
}

export interface SimulationProgress {
  simulationId: number;
  completed: number;
  total: number;
  percentage: number;
  status: 'running' | 'paused' | 'completed' | 'stopped';
}

export class SimulationManager extends EventEmitter {
  private db: Database.Database;
  private battleEngine: BattleEngine;
  private currentSimulationId: number | null = null;
  private isRunning = false;
  private isPaused = false;
  private shouldStop = false;

  constructor(db: Database.Database) {
    super();
    this.db = db;
    this.battleEngine = new BattleEngine(db);
  }

  async startSimulation(config: SimulationConfig): Promise<number> {
    if (this.isRunning) {
      throw new Error('A simulation is already running');
    }

    // Create simulation record
    const result = this.db.prepare(`
      INSERT INTO simulations (
        name, format, status, total_battles_planned,
        concurrent_workers, started_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      config.name || `Simulation ${new Date().toISOString()}`,
      config.format,
      'running',
      config.totalBattles,
      config.concurrentWorkers || 1,
      new Date().toISOString()
    );

    this.currentSimulationId = result.lastInsertRowid as number;
    this.isRunning = true;
    this.isPaused = false;
    this.shouldStop = false;

    // Run simulation in background
    this.runSimulation(config).catch(error => {
      console.error('Simulation error:', error);
      this.updateSimulationStatus('stopped');
    });

    return this.currentSimulationId;
  }

  private async runSimulation(config: SimulationConfig): Promise<void> {
    if (!this.currentSimulationId) return;

    const teams = await Promise.all(
      config.teamIds.map(id => this.battleEngine.loadTeamFromDatabase(id))
    );

    const validTeams = teams.filter(t => t !== null) as TeamData[];

    if (validTeams.length < 2) {
      throw new Error('Need at least 2 valid teams to run simulation');
    }

    let battlesCompleted = 0;

    for (let i = 0; i < config.totalBattles; i++) {
      if (this.shouldStop) {
        this.updateSimulationStatus('stopped');
        break;
      }

      while (this.isPaused) {
        await this.sleep(100);
      }

      // Pick two random teams
      const team1 = validTeams[Math.floor(Math.random() * validTeams.length)];
      const team2 = validTeams[Math.floor(Math.random() * validTeams.length)];

      if (team1.id === team2.id) {
        // Don't battle the same team against itself
        continue;
      }

      try {
        const result = await this.battleEngine.runBattle(team1, team2, config.format);
        await this.battleEngine.saveBattleResult(
          this.currentSimulationId,
          team1.id,
          team2.id,
          result
        );

        battlesCompleted++;

        // Emit progress
        this.emitProgress({
          simulationId: this.currentSimulationId,
          completed: battlesCompleted,
          total: config.totalBattles,
          percentage: Math.round((battlesCompleted / config.totalBattles) * 100),
          status: 'running',
        });
      } catch (error) {
        console.error('Battle error:', error);
      }
    }

    if (!this.shouldStop) {
      this.updateSimulationStatus('completed');
      this.emitProgress({
        simulationId: this.currentSimulationId,
        completed: battlesCompleted,
        total: config.totalBattles,
        percentage: 100,
        status: 'completed',
      });
    }

    this.isRunning = false;
    this.currentSimulationId = null;
  }

  pause(): void {
    if (this.isRunning && !this.isPaused) {
      this.isPaused = true;
      this.updateSimulationStatus('paused');
    }
  }

  resume(): void {
    if (this.isRunning && this.isPaused) {
      this.isPaused = false;
      this.updateSimulationStatus('running');
    }
  }

  stop(): void {
    if (this.isRunning) {
      this.shouldStop = true;
      this.updateSimulationStatus('stopped');
      this.isRunning = false;
    }
  }

  private updateSimulationStatus(status: 'running' | 'paused' | 'completed' | 'stopped'): void {
    if (!this.currentSimulationId) return;

    const updates: any = { status };
    if (status === 'completed' || status === 'stopped') {
      updates.completed_at = new Date().toISOString();
    }

    const setClauses = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), this.currentSimulationId];

    this.db.prepare(`
      UPDATE simulations
      SET ${setClauses}
      WHERE id = ?
    `).run(...values);
  }

  private emitProgress(progress: SimulationProgress): void {
    this.emit('progress', progress);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getSimulationStatus(simulationId: number): any {
    return this.db.prepare('SELECT * FROM simulations WHERE id = ?').get(simulationId);
  }

  getAllSimulations(): any[] {
    return this.db.prepare('SELECT * FROM simulations ORDER BY created_at DESC').all();
  }

  getBattleResults(simulationId: number, limit: number = 100): any[] {
    return this.db.prepare(`
      SELECT * FROM battles
      WHERE simulation_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `).all(simulationId, limit);
  }

  getTeamStats(teamId: number): any {
    return this.db.prepare(`
      SELECT
        t.id,
        t.name,
        t.total_battles,
        t.wins,
        t.losses,
        t.win_rate
      FROM teams t
      WHERE t.id = ?
    `).get(teamId);
  }

  getAllTeamStats(): any[] {
    return this.db.prepare(`
      SELECT
        t.id,
        t.name,
        t.total_battles,
        t.wins,
        t.losses,
        t.win_rate
      FROM teams t
      WHERE t.total_battles > 0
      ORDER BY t.win_rate DESC, t.total_battles DESC
    `).all();
  }
}
