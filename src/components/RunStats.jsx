export default function RunStats({ players, encounters }) {
  // Logik: Zählt für jeden Spieler die Tode
  const playerStats = players.map(player => {
    const lossCount = encounters.filter(e => e.player_id === player.id && e.caused_death === true).length;
    return { name: player.name, losses: lossCount };
  });

  return (
    <div style={{ 
      background: '#1e293b', 
      borderRadius: '16px', 
      padding: '20px', 
      marginBottom: '30px', 
      border: '1px solid #334155',
      display: 'flex',
      flexDirection: 'column',
      gap: '15px'
    }}>
      <div style={{ color: '#38bdf8', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>
        Verlorene Links
      </div>
      
      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        {playerStats.map(stat => (
          <div key={stat.name} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              fontSize: '1.1rem', 
              fontWeight: '900', 
              color: '#f1f5f9' 
            }}>
              {stat.name}
            </div>
            <div style={{ 
              background: stat.losses > 0 ? '#ef4444' : '#334155', 
              color: '#fff', 
              padding: '4px 14px', 
              borderRadius: '20px', 
              fontWeight: '900',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '20px', 
              boxShadow: stat.losses > 0 ? '0 0 15px rgba(239, 68, 68, 0.2)' : 'none'
            }}>
              {stat.losses}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}