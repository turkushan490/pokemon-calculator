# Pokemon Battle Simulator - Project Structure Guide

## 📁 Root Directory Structure

```
poke-calculator/
├── 📂 public/                  # Static assets served by webpack
│   └── 📂 sprites/            # Pokemon sprite images
│       ├── 📂 animated/       # Animated GIF sprites (649 files)
│       └── 📂 static/         # Static PNG sprites (1025 files)
│
├── 📂 src/                    # Source code
│   ├── 📂 main/              # Electron main process (Node.js)
│   │   ├── 📂 data/          # Data fetching & synchronization
│   │   │   ├── PokeAPIClient.ts     # Fetches Pokemon data from PokeAPI
│   │   │   └── DataSync.ts          # Syncs data to local database
│   │   │
│   │   ├── 📂 database/      # SQLite database layer
│   │   │   ├── schema.ts            # Database schema & initialization
│   │   │   └── 📂 repositories/     # Data access layer
│   │   │       ├── PokemonRepository.ts  # Pokemon CRUD operations
│   │   │       └── TeamRepository.ts     # Team CRUD operations
│   │   │
│   │   ├── 📂 simulation/    # Battle simulation engine
│   │   │   └── SimulationManager.ts      # Manages battle simulations
│   │   │
│   │   ├── 📂 ipc/           # Inter-Process Communication
│   │   │   └── handlers.ts           # IPC message handlers
│   │   │
│   │   ├── index.ts          # Main process entry point
│   │   └── preload.ts        # Preload script (bridge between main & renderer)
│   │
│   └── 📂 renderer/          # Frontend (React app)
│       ├── 📂 components/    # React UI components
│       │   ├── App.tsx                   # Main app component & routing
│       │   ├── Dashboard.tsx             # Home dashboard
│       │   ├── TeamBuilder.tsx           # Team creation interface
│       │   ├── PokemonAnalytics.tsx      # Pokemon statistics viewer
│       │   ├── BattleSimulator.tsx       # Battle simulation UI
│       │   ├── ResultsDashboard.tsx      # Results & analytics
│       │   ├── Settings.tsx              # App settings
│       │   ├── TeamDetailsModal.tsx      # Team details popup
│       │   └── BattleLogViewer.tsx       # Battle log viewer
│       │
│       ├── 📂 utils/         # Utility functions
│       │   └── sprites.ts            # Sprite path helpers
│       │
│       ├── index.tsx         # React app entry point
│       ├── index.html        # HTML template
│       └── styles.css        # Global styles (Tailwind CSS)
│
├── 📂 scripts/               # Build & utility scripts
│   └── download-sprites.js   # Downloads Pokemon sprites
│
├── 📂 .webpack/             # Webpack build output (auto-generated)
│   ├── 📂 main/             # Compiled main process
│   └── 📂 renderer/         # Compiled renderer process
│       └── 📂 main_window/
│           └── 📂 sprites/  # Copied sprite assets
│
├── 📄 package.json          # Node.js dependencies & scripts
├── 📄 tsconfig.json         # TypeScript configuration
├── 📄 tailwind.config.js    # Tailwind CSS configuration
├── 📄 webpack.main.config.js      # Webpack config for main process
├── 📄 webpack.renderer.config.js  # Webpack config for renderer
├── 📄 forge.config.js       # Electron Forge configuration
└── 📄 PROJECT_STRUCTURE.md  # This file

```

## 🔄 Data Flow

### 1. **Pokemon Data Sync**
```
PokeAPI → PokeAPIClient.ts → DataSync.ts → SQLite Database
```

### 2. **User Creates Team**
```
TeamBuilder.tsx → IPC → handlers.ts → TeamRepository.ts → Database
```

### 3. **Battle Simulation**
```
BattleSimulator.tsx → IPC → SimulationManager.ts → @pkmn/sim → Database
```

### 4. **View Results**
```
ResultsDashboard.tsx → IPC → handlers.ts → Database → Display Stats
```

## 🗂️ Key Files Explained

### **Main Process (Backend - Node.js)**

| File | Purpose |
|------|---------|
| `src/main/index.ts` | Electron app initialization, window creation |
| `src/main/preload.ts` | Security bridge between main & renderer |
| `src/main/ipc/handlers.ts` | Handles all IPC requests from frontend |
| `src/main/database/schema.ts` | Defines database tables & structure |
| `src/main/simulation/SimulationManager.ts` | Runs Pokemon battles using @pkmn/sim |
| `src/main/data/DataSync.ts` | Downloads Pokemon data from PokeAPI |

### **Renderer Process (Frontend - React)**

| File | Purpose |
|------|---------|
| `src/renderer/App.tsx` | Main navigation & page routing |
| `src/renderer/components/TeamBuilder.tsx` | UI for building Pokemon teams |
| `src/renderer/components/PokemonAnalytics.tsx` | Shows Pokemon win rates & stats |
| `src/renderer/components/BattleSimulator.tsx` | Configure & run battle simulations |
| `src/renderer/components/ResultsDashboard.tsx` | View battle results & analytics |

### **Configuration Files**

