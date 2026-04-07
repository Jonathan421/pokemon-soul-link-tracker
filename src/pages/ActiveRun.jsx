import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import RouteCard from '../components/RouteCard';
import RouteOverlay from '../components/RouteOverlay';

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

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Lädt...</div>;

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <header style={{ background: '#fff', padding: '20px 40px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: '1.2rem' }}>{data.run?.name} HUB</h1>
        <button onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer', background: 'none', border: 'none', fontWeight: 'bold' }}>Dashboard</button>
      </header>

      <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
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