/**
 * App.jsx — Punto de ensamblado de la aplicación
 *
 * PROPÓSITO EDUCATIVO:
 * App.jsx actúa como "director de orquesta". Conecta:
 *   - useMapZones (estado/persistencia) ←→ MapEngine (Leaflet) ←→ ZoneSidebar (UI)
 *
 * El flujo de datos es unidireccional:
 *   Usuario dibuja en mapa
 *     → MapEngine captura evento Leaflet
 *     → Normaliza a objeto Zone
 *     → Llama onZoneCreated(zone)
 *     → App pasa a addZone()
 *     → useMapZones guarda en estado + LocalStorage
 *     → ZoneSidebar re-renderiza con la nueva zona
 */

import MapEngine from './components/map/MapEngine'
import ZoneSidebar from './components/ui/ZoneSidebar'
import { useMapZones } from './hooks/useMapZones'

export default function App() {
  const { zones, addZone, removeZone, clearZones } = useMapZones()

  return (
    /**
     * Contenedor relativo full-height.
     * MapEngine ocupa el 100% del espacio.
     * ZoneSidebar usa position:absolute para flotar sobre el mapa.
     */
    <div className="relative w-full h-full">
      {/* Motor del mapa: único punto de contacto con Leaflet */}
      <MapEngine
        onZoneCreated={addZone}
        zoneCount={zones.length}
      />

      {/* Panel de UI: flota sobre el mapa, no sabe que existe Leaflet */}
      <ZoneSidebar
        zones={zones}
        onRemoveZone={removeZone}
        onClearZones={clearZones}
      />
    </div>
  )
}
