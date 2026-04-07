import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

export default function Dashboard() {
  const navigate = useNavigate();
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRuns = async () => {
    const { data, error } = await supabase
      .from('runs')
      .select(`
        *,
        run_players (
          players ( id, name )
        )
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setRuns(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRuns();
  }, []);

  const activeRuns = runs.filter(run => !run.is_completed);
  const completedRuns = runs.filter(run => run.is_completed);

  if (loading) {
    return (
      <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#38bdf8', fontSize: '1.2rem', fontWeight: 'bold' }}>
        Lade Dashboard...
      </div>
    );
  }

  const lineClampStyle = {
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    wordBreak: 'break-word',
    whiteSpace: 'normal',
    margin: 0
  };

  const RunTableRow = ({ run, isActive }) => {
    const playerNames = run.run_players?.map(rp => rp.players?.name).filter(Boolean).join(', ') || 'Keine Spieler';
    const guiltyPlayer = run.run_players?.find(rp => rp.players?.id === run.blamed_player_id)?.players?.name || 'Unbekannt';

    return (
      <tr style={{ borderBottom: '1px solid #334155', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#1e293b'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
        
        <td style={{ padding: '16px', verticalAlign: 'middle' }}>
          <div style={{ ...lineClampStyle, fontWeight: '900', color: '#f1f5f9', fontSize: '1.1rem' }}>
            {run.name}
          </div>
        </td>

        <td style={{ padding: '16px', verticalAlign: 'middle' }}>
          <div style={{ ...lineClampStyle, color: '#94a3b8', fontWeight: '600' }}>
            {run.game_version}
          </div>
        </td>

        <td style={{ padding: '16px', verticalAlign: 'middle' }}>
          <div style={{ ...lineClampStyle, color: '#cbd5e1', fontWeight: '600', lineHeight: '1.4' }}>
            {playerNames}
          </div>
        </td>

        <td style={{ padding: '16px', verticalAlign: 'middle' }}>
          {isActive ? (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => navigate(`/run/${run.id}`)}
                style={{ background: '#38bdf8', color: '#0f172a', padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s', boxShadow: '0 4px 10px rgba(56, 189, 248, 0.2)', whiteSpace: 'nowrap' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Weiterspielen
              </button>
            </div>
          ) : (
            /* Das Layout hier wurde auf space-between geändert, damit der Name links und der Button rechts ist */
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '15px' }}>
              {run.run_result === 'won' ? (
                <span style={{ color: '#eab308', fontWeight: '900', whiteSpace: 'nowrap', textAlign: 'left' }}>
                  GEWONNEN
                </span>
              ) : (
                <span style={{ color: '#ef4444', fontWeight: '900', whiteSpace: 'nowrap', textAlign: 'left' }}>
                  {guiltyPlayer}
                </span>
              )}
              <button 
                onClick={() => navigate(`/run/${run.id}`)}
                style={{ background: 'transparent', color: '#94a3b8', padding: '8px 16px', borderRadius: '8px', border: '2px solid #334155', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s', whiteSpace: 'nowrap' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.color = '#f1f5f9'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.color = '#94a3b8'; }}
              >
                Ansehen
              </button>
            </div>
          )}
        </td>
      </tr>
    );
  };

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh', padding: '40px 20px', color: '#f1f5f9' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <img src="/pokeball.png" alt="Pokéball" style={{ width: '40px', height: '40px', filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.2))' }} />
              Soullink Hub
            </h1>
            <p style={{ color: '#94a3b8', margin: '5px 0 0 55px', fontWeight: '600' }}>Willkommen im Kontrollzentrum</p>
          </div>
          
          <button 
            onClick={() => navigate('/create-run')} 
            style={{ background: '#10b981', color: '#fff', padding: '12px 24px', borderRadius: '12px', border: 'none', fontWeight: '900', cursor: 'pointer', fontSize: '1rem', textTransform: 'uppercase', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }}
          >
            Neuen Run starten
          </button>
        </div>

        {/* TABELLE 1: AKTIVE RUNS */}
        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ color: '#38bdf8', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px', borderBottom: '2px solid #334155', paddingBottom: '10px' }}>
            Aktive Runs
          </h2>
          
          {activeRuns.length > 0 ? (
            <div style={{ background: '#1e293b', borderRadius: '16px', overflow: 'hidden', border: '1px solid #334155', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed' }}>
                <thead>
                  <tr style={{ background: '#0f172a', borderBottom: '2px solid #334155' }}>
                    <th style={{ width: '30%', padding: '16px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.85rem' }}>Run Name</th>
                    <th style={{ width: '15%', padding: '16px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.85rem' }}>Edition</th>
                    <th style={{ width: '30%', padding: '16px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.85rem' }}>Team</th>
                    <th style={{ width: '25%', padding: '16px', textAlign: 'right', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.85rem' }}>Aktion</th>
                  </tr>
                </thead>
                <tbody>
                  {activeRuns.map(run => <RunTableRow key={run.id} run={run} isActive={true} />)}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '30px', textAlign: 'center', background: '#1e293b', borderRadius: '16px', color: '#94a3b8', border: '1px dashed #334155' }}>
              Keine aktiven Runs vorhanden. Zeit, ein neues Abenteuer zu starten!
            </div>
          )}
        </section>

        {/* TABELLE 2: HISTORIE (BEENDETE RUNS) */}
        <section>
          <h2 style={{ color: '#94a3b8', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px', borderBottom: '2px solid #334155', paddingBottom: '10px' }}>
            Historie
          </h2>
          
          {completedRuns.length > 0 ? (
            <div style={{ background: '#1e293b', borderRadius: '16px', overflow: 'hidden', border: '1px solid #334155', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', opacity: 0.85 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed' }}>
                <thead>
                  <tr style={{ background: '#0f172a', borderBottom: '2px solid #334155' }}>
                    <th style={{ width: '30%', padding: '16px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.85rem' }}>Run Name</th>
                    <th style={{ width: '15%', padding: '16px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.85rem' }}>Edition</th>
                    <th style={{ width: '30%', padding: '16px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.85rem' }}>Team</th>
                    <th style={{ width: '25%', padding: '16px', textAlign: 'right', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.85rem' }}>Ergebnis</th>
                  </tr>
                </thead>
                <tbody>
                  {completedRuns.map(run => <RunTableRow key={run.id} run={run} isActive={false} />)}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '30px', textAlign: 'center', background: '#1e293b', borderRadius: '16px', color: '#64748b', border: '1px dashed #334155' }}>
              Die Historie ist noch leer. Eure Legenden müssen erst noch geschrieben werden.
            </div>
          )}
        </section>

      </div>
    </div>
  );
}