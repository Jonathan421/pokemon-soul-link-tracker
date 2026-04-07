// src/hooks/useCreateRun.js
import { useState, useEffect } from 'react';
import { gameService } from '../api/gameService';

export function useCreateRun() {
    const [games, setGames] = useState([]);
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Lädt Spiele und Spieler beim Start
    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                // Wir laden beide Sachen gleichzeitig (schneller!)
                const [gamesData, playersData] = await Promise.all([
                    gameService.getAvailableGames(),
                    gameService.getPlayers()
                ]);
                setGames(gamesData);
                setPlayers(playersData);
            } catch (err) {
                setError("Fehler beim Laden der Grunddaten.");
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    // Einen neuen Spieler hinzufügen
    const addPlayer = async (name) => {
        try {
            const newPlayer = await gameService.createPlayer(name);
            // Den neuen Spieler sortiert in die Liste einfügen
            setPlayers(prev => [...prev, newPlayer].sort((a, b) => a.name.localeCompare(b.name)));
            return true;
        } catch (err) {
            alert("Fehler beim Erstellen des Spielers: " + err.message);
            return false;
        }
    };

    return { games, players, loading, error, addPlayer, createRun: gameService.createRun };
}