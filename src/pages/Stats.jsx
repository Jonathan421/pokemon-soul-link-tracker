// src/pages/Stats.jsx
import { useNavigate } from 'react-router-dom';
import { useStats } from '../hooks/useStats';

export default function Stats() {
  const navigate = useNavigate();
  // Hol dir die fertigen Daten aus dem Hook
  const { stats, loading, error } = useStats();

  if (loading) {
    return (
      <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#38bdf8', fontSize: '1.2rem', fontWeight: 'bold' }}>
        Berechne Statistiken...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#ef4444', fontSize: '1.2rem', fontWeight: 'bold' }}>
        Fehler: {error}
      </div>
    );
  }

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', padding: '40px 20px', color: '#f1f5f9' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontSize: '2.5rem' }}>📊</span>
              Hall of Fame
            </h1>
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            style={{ background: 'transparent', color: '#94a3b8', padding: '10px 20px', borderRadius: '10px', border: '2px solid #334155', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s', textTransform: 'uppercase' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.color = '#f1f5f9'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.color = '#94a3b8'; }}
          >
            Zurück zum Dashboard
          </button>
        </div>

        {/* ERKLÄRUNG */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold', flexWrap: 'wrap' }}>
          <span><strong style={{ color: '#f1f5f9' }}>Sp:</strong> Gespielte Runs</span>
          <span><strong style={{ color: '#eab308' }}>S:</strong> Siege</span>
          <span><strong style={{ color: '#ef4444' }}>W:</strong> Schuld an Wipe-Outs</span>
          <span><strong style={{ color: '#f1f5f9' }}>T:</strong> Verlorene Links</span>
          <span><strong style={{ color: '#38bdf8' }}>T/Sp:</strong> Tode pro Run</span>
          <span><strong style={{ color: '#10b981' }}>Win-Rate:</strong> Siegquote</span>
        </div>

        {/* DIE TABELLE */}
        <div style={{ background: '#1e293b', borderRadius: '16px', overflow: 'hidden', border: '1px solid #334155', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', tableLayout: 'fixed' }}>
            <thead>
              <tr style={{ background: '#0f172a', borderBottom: '2px solid #334155' }}>
                <th style={{ width: '10%', padding: '16px', color: '#64748b', fontWeight: '900' }}>#</th>
                <th style={{ width: '30%', padding: '16px', textAlign: 'left', color: '#64748b', fontWeight: '900', textTransform: 'uppercase' }}>Spieler</th>
                <th style={{ width: '10%', padding: '16px', color: '#64748b', fontWeight: '900' }}>Sp</th>
                <th style={{ width: '10%', padding: '16px', color: '#eab308', fontWeight: '900' }}>S</th>
                <th style={{ width: '10%', padding: '16px', color: '#ef4444', fontWeight: '900' }}>W</th>
                <th style={{ width: '10%', padding: '16px', color: '#f1f5f9', fontWeight: '900' }}>T</th>
                <th style={{ width: '10%', padding: '16px', color: '#38bdf8', fontWeight: '900', background: 'rgba(56, 189, 248, 0.05)' }}>T/Sp</th>
                <th style={{ width: '10%', padding: '16px', color: '#10b981', fontWeight: '900' }}>WR %</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((stat, index) => {
                let rankVisual = index + 1;
                if (index === 0) rankVisual = '🥇';
                if (index === 1) rankVisual = '🥈';
                if (index === 2) rankVisual = '🥉';

                return (
                  <tr key={stat.id} style={{ borderBottom: '1px solid #334155', transition: 'background 0.2s', background: index === 0 ? 'rgba(234, 179, 8, 0.05)' : 'transparent' }} onMouseEnter={(e) => e.currentTarget.style.background = '#0f172a'} onMouseLeave={(e) => e.currentTarget.style.background = index === 0 ? 'rgba(234, 179, 8, 0.05)' : 'transparent'}>
                    <td style={{ padding: '16px', fontSize: '1.2rem', fontWeight: '900' }}>{rankVisual}</td>
                    <td style={{ padding: '16px', textAlign: 'left', fontWeight: '900', fontSize: '1.1rem', color: index === 0 ? '#eab308' : '#f1f5f9' }}>{stat.name}</td>
                    <td style={{ padding: '16px', fontWeight: 'bold', color: '#94a3b8' }}>{stat.sp}</td>
                    <td style={{ padding: '16px', fontWeight: 'bold', color: '#f1f5f9' }}>{stat.s}</td>
                    <td style={{ padding: '16px', fontWeight: 'bold', color: '#fca5a5' }}>{stat.w}</td>
                    <td style={{ padding: '16px', fontWeight: 'bold', color: '#94a3b8' }}>{stat.t}</td>
                    <td style={{ padding: '16px', fontWeight: '900', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.05)' }}>{stat.tps}</td>
                    <td style={{ padding: '16px', fontWeight: '900', color: '#10b981' }}>{stat.winRate}%</td>
                  </tr>
                );
              })}
              {stats.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ padding: '30px', color: '#64748b', fontStyle: 'italic' }}>Keine Daten vorhanden. Spielt ein paar Runden!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}