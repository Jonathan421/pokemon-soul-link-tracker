// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../hooks/useLogin'; // Unser neuer Hook

export default function Login() {
  // Lokaler State für die Eingabefelder
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  // Supabase-Logik ausgelagert in den Hook
  const { login, loading, error } = useLogin();

  const handleLogin = async (e) => {
    e.preventDefault(); // Verhindert, dass die Seite beim Klicken neu lädt

    // Wir warten auf das Ergebnis unseres Hooks
    const success = await login(email, password);

    // Wenn alles gut ging, wechseln wir die Seite
    if (success) {
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