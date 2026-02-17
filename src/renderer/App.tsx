import React, { useState } from 'react';
import { TeamBuilder } from './components/TeamBuilder';
import { TeamGenerator } from './components/TeamGenerator';
import { SimulationRunner } from './components/SimulationRunner';
import { ResultsDashboard } from './components/ResultsDashboard';
import { PokemonAnalytics } from './components/PokemonAnalytics';
import { Settings } from './components/Settings';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState('home');

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 text-2xl font-bold border-b border-gray-700">
          Pokemon Battle Simulator
        </div>
        <nav className="flex-1 p-4">
          <button
            onClick={() => setActivePage('home')}
            className={`w-full text-left p-3 rounded mb-2 ${
              activePage === 'home' ? 'bg-blue-600' : 'hover:bg-gray-800'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setActivePage('team-builder')}
            className={`w-full text-left p-3 rounded mb-2 ${
              activePage === 'team-builder' ? 'bg-blue-600' : 'hover:bg-gray-800'
            }`}
          >
            Team Builder
          </button>
          <button
            onClick={() => setActivePage('team-generator')}
            className={`w-full text-left p-3 rounded mb-2 ${
              activePage === 'team-generator' ? 'bg-blue-600' : 'hover:bg-gray-800'
            }`}
          >
            Team Generator
          </button>
          <button
            onClick={() => setActivePage('simulation')}
            className={`w-full text-left p-3 rounded mb-2 ${
              activePage === 'simulation' ? 'bg-blue-600' : 'hover:bg-gray-800'
            }`}
          >
            Run Battles
          </button>
          <button
            onClick={() => setActivePage('results')}
            className={`w-full text-left p-3 rounded mb-2 ${
              activePage === 'results' ? 'bg-blue-600' : 'hover:bg-gray-800'
            }`}
          >
            Results
          </button>
          <button
            onClick={() => setActivePage('pokemon-analytics')}
            className={`w-full text-left p-3 rounded mb-2 ${
              activePage === 'pokemon-analytics' ? 'bg-blue-600' : 'hover:bg-gray-800'
            }`}
          >
            Pokemon Stats
          </button>
          <button
            onClick={() => setActivePage('settings')}
            className={`w-full text-left p-3 rounded mb-2 ${
              activePage === 'settings' ? 'bg-blue-600' : 'hover:bg-gray-800'
            }`}
          >
            Settings
          </button>
        </nav>
        <div className="p-4 border-t border-gray-700 text-sm text-gray-400">
          Status: Ready | Format: VGC 2025
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow p-4">
          <h1 className="text-2xl font-bold text-gray-800">
            {activePage === 'home' && 'Welcome'}
            {activePage === 'team-builder' && 'Team Builder'}
            {activePage === 'team-generator' && 'Team Generator'}
            {activePage === 'simulation' && 'Battle Simulation'}
            {activePage === 'results' && 'Results Dashboard'}
            {activePage === 'pokemon-analytics' && 'Pokemon Statistics'}
            {activePage === 'settings' && 'Settings'}
          </h1>
        </header>
        <main className="flex-1 overflow-auto p-6">
          {activePage === 'home' && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="flex items-center gap-6 mb-6">
                  <img
                    src="poke://sprites/static/25.png"
                    alt="Pikachu"
                    className="w-32 h-32"
                  />
                  <img
                    src="poke://sprites/static/6.png"
                    alt="Charizard"
                    className="w-32 h-32"
                  />
                  <img
                    src="poke://sprites/static/9.png"
                    alt="Blastoise"
                    className="w-32 h-32"
                  />
                  <img
                    src="poke://sprites/static/3.png"
                    alt="Venusaur"
                    className="w-32 h-32"
                  />
                </div>
                <h2 className="text-3xl font-bold mb-4">Pokemon Battle Simulator</h2>
                <p className="text-gray-600 mb-6">
                  Welcome to the Pokemon Battle Simulator! Build teams, run battles, and analyze results with AI-powered predictions.
                </p>
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-bold text-blue-800 mb-2">Team Builder</h3>
                    <p className="text-sm text-gray-600">Create custom teams with IVs, EVs, movesets, and items.</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <h3 className="font-bold text-green-800 mb-2">Battle Simulator</h3>
                    <p className="text-sm text-gray-600">Run simulations using the @pkmn/sim battle engine.</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h3 className="font-bold text-purple-800 mb-2">AI Analytics</h3>
                    <p className="text-sm text-gray-600">Track win rates and effectiveness over time.</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <h3 className="font-bold text-orange-800 mb-2">Pokemon Stats</h3>
                    <p className="text-sm text-gray-600">View detailed statistics and base stats.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activePage === 'team-builder' && (
            <TeamBuilder />
          )}
          {activePage === 'team-generator' && (
            <TeamGenerator />
          )}
          {activePage === 'simulation' && (
            <SimulationRunner />
          )}
          {activePage === 'results' && (
            <ResultsDashboard />
          )}
          {activePage === 'pokemon-analytics' && (
            <PokemonAnalytics />
          )}
          {activePage === 'settings' && (
            <Settings />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
