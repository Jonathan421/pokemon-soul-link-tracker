import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import RouteCard from '../components/RouteCard';
import RouteOverlay from '../components/RouteOverlay';
import RunStats from '../components/RunStats';
import EndRunModal from '../components/EndRunModal';

export default function ActiveRun() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({ run: null, players: [], routes: [], pokemon: [], encounters: [] });
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEndModal, setShowEndModal] = useState(false);
  
  // NEU: State für den Toggle-Switch
  const [hideLostRoutes, setHideLostRoutes] = useState(false);

  const fetchSpielfeld = async () => {
    const { data: run } = await supabase.from('runs').select('*').eq('id', id).single();
    const { data: pData } = await supabase.from('run_players').select('players(id, name)').eq('run_id', id);
    const { data: routes } = await supabase.from('routes_master').select('*').eq('game_version', run.game_version).order('route_order');
    const { data: pkmn } = await supabase.from('pokemon_master').select('*').order('id');
    const { data: encs } = await supabase.from('encounters').select('*').eq('run_id', id);
    
    setData({ run, players: pData.map(i => i.players), routes, pokemon: pkmn, encounters: encs });
    setLoading(false);
  };

  useEffect(() => { fetchSpielfeld(); }, [id]);

  if (loading) {
    return (
      <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#38bdf8', fontSize: '1.2rem', fontWeight: 'bold' }}>
        Lade Hub...
      </div>
    );
  }

  // NEU: Logik, um die sichtbaren Routen zu filtern
  const visibleRoutes = data.routes.filter(route => {
    if (!hideLostRoutes) return true; // Wenn Schalter aus, zeige alle
    
    // Prüfe, ob die Route verloren ist (irgendein Spieler hat Status "verloren" oder Link ist "besiegt")
    const routeEncounters = data.encounters.filter(e => e.route_id === route.id);
    const isLost = routeEncounters.some(e => e.status_encounter === 'verloren' || e.status_team === 'besiegt');
    
    return !isLost; // Behalte die Route nur, wenn sie NICHT verloren ist
  });

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh', paddingBottom: '100px' }}>
      
      {/* HEADER */}
      <header style={{ 
        background: '#1e293b', 
        paddingTop: 'calc(15px + env(safe-area-inset-top))', 
        paddingBottom: '15px',
        paddingLeft: '40px',
        paddingRight: '40px',
        borderBottom: '1px solid #334155', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        position: 'sticky', 
        top: 0, 
        zIndex: 100 
      }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <img src="/pokeball.png" alt="Pokéball Logo" style={{ width: '50px', height: '50px', objectFit: 'contain', filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.2))' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <h1 style={{ margin: 0, color: '#f1f5f9', fontSize: '1.5rem', fontWeight: '900', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{data.run?.name}</h1>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#38bdf8' }}>Unsere Helden:</span> {data.players.map(p => p.name).join(', ')}
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '15px' }}>
          {/* NEU: Run beenden Button (Nur anzeigen, wenn Run noch nicht beendet ist) */}
          {!data.run?.is_completed && (
            <button 
              onClick={() => setShowEndModal(true)} 
              style={{ background: 'rgba(239, 68, 68, 0.1)', border: '2px solid #ef4444', color: '#ef4444', padding: '10px 18px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s ease', textTransform: 'uppercase', letterSpacing: '0.5px' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = '#ef4444'; }}
            >
              Run beenden
            </button>
          )}

          <button 
            onClick={() => navigate('/dashboard')} 
            style={{ background: 'transparent', border: '2px solid #334155', color: '#f1f5f9', padding: '10px 18px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s ease', textTransform: 'uppercase', letterSpacing: '0.5px' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#38bdf8'; e.currentTarget.style.color = '#38bdf8'; e.currentTarget.style.background = 'rgba(56, 189, 248, 0.05)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.color = '#f1f5f9'; e.currentTarget.style.background = 'transparent'; }}
          >
            Dashboard
          </button>
        </div>
      </header>

      {/* NEU: Das Status-Banner, wenn der Run vorbei ist */}
      {data.run?.is_completed && (
        <div style={{ 
          background: data.run.run_result === 'won' ? 'linear-gradient(135deg, #ca8a04, #eab308)' : 'linear-gradient(135deg, #991b1b, #ef4444)', 
          padding: '20px', 
          textAlign: 'center', 
          color: '#fff', 
          fontWeight: '900', 
          fontSize: '1.2rem', 
          letterSpacing: '1px',
          textTransform: 'uppercase',
          boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
        }}>
          {data.run.run_result === 'won' 
            ? '🏆 IHR HABT DEN SOULLINK GEWONNEN! HERZLICHEN GLÜCKWUNSCH! 🏆' 
            : `WIPE OUT! ${data.players.find(p => p.id === data.run.blamed_player_id)?.name || 'Jemand'} hat den Run auf dem Gewissen!`
          }
        </div>
      )}

      {/* CONTENT BEREICH */}
      <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
        
        <RunStats players={data.players} encounters={data.encounters} />

        {/* NEU: Toolbar für Routen & Filter */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '0 5px' }}>
          <h2 style={{ margin: 0, color: '#f1f5f9', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Routen ({visibleRoutes.length})
          </h2>

          {/* Der Toggle-Switch */}
          <div 
            onClick={() => setHideLostRoutes(!hideLostRoutes)}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          >
            <span style={{ 
              color: hideLostRoutes ? '#f1f5f9' : '#94a3b8', 
              fontSize: '0.85rem', 
              fontWeight: 'bold', 
              transition: 'color 0.3s' 
            }}>
              Verlorene ausblenden
            </span>
            <div style={{
              width: '44px', height: '24px', 
              background: hideLostRoutes ? '#38bdf8' : '#334155',
              borderRadius: '20px', 
              position: 'relative', 
              transition: 'background 0.3s',
              boxShadow: hideLostRoutes ? '0 0 10px rgba(56, 189, 248, 0.3)' : 'none'
            }}>
              <div style={{
                width: '18px', height: '18px', 
                background: '#ffffff', 
                borderRadius: '50%',
                position: 'absolute', 
                top: '3px', 
                left: hideLostRoutes ? '23px' : '3px', 
                transition: 'left 0.3s ease-in-out',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }} />
            </div>
          </div>
        </div>

        {/* DAS GRID (Nutzt jetzt visibleRoutes statt data.routes) */}
        {visibleRoutes.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
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
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '1.1rem', fontWeight: 'bold' }}>
            Alle sichtbaren Routen wurden gefiltert! 🪦
          </div>
        )}
      </div>

      {/* OVERLAY */}
      {selectedRoute && (
        <RouteOverlay 
          route={selectedRoute} 
          players={data.players} 
          pokemonList={data.pokemon} 
          runId={data.run.id} 
          encounters={data.encounters} 
          onClose={() => setSelectedRoute(null)} 
          onRefresh={fetchSpielfeld}
        />
      )}

      {/* END RUN MODAL */}
      {showEndModal && (
        <EndRunModal 
          runId={data.run.id} 
          players={data.players} 
          onClose={() => setShowEndModal(false)} 
          onRefresh={fetchSpielfeld} 
        />
      )}

    </div>
  );
}