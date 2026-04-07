// src/api/activeRunService.js
import { supabase } from './supabaseClient';

export const activeRunService = {
    async getRunSpielfeld(runId) {
        // 1. Run-Daten holen
        const { data: run, error: runError } = await supabase
            .from('runs')
            .select('*')
            .eq('id', runId)
            .single();
        if (runError) throw runError;

        // 2. Spieler holen
        const { data: pData, error: pError } = await supabase
            .from('run_players')
            .select('players(id, name)')
            .eq('run_id', runId);
        if (pError) throw pError;

        // 3. Milestones für dieses Spiel holen
        const { data: milestones, error: mError } = await supabase
            .from('milestones')
            .select('*')
            .eq('game_id', run.game_id)
            .order('milestone_order');
        if (mError) throw mError;

        // 4. Routen für dieses Spiel holen (jetzt über game_id gefiltert!)
        const { data: routes, error: rError } = await supabase
            .from('routes_master')
            .select('*')
            .eq('game_id', run.game_id)
            .order('route_order');
        if (rError) throw rError;

        // 5. Pokémon Dex holen
        const { data: pokemon, error: pkmnError } = await supabase
            .from('pokemon_master')
            .select('*')
            .order('id');
        if (pkmnError) throw pkmnError;

        // 6. Encounters für diesen Run holen
        const { data: encounters, error: encError } = await supabase
            .from('encounters')
            .select('*')
            .eq('run_id', runId);
        if (encError) throw encError;

        return {
            run,
            players: pData.map(i => i.players),
            milestones,
            routes,
            pokemon,
            encounters
        };
    }
};