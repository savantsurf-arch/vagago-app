import assert from 'node:assert/strict';
import { calculateBearing } from '../src/services/gpsTrackingService.js';
import { calculateDistanceKm } from '../src/services/geoUtils.js';

console.log('🧪 Iniciando testes automatizados do Sistema de Rastreamento GPS Realtime...');

// Teste 1: Cálculo de Bearing / Ângulo de Direção (Heading)
const bearingNorth = calculateBearing(-14.7966, -39.2789, -14.7866, -39.2789);
assert(Math.abs(bearingNorth - 0) < 1 || Math.abs(bearingNorth - 360) < 1, `Bearing norte esperado próximo de 0/360, obtido: ${bearingNorth}`);

const bearingEast = calculateBearing(-14.7966, -39.2789, -14.7966, -39.2689);
assert(Math.abs(bearingEast - 90) < 2, `Bearing leste esperado ~90, obtido: ${bearingEast}`);

console.log('✓ Teste 1 aprovado: Cálculo trigonométrico de heading/bearing angular');

// Teste 2: Cálculo de Distância Haversine e Metragem Restante
const distSame = calculateDistanceKm(-14.7966, -39.2789, -14.7966, -39.2789);
assert.equal(distSame, 0, 'Distância para o mesmo ponto deve ser 0');

const distShopping = calculateDistanceKm(-14.7966, -39.2789, -14.7879, -39.2673);
assert(distShopping > 1.0 && distShopping < 2.0, `Distância até Shopping Jequitibá esperada entre 1km e 2km, obtida: ${distShopping} km`);

console.log('✓ Teste 2 aprovado: Precisão do cálculo Haversine de distância');

// Teste 3: Lógica de Throttling (Mínimo 5s e Deslocamento > 5m)
function shouldSendGpsUpdate(prevPos, newPos, lastSentTime, nowTime) {
  const timeElapsed = nowTime - lastSentTime;
  if (!prevPos) return true;
  const distMeters = calculateDistanceKm(prevPos.latitude, prevPos.longitude, newPos.latitude, newPos.longitude) * 1000;
  const headingDiff = Math.abs((newPos.heading || 0) - (prevPos.heading || 0));
  const hasMovedSignificantly = distMeters >= 5 || headingDiff >= 15;
  return timeElapsed >= 5000 && hasMovedSignificantly;
}

const pos1 = { latitude: -14.7966, longitude: -39.2789, heading: 90 };
const pos2Close = { latitude: -14.796601, longitude: -39.278901, heading: 90 }; // ~10cm
const pos3Moved = { latitude: -14.7967, longitude: -39.2790, heading: 90 }; // ~15m

// 1 segundo depois com deslocamento mínimo: NÃO deve enviar
assert.equal(shouldSendGpsUpdate(pos1, pos2Close, 1000, 2000), false, 'Não deve enviar com 1s de intervalo');

// 6 segundos depois sem deslocamento: NÃO deve enviar (economiza quota)
assert.equal(shouldSendGpsUpdate(pos1, pos2Close, 1000, 7500), false, 'Não deve enviar se deslocamento for insignificante (<5m)');

// 6 segundos depois com deslocamento > 5m: DEVE enviar
assert.equal(shouldSendGpsUpdate(pos1, pos3Moved, 1000, 7500), true, 'Deve enviar após 5s com deslocamento real');

console.log('✓ Teste 3 aprovado: Algoritmo de throttling de 5s e quota protection validado');

console.log('🎉 TODOS OS TESTES DO SISTEMA GPS FORAM CONCLUÍDOS COM SUCESSO!');
