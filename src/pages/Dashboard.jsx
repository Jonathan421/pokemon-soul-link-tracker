import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchRuns(); }, []);

  const fetchRuns = async () => {
    // Wir sagen Supabase explizit, über welche Spalte die Verknüpfung läuft
    const { data, error } = await supabase
      .from('runs')
      .select(`
        *,
        blamed_player:blamed_player_id (
          name
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Fehler beim Laden der Runs:", error);
    }

    if (data) {
      setRuns(data);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>
      
      {/* Header Bereich */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '50px',
        borderBottom: '1px solid #1e293b',
        paddingBottom: '20px'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '2.2rem', 
            margin: 0, 
            background: 'linear-gradient(to right, #38bdf8, #818cf8)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            fontWeight: '800'
          }}>
            Soul Link Portal
          </h1>
          <p style={{ color: '#94a3b8', margin: '5px 0 0 0' }}>Willkommen zurück, Commander.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <button 
            onClick={() => navigate('/create-run')}
            style={{ 
              background: '#38bdf8', 
              color: '#0f172a', 
              border: 'none', 
              padding: '10px 20px', 
              borderRadius: '10px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>+</span> Neuer Run
          </button>
          <button 
            onClick={() => navigate('/stats')}
            style={{ 
                background: 'transparent', 
                color: '#94a3b8', 
                border: '1px solid #334155', 
                padding: '10px 20px', 
                borderRadius: '10px', 
                cursor: 'pointer' 
            }}
            >
            📊 Statistiken
            </button>
          <button 
            onClick={() => supabase.auth.signOut().then(() => navigate('/'))} 
            style={{ background: 'transparent', color: '#f43f5e', border: '1px solid #450a0a', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Die Run-Liste */}
      {loading ? (
        <p style={{ textAlign: 'center', color: '#94a3b8' }}>Daten werden synchronisiert...</p>
      ) : (
        <div style={{ 
          background: '#1e293b', 
          borderRadius: '16px', 
          border: '1px solid #334155',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#0f172a', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                <th style={{ padding: '20px' }}>Run Name</th>
                <th style={{ padding: '20px' }}>Edition</th>
                <th style={{ padding: '20px' }}>Gestartet am</th>
                <th style={{ padding: '20px' }}>Status</th>
                <th style={{ padding: '20px', textAlign: 'right' }}>Aktion</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr 
                  key={run.id} 
                  style={{ 
                    borderBottom: '1px solid #334155', 
                    transition: 'background 0.2s',
                    cursor: 'default'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#1e293b'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '20px', fontWeight: 'bold', color: '#f1f5f9' }}>{run.name}</td>
                  <td style={{ padding: '20px' }}>
                    <span style={{ 
                      background: '#334155', 
                      color: '#38bdf8', 
                      padding: '4px 10px', 
                      borderRadius: '6px', 
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}>
                      {run.game_version}
                    </span>
                  </td>
                  <td style={{ padding: '20px', color: '#94a3b8', fontSize: '0.9rem' }}>
                    <div style={{ color: '#f1f5f9', fontWeight: '500' }}>
                        {new Date(run.created_at).toLocaleDateString('de-DE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                        })}
                    </div>
                    <div style={{ fontSize: '0.8rem', marginTop: '4px', opacity: 0.7 }}>
                        {new Date(run.created_at).toLocaleTimeString('de-DE', {
                        hour: '2-digit',
                        minute: '2-digit'
                        })} Uhr
                    </div>
                  </td>
                  <td style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ 
                          width: '8px', 
                          height: '8px', 
                          borderRadius: '50%', 
                          background: run.is_completed ? '#de4a51ff' : '#4ade80',
                          boxShadow: run.is_completed ? '0 0 10px #de4a51ff' : '0 0 10px #4ade80'
                        }}></div>
                        <span style={{ color: run.is_completed ? '#fca5a5' : '#4ade80', fontWeight: '600', fontSize: '0.9rem' }}>
                          {run.is_completed ? 'Beendet' : 'Aktiv'}
                        </span>
                      </div>
                      
                      {/* NEU: Hier wird der Sündenbock angezeigt */}
                      {run.is_completed && run.blamed_player && (
                        <div style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 'bold', marginLeft: '16px' }}>
                          von {run.blamed_player.name}
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '20px', textAlign: 'right' }}>
                    <button 
                      onClick={() => navigate(`/run/${run.id}`)}
                      style={{ 
                        background: '#334155', 
                        color: 'white', 
                        border: 'none', 
                        padding: '8px 16px', 
                        borderRadius: '8px', 
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                      }}
                    >
                      Öffnen →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {runs.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
              Keine Runs gefunden. Klicke auf "+ Neuer Run", um zu starten.
            </div>
          )}
        </div>
      )}
    </div>
  );
}