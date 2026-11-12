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

// Smart Geocoding Dictionary & Lookup function (Itabuna - BA + fallbacks locais)
const KNOWN_LOCATIONS = {
  "jequitiba": { name: "Shopping Jequitibá, Itabuna - BA", lat: -14.7879, lng: -39.2673 },
  "shopping": { name: "Shopping Jequitibá, Itabuna - BA", lat: -14.7879, lng: -39.2673 },
  "salobrinho": { name: "Rod. Jorge Amado / Salobrinho, Itabuna - BA", lat: -14.7885, lng: -39.2665 },
  "cinquentenario": { name: "Av. do Cinquentenário, Centro, Itabuna - BA", lat: -14.7966, lng: -39.2789 },
  "cinqüentenário": { name: "Av. do Cinquentenário, Centro, Itabuna - BA", lat: -14.7966, lng: -39.2789 },
  "fatima": { name: "Bairro de Fátima, Itabuna - BA", lat: -14.7945, lng: -39.2862 },
  "fátima": { name: "Bairro de Fátima, Itabuna - BA", lat: -14.7945, lng: -39.2862 },
  "goes calmon": { name: "Góes Calmon, Itabuna - BA", lat: -14.7918, lng: -39.2768 },
  "góes calmon": { name: "Góes Calmon, Itabuna - BA", lat: -14.7918, lng: -39.2768 },
  "jardim vitoria": { name: "Jardim Vitória, Itabuna - BA", lat: -14.7858, lng: -39.2712 },
  "jardim vitória": { name: "Jardim Vitória, Itabuna - BA", lat: -14.7858, lng: -39.2712 },
  "sao caetano": { name: "São Caetano, Itabuna - BA", lat: -14.8012, lng: -39.2815 },
  "são caetano": { name: "São Caetano, Itabuna - BA", lat: -14.8012, lng: -39.2815 },
  "pontalzinho": { name: "Pontalzinho, Itabuna - BA", lat: -14.7988, lng: -39.2848 },
  "conceicao": { name: "Conceição, Itabuna - BA", lat: -14.7975, lng: -39.2722 },
  "conceição": { name: "Conceição, Itabuna - BA", lat: -14.7975, lng: -39.2722 },
  "centro": { name: "Centro, Itabuna - BA", lat: -14.7966, lng: -39.2789 },
  "itabuna": { name: "Centro, Itabuna - BA", lat: -14.7966, lng: -39.2789 }
};

export function geocodeAddress(addressQuery) {
  if (!addressQuery) return null;
  const clean = addressQuery.trim().toLowerCase();

  for (const [key, val] of Object.entries(KNOWN_LOCATIONS)) {
    if (clean.includes(key)) {
      return val;
    }
  }

  // Fallback padrão em Itabuna - BA para nunca desviar para outra cidade
  return {
    name: `${addressQuery}, Itabuna - BA`,
    lat: -14.7966,
    lng: -39.2789
  };
}

// Smart Engine: "Estacionar Perto de Mim" Recommendations
export function calculateSmartParkOptions(spots = [], userLat, userLng) {
  if (!spots || spots.length === 0) return null;

  const activeSpots = spots.filter(
    s => s && s.status !== 'Pausada' && s.isAvailable !== false && s.availabilityStatus !== 'Indisponível'
  );
  const sourceSpots = activeSpots.length > 0 ? activeSpots : spots.filter(Boolean);
  if (sourceSpots.length === 0) return null;

  // Enrich spots with safe numeric distance, rating & smartScore
  const enriched = sourceSpots.map((s) => {
    const spotLat = Number(s.lat || -14.7966);
    const spotLng = Number(s.lng || -39.2789);
    const dist = calculateDistanceKm(userLat, userLng, spotLat, spotLng);
    const ratingVal = Number(s.rating || 4.8);
    const reviewsVal = Number(s.reviewsCount || 0);
    const priceVal = Number(s.priceHourly || 6);
    const coveredBonus = s.isCovered ? 1.5 : 0;

    // Score combines rating, price, proximity, review confidence and covered status
    const score = (ratingVal * 20) - (priceVal * 2) - (dist * 5) + Math.min(reviewsVal, 20) * 0.15 + coveredBonus;

    return {
      ...s,
      rating: ratingVal,
      reviewsCount: reviewsVal,
      priceHourly: priceVal,
      calculatedDistKm: dist,
      distFormatted: formatDistance(dist),
      walkTime: estimateWalkingTime(dist),
      driveTime: estimateDrivingTime(dist),
      smartScore: Number(score.toFixed(2))
    };
  });

  // Helper to pick distinct winners whenever possible so categories don't show duplicate cards
  const usedIds = new Set();
  const usedAddresses = new Set();
  const normalizeAddr = (addr) => (addr || '').trim().toLowerCase().replace(/\s+/g, ' ');

  const pickCandidate = (sortedList, preferDistinct = true) => {
    if (!sortedList || sortedList.length === 0) return null;
    if (preferDistinct) {
      const distinct = sortedList.find(
        item => !usedIds.has(item.id) && !usedAddresses.has(normalizeAddr(item.address))
      );
      if (distinct) {
        usedIds.add(distinct.id);
        usedAddresses.add(normalizeAddr(distinct.address));
        return distinct;
      }
      const distinctById = sortedList.find(item => !usedIds.has(item.id));
      if (distinctById) {
        usedIds.add(distinctById.id);
        return distinctById;
      }
    }
    const first = sortedList[0];
    usedIds.add(first.id);
    usedAddresses.add(normalizeAddr(first.address));
    return first;
  };

  // 1. MELHOR OPÇÃO (Highest overall smart score — top balanced pick)
  const bestOverallList = [...enriched].sort(
    (a, b) => (b.smartScore - a.smartScore) || (b.reviewsCount - a.reviewsCount) || (a.calculatedDistKm - b.calculatedDistKm)
  );
  const bestOverall = pickCandidate(bestOverallList, false);

  // 2. MAIS PRÓXIMA (Smallest distance)
  const closestList = [...enriched].sort(
    (a, b) => (a.calculatedDistKm - b.calculatedDistKm) || (b.smartScore - a.smartScore)
  );
  const closest = pickCandidate(closestList, enriched.length > 1);

  // 3. MAIS BARATA (Lowest hourly price)
  const cheapestList = [...enriched].sort(
    (a, b) => (a.priceHourly - b.priceHourly) || (a.calculatedDistKm - b.calculatedDistKm)
  );
  const cheapest = pickCandidate(cheapestList, true);

  // 4. MELHOR AVALIADA (Highest rating & reviews among remaining distinct spots)
  const topRatedList = [...enriched].sort(
    (a, b) => (b.rating - a.rating) || (b.reviewsCount - a.reviewsCount) || (b.smartScore - a.smartScore)
  );
  const topRated = pickCandidate(topRatedList, true);

  return {
    bestOverall,
    closest,
    cheapest,
    topRated,
    allEnriched: bestOverallList
  };
}

