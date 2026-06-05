import L from 'leaflet';

// leaflet-draw asume que la variable L está en el ámbito global (window.L)
if (typeof window !== 'undefined') {
  window.L = L;
}

// Importamos el archivo de distribución real de leaflet-draw.
// Al usar un alias exacto con regex (/^leaflet-draw$/), no hay riesgo de bucle infinito.
import 'leaflet-draw/dist/leaflet.draw.js';

// PARCHE: Sobreescribimos L.GeometryUtil.readableArea para solucionar un bug de la biblioteca original.
// En entornos modernos con ESM (modo estricto forzado por Vite/esbuild), la asignación 'type = typeof isMetric;'
// sin declarar la variable lanza un 'ReferenceError: type is not defined'.
if (L.GeometryUtil && L.GeometryUtil.readableArea) {
  L.GeometryUtil.readableArea = function (area, isMetric, precision) {
    var areaStr,
      numPrecision,
      type = typeof isMetric; // <- Corregido agregando 'var' para declarar la variable

    if (isMetric || type === 'object' || type === 'string') {
      if (type === 'object') {
        numPrecision = isMetric.precision;
      } else if (type === 'string') {
        numPrecision = precision;
      } else {
        numPrecision = precision;
      }
      
      if (area >= 1000000) {
        areaStr = L.GeometryUtil.formattedNumber(area / 1000000, numPrecision && numPrecision['km'] ? numPrecision['km'] : 2) + ' km²';
      } else if (area >= 10000) {
        areaStr = L.GeometryUtil.formattedNumber(area / 10000, numPrecision && numPrecision['ha'] ? numPrecision['ha'] : 2) + ' ha';
      } else {
        areaStr = L.GeometryUtil.formattedNumber(area, numPrecision && numPrecision['m'] ? numPrecision['m'] : 0) + ' m²';
      }
    } else {
      // Imperial
      if (area >= 3097600) { // 1 square mile = 3,097,600 square yards
        areaStr = L.GeometryUtil.formattedNumber(area / 3097600, numPrecision && numPrecision['mi'] ? numPrecision['mi'] : 2) + ' mi²';
      } else if (area >= 4840) { // 1 acre = 4,840 square yards
        areaStr = L.GeometryUtil.formattedNumber(area / 4840, numPrecision && numPrecision['ac'] ? numPrecision['ac'] : 2) + ' ac';
      } else {
        areaStr = L.GeometryUtil.formattedNumber(area, numPrecision && numPrecision['yd'] ? numPrecision['yd'] : 0) + ' yd²';
      }
    }

    return areaStr;
  };
}

// Exportamos un valor por defecto para satisfacer a los importadores ESM
// como react-leaflet-draw (EditControl)
export default L.Draw;
