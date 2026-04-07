import { useState, useEffect } from 'react';
import { runService } from '../api/runService';

export function useRuns() {
    const [runs, setRuns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRuns = async () => {
        try {
            setLoading(true);
            const data = await runService.getAllRuns();
            setRuns(data);
            setError(null);
        } catch (err) {
            setError(err.message || 'Fehler beim Laden der Runs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRuns();
    }, []);

    return { runs, loading, error, refresh: fetchRuns };
}