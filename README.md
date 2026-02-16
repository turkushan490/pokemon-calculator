# Pokemon Battle Simulator

A desktop application for building Pokemon teams, running battle simulations, and analyzing results. Built with Electron, React, and TypeScript.

## Features

- **Team Builder** - Create Pokemon teams with full customization (moves, abilities, items, natures, IVs/EVs, Tera types). Supports VGC 2025 Regulation G format.
- **Team Generator** - Generate random competitive teams with valid learnable moves, competitive items, and common EV spreads.
- **Battle Simulation** - Run bulk battle simulations (100+) with configurable settings. Pause, resume, and stop mid-run. Real-time progress tracking.
- **Results Dashboard** - View team win rates, battle history, and performance charts.
- **Pokemon Analytics** - Individual Pokemon win rates, usage stats, common moves, natures, and EV spreads.
- **Battle Log Viewer** - Turn-by-turn battle replay with moves, damage, effectiveness, and KOs.
- **Sprite System** - Animated GIF sprites (Gen 5 B&W, 649 Pokemon) with static PNG fallbacks (1025 Pokemon). 7 sprite format options.
- **AI Learning System** - Database infrastructure for tracking move effectiveness and generating battle predictions (in progress).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop Framework | Electron 39 |
| Frontend | React 19, TypeScript 5.9 |
| Styling | Tailwind CSS 4.1 |
| Charts | Recharts 3.5 |
| State Management | Zustand 5.0 |
| Database | SQLite (better-sqlite3) |
| Pokemon Data | @pkmn/dex, @pkmn/sim |
| Damage Calc | @smogon/calc |
| API Client | Axios (PokeAPI) |
| Build | Webpack 5, Electron Forge 7.10 |

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
npm install
```

### Run (Development)

```bash
npm start
```

### Download Sprites

```bash
npm run download-sprites
```

### Build

```bash
npm run package    # Create package
npm run make       # Create platform installer
```

## What's Working

- Full Electron app with IPC bridge and context isolation
- SQLite database with 10 tables (pokemon_species, teams, team_members, simulations, battles, battle_logs, move_effectiveness, ai_predictions, pokemon_ratings, formats)
- Team creation and management (manual builder + random generator)
- Battle simulation engine with type effectiveness, damage calculation, critical hits, switching
- Turn-by-turn battle logging
- Results dashboard with charts and statistics
- Pokemon analytics (win rates, usage stats)
- Battle log viewer
- Sprite system with animated/static fallback chain
- Data sync from PokeAPI on first launch
- Settings page

## Known Issues / TODO

- **No tests** - The test script is a placeholder (`echo "Error: no test specified"`). No test framework is set up.
- **AI predictions not implemented** - The database schema for move effectiveness and AI predictions is ready, but the actual prediction logic is not wired up yet.
- **Simplified battle engine** - The battle simulation uses a custom simplified engine rather than fully leveraging `@pkmn/sim` for accurate game mechanics.
- **Missing data layer** - `src/main/data/` (PokeAPIClient, DataSync) is referenced in documentation but the folder doesn't exist in the repo.
- **Backup file** - `src/renderer/App-backup.tsx` should be cleaned up.
- **No CI/CD** - No automated build/test pipeline.
- **Package metadata incomplete** - `author` field is empty in `package.json`.

## Project Structure

```
src/
  main/           # Electron main process
    database/     # SQLite schema and repositories
    simulation/   # BattleEngine, SimulationManager
    ipc/          # IPC request handlers
    index.ts      # App entry point
    preload.ts    # Secure IPC bridge
  renderer/       # React frontend
    components/   # UI components (TeamBuilder, SimulationRunner, etc.)
    services/     # IPC API wrapper
    utils/        # Sprite handling, Pokemon helpers
    styles/       # Global CSS
  shared/
    types/        # Shared TypeScript interfaces
public/
  sprites/        # Animated GIFs and static PNGs
scripts/          # Sprite download utility
```

See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for full details.

## Documentation

- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - Detailed project organization
- [AI_SYSTEM_README.md](AI_SYSTEM_README.md) - AI learning system design
- [SPRITE_GUIDE.md](SPRITE_GUIDE.md) - Sprite system documentation

## License

ISC
