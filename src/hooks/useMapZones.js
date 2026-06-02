/**
 * useMapZones.js — Hook de estado para gestión de zonas
 *
 * PROPÓSITO EDUCATIVO:
 * Este hook maneja TODA la lógica de negocio relacionada con zonas:
 *  - Persistencia en LocalStorage
 *  - Agregar / eliminar zonas
 *  - Contador de color (para ciclar la paleta)
 *
 * Es completamente agnóstico a Leaflet. El componente MapEngine
 * llama a `addZone()` con datos ya normalizados (ver zone.js).
 * Eso permite que este hook funcione igual si mañana usas Mapbox.
 */

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'leaflet-zones' // Clave en LocalStorage

export function useMapZones() {
  // Inicializar desde LocalStorage si existen zonas guardadas
  const [zones, setZones] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return [] // Si LocalStorage falla (modo privado extremo), arrancar vacío
    }
  })

  // Cada vez que cambia `zones`, guardar en LocalStorage automáticamente
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(zones))
  }, [zones])

  /**
   * addZone — Agrega una zona nueva al estado.
   * Recibe un objeto Zone ya normalizado (ver createZone en zone.js).
   */
  const addZone = useCallback((zone) => {
    setZones((prev) => [...prev, zone])
  }, [])

  /**
   * removeZone — Elimina una zona por su id.
   */
  const removeZone = useCallback((id) => {
    setZones((prev) => prev.filter((z) => z.id !== id))
  }, [])

  /**
   * clearZones — Borra todas las zonas (estado + LocalStorage).
   */
  const clearZones = useCallback(() => {
    setZones([])
  }, [])

  return { zones, addZone, removeZone, clearZones }
}
