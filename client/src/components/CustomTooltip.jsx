import React from 'react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: '#1e2130',
        border: '1px solid #374151',
        borderRadius: '8px',
        padding: '10px 14px',
        color: '#e2e8f0',
        fontSize: '13px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        zIndex: 1000
      }}>
        {label && <p style={{ color: '#9ca3af', marginBottom: '4px', fontWeight: 'bold' }}>{label}</p>}
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color || entry.fill || '#e2e8f0', margin: '2px 0' }}>
            <span style={{ fontWeight: 500 }}>{entry.name}:</span> {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default CustomTooltip;
