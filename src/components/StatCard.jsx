function StatCard({ title, value, color }) {
  return (
    <div
      style={{
        backgroundColor: color,
        borderRadius: '12px',
        padding: '20px',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: '1.2rem',
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100px',
      }}
    >
      <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>{title}</div>
      <div style={{ fontSize: '2rem', marginTop: '8px' }}>{value}</div>
    </div>
  );
}
