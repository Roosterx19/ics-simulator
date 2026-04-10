import React, { useState, useRef, useEffect } from 'react';

export default function ICSSimulator() {
  const canvasRef = useRef(null);
  const [units, setUnits] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [dragging, setDragging] = useState(null);

  // Initialize
  useEffect(() => {
    const newUnits = [];
    const colors = ['#0066CC', '#FF3300', '#FFCC00', '#000000', '#FF9900', '#00CC00'];
    const names = ['Police', 'Fire', 'Hazmat', 'SWAT', 'Utility', 'EMS'];
    
    let id = 0;
    names.forEach((name, idx) => {
      for (let i = 0; i < 6; i++) {
        newUnits.push({
          id: id++,
          name: name,
          color: colors[idx],
          x: 100 + Math.random() * 30,
          y: 200 + id * 8,
          zone: 'staging'
        });
      }
    });
    setUnits(newUnits);
  }, []);

  // Draw canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Zones
    ctx.fillStyle = 'rgba(0, 150, 200, 0.08)';
    ctx.fillRect(0, 0, 200, canvas.height);
    ctx.fillRect(550, 0, canvas.width - 550, canvas.height);

    // Labels
    ctx.fillStyle = '#333';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('STAGING', 30, 35);
    ctx.fillText('COMMAND', 310, 35);
    ctx.fillText('INCIDENT', 580, 35);

    // Draw units
    units.forEach(u => {
      ctx.beginPath();
      ctx.arc(u.x, u.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = u.color;
      ctx.fill();
      if (selectedId === u.id) {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
  }, [units, selectedId]);

  const handleMouse = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const unit = units.find(u => Math.hypot(u.x - x, u.y - y) < 12);
    if (unit) {
      setDragging(unit.id);
      setSelectedId(unit.id);
    }
  };

  const handleMove = (e) => {
    if (!dragging) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setUnits(units.map(u => {
      if (u.id === dragging) {
        const zone = x < 200 ? 'staging' : x > 550 ? 'incident' : 'command';
        return { ...u, x, y, zone };
      }
      return u;
    }));
  };

  const deploy = () => {
    const timer = setInterval(() => {
      let anyMoving = false;
      setUnits(prev => prev.map(u => {
        if (u.zone !== 'incident' && Math.random() > 0.9) {
          anyMoving = true;
          return {
            ...u,
            x: u.x + (560 - u.x) * 0.1,
            y: u.y + (350 - u.y) * 0.1,
            zone: u.x > 550 ? 'incident' : 'command'
          };
        }
        return u;
      }));
      if (!anyMoving) clearInterval(timer);
    }, 100);
  };

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Arial' }}>
      <div style={{ background: '#1a1a1a', color: '#fff', padding: '15px', display: 'flex', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>ICS 300/400 Simulator</h1>
        <button onClick={deploy} style={{ padding: '8px 16px', background: '#00aa44', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Deploy
        </button>
      </div>
      <div style={{ display: 'flex', flex: 1 }}>
        <canvas ref={canvasRef} onMouseDown={handleMouse} onMouseMove={handleMove} onMouseUp={() => setDragging(null)} style={{ flex: 1, border: '2px solid #333' }} />
        <div style={{ width: '250px', borderLeft: '1px solid #ddd', padding: '15px', overflowY: 'auto' }}>
          <h3 style={{ margin: 0, marginBottom: '10px' }}>Units ({units.length})</h3>
          {units.map(u => (
            <div key={u.id} onClick={() => setSelectedId(u.id)} style={{ padding: '6px', marginBottom: '3px', background: selectedId === u.id ? '#e3f2fd' : '#fff', border: '1px solid #ddd', borderRadius: '2px', cursor: 'pointer', fontSize: '11px' }}>
              <div style={{ color: u.color, fontWeight: 'bold' }}>{u.name}</div>
              <div style={{ color: '#666' }}>Zone: {u.zone}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
