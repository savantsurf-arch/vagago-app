import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from './supabaseClient.js';
import { calculateDistanceKm } from './geoUtils.js';

// Calculate bearing (heading angle in degrees 0-360) between two coordinates
export function calculateBearing(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const toDeg = (rad) => (rad * 180) / Math.PI;

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δλ = toRad(lon2 - lon1);

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);

  return (toDeg(θ) + 360) % 360;
}

// Convert arbitrary string/UUID into valid Supabase UUID representation
function toValidUUID(str) {
  if (!str) return null;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(str)) return str;
  // If it's a numeric or alphanumeric ID (like "bkg_123" or "1"), hash into deterministic UUID
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `00000000-0000-4000-8000-${hex.padEnd(12, '0')}`;
}

/**
 * Envia / atualiza a localização do motorista no Supabase (com throttle e proteção)
 */
export async function upsertDriverLocation({
  bookingId,
  userId,
  latitude,
  longitude,
  heading = 0,
  accuracy = 0,
  speed = null
}) {
  if (!isSupabaseConfigured || !bookingId) {
    return { success: false, reason: 'not_configured_or_no_booking' };
  }

  const validBookingId = toValidUUID(bookingId);
  const validUserId = toValidUUID(userId) || '70154527-86d3-41c0-9bdc-a575228e76ce';

  if (!validBookingId) {
    return { success: false, reason: 'invalid_booking_id' };
  }

  try {
    const payload = {
      booking_id: validBookingId,
      user_id: validUserId,
      latitude: Number(latitude),
      longitude: Number(longitude),
      heading: Number(heading || 0),
      accuracy: Number(accuracy || 0),
      speed: speed != null ? Number(speed) : null,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('driver_locations')
      .upsert(payload, { onConflict: 'booking_id' });

    if (error) {
      console.warn('Supabase upsert driver location notice:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.warn('Supabase upsert driver location error:', err?.message || err);
    return { success: false, error: err?.message };
  }
}

/**
 * Remove a localização ao concluir o trajeto (limpeza de banco)
 */
export async function deleteDriverLocation(bookingId) {
  if (!isSupabaseConfigured || !bookingId) return false;
  const validBookingId = toValidUUID(bookingId);
  if (!validBookingId) return false;

  try {
    const { error } = await supabase
      .from('driver_locations')
      .delete()
      .eq('booking_id', validBookingId);

    if (error) {
      console.warn('Supabase delete driver location notice:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase delete driver location error:', err?.message || err);
    return false;
  }
}

/**
 * Subscrição ao Supabase Realtime para ouvir mudanças de localização de uma reserva
 */
export function subscribeToDriverLocationRealtime(bookingId, onUpdate) {
  if (!isSupabaseConfigured || !bookingId) return null;
  const validBookingId = toValidUUID(bookingId);
  if (!validBookingId) return null;

  try {
    const channelName = `driver_loc_${validBookingId.slice(0, 8)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'driver_locations',
          filter: `booking_id=eq.${validBookingId}`
        },
        (payload) => {
          if (payload && payload.new && typeof onUpdate === 'function') {
            onUpdate({
              latitude: Number(payload.new.latitude),
              longitude: Number(payload.new.longitude),
              heading: Number(payload.new.heading || 0),
              accuracy: Number(payload.new.accuracy || 0),
              speed: payload.new.speed != null ? Number(payload.new.speed) : null,
              updatedAt: payload.new.updated_at
            });
          }
        }
      )
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch (e) {
        console.warn('Error removing realtime channel:', e);
      }
    };
  } catch (e) {
    console.warn('Supabase subscribe driver location error:', e);
    return null;
  }
}

/**
 * Hook completo de rastreamento GPS em tempo real (Uber/iFood style)
 * Gerencia:
 * - navigator.geolocation.watchPosition nativo com highAccuracy
 * - Permissões (granted, denied, prompt)
 * - Throttle de 5 segundos e filtro de deslocamento (> 5m) para salvar quota do Supabase
 * - Cálculo de heading dinâmico caso o dispositivo móvel não envie bússola
 * - Cálculo de distância e ETA ao vivo até o portão de destino
 * - Suporte a Modo de Teste Controlado para bancadas sem GPS físico
 */
export function useRealtimeGpsTracker({
  bookingId,
  userId,
  destinationLat,
  destinationLng,
  autoStart = false
}) {
  const [trackingStatus, setTrackingStatus] = useState('IDLE'); // IDLE, LOCATING, TRACKING, PERMISSION_DENIED, UNAVAILABLE, COMPLETED
  const [currentLocation, setCurrentLocation] = useState(null);
  const [permissionError, setPermissionError] = useState(null);
  const [isTestMode, setIsTestMode] = useState(false);

  const watchIdRef = useRef(null);
  const lastSentTimeRef = useRef(0);
  const lastPositionRef = useRef(null);
  const isMountedRef = useRef(true);

  // Distância restante até a garagem em metros
  const distanceRemainingMeters =
    currentLocation && destinationLat && destinationLng
      ? Math.round(
          calculateDistanceKm(
            currentLocation.latitude,
            currentLocation.longitude,
            Number(destinationLat),
            Number(destinationLng)
          ) * 1000
        )
      : null;

  const isNearDestination = distanceRemainingMeters !== null && distanceRemainingMeters <= 40;

  // Processa a posição recebida (seja via GPS nativo ou via simulação de teste)
  const handlePositionUpdate = useCallback(
    (coords) => {
      if (!isMountedRef.current) return;

      const { latitude, longitude, accuracy, speed } = coords;
      let heading = coords.heading;

      // Se o heading não for fornecido pela bússola, calcula a direção angular pelo deslocamento anterior
      if (
        (heading === null || heading === undefined || Number.isNaN(heading)) &&
        lastPositionRef.current
      ) {
        heading = calculateBearing(
          lastPositionRef.current.latitude,
          lastPositionRef.current.longitude,
          latitude,
          longitude
        );
      }

      const newPos = {
        latitude,
        longitude,
        heading: heading || 0,
        accuracy: accuracy || 10,
        speed: speed || null,
        timestamp: Date.now()
      };

      setCurrentLocation(newPos);
      setTrackingStatus('TRACKING');

      // THROTTLE: Envia ao Supabase a cada 5 segundos no máximo,
      // e somente se o deslocamento for relevante (> 5m) ou primeira posição
      const now = Date.now();
      const timeElapsed = now - lastSentTimeRef.current;
      const prevPos = lastPositionRef.current;

      const hasMovedSignificantly =
        !prevPos ||
        calculateDistanceKm(prevPos.latitude, prevPos.longitude, latitude, longitude) * 1000 >= 5 ||
        Math.abs((newPos.heading || 0) - (prevPos.heading || 0)) >= 15;

      if ((timeElapsed >= 5000 && hasMovedSignificantly) || !prevPos) {
        lastSentTimeRef.current = now;
        lastPositionRef.current = newPos;

        if (bookingId) {
          upsertDriverLocation({
            bookingId,
            userId,
            latitude: newPos.latitude,
            longitude: newPos.longitude,
            heading: newPos.heading,
            accuracy: newPos.accuracy,
            speed: newPos.speed
          });
        }
      }
    },
    [bookingId, userId]
  );

  // Iniciar rastreamento real com Geolocation API
  const startTracking = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setTrackingStatus('UNAVAILABLE');
      setPermissionError('Geolocalização não é suportada neste navegador.');
      return;
    }

    setTrackingStatus('LOCATING');
    setPermissionError(null);
    setIsTestMode(false);

    // Limpar watcher anterior se houver
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    try {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          handlePositionUpdate({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            heading: position.coords.heading,
            accuracy: position.coords.accuracy,
            speed: position.coords.speed
          });
        },
        (error) => {
          if (!isMountedRef.current) return;
          console.warn('Geolocation watchPosition error:', error.code, error.message);
          if (error.code === error.PERMISSION_DENIED) {
            setTrackingStatus('PERMISSION_DENIED');
            setPermissionError('Permissão de GPS negada. Ative a localização no seu navegador.');
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            setTrackingStatus('UNAVAILABLE');
            setPermissionError('Sinal de GPS indisponível no momento. Tente ir para uma área aberta.');
          } else {
            setTrackingStatus('UNAVAILABLE');
            setPermissionError('Tempo limite excedido ao obter GPS.');
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 3000
        }
      );
    } catch (err) {
      console.warn('Failed to start watchPosition:', err);
      setTrackingStatus('UNAVAILABLE');
      setPermissionError('Erro ao iniciar rastreador GPS.');
    }
  }, [handlePositionUpdate]);

  // Parar rastreamento
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setTrackingStatus('COMPLETED');
    if (bookingId) {
      deleteDriverLocation(bookingId);
    }
  }, [bookingId]);

  // Modo de teste controlado: avança coordenadas controladamente para bancadas/desktops sem GPS físico
  const simulateStep = useCallback(
    (stepFraction = 0.25, routeCoordinates = []) => {
      setIsTestMode(true);
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }

      if (Array.isArray(routeCoordinates) && routeCoordinates.length > 1) {
        const index = Math.min(
          routeCoordinates.length - 1,
          Math.max(0, Math.floor(stepFraction * (routeCoordinates.length - 1)))
        );
        const [lat, lng] = routeCoordinates[index];
        const nextIndex = Math.min(routeCoordinates.length - 1, index + 1);
        const [nextLat, nextLng] = routeCoordinates[nextIndex];
        const heading = calculateBearing(lat, lng, nextLat, nextLng);

        handlePositionUpdate({
          latitude: Number(lat),
          longitude: Number(lng),
          heading,
          accuracy: 5,
          speed: 8.3 // ~30 km/h
        });
      }
    },
    [handlePositionUpdate]
  );

  useEffect(() => {
    isMountedRef.current = true;
    if (autoStart) {
      startTracking();
    }
    return () => {
      isMountedRef.current = false;
      if (watchIdRef.current !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [autoStart, startTracking]);

  return {
    trackingStatus,
    currentLocation,
    distanceRemainingMeters,
    isNearDestination,
    permissionError,
    isTestMode,
    startTracking,
    stopTracking,
    simulateStep
  };
}
