import React, { useState, useRef, useEffect } from 'react';

const ICSSimulator = () => {
  const canvasRef = useRef(null);
  const [view3D, setView3D] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [units, setUnits] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [scenario, setScenario] = useState('hazmat');
  const [time, setTime] = useState('13:45');
  const [draggingUnit, setDraggingUnit] = useState(null);
  const [incidentObjective, setIncidentObjective] = useState('Contain hazmat spill. Evacuate 500m radius. Establish decontamination.');

  // ICS Command Structure
  const icsStructure = {
    incidentCommander: { role: 'Incident Commander', name: 'Chief Bennett', division: 'Unified Command' },
    operationsChief: { role: 'Operations Section Chief', name: 'Chief Anderson', division: 'Fire' },
    planningChief: { role: 'Planning Section Chief', name: 'Chief Rodriguez', division: 'Police' },
    logisticsChief: { role: 'Logistics Section Chief', name: 'Chief White', division: 'Utility' },
    financeChief: { role: 'Finance/Admin Chief', name: 'Chief Green', division: 'EMS' },
  };

  // Personnel System
  const divisions = {
    police: {
      name: 'Police',
      color: '#0066CC',
      personnel: 6,
      vehicles: [
        { id: 'p1', type: 'Patrol Car', capacity: 2, color: '#0066CC' },
        { id: 'p2', type: 'Patrol Car', capacity: 2, color: '#0066CC' },
        { id: 'p3', type: 'Command Vehicle', capacity: 4, color: '#003366' },
      ],
    },
    fire: {
      name: 'Fire/Rescue',
      color: '#FF3300',
      personnel: 6,
      vehicles: [
        { id: 'f1', type: 'Engine', capacity: 5, color: '#FF3300' },
        { id: 'f2', type: 'Ladder Truck', capacity: 4, color: '#CC2200' },
        { id: 'f3', type: 'Rescue/Squad', capacity: 5, color: '#FF5533' },
        { id: 'f4', type: 'Heavy Rescue', capacity: 6, color: '#990000' },
      ],
    },
    hazmat: {
      name: 'Hazmat',
      color: '#FFCC00',
      personnel: 6,
      vehicles: [
        { id: 'h1', type: 'Hazmat Unit', capacity: 6, color: '#FFCC00' },
        { id: 'h2', type: 'Decontamination Trailer', capacity: 4, color: '#FFAA00' },
      ],
    },
    swat: {
      name: 'SWAT/Law Enforcement',
      color: '#000000',
      personnel: 6,
      vehicles: [
        { id: 's1', type: 'Tactical Vehicle', capacity: 8, color: '#000000' },
        { id: 's2', type: 'Command SUV', capacity: 4, color: '#222222' },
      ],
    },
    utility: {
      name: 'Utility/Public Works',
      color: '#FF9900',
      personnel: 6,
      vehicles: [
        { id: 'u1', type: 'Water Tanker', capacity: 8, color: '#FF9900' },
        { id: 'u2', type: 'Utility Truck', capacity: 4, color: '#CC7700' },
      ],
    },
    ems: {
      name: 'EMS/Medical',
      color: '#00CC00',
      personnel: 6,
      vehicles: [
        { id: 'e1', type: 'Ambulance', capacity: 2, color: '#00CC00' },
        { id: 'e2', type: 'Ambulance', capacity: 2, color: '#00CC00' },
        { id: 'e3', type: 'Mobile Hospital Unit', capacity: 8, color: '#00AA00' },
      ],
    },
  };

  // Initialize on mount
  useEffect(() => {
    initializeUnitsAndVehicles();
  }, []);

  const initializeUnitsAndVehicles = () => {
    const initUnits = [];
    const initVehicles = [];
    let unitId = 0;
    let vehicleId = 0;

    Object.entries(divisions).forEach(([key, division]) => {
      const stagingX = 80;
      const stagingY = 250 + Object.keys(divisions).indexOf(key) * 80;

      // Add personnel
      for (let i = 0; i < division.personnel; i++) {
        initUnits.push({
          id: unitId++,
          division: division.name,
          role: key,
          name: `${division.name.split('/')[0]} ${i + 1}`,
          color: division.color,
          x: stagingX + Math.random() * 40,
          y: stagingY + Math.random() * 20,
          zone: 'staging',
          assignedVehicle: null,
          status: 'staging',
        });
      }

      // Add vehicles
      division.vehicles.forEach((v, idx) => {
        initVehicles.push({
          id: vehicleId++,
          vehicleId: v.id,
          division: division.name,
          role: key,
          type: v.type,
          capacity: v.capacity,
          color: v.color,
          x: stagingX + 100 + idx * 60,
          y: stagingY,
          zone: 'staging',
          assigned: [],
          status: 'ready',
        });
      });
    });

    setUnits(initUnits);
    setVehicles(initVehicles);
  };

  // Mouse events
  const handleMouseDown = (e) => {
    if (view3D) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking unit
    const unit = units.find(u => Math.hypot(u.x - x, u.y - y) < 12);
    if (unit) {
      setDraggingUnit(unit.id);
      setSelectedUnit(unit.id);
      return;
    }

    // Check if clicking vehicle
    const vehicle = vehicles.find(v => Math.hypot(v.x - x, v.y - y) < 18);
    if (vehicle) {
      setSelectedVehicle(vehicle.id);
      setSelectedUnit(null);
      return;
    }

    setSelectedUnit(null);
    setSelectedVehicle(null);
  };

  const handleMouseMove = (e) => {
    if (view3D || !draggingUnit) return;
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

  const handleMouseUp = () => {
    setDraggingUnit(null);
  };

  // 2D Canvas rendering
  useEffect(() => {
    if (view3D || !canvasRef.current) return;

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

    // Grid
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < canvas.width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }

    // Draw vehicles
    vehicles.forEach(vehicle => {
      ctx.beginPath();
      ctx.rect(vehicle.x - 18, vehicle.y - 12, 36, 24);
      ctx.fillStyle = vehicle.color;
      ctx.fill();

      if (selectedVehicle === vehicle.id) {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.stroke();
      } else {
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Vehicle type label
      ctx.fillStyle = '#fff';
      ctx.font = '9px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(vehicle.type.split(' ')[0], vehicle.x, vehicle.y + 2);
    });

    // Draw units
    units.forEach(unit => {
      ctx.beginPath();
      ctx.arc(unit.x, unit.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = unit.color;
      ctx.fill();

      if (selectedUnit === unit.id) {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      } else {
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    });
  }, [units, vehicles, selectedUnit, selectedVehicle, view3D]);

  const startScenario = () => {
    // Auto-deploy units to incident area
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
              status: newX > 550 ? 'deployed' : 'en-route',
            };
          }
          return unit;
        })
      );
      if (!moved) clearInterval(interval);
    }, 150);
  };

  const exportCode = () => {
    const code = `// ICS Simulator - Your application
// Deploy to Vercel: https://vercel.com/new

export default ${ICSSimulator.toString()}`;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ICS_Simulator.jsx';
    a.click();
  };

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#1a1a1a', color: '#fff', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
        <div>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '20px' }}>ICS 300/400 Incident Simulator</h1>
          <p style={{ margin: 0, fontSize: '12px', color: '#aaa' }}>Hazmat Spill Training Scenario | Time: {time}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setView3D(!view3D)} style={{ padding: '10px 16px', background: view3D ? '#ff9900' : '#0066cc', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
            {view3D ? '📊 2D' : '🎮 3D'}
          </button>
          <button onClick={startScenario} style={{ padding: '10px 16px', background: '#00aa44', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
            ▶ Deploy
          </button>
          <button onClick={exportCode} style={{ padding: '10px 16px', background: '#666', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
            ⬇ Export Code
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', flex: 1, gap: '0', overflow: 'hidden' }}>
        {/* Canvas */}
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ flex: 1, border: '2px solid #333', background: '#f0f0f0', cursor: 'grab' }}
        />

        {/* Right Panel */}
        <div style={{ width: '320px', background: '#fff', borderLeft: '1px solid #ddd', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* ICS Structure */}
          <div style={{ padding: '15px', borderBottom: '1px solid #ddd', background: '#f9f9f9' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: 'bold' }}>INCIDENT COMMAND STRUCTURE</h3>
            {Object.entries(icsStructure).map(([key, pos]) => (
              <div key={key} style={{ padding: '4px 6px', fontSize: '11px', marginBottom: '4px', background: '#fff', border: '1px solid #e0e0e0', borderRadius: '2px' }}>
                <div style={{ fontWeight: 'bold', color: '#0066cc' }}>{pos.role}</div>
                <div style={{ fontSize: '10px', color: '#666' }}>{pos.name} ({pos.division})</div>
              </div>
            ))}
          </div>

          {/* Incident Objective */}
          <div style={{ padding: '15px', borderBottom: '1px solid #ddd', background: '#fff9f0' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 'bold', color: '#ff6600' }}>🚨 INCIDENT OBJECTIVE</h3>
            <p style={{ margin: 0, fontSize: '12px', color: '#333', lineHeight: '1.4' }}>{incidentObjective}</p>
          </div>

          {/* Unit/Vehicle Details */}
          <div style={{ flex: 1, overflow: 'auto', padding: '15px' }}>
            {selectedUnit !== null && units.find(u => u.id === selectedUnit) && (
              <div>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '13px' }}>PERSONNEL</h4>
                {units.map(u => u.id === selectedUnit && (
                  <div key={u.id} style={{ padding: '10px', background: '#e3f2fd', border: '2px solid #0066cc', borderRadius: '4px' }}>
                    <div style={{ fontWeight: 'bold' }}>{u.name}</div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                      Division: {u.division}<br />
                      Zone: {u.zone}<br />
                      Status: {u.status}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedVehicle !== null && vehicles.find(v => v.id === selectedVehicle) && (
              <div>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '13px' }}>VEHICLE</h4>
                {vehicles.map(v => v.id === selectedVehicle && (
                  <div key={v.id} style={{ padding: '10px', background: '#f0f5f0', border: '2px solid #00aa44', borderRadius: '4px' }}>
                    <div style={{ fontWeight: 'bold', color: v.color }}>{v.type}</div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                      Division: {v.division}<br />
                      Capacity: {v.capacity} personnel<br />
                      Assigned: {v.assigned.length}/{v.capacity}<br />
                      Zone: {v.zone}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedUnit === null && selectedVehicle === null && (
              <div style={{ color: '#999', fontSize: '12px' }}>
                <h4>STATUS OVERVIEW</h4>
                <div style={{ margin: '10px 0' }}>
                  <strong>Staging:</strong> {units.filter(u => u.zone === 'staging').length} units
                </div>
                <div style={{ margin: '10px 0' }}>
                  <strong>Command:</strong> {units.filter(u => u.zone === 'command').length} units
                </div>
                <div style={{ margin: '10px 0' }}>
                  <strong>Incident:</strong> {units.filter(u => u.zone === 'incident').length} units
                </div>
                <div style={{ margin: '10px 0' }}>
                  <strong>Total Personnel:</strong> {units.length}
                </div>
                <div style={{ margin: '10px 0' }}>
                  <strong>Total Vehicles:</strong> {vehicles.length}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ICSSimulator;
