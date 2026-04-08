# 🔗 Pokémon Soul Link Tracker

Der ultimative Begleiter für deine Pokémon Soul Link Nuzlocke Challenges! 
Diese Web-App hilft dir und deinem Koop-Partner dabei, Runs zu organisieren, Routen und Encounters zu tracken, Tode festzuhalten und eure Erfolge in der Hall of Fame zu verewigen.

## 🚀 Features

* **Dashboard:** Übersicht aller aktiven Runs und der historischen Ergebnisse.
* **Dynamische Runs:** Unterstützung für verschiedene Editionen (z.B. Pokémon Platin). Das System lädt automatisch die passenden Routen und Meilensteine (Orden).
* **Interaktives Spielfeld (Active Run):**
  * Ansicht nach Storyline sortiert
  * Status-Boxen: Sieh den Fortschritt ganzer Gebiete auf einen Blick.
  * Encounter-Tracking: Fange, verliere oder überspringe Pokémon auf spezifischen Routen.
  * Wipe-Out-Tracking: Finde heraus, wer den Run auf dem Gewissen hat!
* **Hall of Fame (Statistiken):** Übersicht der verlorenen Links und der Win/Loss-Ratio.
* **Sicheres Login:** Master-Account Schutz für die Datenverwaltung.
* **UI:** Responsives Design mit Darkmode und dezentem Pokémon-Theme.

## 🛠 Tech Stack

* **Frontend:** React.js
* **Backend / Database:** Supabase (PostgreSQL)
* **Authentication:** Supabase Auth
* **Styling:** Inline-Styles & CSS
* **Architektur:** MVVM / Repository Pattern

## 📂 Projektstruktur

Das Projekt folgt einer sauberen Architektur, um Skalierbarkeit und Wartbarkeit zu gewährleisten:

```text
src/
├── api/                # Datenbank-Services
├── components/         # UI-Komponenten
├── hooks/              # Hooks für State-Management und Logik
├── pages/              # Hauptansichten
└── App.jsx             # Routing
````

## ⚙️ Installation & lokales Setup

Folge diesen Schritten, um das Projekt lokal auf deinem Rechner zum Laufen zu bringen:

### 1\. Repository klonen

````
git clone \<deine-repo-url\>
cd soullink-tracker
````

### 2\. Abhängigkeiten installieren

````
npm install
````

### 3\. Umgebungsvariablen (.env) einrichten

Erstelle im Hauptverzeichnis (auf derselben Ebene wie die `package.json`) eine Datei namens `.env` und füge deine Supabase-Keys ein:

````
VITE_SUPABASE_URL=deine\_supabase\_projekt\_url
VITE_SUPABASE_ANON_KEY=dein\_supabase\_anon\_key
````
*(Hinweis: Diese Datei wird von Git ignoriert und niemals öffentlich hochgeladen.)*

### 4\. Entwicklungsserver starten

````
npm run dev
````
Öffne nun deinen Browser unter `http://localhost:5173` (oder der im Terminal angegebenen URL).

## 🗄️ Datenbank-Schema (Supabase)

Das Projekt baut auf einer relationalen Datenbankstruktur auf:

  * `games`: Verfügbare Editionen (z.B. Platin, HeartGold).
  * `milestones`: Abschnitte eines Spiels (z.B. Orden 1, Pokémon Liga), verknüpft mit einer `game_id`.
  * `routes_master`: Alle Routen eines Spiels, zugeordnet zu `milestones`.
  * `pokemon_master`: Der globale Pokédex.
  * `players`: Die Teilnehmer der Soul Links.
  * `runs` & `run_players`: Verwaltet die einzelnen Spieldurchläufe und wer daran teilnimmt.
  * `encounters`: Speichert jedes Pokémon, das auf einer Route gefangen, verloren oder ausgelassen wurde.

## 🔮 Geplante Features / Roadmap

  * Hinzufügen weiterer Pokémon-Editionen (HeartGold/SoulSilver, Schwarz/Weiß).
  * Profilseiten für individuelle Spieler-Statistiken.
  * Export-Funktion für Run-Zusammenfassungen (als Bild zum Teilen).
