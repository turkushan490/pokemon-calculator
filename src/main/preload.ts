import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Database operations
  createTeam: (team: any) => ipcRenderer.invoke('db:createTeam', team),
  getTeams: () => ipcRenderer.invoke('db:getTeams'),
  getTeam: (id: number) => ipcRenderer.invoke('db:getTeam', id),
  generateRandomTeam: (format: string) => ipcRenderer.invoke('db:generateRandomTeam', format),

  // Simulation operations
  startSimulation: (config: any) => ipcRenderer.invoke('simulation:start', config),
  pauseSimulation: () => ipcRenderer.invoke('simulation:pause'),
  resumeSimulation: () => ipcRenderer.invoke('simulation:resume'),
  stopSimulation: () => ipcRenderer.invoke('simulation:stop'),
  getSimulationStatus: (simulationId: number) => ipcRenderer.invoke('simulation:getStatus', simulationId),
  getAllSimulations: () => ipcRenderer.invoke('simulation:getAll'),
  getBattleResults: (simulationId: number, limit?: number) => ipcRenderer.invoke('simulation:getBattleResults', simulationId, limit),
  getTeamStats: (teamId?: number) => ipcRenderer.invoke('simulation:getTeamStats', teamId),
  getBattleLogs: (battleId: number) => ipcRenderer.invoke('simulation:getBattleLogs', battleId),

  // Progress updates
  onSimulationProgress: (callback: (progress: any) => void) => {
    ipcRenderer.on('simulation:progress', (_event, progress) => callback(progress));
  },

  // Pokemon data
  getPokemon: () => ipcRenderer.invoke('data:getPokemon'),
  getPokemonWithRatings: () => ipcRenderer.invoke('pokemon:getAllWithRatings'),
  searchPokemon: (query: string) => ipcRenderer.invoke('data:searchPokemon', query),
  getPokemonStats: (pokemonId: number) => ipcRenderer.invoke('pokemon:getStats', pokemonId),
  syncData: () => ipcRenderer.invoke('data:sync'),
  needsSync: () => ipcRenderer.invoke('data:needsSync'),
  resetAllData: () => ipcRenderer.invoke('data:resetAllData'),

  // Sync events
  onSyncStarted: (callback: () => void) => {
    ipcRenderer.on('sync:started', () => callback());
  },
  onSyncCompleted: (callback: (report: any) => void) => {
    ipcRenderer.on('sync:completed', (_event, report) => callback(report));
  },
});

// Type declaration for TypeScript
declare global {
  interface Window {
    electronAPI: {
      createTeam: (team: any) => Promise<any>;
      getTeams: () => Promise<any[]>;
      getTeam: (id: number) => Promise<any>;
      generateRandomTeam: (format: string) => Promise<any>;
      startSimulation: (config: any) => Promise<any>;
      pauseSimulation: () => Promise<any>;
      resumeSimulation: () => Promise<any>;
      stopSimulation: () => Promise<any>;
      getSimulationStatus: (simulationId: number) => Promise<any>;
      getAllSimulations: () => Promise<any>;
      getBattleResults: (simulationId: number, limit?: number) => Promise<any>;
      getTeamStats: (teamId?: number) => Promise<any>;
      getBattleLogs: (battleId: number) => Promise<any>;
      onSimulationProgress: (callback: (progress: any) => void) => void;
      getPokemon: () => Promise<any[]>;
      getPokemonWithRatings: () => Promise<any>;
      searchPokemon: (query: string) => Promise<any[]>;
      getPokemonStats: (pokemonId: number) => Promise<any>;
      syncData: () => Promise<any>;
      needsSync: () => Promise<any>;
      resetAllData: () => Promise<any>;
      onSyncStarted: (callback: () => void) => void;
      onSyncCompleted: (callback: (report: any) => void) => void;
    };
  }
}
