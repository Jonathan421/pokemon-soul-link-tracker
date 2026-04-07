// src/api/encounterService.js
import { supabase } from './supabaseClient';

export const encounterService = {
    // Speichert oder aktualisiert Encounters
    async upsertEncounters(updates) {
        if (!updates || updates.length === 0) return;

        const { error } = await supabase
            .from('encounters')
            .upsert(updates, { onConflict: 'run_id, route_id, player_id' });

        if (error) {
            console.error("Fehler beim Speichern der Encounters:", error);
            throw error;
        }
    },

    // Setzt eine Route für einen spezifischen Run komplett zurück
    async deleteRouteEncounters(runId, routeId) {
        const { error } = await supabase
            .from('encounters')
            .delete()
            .match({ run_id: runId, route_id: routeId });

        if (error) {
            console.error("Fehler beim Löschen der Encounters:", error);
            throw error;
        }
    }
};