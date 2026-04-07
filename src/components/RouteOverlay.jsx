import { useState } from 'react';
import { supabase } from '../supabase';
import PokemonSearch from './PokemonSearch';

export default function RouteOverlay({ route, players, pokemonList, runId, encounters, onClose, onRefresh }) {
  const routeEncounters = encounters.filter(e => e.route_id === route.id);
  
  const [localEncounters, setLocalEncounters] = useState(
    players.map(p => {
      const existing = routeEncounters.find(e => e.player_id === p.id);
      return {
        player_id: p.id,
        status_encounter: existing?.status_encounter || '',
        pokemon_id: existing?.pokemon_id || '',
        nickname: existing?.nickname || '',
      };
    })
  );

  const [saving, setSaving] = useState(false);

  const handleUpdatePlayer = (index, field, value) => {
    const updated = [...localEncounters];
    updated[index][field] = value;
    setLocalEncounters(updated);
  };

  const failedEncounter = localEncounters.find(e => e.status_encounter === 'verloren');
  const computedLinkStatus = failedEncounter ? 'besiegt' : 'im_team';
  const computedBlamedPlayer = failedEncounter ? failedEncounter.player_id : null;

  const handleResetRoute = async () => {
    if (window.confirm('⚠️ Willst du diese Route wirklich komplett zurücksetzen? Alle Einträge werden gelöscht!')) {
      setSaving(true);
      const { error } = await supabase
        .from('encounters')
        .delete()
        .match({ run_id: runId, route_id: route.id });

      if (!error) {
        onRefresh();
        onClose();
      } else {
        alert("Fehler beim Löschen!");
      }
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    
    const validEncounters = localEncounters.filter(enc => enc.pokemon_id || enc.status_encounter);
    
    const updates = validEncounters.map(enc => ({
      run_id: runId,
      route_id: route.id,
      player_id: enc.player_id,
      status_encounter: enc.status_encounter || 'ausgelassen', 
      pokemon_id: enc.pokemon_id || null, 
      nickname: enc.status_encounter === 'gefangen' ? enc.nickname : null,
      status_team: computedLinkStatus,
      caused_death: computedLinkStatus === 'besiegt' && enc.player_id === computedBlamedPlayer
    }));

    if (updates.length > 0) {
      const { error } = await supabase.from('encounters').upsert(updates, { onConflict: 'run_id, route_id, player_id' });
      if (error) alert("Fehler beim Speichern!");
    }
    
    onRefresh();
    onClose();
    setSaving(false);
  };

  return (
    <div style={{ 
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      backgroundColor: 'rgba(15, 23, 42, 0.85)', 
      display: 'flex', justifyContent: 'center', alignItems: 'center', 
      zIndex: 1000, padding: '20px' 
    }}>
      <div style={{ 
        backgroundColor: '#f8fafc', width: '100%', maxWidth: '600px', 
        borderRadius: '20px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        display: 'flex', flexDirection: 'column', maxHeight: '95vh'
      }}>
        
        {/* HEADER */}
        <div style={{ padding: '20px 25px', background: '#ffffff', borderBottom: '2px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', fontWeight: '900', textTransform: 'uppercase' }}>
              {route.route_name}
            </h2>
          </div>
          {/* NEU: Dismiss Button ohne Kreis */}
          <button 
            onClick={onClose} 
            style={{ 
              background: 'transparent', border: 'none', cursor: 'pointer', 
              color: '#94a3b8', fontSize: '1.4rem', fontWeight: 'bold', padding: '0 5px' 
            }}
          >
            ✕
          </button>
        </div>

        {/* INHALT (Spieler-Karten) */}
        <div style={{ padding: '25px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {localEncounters.map((enc, idx) => (
            <div key={enc.player_id} style={{ 
              background: '#ffffff', padding: '20px', borderRadius: '16px', 
              border: '1px solid #cbd5e1', boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
            }}>
              
              <div style={{ fontSize: '1rem', fontWeight: '900', color: '#1e293b', marginBottom: '15px' }}>
                {players[idx].name}
              </div>

              <div style={{ marginBottom: '15px' }}>
                <PokemonSearch pokemonList={pokemonList} selectedId={enc.pokemon_id} onSelect={(id) => handleUpdatePlayer(idx, 'pokemon_id', id)} />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginBottom: enc.status_encounter === 'gefangen' ? '15px' : '0' }}>
                <button 
                  onClick={() => handleUpdatePlayer(idx, 'status_encounter', 'gefangen')}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s', border: '2px solid #86efac', background: enc.status_encounter === 'gefangen' ? '#22c55e' : '#ffffff', color: enc.status_encounter === 'gefangen' ? '#ffffff' : '#166534' }}
                >Gefangen</button>
                <button 
                  onClick={() => handleUpdatePlayer(idx, 'status_encounter', 'verloren')}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s', border: '2px solid #fca5a5', background: enc.status_encounter === 'verloren' ? '#ef4444' : '#ffffff', color: enc.status_encounter === 'verloren' ? '#ffffff' : '#991b1b' }}
                >Verloren</button>
                <button 
                  onClick={() => handleUpdatePlayer(idx, 'status_encounter', 'ausgelassen')}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s', border: '2px solid #e2e8f0', background: enc.status_encounter === 'ausgelassen' || enc.status_encounter === '' ? '#cbd5e1' : '#ffffff', color: enc.status_encounter === 'ausgelassen' || enc.status_encounter === '' ? '#334155' : '#64748b' }}
                >Ausgelassen</button>
              </div>

              {enc.status_encounter === 'gefangen' && (
                <input 
                  placeholder="Spitzname eingeben..." 
                  value={enc.nickname} 
                  onChange={(e) => handleUpdatePlayer(idx, 'nickname', e.target.value)} 
                  style={{ 
                    width: '100%', padding: '12px 16px', borderRadius: '8px', 
                    border: '2px solid #e2e8f0', background: '#ffffff', color: '#334155', 
                    fontSize: '0.95rem', fontWeight: '600', outline: 'none', boxSizing: 'border-box'
                  }} 
                />
              )}
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div style={{ 
          padding: '20px 25px', background: '#ffffff', borderTop: '1px solid #cbd5e1', 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
        }}>
          
          {/* NEU: Reset Button (Gleich groß, Icon entfernt, Uppercase) */}
          <button 
             onClick={handleResetRoute} 
             disabled={saving} 
             style={{ 
               background: 'transparent', color: '#ef4444', 
               padding: '14px 28px', /* Gleiches Padding wie Speichern */
               borderRadius: '12px', /* Gleicher Radius */
               border: '2px solid #fca5a5', 
               fontWeight: '900', /* Gleiche Font-Weight */
               cursor: 'pointer', fontSize: '1rem', /* Gleiche Font-Size */
               textTransform: 'uppercase'
             }}
           >
            Route leeren
          </button>

          {/* Speichern Button */}
          <button 
             onClick={handleSaveAll} 
             disabled={saving} 
             style={{ 
               background: '#0ea5e9', color: '#ffffff', 
               padding: '14px 28px', 
               borderRadius: '12px', border: 'none', fontWeight: '900', 
               cursor: 'pointer', fontSize: '1rem', boxShadow: '0 4px 10px rgba(14, 165, 233, 0.3)'
             }}
           >
            {saving ? 'Speichert...' : 'SPEICHERN'}
          </button>
        </div>

      </div>
    </div>
  );
}