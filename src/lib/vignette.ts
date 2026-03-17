/**
 * Générateur de vignettes Capsuléo
 * Crée une image stylisée (Data URL SVG) basée sur le titre du module
 */
export function generateVignette(title: string): string {
  const hash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Palettes de couleurs premium
  const palettes = [
    { start: "#132E53", end: "#0070FF", accent: "#fbbf24" }, // MUC Classic
    { start: "#1e1b4b", end: "#4338ca", accent: "#818cf8" }, // Deep Indigo
    { start: "#111827", end: "#1e3a8a", accent: "#60a5fa" }, // Ocean Night
    { start: "#020617", end: "#312e81", accent: "#fbbf24" }, // Golden Space
  ];
  
  const palette = palettes[hash % palettes.length];
  const initials = title.substring(0, 2).toUpperCase();
  
  const svg = `
    <svg width="600" height="400" viewBox="0 0 600 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${palette.start};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${palette.end};stop-opacity:1" />
        </linearGradient>
        <filter id="blur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="40" />
        </filter>
      </defs>
      
      <!-- Fond -->
      <rect width="600" height="400" fill="url(#grad)" />
      
      <!-- Cercles de lumière -->
      <circle cx="500" cy="100" r="150" fill="${palette.accent}" fill-opacity="0.1" filter="url(#blur)" />
      <circle cx="100" cy="300" r="120" fill="white" fill-opacity="0.05" filter="url(#blur)" />
      
      <!-- Texte Décoratif -->
      <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" 
            fill="white" fill-opacity="0.1" font-family="sans-serif" font-weight="900" font-size="200">
        ${initials}
      </text>
      
      <!-- Ligne d'accent -->
      <rect x="50" y="340" width="100" height="6" rx="3" fill="${palette.accent}" />
      
      <!-- Label Capsuléo -->
      <text x="50" y="370" fill="white" fill-opacity="0.4" font-family="sans-serif" font-weight="800" font-size="14" letter-spacing="0.2em">
        CAPSULÉO IA GENERATED
      </text>
    </svg>
  `.trim();
  
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}
