import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

export default function Stats() {
  const [stats, setStats] = useState({ players: [], totalWipes: 0, globalLosses: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGlobalStats();
  }, []);

  const fetchGlobalStats = async () => {
    // 1. Alle Spieler holen
    const { data: players } = await supabase.from('players').select('*');
    
    // 2. Alle Encounters holen, um Verluste zu zählen
    const { data: encounters } = await supabase.from('encounters').select('*');
    
    // 3. Alle Runs holen für die Full-Wipe Statistik
    const { data: runs } = await supabase.from('runs').select('*');

    const playerStats = players.map(p => {
      const pEncs = encounters.filter(e => e.player_id === p.id);
      return {
        name: p.name,
        killed: pEncs.filter(e => e.status_encounter === 'gekillt').length,
        escaped: pEncs.filter(e => e.status_encounter === 'pokemon_geflohen' || e.status_encounter === 'keine_baelle').length,
        causedDeaths: encounters.filter(e => e.caused_death === true && e.player_id === p.id).length,
        fullWipes: runs.filter(r => r.blamed_player_id === p.id).length
      };
    });

    setStats({
      players: playerStats.sort((a, b) => b.causedDeaths - a.causedDeaths),
      totalWipes: runs.filter(r => r.blamed_player_id !== null).length,
      globalLosses: encounters.filter(e => e.status_team === 'besiegt').length / 2 // Geteilt durch 2, da Soul Link Paare
    });
    setLoading(false);
  };

  if (loading) return <div style={{ color: '#94a3b8', textAlign: 'center', padding: '50px' }}>BERECHNE SCHULD...</div>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2rem', background: 'linear-gradient(to right, #f43f5e, #fb7185)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Hall of Shame</h1>
        <button onClick={() => navigate('/dashboard')} style={{ background: '#1e293b', color: '#94a3b8', border: '1px solid #334155', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer' }}>Zurück</button>
      </header>

      {/* Globale Counter */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
        <div style={{ background: '#1e293b', padding: '30px', borderRadius: '20px', border: '1px solid #334155', textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px' }}>Zerbrochene Links (Gesamt)</div>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#f43f5e' }}>{stats.globalLosses}</div>
        </div>
        <div style={{ background: '#1e293b', padding: '30px', borderRadius: '20px', border: '1px solid #334155', textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px' }}>Total Wipe Outs</div>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#ef4444', textShadow: '0 0 20px rgba(239, 68, 68, 0.3)' }}>{stats.totalWipes}</div>
        </div>
      </div>

      {/* Spieler Detail Tabelle */}
      <div style={{ background: '#1e293b', borderRadius: '20px', border: '1px solid #334155', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#0f172a', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '20px', textAlign: 'left' }}>Spieler</th>
              <th style={{ padding: '20px' }}>💀 Pkmn Gekillt</th>
              <th style={{ padding: '20px' }}>🏃 Nicht gefangen</th>
              <th style={{ padding: '20px', color: '#f43f5e' }}>🔗 Links zerstört</th>
              <th style={{ padding: '20px', color: '#ef4444' }}>💥 Full Wipes</th>
            </tr>
          </thead>
          <tbody>
            {stats.players.map(p => (
              <tr key={p.name} style={{ borderBottom: '1px solid #334155' }}>
                <td style={{ padding: '20px', fontWeight: 'bold' }}>{p.name}</td>
                <td style={{ padding: '20px', textAlign: 'center' }}>{p.killed}</td>
                <td style={{ padding: '20px', textAlign: 'center' }}>{p.escaped}</td>
                <td style={{ padding: '20px', textAlign: 'center', color: '#f43f5e', fontWeight: 'bold' }}>{p.causedDeaths}</td>
                <td style={{ padding: '20px', textAlign: 'center', color: '#ef4444', fontWeight: 'bold' }}>{p.fullWipes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}