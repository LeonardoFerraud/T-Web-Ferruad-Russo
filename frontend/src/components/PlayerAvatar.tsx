import React from 'react';

interface PlayerAvatarProps {
    height?: number; // In cm
    weight?: number; // In kg
    color?: string;  // Main jersey color
    accent?: string; // Accent color
}

const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ 
    height = 180, 
    weight = 75, 
    color = '#4ade80',
    accent = '#16a34a'
}) => {
    // Determine realistic BMI limits to avoid breaking the SVG
    const safeHeight = height > 100 ? height : 180;
    const safeWeight = weight > 30 ? weight : 75;

    // Standard BMI for a fit football player is around 22.5
    // BMI = weight(kg) / height(m)^2
    const bmi = safeWeight / Math.pow(safeHeight / 100, 2);
    const standardBmi = 22.5;

    // Bulk factor (width scale). We constrain it so the player doesn't look ridiculous
    let bulkFactor = bmi / standardBmi;
    bulkFactor = Math.max(0.85, Math.min(bulkFactor, 1.3));

    // Tallness factor (height scale for the torso)
    let tallFactor = safeHeight / 180;
    tallFactor = Math.max(0.9, Math.min(tallFactor, 1.15));

    // Head scaling is much subtler than body scaling
    const headScale = 1 + (bulkFactor - 1) * 0.2;

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            <svg viewBox="0 0 100 120" style={{ width: '90%', height: '100%', overflow: 'visible' }}>
                <defs>
                    <linearGradient id="jerseyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={color} />
                        <stop offset="100%" stopColor={accent} />
                    </linearGradient>
                    <linearGradient id="skinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#cbd5e1" />
                        <stop offset="100%" stopColor="#64748b" />
                    </linearGradient>
                    <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={color} floodOpacity="0.4" />
                    </filter>
                    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                        <feDropShadow dx="0" dy="5" stdDeviation="3" floodColor="#000" floodOpacity="0.5" />
                    </filter>
                </defs>

                {/* Torso & Shoulders (Varies with Weight and Height) */}
                <g transform={`translate(50, 120) scale(${bulkFactor}, ${tallFactor}) translate(-50, -120)`}>
                    {/* Main Jersey */}
                    <path 
                        d="M 22 120 L 22 85 C 22 62, 34 52, 50 52 C 66 52, 78 62, 78 85 L 78 120 Z" 
                        fill="url(#jerseyGradient)" 
                        filter="url(#shadow)"
                    />
                    
                    {/* Jersey Sleeves/Arms */}
                    <path d="M 22 62 C 12 70, 8 85, 8 100 L 22 100 Z" fill="url(#jerseyGradient)" opacity="0.9" />
                    <path d="M 78 62 C 88 70, 92 85, 92 100 L 78 100 Z" fill="url(#jerseyGradient)" opacity="0.9" />

                    {/* V-Neck Collar Detail */}
                    <path d="M 40 52 L 50 65 L 60 52" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
                    
                    {/* Jersey Chest Pattern (Subtle chevron) */}
                    <path d="M 30 75 L 50 85 L 70 75" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" strokeLinecap="round" />
                </g>

                {/* Head & Neck (Varies slightly) */}
                <g transform={`translate(50, 52) scale(${headScale}) translate(-50, -52)`}>
                    {/* Neck */}
                    <path d="M 44 52 L 44 40 L 56 40 L 56 52 Z" fill="url(#skinGradient)" filter="url(#shadow)" />
                    
                    {/* Head Silhouette */}
                    <path 
                        d="M 50 10 C 62 10, 65 20, 65 28 C 65 38, 58 45, 50 45 C 42 45, 35 38, 35 28 C 35 20, 38 10, 50 10 Z" 
                        fill="url(#skinGradient)" 
                        filter="url(#neonGlow)"
                    />
                    
                    {/* Simple stylized visor/eyes line for a futuristic sports look */}
                    <path d="M 40 26 C 45 28, 55 28, 60 26" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="2" strokeLinecap="round" />
                </g>
            </svg>
        </div>
    );
};

export default PlayerAvatar;
