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

// Geocodificação real via OpenStreetMap Nominatim (gratuita) com fallback local em Itabuna - BA
export async function geocodeAddressOSM(addressQuery) {
  const localFallback = geocodeAddress(addressQuery);
  if (!addressQuery || typeof fetch !== 'function') {
    return localFallback;
  }

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeoutId = controller ? setTimeout(() => controller.abort(), 3000) : null;
  const q = addressQuery.toLowerCase().includes('itabuna')
    ? addressQuery
    : `${addressQuery}, Itabuna, Bahia, Brasil`;

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=br&limit=1&viewbox=-39.35,-14.74,-39.20,-14.85&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, {
      signal: controller?.signal,
      headers: { Accept: 'application/json' }
    });
    if (!res.ok) return localFallback;
    const rows = await res.json();
    if (Array.isArray(rows) && rows[0]?.lat && rows[0]?.lon) {
      return {
        name: rows[0].display_name || localFallback?.name || addressQuery,
        lat: Number(parseFloat(rows[0].lat).toFixed(6)),
        lng: Number(parseFloat(rows[0].lon).toFixed(6))
      };
    }
    return localFallback;
  } catch {
    return localFallback;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

// Links padronizados usando OpenStreetMap (principal) + Waze + Apple Maps
export function getNavigationLinks(lat, lng, address = '', origin = null) {
  const hasCoords =
    lat !== null &&
    lat !== undefined &&
    lng !== null &&
    lng !== undefined &&
    !Number.isNaN(Number(lat)) &&
    !Number.isNaN(Number(lng));

  const hasOrigin =
    origin &&
    origin.lat !== null &&
    origin.lat !== undefined &&
    origin.lng !== null &&
    origin.lng !== undefined &&
    !Number.isNaN(Number(origin.lat)) &&
    !Number.isNaN(Number(origin.lng));

  const cleanLat = hasCoords ? Number(lat) : null;
  const cleanLng = hasCoords ? Number(lng) : null;
  const dest = hasCoords
    ? `${cleanLat},${cleanLng}`
    : encodeURIComponent(address || 'Itabuna, BA');

  const openStreetMapUrl = hasCoords
    ? hasOrigin
      ? `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${Number(origin.lat)}%2C${Number(origin.lng)}%3B${cleanLat}%2C${cleanLng}`
      : `https://www.openstreetmap.org/?mlat=${cleanLat}&mlon=${cleanLng}#map=17/${cleanLat}/${cleanLng}`
    : `https://www.openstreetmap.org/search?query=${encodeURIComponent(address || 'Itabuna, BA')}`;

  return {
    openStreetMapUrl,
    wazeUrl: hasCoords
      ? `https://waze.com/ul?ll=${cleanLat},${cleanLng}&navigate=yes`
      : `https://waze.com/ul?q=${encodeURIComponent(address || 'Itabuna, BA')}&navigate=yes`,
    appleMapsUrl: `https://maps.apple.com/?daddr=${dest}&dirflg=d`
  };
}

// Busca trajeto real via OSRM (OpenStreetMap gratuito) com fallback em linha reta
export async function fetchDrivingRoute(fromLat, fromLng, toLat, toLng, mode = 'CAR') {
  const fLat = Number(fromLat);
  const fLng = Number(fromLng);
  const tLat = Number(toLat);
  const tLng = Number(toLng);

  if ([fLat, fLng, tLat, tLng].some((v) => Number.isNaN(v))) {
    return null;
  }

  const isWalking = mode === 'WALKING';
  const speedKmh = isWalking ? 4.8 : 25;
  const straightDistKm = calculateDistanceKm(fLat, fLng, tLat, tLng);
  const fallbackRoute = {
    coordinates: [
      [fLat, fLng],
      [tLat, tLng]
    ],
    distanceKm: straightDistKm,
    durationMin: Math.max(1, Math.round((straightDistKm / speedKmh) * 60)),
    isEstimated: true
  };

  if (typeof fetch !== 'function') {
    return fallbackRoute;
  }

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeoutId = controller ? setTimeout(() => controller.abort(), 3500) : null;
  const profile = isWalking ? 'foot' : 'driving';

  try {
    const url = `https://router.project-osrm.org/route/v1/${profile}/${fLng},${fLat};${tLng},${tLat}?overview=full&geometries=geojson`;
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

// Rotas alternativas baseadas em OpenStreetMap para o painel de navegação
export function calculateOsmAlternativeRoutes(startLat, startLng, endLat, endLng, mode = 'CAR', osrmRoute = null) {
  const safeDistKm = Math.max(
    0.2,
    osrmRoute?.distanceKm || calculateDistanceKm(startLat, startLng, endLat, endLng)
  );
  const baseMins = Math.max(
    1,
    osrmRoute?.durationMin || Math.round((safeDistKm / (mode === 'WALKING' ? 4.8 : 24)) * 60)
  );

  const straightLine = (offset = 0) => [
    [Number(startLat), Number(startLng)],
    [
      (Number(startLat) + Number(endLat)) / 2 + offset,
      (Number(startLng) + Number(endLng)) / 2 - offset
    ],
    [Number(endLat), Number(endLng)]
  ];

  const mainPolyline =
    Array.isArray(osrmRoute?.coordinates) && osrmRoute.coordinates.length > 1
      ? osrmRoute.coordinates
      : straightLine(0);

  let trafficStatus = '🟢 Via livre (OpenStreetMap)';
  if (baseMins > 12 && mode === 'CAR') trafficStatus = '🟡 Fluxo moderado (OSM)';

  return {
    fastest: {
      id: 'fastest',
      title: '⚡ Rota Principal (OSM)',
      subtitle: 'Via OpenStreetMap / OSRM',
      distanceKm: Number(safeDistKm.toFixed(1)),
      etaMinutes: baseMins,
      etaString: `${baseMins} min (${safeDistKm.toFixed(1)} km)`,
      trafficStatus,
      polyline: mainPolyline
    },
    shortest: {
      id: 'shortest',
      title: '🛣️ Rota Direta',
      subtitle: 'Via vias locais de Itabuna',
      distanceKm: Math.max(0.1, Number((safeDistKm * 0.92).toFixed(1))),
      etaMinutes: Math.max(1, baseMins - 1),
      etaString: `${Math.max(1, baseMins - 1)} min (${Math.max(0.1, Number((safeDistKm * 0.92).toFixed(1)))} km)`,
      trafficStatus: '🟢 Via local (OSM)',
      polyline: straightLine(0.0004)
    },
    alternative: {
      id: 'alternative',
      title: '🌳 Rota Alternativa',
      subtitle: 'Trajeto secundário OpenStreetMap',
      distanceKm: Number((safeDistKm * 1.15).toFixed(1)),
      etaMinutes: baseMins + 2,
      etaString: `${baseMins + 2} min (${Number((safeDistKm * 1.15).toFixed(1))} km)`,
      trafficStatus: '🟢 Trajeto alternativo',
      polyline: straightLine(-0.0005)
    }
  };
}

export function assignGarageBoxNumber(spaceId = '') {
  const letters = ['A', 'B', 'C', 'D'];
  const hash = String(spaceId || '').split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const letter = letters[hash % letters.length];
  const num = (hash % 18) + 1;
  return `Box ${letter}-${num < 10 ? `0${num}` : num} (Vaga Privativa)`;
}

// Abre rota externa no OpenStreetMap (ou Apple Maps no iOS se preferir)
export function openExternalNavigation(lat, lng, address = '', origin = null) {
  const { openStreetMapUrl } = getNavigationLinks(lat, lng, address, origin);
  window.open(openStreetMapUrl, '_blank', 'noopener,noreferrer');
}