// Links padronizados para apps externos de navegação ("Como Chegar")
export function getNavigationLinks(lat, lng, address = '') {
  const hasCoords =
    lat !== null &&
    lat !== undefined &&
    lng !== null &&
    lng !== undefined &&
    !Number.isNaN(Number(lat)) &&
    !Number.isNaN(Number(lng));

  const dest = hasCoords
    ? `${Number(lat)},${Number(lng)}`
    : encodeURIComponent(address || 'Itabuna, BA');

  return {
    googleMapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`,
    wazeUrl: hasCoords
      ? `https://waze.com/ul?ll=${Number(lat)},${Number(lng)}&navigate=yes`
      : `https://waze.com/ul?q=${encodeURIComponent(address || 'Itabuna, BA')}&navigate=yes`,
    appleMapsUrl: `https://maps.apple.com/?daddr=${dest}&dirflg=d`
  };
}

// Busca trajeto de carro via OSRM (OpenStreetMap gratuito) com fallback em linha reta
export async function fetchDrivingRoute(fromLat, fromLng, toLat, toLng) {
  const fLat = Number(fromLat);
  const fLng = Number(fromLng);
  const tLat = Number(toLat);
  const tLng = Number(toLng);

  if ([fLat, fLng, tLat, tLng].some((v) => Number.isNaN(v))) {
    return null;
  }

  const straightDistKm = calculateDistanceKm(fLat, fLng, tLat, tLng);
  const fallbackRoute = {
    coordinates: [
      [fLat, fLng],
      [tLat, tLng]
    ],
    distanceKm: straightDistKm,
    durationMin: Math.max(1, Math.round((straightDistKm / 25) * 60)),
    isEstimated: true
  };

  if (typeof fetch !== 'function') {
    return fallbackRoute;
  }

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeoutId = controller ? setTimeout(() => controller.abort(), 3500) : null;

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${fLng},${fLat};${tLng},${tLat}?overview=full&geometries=geojson`;
    const res = await fetch(url, { signal: controller?.signal });
    if (!res.ok) return fallbackRoute;

    const data = await res.json();
    const route = data?.routes?.[0];
    const rawCoords = route?.geometry?.coordinates;
    if (!Array.isArray(rawCoords) || rawCoords.length < 2) {
      return fallbackRoute;
    }

    return {
      coordinates: rawCoords.map(([lng, lat]) => [lat, lng]),
      distanceKm: Number(((route.distance || straightDistKm * 1000) / 1000).toFixed(2)),
      durationMin: Math.max(1, Math.round((route.duration || 60) / 60)),
      isEstimated: false
    };
  } catch {
    return fallbackRoute;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

// Open native maps app for navigation ("🧭 COMO CHEGAR")
export function openExternalNavigation(lat, lng, address = '') {
  const { appleMapsUrl, googleMapsUrl } = getNavigationLinks(lat, lng, address);
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const isIOS = /iPhone|iPad|iPod/i.test(ua);

  window.open(isIOS ? appleMapsUrl : googleMapsUrl, '_blank', 'noopener,noreferrer');
}
