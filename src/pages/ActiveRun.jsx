// src/pages/ActiveRun.jsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useActiveRun } from '../hooks/useActiveRun';
import RouteCard from '../components/RouteCard';
import RouteOverlay from '../components/RouteOverlay';
import RunStats from '../components/RunStats';
import EndRunModal from '../components/EndRunModal';

export default function ActiveRun() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, error, refresh, getRoutesByMilestone, getUngroupedRoutes } = useActiveRun(id);

  const [selectedRoute, setSelectedRoute] = useState(null);
  const [showEndModal, setShowEndModal] = useState(false);
  const [hideLostRoutes, setHideLostRoutes] = useState(false);

  // State, um zu tracken, welche Milestones aufgeklappt sind
  const [expandedMilestones, setExpandedMilestones] = useState({});

  if (loading) {
    return (
      <div style={{ background: 'transparent', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#38bdf8', fontSize: '1.2rem', fontWeight: 'bold' }}>
        Lade Spielfeld...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: 'transparent', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#ef4444', fontSize: '1.2rem', fontWeight: 'bold' }}>
        Fehler: {error}
      </div>
    );
  }

  // Filter-Logik
  const filterRoutes = (routes) => {
    return routes.filter(route => {
      if (!hideLostRoutes) return true;
      const routeEncounters = data.encounters.filter(e => e.route_id === route.id);
      const isLost = routeEncounters.some(e => e.status_encounter === 'verloren' || e.status_team === 'besiegt');
      return !isLost;
    });
  };

  // Hilfsfunktion: Berechnet die Farbe für die kleinen Status-Boxen
  const getRouteColor = (route) => {
    const routeEncounters = data.encounters.filter(e => e.route_id === route.id);
    const isDead = routeEncounters[0]?.status_team === 'besiegt';
    const isComplete = routeEncounters.length === data.players.length &&
      routeEncounters.every(e => e.status_encounter !== '');

    if (isDead) return '#ef4444'; // Rot (Wipe)
    if (isComplete) return '#22c55e'; // Grün (Abgeschlossen)
    if (routeEncounters.length > 0) return '#0ea5e9'; // Blau (In Bearbeitung)
    return '#475569'; // Dunkelgrau (Noch unberührt)
  };

  const toggleMilestone = (milestoneId) => {
    setExpandedMilestones(prev => {
      // Wir prüfen, ob es aktuell offen ist (Standard ist jetzt offen, also alles außer "false")
      const isCurrentlyExpanded = prev[milestoneId] !== false;
      return {
        ...prev,
        [milestoneId]: !isCurrentlyExpanded
      };
    });
  };

  // Hilfskomponente zum Rendern einer Route-Liste
  const renderRouteGrid = (routes) => {
    const visibleRoutes = filterRoutes(routes);
    if (visibleRoutes.length === 0) {
      return <div style={{ color: '#64748b', fontStyle: 'italic', padding: '10px 0' }}>Keine sichtbaren Routen in diesem Abschnitt.</div>;
    }
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', paddingBottom: '20px' }}>
        {visibleRoutes.map(route => (
          <RouteCard
            key={route.id}
            route={route}
            players={data.players}
            pokemonList={data.pokemon}
            encounters={data.encounters}
            onOpen={() => setSelectedRoute(route)}
          />
        ))}
      </div>
    );
  };

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', paddingBottom: '100px' }}>
      {/* HEADER (Unverändert) */}
      <header style={{ background: '#1e293b', paddingTop: 'calc(15px + env(safe-area-inset-top))', paddingBottom: '15px', paddingLeft: '40px', paddingRight: '40px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <img src="/pokeball.png" alt="Pokéball" style={{ width: '50px', height: '50px', objectFit: 'contain', filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.2))' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <h1 style={{ margin: 0, color: '#f1f5f9', fontSize: '1.5rem', fontWeight: '900', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{data.run?.name}</h1>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#38bdf8' }}>Unsere Helden:</span> {data.players.map(p => p.name).join(', ')}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          {!data.run?.is_completed && (
            <button onClick={() => setShowEndModal(true)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '2px solid #ef4444', color: '#ef4444', padding: '10px 18px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s ease', textTransform: 'uppercase', letterSpacing: '0.5px' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = '#ef4444'; }}>
              Run beenden
            </button>
          )}
          <button onClick={() => navigate('/dashboard')} style={{ background: 'transparent', border: '2px solid #334155', color: '#f1f5f9', padding: '10px 18px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s ease', textTransform: 'uppercase', letterSpacing: '0.5px' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#38bdf8'; e.currentTarget.style.color = '#38bdf8'; e.currentTarget.style.background = 'rgba(56, 189, 248, 0.05)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.color = '#f1f5f9'; e.currentTarget.style.background = 'transparent'; }}>
            Dashboard
          </button>
        </div>
      </header>

      {data.run?.is_completed && (
        <div style={{ background: data.run.result_status === 'won' ? 'linear-gradient(135deg, #ca8a04, #eab308)' : 'linear-gradient(135deg, #991b1b, #ef4444)', padding: '20px', textAlign: 'center', color: '#fff', fontWeight: '900', fontSize: '1.2rem', letterSpacing: '1px', textTransform: 'uppercase', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}>
          {data.run.result_status === 'won' ? '🏆 IHR HABT DEN SOULLINK GEWONNEN! 🏆' : `WIPE OUT! ${data.players.find(p => p.id === data.run.caused_wipeout_id)?.name || 'Jemand'} hat den Run auf dem Gewissen!`}
        </div>
      )}

      <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
        <RunStats players={data.players} encounters={data.encounters} />

        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '30px', padding: '0 5px' }}>
          {/* Der Toggle-Switch */}
          <div onClick={() => setHideLostRoutes(!hideLostRoutes)} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <span style={{ color: hideLostRoutes ? '#f1f5f9' : '#94a3b8', fontSize: '0.85rem', fontWeight: 'bold', transition: 'color 0.3s' }}>
              Verlorene ausblenden
            </span>
            <div style={{ width: '44px', height: '24px', background: hideLostRoutes ? '#38bdf8' : '#334155', borderRadius: '20px', position: 'relative', transition: 'background 0.3s', boxShadow: hideLostRoutes ? '0 0 10px rgba(56, 189, 248, 0.3)' : 'none' }}>
              <div style={{ width: '18px', height: '18px', background: '#ffffff', borderRadius: '50%', position: 'absolute', top: '3px', left: hideLostRoutes ? '23px' : '3px', transition: 'left 0.3s ease-in-out', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
            </div>
          </div>
        </div>

        {/* MILESTONE ACCORDIONS */}
        {data.milestones.map(milestone => {
          const mRoutes = getRoutesByMilestone(milestone.id);
          const isExpanded = expandedMilestones[milestone.id] !== false;

          return (
            <div
              key={milestone.id}
              style={{
                marginBottom: '15px',
                // ÄNDERUNG: background auf transparent gesetzt und border komplett entfernt
                background: 'transparent',
                borderRadius: '12px',
                overflow: 'hidden'
              }}
            >
              {/* ACCORDION HEADER */}
              <div
                onClick={() => toggleMilestone(milestone.id)}
                style={{
                  padding: '15px 20px',
                  display: 'grid',
                  // 3 feste Spalten: Titel (mind. 180px oder 30%), Boxen (restlicher Platz), Pfeil (20px)
                  gridTemplateColumns: 'minmax(180px, 30%) 1fr 20px',
                  alignItems: 'center',
                  gap: '15px',
                  cursor: 'pointer',
                  background: isExpanded ? 'rgba(30, 41, 59, 0.5)' : 'transparent',
                  transition: 'background 0.2s',
                  borderRadius: isExpanded ? '12px 12px 0 0' : '12px'
                }}
              >
                {/* Spalte 1: Bild & Titel */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  {milestone.image_url && (
                    <img src={milestone.image_url} alt={milestone.name} style={{ height: '30px', width: 'auto', objectFit: 'contain', display: 'block' }} />
                  )}
                  <h3 style={{ margin: 0, color: '#f1f5f9', fontSize: '1.2rem', letterSpacing: '1px' }}>
                    {milestone.name}
                  </h3>
                </div>

                {/* Spalte 2: Die Status-Boxen & Routen-Anzahl */}
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {mRoutes.map(route => (
                    <div
                      key={route.id}
                      title={route.route_name}
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '2px',
                        background: getRouteColor(route),
                        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                        transition: 'background 0.3s ease'
                      }}
                    />
                  ))}
                  <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 'bold', marginLeft: '8px' }}>
                    ({mRoutes.length})
                  </span>
                </div>

                {/* Spalte 3: Pfeil */}
                <div style={{ color: '#38bdf8', fontSize: '1.2rem', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s', textAlign: 'right' }}>
                  ▼
                </div>
              </div>

              {/* ACCORDION BODY (Die Routen-Karten) */}
              {isExpanded && (
                <div
                  style={{
                    padding: '20px 0', // padding links/rechts auf 0, damit die Karten bündig abschließen
                    // ÄNDERUNG: borderTop komplett entfernt und Hintergrund auf transparent
                    background: 'transparent'
                  }}
                >
                  {renderRouteGrid(mRoutes)}
                </div>
              )}
            </div>
          );
        })}

        {/* UNGROUPED ROUTES (Falls du Routen hast, die noch keinem Orden zugeordnet sind) */}
        {getUngroupedRoutes().length > 0 && (
          <div style={{ marginTop: '30px' }}>
            <h3 style={{ color: '#94a3b8', fontSize: '1rem', textTransform: 'uppercase', marginBottom: '15px' }}>Weitere Gebiete</h3>
            {renderRouteGrid(getUngroupedRoutes())}
          </div>
        )}

      </div>

      {selectedRoute && (
        <RouteOverlay route={selectedRoute} players={data.players} pokemonList={data.pokemon} runId={data.run.id} encounters={data.encounters} onClose={() => setSelectedRoute(null)} onRefresh={refresh} />
      )}

      {showEndModal && (
        <EndRunModal runId={data.run.id} players={data.players} onClose={() => setShowEndModal(false)} onRefresh={refresh} />
      )}
    </div>
  );
}