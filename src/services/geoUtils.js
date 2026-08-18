// Geo Utility functions for Haversine calculations, travel times, smart recommendations & geocoding

// Haversine formula to calculate exact distance in KM between two coordinates
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Number(d.toFixed(2));
}

// Format distance string (e.g., "350 m" or "1.4 km")
export function formatDistance(distanceKm) {
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

// Estimate walking time in minutes (based on avg walking speed of 4.5 km/h ~ 75 m/min)
export function estimateWalkingTime(distanceKm) {
  const minutes = Math.max(1, Math.round((distanceKm / 4.5) * 60));
  return `${minutes} min a pé`;
}

// Estimate driving time in minutes (based on avg urban driving speed of 25 km/h ~ 416 m/min + traffic lights)
export function estimateDrivingTime(distanceKm) {
  const minutes = Math.max(1, Math.round((distanceKm / 25) * 60));
  return `${minutes} min de carro`;
}

// Smart Geocoding Dictionary & Lookup function (maps user search terms to lat/lng)
const KNOWN_LOCATIONS = {
  "itabuna": { name: "Centro, Itabuna - BA", lat: -14.7966, lng: -39.2789 },
  "centro de itabuna": { name: "Centro, Itabuna - BA", lat: -14.7966, lng: -39.2789 },
  "paulista": { name: "Av. Paulista, São Paulo - SP", lat: -23.561414, lng: -46.655881 },
  "bela vista": { name: "Bela Vista, São Paulo - SP", lat: -23.561414, lng: -46.655881 },
  "faria lima": { name: "Faria Lima, São Paulo - SP", lat: -23.570198, lng: -46.689025 },
  "pinheiros": { name: "Pinheiros, São Paulo - SP", lat: -23.570198, lng: -46.689025 },
  "moema": { name: "Moema, São Paulo - SP", lat: -23.606821, lng: -46.662198 },
  "copacabana": { name: "Copacabana, Rio de Janeiro - RJ", lat: -22.969821, lng: -43.186452 },
  "centro": { name: "Centro Histórico, São Paulo - SP", lat: -23.5489, lng: -46.6388 }
};

export function geocodeAddress(addressQuery) {
  if (!addressQuery) return null;
  const clean = addressQuery.trim().toLowerCase();
  
  for (const [key, val] of Object.entries(KNOWN_LOCATIONS)) {
    if (clean.includes(key)) {
      return val;
    }
  }

  // Default fallback center if unknown address
  return {
    name: addressQuery,
    lat: -23.561414,
    lng: -46.655881
  };
}

// Smart Engine: "Estacionar Perto de Mim" Recommendations
export function calculateSmartParkOptions(spots = [], userLat, userLng) {
  if (!spots || spots.length === 0) return null;

  // Enrich spots with calculated distance
  const enriched = spots.map(s => {
    const dist = calculateDistanceKm(userLat, userLng, s.lat, s.lng);
    // Score combines price (lower is better), rating (higher is better), and distance (lower is better)
    // Formula: (rating * 20) - (priceHourly * 2) - (dist * 5)
    const score = (s.rating * 20) - (s.priceHourly * 2) - (dist * 5);
    return {
      ...s,
      calculatedDistKm: dist,
      distFormatted: formatDistance(dist),
      walkTime: estimateWalkingTime(dist),
      driveTime: estimateDrivingTime(dist),
      smartScore: score
    };
  });

  // 1. MAIS PRÓXIMA (Smallest distance)
  const closest = [...enriched].sort((a, b) => a.calculatedDistKm - b.calculatedDistKm)[0];

  // 2. MAIS BARATA (Lowest hourly price)
  const cheapest = [...enriched].sort((a, b) => a.priceHourly - b.priceHourly)[0];

  // 3. MELHOR AVALIADA (Highest rating)
  const topRated = [...enriched].sort((a, b) => b.rating - a.rating)[0];

  // 4. MELHOR OPÇÃO (Highest calculated smart score)
  const bestOverall = [...enriched].sort((a, b) => b.smartScore - a.smartScore)[0];

  return {
    bestOverall,
    closest,
    cheapest,
    topRated,
    allEnriched: enriched
  };
}

// Open native maps app for navigation ("🧭 COMO CHEGAR")
export function openExternalNavigation(lat, lng, address = '') {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  if (isMobile && /iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    // Apple Maps
    window.open(`https://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`, '_blank');
  } else {
    // Google Maps API / Deep Link
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  }
}
