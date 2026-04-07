import { supabase } from './supabaseClient'; // Passe den Pfad an, falls nötig

export const runService = {
    async getAllRuns() {
        // Wir holen Runs + Spielname + alle Spieler + den Namen des Schuldigen
        const { data, error } = await supabase
            .from('runs')
            .select(`
        id,
        name,
        is_completed,
        result_status,
        created_at,
        games ( title ),
        run_players ( players ( id, name ) ),
        guilty_player:players!caused_wipeout_id ( name )
      `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Fehler beim Laden der Runs:", error);
            throw error;
        }

        // Jetzt formatieren wir die rohen Datenbank-Daten in schöne, flache Werte
        return data.map(run => {
            const playerNames = run.run_players
                ?.map(rp => rp.players?.name)
                .filter(Boolean)
                .join(', ') || 'Keine Spieler';

            return {
                id: run.id,
                name: run.name,
                gameTitle: run.games?.title || 'Unbekanntes Spiel',
                isCompleted: run.is_completed,
                resultStatus: run.result_status, // 'won', 'wipe', etc.
                playerNames: playerNames,
                guiltyPlayerName: run.guilty_player?.name || 'Unbekannt',
                createdAt: run.created_at
            };
        });
    },

    // Beendet einen Run (Gewonnen oder Wipe Out)
    async endRun(runId, resultStatus, causedWipeoutId = null) {
        const { error } = await supabase
            .from('runs')
            .update({
                is_completed: true,
                result_status: resultStatus, // Der neue Spaltenname
                caused_wipeout_id: causedWipeoutId // Der neue Spaltenname
            })
            .eq('id', runId);

        if (error) {
            console.error("Fehler beim Beenden des Runs:", error);
            throw error;
        }
    }
};