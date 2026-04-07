// src/api/gameService.js
import { supabase } from './supabaseClient';

export const gameService = {
    // Holt die Liste aller Spiele für das Dropdown-Menü
    async getAvailableGames() {
        const { data, error } = await supabase
            .from('games')
            .select('id, title, short_name')
            .order('id');

        if (error) throw error;
        return data;
    },

    // Holt alle Spieler
    async getPlayers() {
        const { data, error } = await supabase
            .from('players')
            .select('*')
            .order('name');

        if (error) throw error;
        return data;
    },

    // Erstellt einen neuen Spieler
    async createPlayer(name) {
        const { data, error } = await supabase
            .from('players')
            .insert([{ name }])
            .select();

        if (error) throw error;
        return data[0]; // Gib den neuen Spieler zurück
    },

    // Erstellt den Run und verknüpft die Spieler
    async createRun(runName, gameId, selectedPlayerIds) {
        // 1. Run erstellen (mit game_id statt game_version)
        const { data: runData, error: runError } = await supabase
            .from('runs')
            // WICHTIG: Hier speichern wir jetzt die game_id (z.B. 14)
            .insert([{ name: runName, game_id: gameId }])
            .select();

        if (runError) throw runError;
        const newRunId = runData[0].id;

        // 2. Spieler mit dem Run verknüpfen
        const playerInserts = selectedPlayerIds.map(playerId => ({
            run_id: newRunId,
            player_id: playerId
        }));

        const { error: linkError } = await supabase
            .from('run_players')
            .insert(playerInserts);

        if (linkError) throw linkError;

        return newRunId;
    }
};