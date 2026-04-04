import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateRun from './pages/CreateRun';
import ActiveRun from './pages/ActiveRun'; // NEU
import Stats from './pages/Stats';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-run" element={<CreateRun />} />
        <Route path="/run/:id" element={<ActiveRun />} /> {/* NEU: Das :id ist ein Platzhalter */}
        <Route path="/stats" element={<Stats />} />
      </Routes>
    </Router>
  );
}

export default App;