// src/api/statsService.js
import { supabase } from './supabaseClient';

export const statsService = {
    async getRawStatsData() {
        // 1. Alle Spieler holen
        const { data: players, error: playersError } = await supabase
            .from('players')
            .select('*');
        if (playersError) throw playersError;

        // 2. Alle Runs inkl. Teilnehmer holen
        // HINWEIS: Wir selektieren hier die neuen Spalten result_status und caused_wipeout_id
        const { data: runs, error: runsError } = await supabase
            .from('runs')
            .select('id, is_completed, result_status, caused_wipeout_id, run_players(player_id)');
        if (runsError) throw runsError;

        // 3. Nur die Encounters holen, die zu einem Tod geführt haben
        const { data: deaths, error: deathsError } = await supabase
            .from('encounters')
            .select('player_id')
            .eq('caused_death', true);
        if (deathsError) throw deathsError;

        return { players, runs, deaths };
    }
};