import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import RouteCard from '../components/RouteCard';
import RouteOverlay from '../components/RouteOverlay';
import RunStats from '../components/RunStats'; // <-- NEU: Import hinzugefügt

export default function ActiveRun() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({ run: null, players: [], routes: [], pokemon: [], encounters: [] });
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [loading, setLoading] = useState(true);

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
        
        {/* Linke Seite: Logo, Run Name & Teilnehmer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <img 
            src="/pokeball.png" 
            alt="Pokéball Logo" 
            style={{ 
              width: '50px', 
              height: '50px', 
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.2))'
            }} 
          />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <h1 style={{ 
              margin: 0, 
              color: '#f1f5f9', 
              fontSize: '1.5rem', 
              fontWeight: '900', 
              letterSpacing: '0.5px', 
              textTransform: 'uppercase' 
            }}>
              {data.run?.name}
            </h1>
            
            <div style={{ 
              color: '#94a3b8',
              fontSize: '0.85rem', 
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{ color: '#38bdf8' }}>Unsere Helden:</span> 
              {data.players.map(p => p.name).join(', ')}
            </div>
          </div>
        </div>
        
        {/* Rechte Seite: Dashboard Button */}
        <button 
          onClick={() => navigate('/dashboard')} 
          style={{ 
            background: 'transparent', 
            border: '2px solid #334155', 
            color: '#f1f5f9', 
            padding: '10px 18px',
            borderRadius: '10px',
            fontWeight: 'bold', 
            cursor: 'pointer',
            fontSize: '0.85rem',
            transition: 'all 0.2s ease',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
          onMouseEnter={(e) => { 
            e.currentTarget.style.borderColor = '#38bdf8'; 
            e.currentTarget.style.color = '#38bdf8'; 
            e.currentTarget.style.background = 'rgba(56, 189, 248, 0.05)';
          }}
          onMouseLeave={(e) => { 
            e.currentTarget.style.borderColor = '#334155'; 
            e.currentTarget.style.color = '#f1f5f9'; 
            e.currentTarget.style.background = 'transparent';
          }}
        >
          Dashboard
        </button>
      </header>

      {/* CONTENT BEREICH */}
      <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
        
        {/* NEU: Die ausgelagerte Stats-Komponente */}
        <RunStats players={data.players} encounters={data.encounters} />

        {/* DAS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {data.routes.map(route => (
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
    </div>
  );
}