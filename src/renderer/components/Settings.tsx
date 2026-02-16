import React, { useState, useEffect } from 'react';

export const Settings: React.FC = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>('');
  const [pokemonCount, setPokemonCount] = useState(0);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetStatus, setResetStatus] = useState<string>('');

  useEffect(() => {
    checkPokemonData();
  }, []);

  const checkPokemonData = async () => {
    try {
      const result: any = await window.electronAPI.getPokemon();
      if (result && typeof result === 'object' && 'success' in result && result.success) {
        setPokemonCount(result.pokemon.length);
      }
    } catch (error) {
      console.error('Failed to check Pokemon data:', error);
    }
  };

  const syncData = async () => {
    setIsSyncing(true);
    setSyncStatus('Syncing Pokemon data from PokeAPI...');

    try {
      const result = await window.electronAPI.syncData();
      if (result.success) {
        setSyncStatus(`Successfully synced ${result.report.pokemon} Pokemon!`);
        await checkPokemonData();
      } else {
        setSyncStatus(`Error: ${result.error}`);
      }
    } catch (error) {
      setSyncStatus('Failed to sync data');
      console.error('Sync error:', error);
    }

    setIsSyncing(false);
  };

  const handleResetData = async () => {
    setIsResetting(true);
    setResetStatus('Resetting all battle data...');

    try {
      const result = await window.electronAPI.resetAllData();
      if (result.success) {
        setResetStatus('All battle data has been successfully reset!');
        setShowResetConfirm(false);
      } else {
        setResetStatus(`Error: ${result.error}`);
      }
    } catch (error) {
      setResetStatus('Failed to reset data');
      console.error('Reset error:', error);
    }

    setIsResetting(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* App Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Application Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <div className="font-semibold">Application Version</div>
              <div className="text-sm text-gray-600">Pokemon Battle Simulator v1.0.0</div>
            </div>
          </div>
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <div className="font-semibold">Pokemon Data</div>
              <div className="text-sm text-gray-600">{pokemonCount} Pokemon loaded</div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">Data Management</h3>
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold mb-2">Pokemon Database</h4>
            <p className="text-sm text-gray-600 mb-3">
              Sync the latest Pokemon data from PokeAPI. This includes stats, types, abilities, and moves.
            </p>
            <button
              onClick={syncData}
              disabled={isSyncing}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300"
            >
              {isSyncing ? 'Syncing...' : 'Sync Pokemon Data'}
            </button>
            {syncStatus && (
              <div className={`mt-3 p-3 rounded ${
                syncStatus.includes('Error') || syncStatus.includes('Failed')
                  ? 'bg-red-50 text-red-800'
                  : 'bg-green-50 text-green-800'
              }`}>
                {syncStatus}
              </div>
            )}
          </div>

          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-2 text-red-600">Reset Battle Data</h4>
            <p className="text-sm text-gray-600 mb-3">
              Delete all battle simulations, logs, and team statistics. This will NOT delete your teams or Pokemon data.
              Use this when you want to start fresh with new simulations.
            </p>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700"
            >
              Reset All Battle Data
            </button>
            {resetStatus && (
              <div className={`mt-3 p-3 rounded ${
                resetStatus.includes('Error') || resetStatus.includes('Failed')
                  ? 'bg-red-50 text-red-800'
                  : 'bg-green-50 text-green-800'
              }`}>
                {resetStatus}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4 text-red-600">Confirm Data Reset</h3>
            <p className="text-gray-700 mb-4">
              Are you sure you want to reset all battle data? This will permanently delete:
            </p>
            <ul className="list-disc list-inside mb-6 text-gray-600 space-y-1">
              <li>All battle simulations</li>
              <li>All battle logs and results</li>
              <li>All team win/loss statistics</li>
              <li>All Pokemon usage statistics</li>
            </ul>
            <p className="text-sm text-gray-500 mb-6 italic">
              Your teams and Pokemon data will NOT be deleted. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                disabled={isResetting}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleResetData}
                disabled={isResetting}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-300"
              >
                {isResetting ? 'Resetting...' : 'Yes, Reset All Data'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Battle Formats */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">Battle Formats</h3>
        <div className="space-y-3">
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold">VGC 2024 Regulation G</h4>
            <p className="text-sm text-gray-600">Official Video Game Championships format</p>
            <div className="mt-2 text-xs text-gray-500">
              Format ID: gen9vgc2024regg • Doubles • Level 50
            </div>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold">VGC 2025 Regulation G</h4>
            <p className="text-sm text-gray-600">Latest VGC format for 2025</p>
            <div className="mt-2 text-xs text-gray-500">
              Format ID: gen9vgc2025regg • Doubles • Level 50
            </div>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold">Smogon Doubles OU</h4>
            <p className="text-sm text-gray-600">Smogon community doubles overused tier</p>
            <div className="mt-2 text-xs text-gray-500">
              Format ID: gen9doublesou • Doubles • Level 100
            </div>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold">Battle Stadium Doubles</h4>
            <p className="text-sm text-gray-600">Ranked Battle Stadium format</p>
            <div className="mt-2 text-xs text-gray-500">
              Format ID: gen9battlestadiumdoubles • Doubles • Level 50
            </div>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">About</h3>
        <div className="text-sm text-gray-600 space-y-2">
          <p>
            Pokemon Battle Simulator is an advanced tool for testing and analyzing Pokemon teams
            through automated battle simulations.
          </p>
          <p>
            Features include:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Full team builder with EV/IV customization</li>
            <li>Automated battle simulation using @pkmn/sim</li>
            <li>Comprehensive analytics and statistics</li>
            <li>Support for multiple battle formats</li>
            <li>Performance tracking and win rate analysis</li>
          </ul>
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-gray-500">
              Powered by @pkmn/sim, @pkmn/dex, and @smogon/calc
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
