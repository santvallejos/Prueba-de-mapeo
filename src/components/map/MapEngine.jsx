/**
 * MapEngine.jsx — Motor de mapa basado en Leaflet
 *
 * ═══════════════════════════════════════════════════════════════
 * GUÍA EDUCATIVA: ¿Cómo funciona Leaflet con React?
 * ═══════════════════════════════════════════════════════════════
 *
 * Leaflet es una librería JavaScript de mapas. Su versión React
 * se llama `react-leaflet` y envuelve la API imperativa de Leaflet
 * en componentes declarativos de React.
 *
 * FLUJO GENERAL:
 *   MapContainer           → Crea el div del mapa y la instancia de Leaflet
 *     TileLayer            → Conecta con OpenStreetMap para renderizar los tiles
 *     FeatureGroup         → Contenedor de capas dibujables (requerido por EditControl)
 *       EditControl        → Barra de herramientas de dibujo (de leaflet-draw)
 *
 * ═══════════════════════════════════════════════════════════════
 * MODULARIDAD:
 * Este archivo es el ÚNICO que sabe que existe Leaflet.
 * Transforma eventos de Leaflet → datos genéricos → llama onZoneCreated(zone).
 * Si migras a Mapbox, solo reemplazas este archivo.
 * ═══════════════════════════════════════════════════════════════
 */

import { useRef } from 'react'
import { MapContainer, TileLayer, FeatureGroup } from 'react-leaflet'
import { EditControl } from 'react-leaflet-draw'

// CSS de Leaflet: estilos base del mapa (íconos, controles, popups)
import 'leaflet/dist/leaflet.css'
// CSS de leaflet-draw: estilos de la barra de herramientas de dibujo
import 'leaflet-draw/dist/leaflet.draw.css'

import { createZone, ZONE_COLORS } from '../../types/zone'

/**
 * Props:
 *  - onZoneCreated(zone) → callback cuando el usuario termina de dibujar
 *  - zoneCount           → cuántas zonas hay (para ciclar colores)
 */
export default function MapEngine({ onZoneCreated, zoneCount }) {
  /**
   * featureGroupRef — Referencia a la capa FeatureGroup de Leaflet.
   *
   * ¿Por qué useRef y no useState?
   * Porque no necesitamos re-renderizar React cuando cambia la capa.
   * Leaflet maneja su propio estado interno del mapa (imperativo).
   * React solo observa eventos y pasa datos normalizados hacia arriba.
   */
  const featureGroupRef = useRef(null)

  /**
   * handleCreated — Se dispara cuando el usuario termina de dibujar una figura.
   *
   * El evento `e` de Leaflet contiene:
   *  - e.layerType : string con el tipo ('polygon', 'rectangle', 'circle', etc.)
   *  - e.layer     : la capa de Leaflet con todos los métodos de la figura
   *
   * Según el tipo, extraemos las coordenadas de diferente manera porque
   * Leaflet usa APIs distintas para cada figura:
   *  - Polygon/Rectangle → layer.getLatLngs() → array de arrays de LatLng
   *  - Circle            → layer.getLatLng()  → un LatLng central + layer.getRadius()
   *  - Marker            → layer.getLatLng()  → un LatLng puntual
   */
  const handleCreated = (e) => {
    const { layerType, layer } = e
    let coords = []

    if (layerType === 'polygon' || layerType === 'rectangle') {
      // getLatLngs() devuelve [[LatLng, LatLng, ...]] — un array envuelto
      // [0] accede al primer anillo (los polígonos pueden tener huecos en anillos extra)
      coords = layer.getLatLngs()[0].map((ll) => [ll.lat, ll.lng])
    } else if (layerType === 'circle') {
      const center = layer.getLatLng()
      // Para círculos guardamos centro + radio (no hay coordenadas de borde)
      coords = [[center.lat, center.lng, layer.getRadius()]]
    } else if (layerType === 'marker' || layerType === 'circlemarker') {
      const ll = layer.getLatLng()
      coords = [[ll.lat, ll.lng]]
    }

    // Elegir color ciclando sobre la paleta
    const color = ZONE_COLORS[zoneCount % ZONE_COLORS.length]

    // Crear objeto Zone normalizado (independiente de Leaflet)
    const zone = createZone(layerType, coords, color)

    // Notificar al padre (App.jsx → useMapZones)
    onZoneCreated(zone)
  }

  return (
    /**
     * MapContainer — El componente raíz del mapa.
     *
     * Props clave:
     *  - center   : [lat, lng] del centro inicial del mapa
     *  - zoom     : nivel de zoom inicial (1-18, donde 18 es muy cercano)
     *  - style    : DEBE tener height explícita, Leaflet no infiere altura del CSS
     *
     * IMPORTANTE: MapContainer NO se re-renderiza si cambian sus props.
     * center y zoom son solo valores iniciales. Para cambiarlos después,
     * necesitas useMap() dentro de un componente hijo.
     */
    <MapContainer
      center={[-27.4806, -58.8341]} // Corrientes Capital, Argentina
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      className="z-0"
    >
      {/**
       * TileLayer — La capa de imágenes del mapa (los "tiles").
       *
       * Leaflet divide el mapa en cuadrados de 256x256px llamados "tiles".
       * Cada tile es una imagen PNG descargada del servidor de mapas.
       *
       * url: Template de URL donde {z}=zoom, {x}/{y}=coordenadas del tile.
       * OpenStreetMap es gratuito y de código abierto.
       * Podrías cambiar esta URL a Mapbox, Google Maps, Esri, etc.
       *
       * attribution: Texto de crédito obligatorio por términos de OSM.
       */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/**
       * FeatureGroup — Agrupa capas dibujables.
       *
       * EditControl REQUIERE estar dentro de un FeatureGroup.
       * Esto es porque leaflet-draw necesita una referencia a una capa
       * donde guardar/editar las figuras dibujadas.
       * ref={featureGroupRef} nos permite acceder a esa capa si necesitamos
       * borrar figuras programáticamente desde React.
       */}
      <FeatureGroup ref={featureGroupRef}>
        {/**
         * EditControl — La barra de herramientas de dibujo.
         *
         * position: Dónde aparece el control ('topleft', 'topright', etc.)
         *
         * onCreated: Evento que se dispara cuando el usuario termina de dibujar.
         *
         * draw: Objeto de configuración que activa/desactiva herramientas:
         *   - polygon   → dibujar polígono con múltiples puntos
         *   - rectangle → dibujar rectángulo
         *   - circle    → dibujar círculo
         *   - marker    → colocar un punto
         *   - polyline  → dibujar línea (false = desactivado)
         *   - circlemarker → marcador circular pequeño (false = desactivado)
         *
         * edit: Controla si se pueden editar/borrar las figuras ya creadas.
         *   - featureGroup: le pasamos nuestra referencia para que sepa qué editar
         */}
        <EditControl
          position="topleft"
          onCreated={handleCreated}
          draw={{
            polygon: {
              shapeOptions: { color: ZONE_COLORS[zoneCount % ZONE_COLORS.length] },
            },
            rectangle: {
              shapeOptions: { color: ZONE_COLORS[zoneCount % ZONE_COLORS.length] },
            },
            circle: {
              shapeOptions: { color: ZONE_COLORS[zoneCount % ZONE_COLORS.length] },
            },
            marker: true,
            polyline: false,
            circlemarker: false,
          }}
          edit={{
            featureGroup: featureGroupRef.current,
          }}
        />
      </FeatureGroup>
    </MapContainer>
  )
}
