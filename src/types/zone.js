/**
 * zone.js — Tipos/modelos de datos de zonas
 *
 * PROPÓSITO EDUCATIVO:
 * Este archivo define la estructura de datos de una "Zona" de forma
 * independiente a Leaflet. Si en el futuro migras a Mapbox o Google Maps,
 * esta estructura NO cambia — solo cambia el motor (MapEngine).
 *
 * Una zona geográfica tiene:
 *  - id: identificador único
 *  - name: nombre legible para el usuario
 *  - type: tipo de figura dibujada (polygon, rectangle, circle, etc.)
 *  - coordinates: array de pares [lat, lng] que forman el borde de la zona
 *  - color: color de relleno para identificarla visualmente
 *  - createdAt: timestamp de creación
 */

/**
 * Crea un objeto Zone genérico a partir de los datos crudos del evento de Leaflet.
 *
 * @param {string} type    - Tipo de figura: 'polygon' | 'rectangle' | 'circle' | 'marker'
 * @param {Array}  coords  - Array de [lat, lng] extraídos de la capa de Leaflet
 * @param {string} [color] - Color hexadecimal opcional
 * @returns {Object}       - Zona normalizada lista para guardar
 */
export function createZone(type, coords, color = '#22C55E') {
  return {
    id: crypto.randomUUID(),        // ID único, nativo del navegador
    name: `Zona ${Date.now().toString().slice(-4)}`, // Nombre autogenerado
    type,
    coordinates: coords,
    color,
    createdAt: new Date().toISOString(),
  }
}

/**
 * Paleta de colores disponibles para las zonas.
 * Se cicla automáticamente al crear zonas nuevas.
 */
export const ZONE_COLORS = [
  '#22C55E', // verde (CTA del design system)
  '#3B82F6', // azul
  '#F59E0B', // amarillo
  '#EF4444', // rojo
  '#8B5CF6', // violeta
  '#06B6D4', // cyan
]
