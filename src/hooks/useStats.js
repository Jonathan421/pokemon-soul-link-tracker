// src/hooks/useStats.js
import { useState, useEffect } from 'react';
import { statsService } from '../api/statsService';

export function useStats() {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchAndCalculateStats() {
            try {
                setLoading(true);
                // Rohe Daten vom Service holen
                const { players, runs, deaths } = await statsService.getRawStatsData();

                // Metriken berechnen
                const calculatedStats = players.map(player => {
                    const playerRuns = runs.filter(r => r.run_players.some(rp => rp.player_id === player.id));
                    const completedRuns = playerRuns.filter(r => r.is_completed);

                    const sp = playerRuns.length;
                    const finished = completedRuns.length;
                    // Nutze den neuen Spaltennamen 'result_status'
                    const s = completedRuns.filter(r => r.result_status === 'won').length;
                    // Nutze den neuen Spaltennamen 'caused_wipeout_id'
                    const w = completedRuns.filter(r => r.caused_wipeout_id === player.id).length;
                    const t = deaths.filter(d => d.player_id === player.id).length;

                    const winRate = finished > 0 ? ((s / finished) * 100) : 0;
                    const tps = sp > 0 ? (t / sp) : 0;

                    return {
                        id: player.id,
                        name: player.name,
                        sp,
                        s,
                        w,
                        t,
                        winRate: parseFloat(winRate.toFixed(1)),
                        tps: parseFloat(tps.toFixed(2))
                    };
                });

                // BUNDESLIGA-SORTIERUNG
                calculatedStats.sort((a, b) => {
                    if (b.winRate !== a.winRate) return b.winRate - a.winRate;
                    if (a.tps !== b.tps) return a.tps - b.tps;
                    return a.t - b.t;
                });

                setStats(calculatedStats);
                setError(null);
            } catch (err) {
                setError(err.message || "Fehler beim Berechnen der Statistiken");
            } finally {
                setLoading(false);
            }
        }

        fetchAndCalculateStats();
    }, []);

    return { stats, loading, error };
}