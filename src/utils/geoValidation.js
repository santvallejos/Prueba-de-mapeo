/**
 * geoValidation.js — Validación espacial para evitar superposición de zonas
 *
 * ═══════════════════════════════════════════════════════════════
 * GUÍA EDUCATIVA: ¿Cómo validar superposición espacial con Turf.js?
 * ═══════════════════════════════════════════════════════════════
 *
 * Leaflet maneja la representación visual y el dibujo del mapa. Sin embargo,
 * Leaflet no contiene algoritmos matemáticos avanzados para calcular si dos figuras
 * se cruzan o comparten áreas. Para eso usamos Turf.js, una librería de análisis espacial.
 *
 * CONCEPTOS CLAVE DE ESTA VALIDACIÓN:
 *
 * 1. Formato GeoJSON vs. Leaflet:
 *    - Leaflet utiliza pares [Latitud, Longitud] (ej: [-27.48, -58.83]).
 *    - Turf.js sigue el estándar GeoJSON, el cual utiliza [Longitud, Latitud] (inverso).
 *    - Además, un polígono en GeoJSON requiere cerrarse. Esto significa que la
 *      última coordenada del anillo debe ser exactamente igual a la primera.
 *
 * 2. La función turf.intersect (Versión 7):
 *    - En Turf.js v7, la función `intersect` toma como argumento un `FeatureCollection`
 *      que contenga los polígonos que queremos comparar.
 *    - Si hay un área de superposición (intersección), devuelve un objeto Feature con la
 *      geometría de la intersección (por ejemplo, un nuevo Polígono que representa el área cruzada).
 *    - Si NO se cruzan, o si solo se tocan en un borde o vértice (área cero), devuelve `null`.
 *
 * ═══════════════════════════════════════════════════════════════
 */

import * as turf from '@turf/turf';

/**
 * Convierte un array de coordenadas de Leaflet [[lat, lng], ...]
 * al formato GeoJSON requerido por Turf.js [[lng, lat], ...] y lo cierra.
 *
 * @param {Array} leafletCoords - Coordenadas en formato Leaflet
 * @returns {Array} Coordenadas formateadas para GeoJSON
 */
function formatToGeoJSON(leafletCoords) {
  // 1. Invertir de [lat, lng] a [lng, lat]
  const geojsonCoords = leafletCoords.map(([lat, lng]) => [lng, lat]);

  // 2. Asegurarse de que el polígono esté cerrado (primer punto igual al último)
  const first = geojsonCoords[0];
  const last = geojsonCoords[geojsonCoords.length - 1];

  if (first[0] !== last[0] || first[1] !== last[1]) {
    geojsonCoords.push([first[0], first[1]]);
  }

  return geojsonCoords;
}

/**
 * Valida si un nuevo polígono se superpone (comparte área) con alguna zona existente.
 *
 * @param {Array} newCoords - Coordenadas de la nueva zona [[lat, lng], ...]
 * @param {Array} existingZones - Listado de zonas en memoria (del hook useMapZones)
 * @returns {boolean} true si se superpone con alguna zona existente, false en caso contrario
 */
export function checkOverlap(newCoords, existingZones) {
  // Si no hay zonas existentes, no hay posibilidad de superposición
  if (!existingZones || existingZones.length === 0) {
    return false;
  }

  // 1. Preparar la nueva zona en formato GeoJSON para Turf.js
  const formattedNewCoords = formatToGeoJSON(newCoords);
  // turf.polygon requiere un array de anillos. El primer anillo es el borde exterior.
  const newPolygon = turf.polygon([formattedNewCoords]);

  // 2. Comparar contra cada una de las zonas existentes
  for (const zone of existingZones) {
    // Solo validamos superposiciones entre figuras de área (polígonos y rectángulos)
    if (zone.type !== 'polygon' && zone.type !== 'rectangle') {
      continue;
    }

    // Preparar la zona existente en formato GeoJSON
    const formattedExistingCoords = formatToGeoJSON(zone.coordinates);
    const existingPolygon = turf.polygon([formattedExistingCoords]);

    try {
      // En Turf v7: intersect toma un FeatureCollection de las figuras
      const intersection = turf.intersect(
        turf.featureCollection([newPolygon, existingPolygon])
      );

      // Si la intersección no es null, evaluamos si es una superposición real
      if (intersection !== null) {
        const type = intersection.geometry.type;
        // Si el tipo de la intersección es 'Polygon' o 'MultiPolygon',
        // significa que comparten un espacio bidimensional (se enciman).
        // Si fuera 'LineString' o 'Point', significaría que solo se tocan
        // en bordes o vértices, lo cual está permitido.
        if (type === 'Polygon' || type === 'MultiPolygon') {
          return true; // ¡Se superponen!
        }
      }
    } catch (error) {
      console.error('Error al calcular intersección de Turf.js:', error);
    }
  }

  return false; // No se superpone con ninguna zona
}
