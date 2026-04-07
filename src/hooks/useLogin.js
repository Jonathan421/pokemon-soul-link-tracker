// src/hooks/useLogin.js
import { useState } from 'react';
import { authService } from '../api/authService';

export function useLogin() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const login = async (email, password) => {
        setLoading(true);
        setError(null);

        try {
            await authService.login(email, password);
            return true; // Gibt true zurück, wenn es geklappt hat
        } catch (err) {
            // Wir überschreiben die englische Supabase-Meldung mit deiner deutschen
            setError('Login fehlgeschlagen. Bitte überprüfe deine Daten.');
            return false; // Gibt false zurück bei Fehler
        } finally {
            setLoading(false);
        }
    };

    return { login, loading, error };
}