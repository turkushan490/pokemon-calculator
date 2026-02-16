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
                <h2 className="text-3xl font-bold mb-4">Pokemon Battle Simulator</h2>
                <p className="text-gray-600 mb-6">
                  Welcome to the Pokemon Battle Simulator!
                </p>
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
