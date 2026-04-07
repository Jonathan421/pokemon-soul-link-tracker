// src/pages/CreateRun.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateRun } from '../hooks/useCreateRun';

export default function CreateRun() {
  const [name, setName] = useState('');
  // Wir speichern jetzt die ID, nicht den Text! 
  // Initial ist es leer, wir setzen es gleich über den useEffect.
  const [selectedGameId, setSelectedGameId] = useState('');

  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  // Unser Hook liefert die Spiele (games) direkt aus der Datenbank!
  const { games, players, loading, error, addPlayer, createRun } = useCreateRun();

  // Setze das erste Spiel in der Liste als Standard-Auswahl
  useEffect(() => {
    if (games.length > 0 && !selectedGameId) {
      setSelectedGameId(games[0].id);
    }
  }, [games, selectedGameId]);

  const handleCreatePlayer = async (e) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;

    const success = await addPlayer(newPlayerName.trim());
    if (success) setNewPlayerName('');
  };

  const handleTogglePlayer = (id) => {
    setSelectedPlayers(prev =>
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedPlayers.length < 2) return alert("Ein Soul Link braucht mindestens 2 Spieler!");
    if (!selectedGameId) return alert("Bitte wähle eine Edition aus!");

    setIsSubmitting(true);

    try {
      // Wir übergeben jetzt die ID des Spiels!
      const newRunId = await createRun(name, selectedGameId, selectedPlayers);
      navigate(`/run/${newRunId}`);
    } catch (err) {
      alert("Fehler beim Erstellen: " + err.message);
      setIsSubmitting(false);
    }
  };

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

  if (loading) return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Lade...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center', marginTop: '50px' }}>{error}</div>;

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh', padding: '40px 20px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
      <div style={{ width: '100%', maxWidth: '600px', background: '#1e293b', padding: '40px', borderRadius: '24px', border: '1px solid #334155', boxShadow: '0 20px 50px rgba(0,0,0,0.4)' }}>

        {/* HEADER MIT DISMISS BUTTON */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <h1 style={{ margin: 0, fontSize: '2rem', background: 'linear-gradient(to right, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textTransform: 'uppercase', letterSpacing: '1px' }}>
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

          {/* EDITION (Dynamisch aus der Datenbank) */}
          <div>
            <label style={{ color: '#94a3b8', display: 'block', marginBottom: '10px', fontSize: '0.85rem', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase' }}>Edition wählen</label>
            <div style={{ position: 'relative' }}>
              <select
                value={selectedGameId}
                onChange={(e) => setSelectedGameId(e.target.value)}
                style={{ ...inputStyles, cursor: 'pointer', appearance: 'none', paddingRight: '40px' }}
              >
                {games.map(game => (
                  <option key={game.id} value={game.id}>
                    {game.title}
                  </option>
                ))}
              </select>
              <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none', fontSize: '0.8rem' }}>▼</div>
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
                    padding: '14px', borderRadius: '12px', border: '2px solid',
                    borderColor: selectedPlayers.includes(player.id) ? '#38bdf8' : '#334155',
                    background: selectedPlayers.includes(player.id) ? 'rgba(56, 189, 248, 0.1)' : '#0f172a',
                    color: selectedPlayers.includes(player.id) ? '#38bdf8' : '#f1f5f9',
                    cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
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
                style={{ padding: '0 20px', borderRadius: '12px', border: 'none', background: '#334155', color: '#f1f5f9', fontWeight: '900', cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#475569'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#334155'}
              >
                Hinzufügen
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              background: 'linear-gradient(to right, #38bdf8, #818cf8)', color: '#0f172a', padding: '20px', borderRadius: '16px', border: 'none', fontSize: '1.2rem', fontWeight: '900', cursor: 'pointer', marginTop: '10px', textTransform: 'uppercase', letterSpacing: '1px', boxShadow: '0 10px 25px rgba(56, 189, 248, 0.4)', transition: 'transform 0.2s, filter 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.filter = 'brightness(1.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.filter = 'brightness(1)'; }}
          >
            {isSubmitting ? 'Wird erstellt...' : 'Challenge starten'}
          </button>
        </form>
      </div>
    </div>
  );
}