export default function RouteCard({ route, players, pokemonList, encounters, onOpen }) {
  const routeEncounters = encounters.filter(e => e.route_id === route.id);
  const currentLinkStatus = routeEncounters[0]?.status_team || 'im_team';
  const isDead = currentLinkStatus === 'besiegt';
  
  const isComplete = routeEncounters.length === players.length && 
                     routeEncounters.every(e => e.status_encounter !== '');

  // --- DEIN FIXIERTES FARBSCHEMA ---
  let styles = {
    bg: '#f8fafc',
    border: '#cbd5e1',
    headerBg: '#e2e8f0',
    accent: '#64748b'
  };

  if (isDead) {
    styles = { bg: '#fee2e2', border: '#f87171', headerBg: '#ef4444', accent: '#991b1b' };
  } else if (isComplete) {
    styles = { bg: '#dcfce7', border: '#4ade80', headerBg: '#22c55e', accent: '#14532d' };
  } else if (routeEncounters.length > 0) {
    styles = { bg: '#e0f2fe', border: '#38bdf8', headerBg: '#0ea5e9', accent: '#0c4a6e' };
  }

  return (
    <div 
      onClick={onOpen} 
      style={{ 
        background: styles.bg, 
        borderRadius: '16px', 
        overflow: 'hidden',
        cursor: 'pointer', 
        border: `2px solid ${styles.border}`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        transition: 'all 0.2s ease-in-out'
      }} 
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'} 
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      {/* HEADER */}
      <div style={{ 
        background: styles.headerBg, 
        padding: '10px 15px', 
        borderBottom: `1px solid ${styles.border}`
      }}>
        <h3 style={{ 
          margin: 0, 
          fontSize: '0.9rem', 
          fontWeight: '900', 
          color: isDead || isComplete || routeEncounters.length > 0 ? '#fff' : '#475569',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {route.route_name}
        </h3>
      </div>

      {/* TABELLEN-INHALT */}
      <div style={{ padding: '8px 15px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <tbody>
            {players.map(p => {
              const enc = routeEncounters.find(e => e.player_id === p.id);
              const pkmn = pokemonList.find(pk => String(pk.id) === String(enc?.pokemon_id));
              const isCauser = isDead && enc?.caused_death;
              const isKilled = enc?.status_encounter === 'verloren';

              return (
                <tr 
                  key={p.id} 
                  style={{ 
                    height: '52px', 
                    position: 'relative' // Wichtig: Damit der Strich weiß, wo "oben" ist
                  }}
                >
                  {/* Spalte 1: Name + Roter Strich Anker */}
                  <td style={{ 
                    fontSize: '0.85rem', 
                    fontWeight: '800', 
                    color: '#1e293b',
                    width: '30%',
                    textDecoration: isCauser ? 'line-through' : 'none',
                    whiteSpace: 'nowrap',
                    position: 'relative' // Lokaler Anker für den Strich
                  }}>
                    {p.name}

                    {/* DER ROTE STRICH: Er liegt jetzt IN der ersten Zelle, spannt sich aber über die Breite der TR */}
                    {isKilled && (
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: 0,
                        width: '333%', // Erstreckt sich über ca. 3 Spalten (grob kalkuliert)
                        height: '2px',
                        backgroundColor: '#ef4444',
                        transform: 'translateY(-50%)',
                        zIndex: 10,
                        pointerEvents: 'none',
                        borderRadius: '2px'
                      }} />
                    )}
                  </td>

                  {/* Spalte 2: Pokemon Bild */}
                  <td style={{ width: '50px', textAlign: 'right', paddingRight: '8px', position: 'relative', zIndex: 1 }}>
                    {enc?.pokemon_id ? (
                      <img 
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pkmn?.id}.png`} 
                        style={{ 
                          width: '42px', height: '42px', display: 'inline-block', verticalAlign: 'middle',
                          // NEU: Wenn es NICHT gefangen wurde, wird das Bild grau und transparent!
                          filter: enc.status_encounter !== 'gefangen' ? 'grayscale(100%) opacity(50%)' : 'none'
                        }} 
                        alt="" 
                      />
                    ) : (
                      <div style={{ 
                        width: '34px', height: '34px', border: `2px dashed ${styles.accent}`, 
                        borderRadius: '8px', display: 'inline-block', verticalAlign: 'middle', opacity: 0.4
                      }}></div>
                    )}
                  </td>

                  {/* Spalte 3: Spitzname / Status */}
                  <td style={{ 
                    fontSize: '0.8rem', 
                    color: '#334155', 
                    fontWeight: '600',
                    textAlign: 'left'
                  }}>
                    {enc?.status_encounter === 'gefangen' ? (
                      <span style={{ whiteSpace: 'nowrap' }}>{enc.nickname || pkmn?.name}</span>
                    ) : (
                      <span style={{ 
                        fontSize: '0.7rem', 
                        fontStyle: 'italic', 
                        color: styles.accent,
                        opacity: 0.7 
                      }}>
                        {enc ? enc.status_encounter.replace('_', ' ') : 'offen'}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}