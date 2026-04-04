import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

// 1. Die Mini-Komponente für die einzelnen Spieler (jetzt ohne Team-Status!)
function PlayerEncounterRow({ player, route, pokemonList, runId, existingEncounter }) {
  const [encounterStatus, setEncounterStatus] = useState(existingEncounter?.status_encounter || '');
  const [pokemonId, setPokemonId] = useState(existingEncounter?.pokemon_id || '');
  const [nickname, setNickname] = useState(existingEncounter?.nickname || '');
  
  const [isSaved, setIsSaved] = useState(!!existingEncounter);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!encounterStatus) return alert("Was ist passiert?");
    setLoading(true);

    const encounterData = {
      run_id: runId,
      route_id: route.id,
      player_id: player.id,
      status_encounter: encounterStatus,
      status_team: encounterStatus === 'gefangen' ? (existingEncounter?.status_team || 'im_team') : null,
      pokemon_id: encounterStatus === 'gefangen' ? pokemonId : null,
      nickname: encounterStatus === 'gefangen' ? nickname : null
    };

    const { error } = await supabase
      .from('encounters')
      .upsert(encounterData, { onConflict: 'run_id, route_id, player_id' });

    if (error) {
      alert("Fehler beim Speichern!");
    } else {
      setIsSaved(true);
    }
    setLoading(false);
  };

  return (
    <div style={{ 
      display: 'flex', 
      gap: '12px', 
      padding: '12px', 
      backgroundColor: isSaved ? 'rgba(74, 222, 128, 0.05)' : 'rgba(15, 23, 42, 0.4)', 
      borderRadius: '12px', 
      flexWrap: 'wrap', 
      alignItems: 'center',
      border: isSaved ? '1px solid rgba(74, 222, 128, 0.3)' : '1px solid #334155',
      transition: 'all 0.3s ease'
    }}>
      
      {/* Spieler Name */}
      <div style={{ width: '100px', fontWeight: 'bold', color: isSaved ? '#4ade80' : '#94a3b8', fontSize: '0.9rem' }}>
        {player.name}
      </div>

      {/* Status Dropdown */}
      <select 
        value={encounterStatus}
        onChange={(e) => { setEncounterStatus(e.target.value); setIsSaved(false); }}
        style={{ 
          padding: '10px', 
          borderRadius: '8px', 
          background: '#0f172a', 
          color: 'white', 
          border: '1px solid #334155', 
          minWidth: '180px',
          outline: 'none'
        }}
      >
        <option value="">-- Ereignis --</option>
        <option value="gefangen">🟢 Gefangen</option>
        <option value="gekillt">🔴 Gekillt</option>
        <option value="pokemon_geflohen">💨 Geflohen (Pkmn)</option>
        <option value="spieler_geflohen">🏃 Geflohen (Ich)</option>
        <option value="spieler_besiegt">☠️ Wipe</option>
        <option value="keine_baelle">🎒 Keine Bälle</option>
      </select>

      {/* Pokémon & Nickname Felder */}
      {encounterStatus === 'gefangen' && (
        <div style={{ display: 'flex', gap: '10px', flex: 1, minWidth: '250px' }}>
          <select 
            value={pokemonId}
            onChange={(e) => { setPokemonId(e.target.value); setIsSaved(false); }}
            style={{ 
              padding: '10px', 
              borderRadius: '8px', 
              background: '#0f172a', 
              color: 'white', 
              border: '1px solid #334155', 
              flex: 1 
            }}
          >
            <option value="">-- Pokémon --</option>
            {pokemonList.map(p => <option key={p.id} value={p.id}>#{p.id} {p.name}</option>)}
          </select>

          <input 
            type="text" 
            placeholder="Spitzname" 
            value={nickname}
            onChange={(e) => { setNickname(e.target.value); setIsSaved(false); }}
            style={{ 
              padding: '10px', 
              borderRadius: '8px', 
              background: '#0f172a', 
              color: 'white', 
              border: '1px solid #334155', 
              flex: 1,
              outline: 'none'
            }}
          />
        </div>
      )}

      {/* Speichern Button */}
      <button 
        onClick={handleSave} 
        disabled={loading} 
        style={{ 
          padding: '10px 16px', 
          backgroundColor: isSaved ? 'transparent' : '#38bdf8', 
          color: isSaved ? '#4ade80' : '#0f172a', 
          border: isSaved ? '1px solid #4ade80' : 'none', 
          borderRadius: '8px', 
          cursor: 'pointer', 
          fontWeight: 'bold',
          fontSize: '0.85rem',
          minWidth: '100px'
        }}
      >
        {loading ? '...' : isSaved ? 'Bereit ✅' : 'Speichern'}
      </button>
    </div>
  );
}

// 2. Die Karte für die gesamte Route. Hier wird der Soul Link kontrolliert!
function RouteCard({ route, players, pokemonList, runId, encounters, onRefresh }) {
  const routeEncounters = encounters.filter(e => e.route_id === route.id);
  const caughtEncounters = routeEncounters.filter(e => e.status_encounter === 'gefangen');
  const hasCaught = caughtEncounters.length > 0;
  
  const currentLinkStatus = hasCaught ? (caughtEncounters[0].status_team || 'im_team') : 'im_team';

  const initialBlamedPlayer = routeEncounters.find(e => e.caused_death === true)?.player_id || '';
  
  const [linkStatus, setLinkStatus] = useState(currentLinkStatus);
  const [blamedPlayer, setBlamedPlayer] = useState(initialBlamedPlayer);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLinkStatus(currentLinkStatus);
    setBlamedPlayer(initialBlamedPlayer);
  }, [currentLinkStatus, initialBlamedPlayer]);

  const handleSaveLinkStatus = async () => {
    if (linkStatus === 'besiegt' && !blamedPlayer) {
      return alert("Wer hat den Link auf dem Gewissen?");
    }
    setLoading(true);
    const updates = caughtEncounters.map(enc => ({
      run_id: runId,
      route_id: route.id,
      player_id: enc.player_id,
      status_encounter: enc.status_encounter,
      pokemon_id: enc.pokemon_id,
      nickname: enc.nickname,
      status_team: linkStatus,
      caused_death: linkStatus === 'besiegt' ? (enc.player_id === blamedPlayer) : false
    }));

    const { error } = await supabase.from('encounters').upsert(updates, { onConflict: 'run_id, route_id, player_id' });
    if (error) {
      console.error(error);
      alert("Fehler beim Speichern!");
    } else {
      onRefresh(); 
    }
    setLoading(false);
  };

  const isDead = currentLinkStatus === 'besiegt';

  return (
    <div style={{ 
      background: isDead ? 'linear-gradient(145deg, #2d0a0a 0%, #1e293b 100%)' : '#1e293b', 
      borderRadius: '20px', 
      padding: '24px', 
      marginBottom: '24px', 
      border: isDead ? '2px solid #f43f5e' : '1px solid #334155',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      transition: 'all 0.3s ease'
    }}>
      
      {/* Header der Karte */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '1.4rem', color: isDead ? '#f43f5e' : '#38bdf8', letterSpacing: '0.5px' }}>
          {route.route_name}
        </h3>
        {isDead && (
          <span style={{ 
            background: '#f43f5e', 
            color: 'white', 
            padding: '4px 12px', 
            borderRadius: '20px', 
            fontSize: '0.75rem', 
            fontWeight: 'bold',
            textTransform: 'uppercase'
          }}>
            Gefallener Link
          </span>
        )}
      </div>
      
      {/* Spieler-Einträge */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {players.map((player) => {
          const existingEncounter = routeEncounters.find(e => e.player_id === player.id);
          return (
            <PlayerEncounterRow 
              key={player.id} 
              player={player} 
              route={route} 
              pokemonList={pokemonList} 
              runId={runId}
              existingEncounter={existingEncounter}
            />
          )
        })}
      </div>

      {/* Die Soul-Link Kontroll-Leiste (nur wenn Pokémon gefangen wurden) */}
      {hasCaught && (
        <div style={{ 
          marginTop: '24px', 
          padding: '16px', 
          background: 'rgba(15, 23, 42, 0.6)', 
          borderRadius: '12px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          gap: '15px', 
          flexWrap: 'wrap',
          border: '1px solid #334155'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
              Link Status
            </span>
            <select 
              value={linkStatus} 
              onChange={(e) => setLinkStatus(e.target.value)}
              style={{ 
                padding: '8px 12px', 
                borderRadius: '8px', 
                background: '#0f172a', 
                color: 'white', 
                border: '1px solid #334155',
                fontWeight: 'bold'
              }}
            >
              <option value="im_team">⚔️ Im Team</option>
              <option value="in_der_box">📦 In der Box</option>
              <option value="besiegt">💀 BESIEGT / TOT</option>
            </select>

            {linkStatus === 'besiegt' && (
              <select 
                value={blamedPlayer} 
                onChange={(e) => setBlamedPlayer(e.target.value)}
                style={{ 
                  padding: '8px 12px', 
                  borderRadius: '8px', 
                  background: '#450a0a', 
                  color: '#fca5a5', 
                  border: '1px solid #f43f5e' 
                }}
              >
                <option value="">-- Wer war schuld? --</option>
                {players.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            )}
          </div>

          <button 
            onClick={handleSaveLinkStatus} 
            disabled={loading}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: linkStatus === 'besiegt' ? '#f43f5e' : '#38bdf8', 
              color: '#0f172a', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer', 
              fontWeight: 'bold',
              fontSize: '0.9rem'
            }}
          >
            {loading ? '...' : 'Status anwenden'}
          </button>
        </div>
      )}
    </div>
  );
}

