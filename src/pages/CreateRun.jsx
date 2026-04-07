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

  // Gemeinsames Styling für Inputs und Selects
  const inputStyles = {
    width: '100%', 
    padding: '16px', 
    borderRadius: '12px', 
    border: '2px solid #334155', 
    background: '#0f172a', 
    color: '#f1f5f9', 
    fontSize: '1.05rem',
    fontWeight: '600',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.2s ease'
  };

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh', padding: '40px 20px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
      <div style={{ 
        width: '100%',
        maxWidth: '600px',
        background: '#1e293b', 
        padding: '40px', 
        borderRadius: '24px', 
        border: '1px solid #334155',
        boxShadow: '0 20px 50px rgba(0,0,0,0.4)' 
      }}>
        
        {/* HEADER MIT DISMISS BUTTON */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: '2rem',
            background: 'linear-gradient(to right, #38bdf8, #818cf8)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Neues Abenteuer
          </h1>
          <button 
            onClick={() => navigate('/dashboard')} 
            style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '1.8rem', cursor: 'pointer', padding: '0', lineHeight: '1', transition: 'color 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#f1f5f9'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* RUN NAME */}
          <div>
            <label style={{ color: '#94a3b8', display: 'block', marginBottom: '10px', fontSize: '0.85rem', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase' }}>Name des Runs</label>
            <input 
              type="text" 
              placeholder="z.B. Nuzlocke Extrem"
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              style={inputStyles} 
            />
          </div>

          {/* EDITION */}
          <div>
            <label style={{ color: '#94a3b8', display: 'block', marginBottom: '10px', fontSize: '0.85rem', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase' }}>Edition wählen</label>
            <div style={{ position: 'relative' }}>
              <select 
                value={gameVersion} 
                onChange={(e) => setGameVersion(e.target.value)} 
                style={{ 
                  ...inputStyles,
                  cursor: 'pointer',
                  appearance: 'none', // Entfernt Standard-Pfeil
                  paddingRight: '40px' // Platz für neuen Pfeil
                }}
              >
                <option value="Platin">💎 Pokémon Platin</option>
                <option value="HeartGold">🔥 HeartGold</option>
                <option value="SoulSilver">🌊 SoulSilver</option>
                <option value="Schwarz">🌑 Schwarz</option>
                <option value="Weiss">⚪ Weiss</option>
              </select>
              {/* Custom Pfeil für das Select-Feld */}
              <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none', fontSize: '0.8rem' }}>
                ▼
              </div>
            </div>
          </div>

          {/* SPIELER AUSWAHL */}
          <div>
            <label style={{ color: '#94a3b8', display: 'block', marginBottom: '15px', fontSize: '0.85rem', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase' }}>Teilnehmer auswählen</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              {players.map(player => (
                <div 
                  key={player.id}
                  onClick={() => handleTogglePlayer(player.id)}
                  style={{ 
                    padding: '14px', 
                    borderRadius: '12px', 
                    border: '2px solid',
                    borderColor: selectedPlayers.includes(player.id) ? '#38bdf8' : '#334155',
                    background: selectedPlayers.includes(player.id) ? 'rgba(56, 189, 248, 0.1)' : '#0f172a',
                    color: selectedPlayers.includes(player.id) ? '#38bdf8' : '#f1f5f9',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s',
                    fontWeight: selectedPlayers.includes(player.id) ? '900' : '600'
                  }}
                >
                  {player.name}
                </div>
              ))}
            </div>

            {/* NEUEN SPIELER HINZUFÜGEN */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <input 
                type="text" 
                placeholder="Neuer Spieler..."
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                style={{ ...inputStyles, flex: 1, padding: '14px' }}
              />
              <button 
                type="button"
                onClick={handleCreatePlayer}
                style={{ 
                  padding: '0 20px', 
                  borderRadius: '12px', 
                  border: 'none', 
                  background: '#334155', 
                  color: '#f1f5f9', 
                  fontWeight: '900', 
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#475569'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#334155'}
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
              borderRadius: '16px', 
              border: 'none', 
              fontSize: '1.2rem', 
              fontWeight: '900', 
              cursor: 'pointer',
              marginTop: '10px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              boxShadow: '0 10px 25px rgba(56, 189, 248, 0.4)',
              transition: 'transform 0.2s, filter 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.filter = 'brightness(1.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.filter = 'brightness(1)'; }}
          >
            {loading ? 'Wird erstellt...' : 'Challenge starten'}
          </button>
        </form>
      </div>
    </div>
  );
}