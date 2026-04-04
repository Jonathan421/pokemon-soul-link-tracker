import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

export default function CreateRun() {
  const [name, setName] = useState('');
  const [gameVersion, setGameVersion] = useState('Platin');
  const [players, setPlayers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    const { data } = await supabase.from('players').select('*').order('name');
    if (data) setPlayers(data);
  };

  const handleCreatePlayer = async (e) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;

    const { data, error } = await supabase
      .from('players')
      .insert([{ name: newPlayerName.trim() }])
      .select();

    if (error) {
      alert("Fehler beim Erstellen des Spielers: " + error.message);
    } else {
      setPlayers(prev => [...prev, data[0]].sort((a, b) => a.name.localeCompare(b.name)));
      setNewPlayerName('');
    }
  };

  const handleTogglePlayer = (id) => {
    setSelectedPlayers(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedPlayers.length < 2) return alert("Ein Soul Link braucht mindestens 2 Spieler!");
    setLoading(true);

    const { data: runData, error: runError } = await supabase
      .from('runs')
      .insert([{ name, game_version: gameVersion }])
      .select();

    if (runError) {
      alert(runError.message);
      setLoading(false);
      return;
    }

    const runId = runData[0].id;
    const playerInserts = selectedPlayers.map(playerId => ({
      run_id: runId,
      player_id: playerId
    }));

    const { error: linkError } = await supabase.from('run_players').insert(playerInserts);

    if (linkError) {
      alert(linkError.message);
    } else {
      navigate(`/run/${runId}`);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px' }}>
      <div style={{ 
        background: '#1e293b', 
        padding: '40px', 
        borderRadius: '24px', 
        border: '1px solid #334155',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)' 
      }}>
        <h1 style={{ 
          textAlign: 'center', 
          marginBottom: '40px', 
          fontSize: '2rem',
          background: 'linear-gradient(to right, #38bdf8, #818cf8)', 
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent' 
        }}>Neues Abenteuer</h1>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* RUN NAME */}
          <div>
            <label style={{ color: '#94a3b8', display: 'block', marginBottom: '10px', fontSize: '0.9rem', fontWeight: 'bold', letterSpacing: '1px' }}>NAME DES RUNS</label>
            <input 
              type="text" 
              placeholder="z.B. Nuzlocke Extrem"
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #334155', background: '#0f172a', color: 'white', fontSize: '1.1rem', boxSizing: 'border-box' }} 
            />
          </div>

          {/* EDITION - Jetzt schön groß */}
          <div>
            <label style={{ color: '#94a3b8', display: 'block', marginBottom: '10px', fontSize: '0.9rem', fontWeight: 'bold', letterSpacing: '1px' }}>EDITION WÄHLEN</label>
            <select 
              value={gameVersion} 
              onChange={(e) => setGameVersion(e.target.value)} 
              style={{ 
                width: '100%', 
                padding: '18px', 
                borderRadius: '12px', 
                border: '1px solid #334155', 
                background: '#0f172a', 
                color: 'white', 
                fontSize: '1.2rem', // Schön groß
                fontWeight: 'bold',
                cursor: 'pointer',
                appearance: 'none' // Entfernt Standard-Pfeil für cleaneren Look
              }}
            >
              <option value="Platin">💎 Pokémon Platin</option>
              <option value="HeartGold">🔥 HeartGold</option>
              <option value="SoulSilver">🌊 SoulSilver</option>
              <option value="Schwarz">🌑 Schwarz</option>
              <option value="Weiss">⚪ Weiss</option>
            </select>
          </div>

          {/* SPIELER AUSWAHL */}
          <div>
            <label style={{ color: '#94a3b8', display: 'block', marginBottom: '15px', fontSize: '0.9rem', fontWeight: 'bold', letterSpacing: '1px' }}>TEILNEHMER AUSWÄHLEN</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              {players.map(player => (
                <div 
                  key={player.id}
                  onClick={() => handleTogglePlayer(player.id)}
                  style={{ 
                    padding: '12px', 
                    borderRadius: '10px', 
                    border: '1px solid',
                    borderColor: selectedPlayers.includes(player.id) ? '#38bdf8' : '#334155',
                    background: selectedPlayers.includes(player.id) ? 'rgba(56, 189, 248, 0.1)' : '#0f172a',
                    color: selectedPlayers.includes(player.id) ? '#38bdf8' : '#f1f5f9',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s',
                    fontWeight: selectedPlayers.includes(player.id) ? 'bold' : 'normal'
                  }}
                >
                  {player.name}
                </div>
              ))}
            </div>

            {/* NEUEN SPIELER HINZUFÜGEN */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                placeholder="Neuer Spieler..."
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: 'transparent', color: 'white' }}
              />
              <button 
                type="button"
                onClick={handleCreatePlayer}
                style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #38bdf8', background: 'transparent', color: '#38bdf8', cursor: 'pointer' }}
              >
                Hinzufügen
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              background: 'linear-gradient(to right, #38bdf8, #818cf8)', 
              color: '#0f172a', 
              padding: '20px', 
              borderRadius: '15px', 
              border: 'none', 
              fontSize: '1.2rem', 
              fontWeight: 'bold', 
              cursor: 'pointer',
              marginTop: '10px' 
            }}
          >
            {loading ? 'Wird erstellt...' : 'CHALLENGE STARTEN'}
          </button>
        </form>
      </div>
    </div>
  );
}