// 3. Das Haupt-Spielfeld
export default function ActiveRun() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [run, setRun] = useState(null);
  const [players, setPlayers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [pokemonList, setPokemonList] = useState([]);
  const [encounters, setEncounters] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSpielfeld = async () => {
    const { data: runData } = await supabase.from('runs').select('*').eq('id', id).single();
    setRun(runData);

    const { data: playerData } = await supabase.from('run_players').select('players(id, name)').eq('run_id', id);
    if (playerData) setPlayers(playerData.map(item => item.players));

    const { data: routeData } = await supabase.from('routes_master').select('*').eq('game_version', runData.game_version).order('route_order', { ascending: true });
    if (routeData) setRoutes(routeData);

    const { data: pkmnData } = await supabase.from('pokemon_master').select('*').order('id', { ascending: true });
    if (pkmnData) setPokemonList(pkmnData);

    const { data: encounterData } = await supabase.from('encounters').select('*').eq('run_id', id);
    if (encounterData) setEncounters(encounterData);

    setLoading(false);
  };

  const handleFinishRun = async () => {
    // 1. Grundsätzliche Abfrage
    const isWipe = window.confirm(
        "Ist der Run gescheitert (Wipe)? \n\n'OK' für JA (Schuldiger wird gesucht)\n'Abbrechen' für NEIN (Erfolgreich beendet)"
    );

    let blamedId = null;

    if (isWipe) {
        // 2. Wer war schuld? (Wir nutzen eine einfache Liste für den Prompt)
        const playerListText = players.map((p, index) => `${index + 1}: ${p.name}`).join('\n');
        const choice = window.prompt(
        `Wer hat den Run auf dem Gewissen? Gib die Nummer ein:\n\n${playerListText}`
        );

        const chosenIndex = parseInt(choice) - 1;
        if (players[chosenIndex]) {
        blamedId = players[chosenIndex].id;
        alert(`Oha, ${players[chosenIndex].name} wird als Sündenbock in die Geschichte eingehen...`);
        }
    }

    // 3. Update in der Datenbank
    const { error } = await supabase
        .from('runs')
        .update({ 
        is_completed: true,
        blamed_player_id: blamedId // Hier speichern wir die Schuld
        })
        .eq('id', id);

    if (error) {
        alert("Fehler: " + error.message);
    } else {
        fetchSpielfeld();
        alert(isWipe ? "Der Run wurde als gescheitert archiviert." : "Glückwunsch zum Sieg!");
    }
    };

  useEffect(() => {
    fetchSpielfeld();
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Lade Spielfeld...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Header Bereich */}
        <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '40px', 
        borderBottom: '1px solid #334155', 
        paddingBottom: '20px' 
        }}>
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '2rem', margin: 0, color: '#f1f5f9' }}>{run.name}</h1>
            {run.is_completed && (
                <span style={{ 
                background: 'rgba(148, 163, 184, 0.1)', 
                color: '#dd2238ff', 
                padding: '4px 12px', 
                borderRadius: '20px', 
                fontSize: '0.7rem', 
                fontWeight: 'bold', 
                border: '1px solid #334155',
                textTransform: 'uppercase'
                }}>
                Mission failed
                </span>
            )}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '6px' }}>
            <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{run.game_version}</span> 
            <span style={{ margin: '0 10px', opacity: 0.3 }}>|</span>
            Squad: {players.map(p => p.name).join(' & ')}
            </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
            {/* Button erscheint nur, wenn der Run noch läuft */}
            {!run.is_completed && (
            <button 
                onClick={handleFinishRun}
                style={{ 
                background: 'rgba(148, 163, 184, 0.1)', 
                color: '#dd2238ff', 
                border: '1px solid #334155', 
                padding: '10px 20px', 
                borderRadius: '10px', 
                cursor: 'pointer', 
                fontWeight: 'bold',
                transition: '0.2s'
                }}
            >
                Run verloren
            </button>
            )}
            <button 
            onClick={() => navigate('/dashboard')} 
            style={{ 
                background: '#1e293b', 
                color: '#94a3b8', 
                border: '1px solid #334155', 
                padding: '10px 20px', 
                borderRadius: '10px', 
                cursor: 'pointer' 
            }}
            >
            Zurück
            </button>
        </div>
        </header>

        {/* Sektion für die Routen */}
        <div>
        <h2 style={{ 
            fontSize: '1.2rem', 
            color: '#f1f5f9', 
            marginBottom: '20px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px' 
        }}>
            <span style={{ width: '4px', height: '20px', background: '#38bdf8', borderRadius: '2px' }}></span>
            Routen & Begegnungen
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {routes.map((route) => (
            <RouteCard 
                key={route.id}
                route={route}
                players={players}
                pokemonList={pokemonList}
                runId={run.id}
                encounters={encounters}
                onRefresh={fetchSpielfeld}
            />
            ))}
        </div>
        </div>
    </div>
    );
}