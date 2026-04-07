import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// WICHTIG: Hier ist der korrekte Pfad zu deinem neuen api-Ordner!
import { supabase } from './api/supabaseClient';

// Deine Seiten-Imports
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateRun from './pages/CreateRun';
import ActiveRun from './pages/ActiveRun';
import Stats from './pages/Stats';

export default function App() {
  const [session, setSession] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // 1. Fragt sofort den Status beim allerersten Laden ab
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsInitializing(false); // Supabase ist fertig mit Nachdenken!
    });

    // 2. Hört auf Änderungen (Login / Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // WICHTIG: Solange Supabase den Login-Status noch prüft, zeigen wir nur einen Ladescreen
  if (isInitializing) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a', color: '#38bdf8' }}>
        <h2>Verifiziere Zugang...</h2>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Wenn KEINE Session da ist, zeige Entry, ansonsten direkt ins Dashboard */}
        <Route path="/" element={!session ? <Login /> : <Navigate to="/dashboard" />} />

        {/* Geschützte Routen: Wenn KEINE Session da ist, werfe zurück zum Entry */}
        <Route path="/dashboard" element={session ? <Dashboard /> : <Navigate to="/" />} />
        <Route path="/create-run" element={session ? <CreateRun /> : <Navigate to="/" />} />
        <Route path="/run/:id" element={session ? <ActiveRun /> : <Navigate to="/" />} />
        <Route path="/stats" element={session ? <Stats /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}