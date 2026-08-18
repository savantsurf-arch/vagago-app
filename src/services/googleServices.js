// Google Maps Geocoding, Places Autocomplete, Directions Routes & Advanced Navigation Engine

// Places Autocomplete Dictionary centered on Itabuna & Bahia Pilot Region
export const GOOGLE_PLACES_SUGGESTIONS = [
  { id: "g1", title: "Av. Cinquentenário - Centro", subtitle: "Centro Comercial de Itabuna - BA", lat: -14.7966, lng: -39.2789 },
  { id: "g2", title: "Shopping Jequitibá", subtitle: "Av. José Soares Pinheiro, 2141 - Centro, Itabuna - BA", lat: -14.7905, lng: -39.2712 },
  { id: "g3", title: "Bairro São Caetano", subtitle: "Av. Princesa Isabel - São Caetano, Itabuna - BA", lat: -14.8050, lng: -39.2810 },
  { id: "g4", title: "Bairro Fátima", subtitle: "Rua Saturnino José Soares - Fátima, Itabuna - BA", lat: -14.7890, lng: -39.2820 },
  { id: "g5", title: "HBR Medical Center / Hospital Calixto Midlej", subtitle: "Rua Antônio Muniz - Centro, Itabuna - BA", lat: -14.7950, lng: -39.2770 },
  { id: "g6", title: "Prefeitura Municipal de Itabuna", subtitle: "Av. Princesa Isabel - São Caetano, Itabuna - BA", lat: -14.8030, lng: -39.2795 }
];

export function searchGooglePlaces(query) {
  if (!query) return GOOGLE_PLACES_SUGGESTIONS;
  const clean = query.toLowerCase().trim();
  return GOOGLE_PLACES_SUGGESTIONS.filter(p =>
    p.title.toLowerCase().includes(clean) ||
    p.subtitle.toLowerCase().includes(clean)
  );
}

// Convert address to Lat/Lng and Entrance Lat/Lng (Geocoding API Simulation)
export function geocodeAddress(addressString) {
  const hash = addressString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const offsetLat = ((hash % 100) - 50) * 0.0001;
  const offsetLng = ((hash % 80) - 40) * 0.0001;

  const baseLat = -14.7966 + offsetLat;
  const baseLng = -39.2789 + offsetLng;

  return {
    lat: parseFloat(baseLat.toFixed(6)),
    lng: parseFloat(baseLng.toFixed(6)),
    entranceLat: parseFloat((baseLat + 0.00015).toFixed(6)),
    entranceLng: parseFloat((baseLng - 0.00012).toFixed(6))
  };
}

// Generate Polyline Coordinates connecting User Lat/Lng to Destination Lat/Lng
export function generateGoogleDirectionsPolyline(startLat, startLng, endLat, endLng, routeOffset = 0) {
  if (!startLat || !startLng || !endLat || !endLng) return [];

  const midLat1 = startLat + (endLat - startLat) * 0.25 + (0.0004 + routeOffset * 0.0003);
  const midLng1 = startLng + (endLng - startLng) * 0.20 - (0.0003 - routeOffset * 0.0002);
  const midLat2 = startLat + (endLat - startLat) * 0.60 - (0.0003 - routeOffset * 0.0004);
  const midLng2 = startLng + (endLng - startLng) * 0.70 + (0.0005 + routeOffset * 0.0003);
  const midLat3 = startLat + (endLat - startLat) * 0.85 + (0.0002 + routeOffset * 0.0001);
  const midLng3 = startLng + (endLng - startLng) * 0.90 - (0.0001 - routeOffset * 0.0002);

  return [
    [startLat, startLng],
    [midLat1, midLng1],
    [midLat2, midLng2],
    [midLat3, midLng3],
    [endLat, endLng]
  ];
}

// Calculate 3 Alternative Routes (Fastest, Shortest, Alternative) with Mode (Car vs Walking)
export function calculateAlternativeRoutes(startLat, startLng, endLat, endLng, mode = 'CAR') {
  const distKm = Math.sqrt(Math.pow(endLat - startLat, 2) + Math.pow(endLng - startLng, 2)) * 111.32;
  const safeDistKm = Math.max(0.2, parseFloat(distKm.toFixed(1)));

  let baseMins = 0;
  if (mode === 'WALKING') {
    baseMins = Math.max(3, Math.round((safeDistKm / 4.8) * 60));
  } else {
    baseMins = Math.max(2, Math.round((safeDistKm / 22) * 60));
  }

  let trafficStatus = "🟢 Trânsito Livre";
  if (baseMins > 12 && mode === 'CAR') trafficStatus = "🟡 Trânsito Moderado";
  if (baseMins > 25 && mode === 'CAR') trafficStatus = "🔴 Trânsito Intenso";

  return {
    fastest: {
      id: 'fastest',
      title: '⚡ Rota Mais Rápida',
      subtitle: 'Via Av. Cinquentenário (Recomendada)',
      distanceKm: safeDistKm,
      etaMinutes: baseMins,
      etaString: `${baseMins} min (${safeDistKm} km)`,
      trafficStatus,
      polyline: generateGoogleDirectionsPolyline(startLat, startLng, endLat, endLng, 0)
    },
    shortest: {
      id: 'shortest',
      title: '🛣️ Rota Mais Curta',
      subtitle: 'Via Ruas Secundárias do Centro',
      distanceKm: Math.max(0.1, parseFloat((safeDistKm * 0.85).toFixed(1))),
      etaMinutes: Math.max(2, baseMins - 1),
      etaString: `${Math.max(2, baseMins - 1)} min (${Math.max(0.1, parseFloat((safeDistKm * 0.85).toFixed(1)))} km)`,
      trafficStatus: "🟢 Trânsito Livre",
      polyline: generateGoogleDirectionsPolyline(startLat, startLng, endLat, endLng, 1)
    },
    alternative: {
      id: 'alternative',
      title: '🌳 Rota Alternativa',
      subtitle: 'Evitando cruzamentos de pico',
      distanceKm: parseFloat((safeDistKm * 1.2).toFixed(1)),
      etaMinutes: baseMins + 3,
      etaString: `${baseMins + 3} min (${parseFloat((safeDistKm * 1.2).toFixed(1))} km)`,
      trafficStatus: "🟢 Trânsito Livre",
      polyline: generateGoogleDirectionsPolyline(startLat, startLng, endLat, endLng, 2)
    }
  };
}

// Calculate Google Directions ETA & Traffic condition
export function calculateGoogleETA(distanceKm) {
  const baseMinutes = Math.max(2, Math.round((distanceKm / 22) * 60));
  let trafficStatus = "🟢 Trânsito Livre";
  if (baseMinutes > 12) trafficStatus = "🟡 Trânsito Moderado";

  return {
    etaMinutes: baseMinutes,
    etaString: `${baseMinutes} min de viagem`,
    trafficStatus
  };
}

// Generate assigned garage box/slot number
export function assignGarageBoxNumber(spaceId) {
  const letters = ["A", "B", "C", "D"];
  const letter = letters[Math.floor(Math.random() * letters.length)];
  const num = Math.floor(1 + Math.random() * 20);
  return `Box ${letter}-${num < 10 ? '0' + num : num} (Subsolo 1)`;
}
