import React from 'react';

interface ScoreGaugeProps {
  score: number;
  size?: number;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, size = 120 }) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  let colorClass = "text-red-500";
  let gradientId = "grad-red";
  
  if (score >= 50) {
    colorClass = "text-yellow-500";
    gradientId = "grad-yellow";
  }
  if (score >= 75) {
    colorClass = "text-emerald-500";
    gradientId = "grad-green";
  }

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full drop-shadow-lg">
        <defs>
            <linearGradient id="grad-green" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{stopColor: '#10B981', stopOpacity:1}} />
                <stop offset="100%" style={{stopColor: '#34D399', stopOpacity:1}} />
            </linearGradient>
            <linearGradient id="grad-yellow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{stopColor: '#F59E0B', stopOpacity:1}} />
                <stop offset="100%" style={{stopColor: '#FBBF24', stopOpacity:1}} />
            </linearGradient>
            <linearGradient id="grad-red" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{stopColor: '#EF4444', stopOpacity:1}} />
                <stop offset="100%" style={{stopColor: '#F87171', stopOpacity:1}} />
            </linearGradient>
        </defs>
        <circle
          className="text-gray-100"
          strokeWidth="8"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="50%"
          cy="50%"
        />
        <circle
          className="transition-all duration-1000 ease-out"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke={`url(#${gradientId})`}
          fill="transparent"
          r={radius}
          cx="50%"
          cy="50%"
        />
      </svg>
      <div className="absolute flex flex-col items-center animate-fade-in">
        <span className={`text-4xl font-bold text-gray-800 font-heading`}>{score}</span>
        <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mt-1">ATS Score</span>
      </div>
    </div>
  );
};