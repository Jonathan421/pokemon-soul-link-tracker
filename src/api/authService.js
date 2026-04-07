// src/api/authService.js
import { supabase } from './supabaseClient';

export const authService = {
    // Meldet den Nutzer an
    async login(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error("Supabase Login Error:", error.message);
            throw error;
        }

        return data;
    },

    // Falls du später einen Logout-Button einbaust, haben wir das hier schon mal vorbereitet:
    async logout() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    }
};