| File | Purpose |
|------|---------|
| `package.json` | Defines dependencies, scripts, project metadata |
| `tsconfig.json` | TypeScript compiler settings |
| `webpack.*.config.js` | Build configuration for main & renderer |
| `tailwind.config.js` | Tailwind CSS styling configuration |
| `forge.config.js` | Electron Forge packaging settings |

## 🎨 UI Components Architecture

```
App.tsx (Router)
├── Dashboard.tsx (Home)
├── TeamBuilder.tsx
│   └── Uses: TeamDetailsModal.tsx
├── PokemonAnalytics.tsx
├── BattleSimulator.tsx
├── ResultsDashboard.tsx
│   ├── Uses: TeamDetailsModal.tsx
│   └── Uses: BattleLogViewer.tsx
└── Settings.tsx
```

## 🗄️ Database Schema

### **Tables:**
1. **pokemon_species** - Base Pokemon data (stats, types, abilities)
2. **teams** - User-created teams
3. **team_members** - Pokemon in teams (IVs, EVs, moves)
4. **simulations** - Battle simulation records
5. **battles** - Individual battle results
6. **battle_logs** - Turn-by-turn battle logs

## 🚀 Build Process

### Development:
```bash
npm start
```
1. Webpack compiles TypeScript → JavaScript
2. Copies `public/` assets to `.webpack/renderer/main_window/`
3. Launches Electron with hot reload

### Production:
```bash
npm run package  # Creates distributable package
npm run make     # Creates installer (.exe, .dmg, etc.)
```

## 📦 Key Dependencies

### Backend:
- **electron** - Desktop app framework
- **better-sqlite3** - Local database
- **@pkmn/sim** - Pokemon battle simulation
- **@pkmn/dex** - Pokemon data/dex
- **axios** - HTTP requests to PokeAPI

### Frontend:
- **react** - UI framework
- **tailwindcss** - CSS styling
- **recharts** - Charts & graphs
- **zustand** - State management

## 🔧 Common Tasks

### Add a new Pokemon data field:
1. Update `src/main/database/schema.ts` (add column)
2. Update `src/main/data/DataSync.ts` (sync new field)
3. Update TypeScript interfaces in components

### Add a new UI page:
1. Create component in `src/renderer/components/`
2. Add route in `src/renderer/App.tsx`

### Add new IPC communication:
1. Add handler in `src/main/ipc/handlers.ts`
2. Add method in `src/main/preload.ts`
3. Call from renderer component

## 📸 Sprite System

### Available Sprite Formats:
1. **animated** - Gen 5 Black/White animated GIFs (649 Pokemon)
2. **static** - Default static PNG sprites (1025 Pokemon)
3. **official-artwork** - High-quality official artwork PNG (best for showcasing)
4. **home** - Modern Pokemon Home style sprites
5. **showdown** - Pokemon Showdown competitive battle sprites (animated)
6. **shiny** - Shiny variant sprites
7. **shiny-home** - Shiny variants in Pokemon Home style

### Downloading Sprites:
```bash
# Download default formats (animated + static)
npm run download-sprites

# Download specific formats
npm run download-sprites -- official-artwork home showdown

# Download all shiny variants
npm run download-sprites -- shiny shiny-home
```

### Sprite Loading Priority:
1. `/sprites/animated/{dex_number}.gif` (if exists)
2. `/sprites/static/{dex_number}.png` (fallback)
3. GitHub CDN (final fallback)

### Adding New Sprite Formats:
Edit `scripts/download-sprites.js` and add to the `SPRITE_FORMATS` object.

## 🎯 Improved Project Organization

### ✅ Completed Modularization:

The project now has a clean, modular structure with functions separated into logical modules:

#### **1. Shared Types** (`/src/shared/types/`)
- `pokemon.ts` - All TypeScript interfaces shared between main and renderer
  - Pokemon, Team, TeamMember, Battle, Simulation interfaces
  - Centralizes type definitions for better type safety

#### **2. Renderer Services** (`/src/renderer/services/`)
- `pokemonApi.ts` - Centralized API/IPC communication layer
  - `getAllPokemon()` - Fetch all Pokemon
  - `getPokemonWithRatings()` - Fetch Pokemon with battle stats
  - `createTeam()` - Create new team
  - `runSimulation()` - Run battle simulations
  - And more... (see file for full API)

#### **3. Renderer Utilities** (`/src/renderer/utils/`)
- `sprites.ts` - Sprite path generation and fallback handling
  - `getSpriteUrl()` - Get local sprite path
  - `getGitHubSpriteUrl()` - Get CDN fallback URL
  - `handleSpriteError()` - Automatic sprite fallback on error
  - Support for 7 different sprite formats

- `pokemon.ts` - Pokemon data helper functions
  - `getTotalEVs()` - Calculate total EVs
  - `formatWinRate()` - Format win rate as percentage
  - `getRankingBadge()` - Get ranking badge (gold/silver/bronze)
  - `TYPE_COLORS` - Pokemon type color schemes

### Benefits of This Structure:
- **Reusability**: Shared utilities across all components
- **Type Safety**: Centralized type definitions
- **Maintainability**: Easy to find and update functionality
- **Testability**: Isolated functions are easier to test
- **Scalability**: Clean structure for future growth
