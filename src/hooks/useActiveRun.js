// src/hooks/useActiveRun.js
import { useState, useEffect, useCallback } from 'react';
import { activeRunService } from '../api/activeRunService';

export function useActiveRun(runId) {
    const [data, setData] = useState({
        run: null,
        players: [],
        milestones: [],
        routes: [],
        pokemon: [],
        encounters: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSpielfeld = useCallback(async () => {
        if (!runId) return;
        try {
            setLoading(true);
            const result = await activeRunService.getRunSpielfeld(runId);
            setData(result);
            setError(null);
        } catch (err) {
            console.error("Fehler beim Laden des Runs:", err);
            setError(err.message || "Konnte das Spielfeld nicht laden.");
        } finally {
            setLoading(false);
        }
    }, [runId]);

    useEffect(() => {
        fetchSpielfeld();
    }, [fetchSpielfeld]);

    // Hilfsfunktion: Gruppiert die Routen nach milestone_id
    const getRoutesByMilestone = (milestoneId) => {
        return data.routes.filter(route => route.milestone_id === milestoneId);
    };

    // Hilfsfunktion: Gibt Routen zurück, die keinem Milestone zugeordnet sind
    const getUngroupedRoutes = () => {
        return data.routes.filter(route => !route.milestone_id);
    };

    return { data, loading, error, refresh: fetchSpielfeld, getRoutesByMilestone, getUngroupedRoutes };
}