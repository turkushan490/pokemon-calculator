import { app, BrowserWindow, protocol, net } from 'electron';
import path from 'path';
import fs from 'fs';
import { pathToFileURL } from 'url';
import { DatabaseSchema } from './database/schema';
import { TeamRepository } from './database/repositories/TeamRepository';
import { PokemonRepository } from './database/repositories/PokemonRepository';
import { CacheManager } from './data/CacheManager';
import { PokeAPIClient } from './data/PokeAPIClient';
import { DataSync } from './data/DataSync';
import { SimulationManager } from './simulation/SimulationManager';
import { setupIPCHandlers } from './ipc/handlers';

// Register custom protocol for serving local sprites (must be before app.ready)
protocol.registerSchemesAsPrivileged([
  { scheme: 'poke', privileges: { standard: true, secure: true, supportFetchAPI: true } }
]);

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;
let dbSchema: DatabaseSchema;
let teamRepo: TeamRepository;
let pokemonRepo: PokemonRepository;
let dataSync: DataSync;
let simulationManager: SimulationManager;

const initializeApp = async (): Promise<void> => {
  // Initialize database
  dbSchema = new DatabaseSchema();
  const db = dbSchema.getDatabase();

  // Initialize repositories
  teamRepo = new TeamRepository(db);
  pokemonRepo = new PokemonRepository(db);

  // Initialize data sync
  const cache = new CacheManager();
  const apiClient = new PokeAPIClient(cache);
  dataSync = new DataSync(apiClient, dbSchema);

  // Initialize simulation manager
  simulationManager = new SimulationManager(db);

  // Setup IPC handlers
  setupIPCHandlers(teamRepo, pokemonRepo, dataSync, simulationManager);

  // Check if we need to sync data
  const needsSync = await dataSync.needsUpdate();
  if (needsSync) {
    console.log('First launch detected, syncing Pokemon data...');
    mainWindow?.webContents.send('sync:started');
    const report = await dataSync.syncAllData();
    console.log('Sync complete:', report);
    mainWindow?.webContents.send('sync:completed', report);
  }
};

const createWindow = async (): Promise<void> => {
  // Initialize app first
  await initializeApp();

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Load the index.html of the app.
  if (MAIN_WINDOW_WEBPACK_ENTRY) {
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  }

  // Open DevTools in development
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

// Serve local sprite files via custom 'poke' protocol
app.whenReady().then(() => {
  protocol.handle('poke', (request) => {
    const url = new URL(request.url);
    // poke://sprites/animated/25.gif
    // URL structure: hostname = 'sprites', pathname = '/animated/25.gif'
    const requestPath = url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname;

    // In production, use resources path; in dev, use webpack output path
    let spritesPath: string;

    if (app.isPackaged) {
      // Production: sprites are in the app's resources folder
      spritesPath = path.join(process.resourcesPath, 'sprites');
    } else {
      // Development: __dirname is .webpack/main, go up to .webpack then to renderer/main_window/sprites
      spritesPath = path.join(__dirname, '..', 'renderer', 'main_window', 'sprites');
    }

    const filePath = path.join(spritesPath, requestPath);

    console.log('[poke://] Request:', request.url, '-> File path:', filePath);

    if (fs.existsSync(filePath)) {
      console.log('[poke://] Serving file:', filePath);
      return net.fetch(pathToFileURL(filePath).href);
    }
    console.log('[poke://] File not found:', filePath);
    return new Response('Not found', { status: 404 });
  });

  createWindow();
});

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
