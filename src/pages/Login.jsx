import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

export default function Login() {
  // Hier speichern wir die Eingaben aus den Textfeldern
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Dieses Tool nutzen wir, um nach dem Login die Seite zu wechseln
  const navigate = useNavigate();

  // Diese Funktion wird aufgerufen, wenn man auf "Einloggen" klickt
  const handleLogin = async (e) => {
    e.preventDefault(); // Verhindert, dass die Seite beim Klicken neu lädt
    setLoading(true);
    setError(null);

    // Hier fragt unsere Website bei Supabase an, ob die Daten stimmen
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      // Wenn das Passwort falsch ist, zeige den Fehler an
      setError('Login fehlgeschlagen. Bitte überprüfe deine Daten.');
      setLoading(false);
    } else {
      // Login erfolgreich! Ab zum Dashboard.
      navigate('/dashboard');
    }
  };

  // Das ist das Aussehen der Seite (mit ein bisschen Basis-Design)
  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>Soul Link Tracker</h1>
      <p>Bitte logge dich mit dem Master-Account ein.</p>
      
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        <input
          type="email"
          placeholder="E-Mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <input
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <button 
          type="submit" 
          disabled={loading} 
          style={{ padding: '10px', fontSize: '16px', borderRadius: '5px', backgroundColor: '#333', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          {loading ? 'Prüfe Daten...' : 'Einloggen'}
        </button>
      </form>

      {/* Wenn es einen Fehler gibt, wird er hier in Rot angezeigt */}
      {error && <p style={{ color: 'red', marginTop: '15px' }}>{error}</p>}
    </div>
  );
}