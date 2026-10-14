// Visual analog clock for teaching time — big, clear, kid-friendly
import React from 'react';

export default function VisualClock({ timeStr, size = 200 }) {
  // Parse "7 o clock" or "7 thirty"
  const parts = timeStr.split(' ');
  const hour = parseInt(parts[0]) || 12;
  const isHalf = parts[1] === 'thirty';

  // Calculate hand angles
  const minuteAngle = isHalf ? 180 : 0; // 30 min = 180°, 0 min = 0°
  const hourAngle = ((hour % 12) + (isHalf ? 0.5 : 0)) * 30; // 30° per hour

  const cx = 100, cy = 100, r = 90;

  // Hour markers
  const markers = [];
  for (let i = 1; i <= 12; i++) {
    const a = (i * 30 * Math.PI) / 180;
    const x1 = cx + (r - 12) * Math.sin(a);
    const y1 = cy - (r - 12) * Math.cos(a);
    const x2 = cx + r * Math.sin(a);
    const y2 = cy - r * Math.cos(a);
    markers.push(
      <g key={i}>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fff" strokeWidth={i % 3 === 0 ? 4 : 2} />
        <text x={cx + (r - 25) * Math.sin(a)} y={cy - (r - 25) * Math.cos(a) + 5}
          textAnchor="middle" fontSize="14" fontWeight="bold" fill="#fff">{i}</text>
      </g>
    );
  }

  const hand = (angle, len, w, color) => {
    const a = (angle * Math.PI) / 180;
    return (
      <line x1={cx} y1={cy}
        x2={cx + len * Math.sin(a)} y2={cy - len * Math.cos(a)}
        stroke={color} strokeWidth={w} strokeLinecap="round" />
    );
  };

  return (
    <svg width={size} height={size} viewBox="0 0 200 200"
      style={{ filter: 'drop-shadow(0 0 20px rgba(0,229,255,.4))' }}>
      <circle cx={cx} cy={cy} r={r + 5} fill="#1a0f2e" stroke="#00e5ff" strokeWidth="3" />
      {markers}
      {/* Hour hand (short, yellow) */}
      {hand(hourAngle, 45, 8, '#ffe600')}
      {/* Minute hand (long, cyan) */}
      {hand(minuteAngle, 70, 5, '#00e5ff')}
      <circle cx={cx} cy={cy} r="8" fill="#E91E8C" />
      {/* Labels */}
      <text x={cx} y={195} textAnchor="middle" fontSize="11" fill="#b9a8e8">
        🟡 short = hour &nbsp; 🔵 long = minute
      </text>
    </svg>
  );
}
