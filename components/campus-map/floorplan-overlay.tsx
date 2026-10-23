'use client'

import { useEffect, useRef } from 'react'
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps'
import { boundsFor, type FloorPlan } from '@/lib/campus'

type Props = {
  plan: FloorPlan
  visible: boolean
  opacity?: number
}

/**
 * Draws a floor-plan image on the map with google.maps.GroundOverlay.
 * GroundOverlay can only place north-aligned images. For a rotated
 * building, switch to deck.gl's BitmapLayer, which takes four corners.
 */
export function FloorPlanOverlay({ plan, visible, opacity = 0.9 }: Props) {
  const map = useMap()
  const mapsLib = useMapsLibrary('maps')
  const overlayRef = useRef<google.maps.GroundOverlay | null>(null)

  // A GroundOverlay's bounds can't be changed after creation, so it is
  // rebuilt whenever the plan's position or size changes.
  useEffect(() => {
    if (!map || !mapsLib) return
    const overlay = new mapsLib.GroundOverlay(
      plan.url,
      boundsFor(plan.center, plan.widthM, plan.heightM),
      { clickable: false, opacity },
    )
    overlay.setMap(visible ? map : null)
    overlayRef.current = overlay
    return () => {
      overlay.setMap(null)
      overlayRef.current = null
    }
    // opacity and visible are handled by the cheaper effects below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, mapsLib, plan.url, plan.center.lat, plan.center.lng, plan.widthM, plan.heightM])

  useEffect(() => {
    overlayRef.current?.setMap(visible && map ? map : null)
  }, [visible, map])

  useEffect(() => {
    overlayRef.current?.setOpacity(opacity)
  }, [opacity])

  return null
}
