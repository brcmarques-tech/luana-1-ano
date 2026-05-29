// Mapa do Rio Grande do Sul com zoom procedural até as coordenadas alvo.
// Tudo SVG pra escalar bem. Path simplificado do contorno do RS.

import { REVEAL } from './data.js';

// Contorno simplificado do RS em coords (longitude, latitude).
// 24 pontos aproximam bem o estado pra silhueta estilizada.
const RS_OUTLINE = [
  [-53.6, -27.1], // norte (canto com SC perto de Iraí)
  [-51.5, -27.9], // serra gaúcha norte
  [-50.5, -28.5],
  [-49.7, -29.3], // Torres
  [-50.0, -30.2], // litoral norte
  [-50.5, -31.0],
  [-51.5, -31.8], // Mostardas
  [-52.1, -32.2],
  [-52.3, -33.0], // Rio Grande
  [-52.6, -33.5],
  [-53.5, -33.7], // Chuí
  [-53.7, -33.6],
  [-54.5, -32.9], // fronteira com Uruguai
  [-55.5, -31.0],
  [-56.0, -30.5],
  [-57.0, -30.2],
  [-57.6, -30.0], // Barra do Quaraí
  [-57.5, -29.5],
  [-56.5, -29.0],
  [-55.9, -28.3], // Argentina norte
  [-55.5, -27.8],
  [-54.6, -27.4],
  [-54.0, -27.2],
  [-53.6, -27.1], // volta ao início
];

// Bounding box do RS (calculado dos pontos acima).
const BBOX = {
  west:  -57.6,
  east:  -49.7,
  north: -27.1,
  south: -33.7,
};

// Converte (lon, lat) → (x, y) no viewBox 0-1000 x 0-1000.
const projectToSVG = (lon, lat, viewW = 1000, viewH = 1000) => {
  const w = BBOX.east - BBOX.west;
  const h = BBOX.south - BBOX.north; // h é negativo (norte > sul em valor absoluto)
  const x = ((lon - BBOX.west) / w) * viewW;
  const y = ((lat - BBOX.north) / h) * viewH;
  return [x, y];
};

const buildOutlinePath = () => {
  const pts = RS_OUTLINE.map(([lon, lat]) => projectToSVG(lon, lat));
  return 'M ' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L ') + ' Z';
};

export const buildMapHTML = () => {
  const path = buildOutlinePath();
  const [pinX, pinY] = projectToSVG(REVEAL.lon, REVEAL.lat);

  return `
    <div class="cn-map-stage" id="cn-map-stage">
      <svg class="cn-map-svg" id="cn-map-svg" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="cn-glow-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#ffd93d" stop-opacity="0.9" />
            <stop offset="40%" stop-color="#ff5e8a" stop-opacity="0.5" />
            <stop offset="100%" stop-color="#ff5e8a" stop-opacity="0" />
          </radialGradient>
          <filter id="cn-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        <!-- contorno do RS feito de estrelas pequenas conectadas -->
        <path d="${path}" class="cn-map-outline" />

        <!-- pin no ponto alvo -->
        <g class="cn-pin-group" transform="translate(${pinX.toFixed(1)} ${pinY.toFixed(1)})">
          <circle r="50" fill="url(#cn-glow-grad)" class="cn-pin-glow" />
          <circle r="6" fill="#ffd93d" class="cn-pin-core" />
          <circle r="14" fill="none" stroke="#ffd93d" stroke-width="1.2" class="cn-pin-ring" />
        </g>
      </svg>
    </div>`;
};

// Calcula transform pra zoom in até o pin (em coords do viewBox).
export const computeZoomTransform = (containerW, containerH, scale = 4) => {
  const [pinX, pinY] = projectToSVG(REVEAL.lon, REVEAL.lat);
  // Centralizar o pin: translate pra ele ficar no centro do container
  const tx = (500 - pinX) * scale;
  const ty = (500 - pinY) * scale;
  return { tx, ty, scale };
};
