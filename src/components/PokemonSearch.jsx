import { useState, useEffect } from 'react';

export default function PokemonSearch({ pokemonList, selectedId, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (selectedId && pokemonList.length > 0) {
      const pkmn = pokemonList.find(p => String(p.id) === String(selectedId));
      if (pkmn) setSearchTerm(`#${pkmn.id} ${pkmn.name}`);
    }
  }, [selectedId, pokemonList]);

  const filtered = pokemonList.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || String(p.id).includes(searchTerm)
  );

  return (
    <div style={{ position: 'relative', flex: 1, width: '100%' }}>
      <input
        type="text"
        placeholder="🔍 Pokémon suchen..."
        value={searchTerm}
        onChange={(e) => { setSearchTerm(e.target.value); setIsOpen(true); }}
        onFocus={() => { setSearchTerm(''); setIsOpen(true); }}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)} 
        style={{ 
          width: '100%', 
          padding: '12px 16px', 
          borderRadius: '8px', 
          border: '2px solid #e2e8f0', /* Hellerer, sanfter Rahmen */
          background: '#ffffff',       /* Reinweiß */
          color: '#334155',            /* Weiches Dunkelgrau statt hartem Schwarz */
          fontSize: '0.95rem', 
          fontWeight: '600',           /* Etwas dünner als "bold" */
          outline: 'none', 
          boxSizing: 'border-box',
          transition: 'border-color 0.2s ease'
        }}
      />
      {isOpen && (
        <div style={{ 
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, 
          maxHeight: '200px', overflowY: 'auto', background: '#ffffff', 
          border: '1px solid #e2e8f0', borderRadius: '8px', 
          zIndex: 9999, 
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)' /* Weicherer Schatten */
        }}>
          {filtered.map(p => (
            <div 
              key={p.id} 
              onClick={() => { onSelect(p.id); setIsOpen(false); }} 
              style={{ 
                padding: '10px 16px', cursor: 'pointer', borderBottom: '1px solid #f8fafc',
                color: '#334155', fontSize: '0.9rem', display: 'flex', gap: '10px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
            >
              <span style={{ color: '#0ea5e9', fontWeight: '800' }}>#{p.id}</span> 
              <span style={{ fontWeight: '600' }}>{p.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}