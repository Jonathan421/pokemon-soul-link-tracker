// src/components/EndRunModal.jsx
import { useState } from 'react';
import { runService } from "../api/runService"; // WICHTIG: Service statt Supabase importieren

export default function EndRunModal({ runId, players, onClose, onRefresh }) {
  const [result, setResult] = useState(''); // 'won' oder 'wiped'
  const [blamedPlayer, setBlamedPlayer] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    // Validierung: Bei Wipe Out muss jemand schuld sein!
    if (result === 'wiped' && !blamedPlayer) {
      alert('Bitte wähle aus, wer den Run auf dem Gewissen hat!');
      return;
    }

    setSaving(true);

    try {
      // SERVICE AUFRUF
      // Wir übergeben runId, den Status und (falls Wipe Out) die ID des Schuldigen
      const wipeoutId = result === 'wiped' ? blamedPlayer : null;
      await runService.endRun(runId, result, wipeoutId);

      onRefresh();
      onClose();
    } catch (error) {
      alert('Fehler beim Beenden des Runs: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // --- AB HIER IST ALLES DEIN ORIGINAL-CODE (NUR STYLING & RENDER) ---
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }}>
      <div style={{ backgroundColor: '#1e293b', width: '100%', maxWidth: '500px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', border: '1px solid #334155' }}>

        <div style={{ padding: '25px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#f1f5f9', fontWeight: '900', textTransform: 'uppercase' }}>Run beenden</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '1.5rem', fontWeight: 'bold' }}>✕</button>
        </div>

        <div style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          <div style={{ display: 'flex', gap: '15px' }}>
            {/* GEWONNEN BUTTON */}
            <div
              onClick={() => { setResult('won'); setBlamedPlayer(''); }}
              style={{ flex: 1, padding: '20px', borderRadius: '16px', border: result === 'won' ? '2px solid #eab308' : '2px solid #334155', background: result === 'won' ? 'rgba(234, 179, 8, 0.1)' : '#0f172a', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🏆</div>
              <div style={{ color: result === 'won' ? '#eab308' : '#94a3b8', fontWeight: '900', textTransform: 'uppercase' }}>Gewonnen</div>
            </div>

            {/* WIPE OUT BUTTON */}
            <div
              onClick={() => setResult('wiped')}
              style={{ flex: 1, padding: '20px', borderRadius: '16px', border: result === 'wiped' ? '2px solid #ef4444' : '2px solid #334155', background: result === 'wiped' ? 'rgba(239, 68, 68, 0.1)' : '#0f172a', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>💀</div>
              <div style={{ color: result === 'wiped' ? '#ef4444' : '#94a3b8', fontWeight: '900', textTransform: 'uppercase' }}>Wipe Out</div>
            </div>
          </div>

          {/* SCHULDIGEN AUSWÄHLEN (Nur bei Wipe Out sichtbar) */}
          {result === 'wiped' && (
            <div style={{ marginTop: '10px', animation: 'fadeIn 0.3s ease-in-out' }}>
              <div style={{ color: '#fca5a5', fontSize: '0.85rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '10px', textAlign: 'center' }}>
                Wer ist schuld am Wipe Out?
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {players.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setBlamedPlayer(p.id)}
                    style={{ padding: '10px 15px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', border: blamedPlayer === p.id ? '2px solid #ef4444' : '2px solid #334155', background: blamedPlayer === p.id ? '#ef4444' : '#0f172a', color: blamedPlayer === p.id ? '#ffffff' : '#94a3b8' }}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={!result || saving}
            style={{ width: '100%', padding: '16px', marginTop: '10px', borderRadius: '12px', border: 'none', background: result ? (result === 'won' ? '#eab308' : '#ef4444') : '#334155', color: result ? '#fff' : '#94a3b8', fontWeight: '900', fontSize: '1.1rem', cursor: result ? 'pointer' : 'not-allowed', textTransform: 'uppercase' }}
          >
            {saving ? 'Wird gespeichert...' : 'Run abschließen'}
          </button>
        </div>
      </div>
    </div>
  );
}