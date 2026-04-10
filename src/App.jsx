import React, { useState, useRef, useEffect } from 'react';

const ICSSimulator = () => {
  const canvasRef = useRef(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [units, setUnits] = useState([]);
  const [draggingUnit, setDraggingUnit] = useState(null);

  // Personnel System
  const divisions = {
    police: { name: 'Police', color: '#0066CC', personnel: 6 },
    fire: { name: 'Fire/Rescue', color: '#FF3300', personnel: 6 },
    hazmat: { name: 'Hazmat', color: '#FFCC00', personnel: 6 },
    swat: { name: 'SWAT', color: '#000000', personnel: 6 },
    utility: { name: 'Utility', color: '#FF9900', personnel: 6 },
    ems: { name: 'EMS', color: '#00CC00', personnel: 6 },
  };

  // Initialize units
  useEffect(() => {
    const initUnits = [];
    let id = 0;
    Object.entries(divisions).forEach(([key, div]) => {
      for (let i = 0; i < div.personnel; i++) {
        initUnits.push({
          id: id++,
          division: div.name,
          color: div.color,
          x: 100 + Math.random() * 40,
          y: 250 + id * 10,
          zone: 'staging',
        });
      }
    });
    setUnits(initUnits);
  }, []);

  // Mouse events
  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const unit = units.find(u => Math.hypot(u.x - x, u.y - y) < 12);
    if (unit) {
      setDraggingUnit(unit.id);
      setSelectedUnit(unit.id);
    }
  };

  const handleMouseMove = (e) => {
    if (!draggingUnit) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setUnits(units.map(u => {
      if (u.id === draggingUnit) {
        const newZone = x < 200 ? 'staging' : x > 550 ? 'incident' : 'command';
        return { ...u, x, y, zone: newZone };
      }
      return u;
    }));
  };

  // Canvas rendering
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Zone backgrounds
    ctx.fillStyle = 'rgba(0, 150, 200, 0.08)';
    ctx.fillRect(0, 0, 200, canvas.height);
    ctx.fillRect(550, 0, canvas.width - 550, canvas.height);

    // Zone labels
    ctx.fillStyle = '#333';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('📍 STAGING', 20, 35);
    ctx.fillText('🎯 COMMAND', 280, 35);
    ctx.fillText('🚨 INCIDENT', 570, 35);

    // Draw units
    units.forEach(unit => {
      ctx.beginPath();
      ctx.arc(unit.x, unit.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = unit.color;
      ctx.fill();

      if (selectedUnit === unit.id) {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
  }, [units, selectedUnit]);

  const startScenario = () => {
    const interval = setInterval(() => {
      let moved = false;
      setUnits(prevUnits =>
        prevUnits.map(unit => {
          if (unit.zone !== 'incident' && Math.random() > 0.85) {
            const newX = unit.x + (560 - unit.x) * 0.12;
            const newY = unit.y + (350 - unit.y) * 0.12;
            moved = true;
            return {
              ...unit,
              x: newX,
              y: newY,
              zone: newX > 550 ? 'incident' : 'command',
            };
          }
          return unit;
        })
      );
      if (!moved) clearInterval(interval);
    }, 150);
  };

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#1a1a1a', color: '#fff', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>ICS 300/400 Incident Simulator</h1>
        <button onClick={startScenario} style={{ padding: '10px 16px', background: '#00aa44', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          ▶ Deploy
        </button>
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', flex: 1, gap: '0' }}>
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={() => setDraggingUnit(null)}
          style={{ flex: 1, border: '2px solid #333', background: '#f0f0f0', cursor: 'grab' }}
        />

        {/* Right Panel */}
        <div style={{ width: '280px', background: '#f9f9f9', borderLeft: '1px solid #ddd', padding: '15px', overflowY: 'auto' }}>
          <h3 style={{ margin: '0 0 15px 0' }}>Unit Roster ({units.length})</h3>
          {units.map(u => (
            <div
              key={u.id}
              onClick={() => setSelectedUnit(u.id)}
              style={{
                padding: '8px',
                marginBottom: '4px',
                backgroundColor: selectedUnit === u.id ? '#e3f2fd' : '#fff',
                border: selectedUnit === u.id ? '2px solid #0066cc' : '1px solid #ddd',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              <div style={{ fontWeight: 'bold', color: u.color }}>{u.division}</div>
              <div style={{ fontSize: '11px', color: '#666' }}>Zone: {u.zone}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ICSSimulator;
