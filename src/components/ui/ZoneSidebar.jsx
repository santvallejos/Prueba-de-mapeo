/**
 * ZoneSidebar.jsx — Panel lateral de zonas
 *
 * PROPÓSITO EDUCATIVO:
 * Este componente es completamente agnóstico a Leaflet.
 * Solo recibe datos normalizados (zone.js) y callbacks del hook.
 * Es pura UI: mostrar lista, borrar, limpiar.
 *
 * Separar UI de la lógica del mapa permite:
 *  1. Testear el sidebar sin montar el mapa
 *  2. Cambiar el motor de mapas sin tocar la UI
 *  3. Mover el sidebar a un drawer, modal, etc. fácilmente
 */

import { useState } from 'react'

/** Ícono SVG de papelera (Lucide-style, sin emojis) */
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
)

/** Ícono SVG de mapa */
const MapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
    <line x1="9" y1="3" x2="9" y2="18" />
    <line x1="15" y1="6" x2="15" y2="21" />
  </svg>
)

/** Ícono SVG de borrar todo */
const ClearIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" /><path d="M8 6V4h8v2" />
    <path d="M19 6l-1 14H6L5 6" />
  </svg>
)

/**
 * Formatea el tipo de figura a texto legible.
 * Centralizar aquí facilita i18n futura.
 */
const TYPE_LABELS = {
  polygon:  'Polígono',
  rectangle:'Rectángulo',
  circle:   'Círculo',
  marker:   'Marcador',
}

/**
 * Formatea las coordenadas para mostrar un resumen compacto.
 * Para polígonos muestra cuántos puntos tiene la zona.
 */
function formatCoords(zone) {
  if (zone.type === 'marker' || zone.type === 'circle') {
    const [lat, lng] = zone.coordinates[0]
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
  }
  return `${zone.coordinates.length} puntos`
}

export default function ZoneSidebar({ zones, onRemoveZone, onClearZones }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    /**
     * Panel flotante sobre el mapa.
     * z-10 asegura que quede sobre el canvas de Leaflet (z-index ~400 internamente).
     * pointer-events-none en el contenedor evita bloquear clics en el mapa,
     * pero pointer-events-auto en el panel sí captura eventos.
     */
    <div className="absolute top-4 right-4 z-[1000] pointer-events-none">
      <div
        className="pointer-events-auto w-72 rounded-2xl border border-[--color-border] overflow-hidden"
        style={{ background: 'rgba(30,41,59,0.92)', backdropFilter: 'blur(12px)' }}
      >
        {/* Encabezado del panel */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[--color-border]">
          <div className="flex items-center gap-2 text-[--color-text]">
            <MapIcon />
            <span className="font-semibold text-sm">Zonas creadas</span>
            {/* Contador de zonas con color CTA */}
            <span
              className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold"
              style={{ background: '#22C55E22', color: '#22C55E' }}
            >
              {zones.length}
            </span>
          </div>
          <div className="flex gap-2">
            {/* Botón limpiar todo */}
            {zones.length > 0 && (
              <button
                onClick={onClearZones}
                title="Borrar todas las zonas"
                className="cursor-pointer text-[--color-muted] hover:text-red-400 transition-colors duration-200 p-1 rounded"
              >
                <ClearIcon />
              </button>
            )}
            {/* Botón colapsar panel */}
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="cursor-pointer text-[--color-muted] hover:text-[--color-text] transition-colors duration-200 text-xs p-1"
            >
              {collapsed ? '▼' : '▲'}
            </button>
          </div>
        </div>

        {/* Lista de zonas — se oculta si collapsed */}
        {!collapsed && (
          <div className="max-h-80 overflow-y-auto">
            {zones.length === 0 ? (
              /* Estado vacío */
              <div className="px-4 py-6 text-center text-[--color-muted] text-sm">
                <p className="mb-1">Sin zonas aún</p>
                <p className="text-xs opacity-70">Usa las herramientas del mapa para dibujar</p>
              </div>
            ) : (
              <ul className="p-2 flex flex-col gap-1">
                {zones.map((zone) => (
                  <li
                    key={zone.id}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[--color-surface-2] transition-colors duration-200"
                  >
                    {/* Punto de color de la zona */}
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ background: zone.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[--color-text] truncate">{zone.name}</p>
                      <p className="text-xs text-[--color-muted]">
                        {TYPE_LABELS[zone.type] ?? zone.type} · {formatCoords(zone)}
                      </p>
                    </div>
                    {/* Botón eliminar zona individual */}
                    <button
                      onClick={() => onRemoveZone(zone.id)}
                      title="Eliminar zona"
                      className="cursor-pointer text-[--color-muted] hover:text-red-400 transition-colors duration-200 p-1 rounded flex-shrink-0"
                    >
                      <TrashIcon />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Footer con instrucciones */}
        {!collapsed && (
          <div className="px-4 py-2 border-t border-[--color-border] text-xs text-[--color-muted] text-center">
            Dibuja en el mapa · Se guarda automáticamente
          </div>
        )}
      </div>
    </div>
  )
}
