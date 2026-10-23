'use client'

import { useState } from 'react'
import { APIProvider, AdvancedMarker, Map, useMap } from '@vis.gl/react-google-maps'
import {
  Accessibility,
  ChevronDown,
  Compass,
  Crosshair,
  Layers3,
  Menu,
  Minus,
  Navigation,
  Plus,
  Search,
  UserRound,
  X,
} from 'lucide-react'
import { AlignPanel } from '@/components/campus-map/align-panel'
import { FloorPlanOverlay } from '@/components/campus-map/floorplan-overlay'
import { buildings, CAMPUS_CENTER, floorPlans, milesBetween, type Building, type LatLng } from '@/lib/campus'

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ''
// DEMO_MAP_ID works for development. Create your own Map ID for production
// so you can style the map (for example, hide business pins).
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAP_ID || 'DEMO_MAP_ID'
const SHOW_ALIGN_TOOL = process.env.NODE_ENV !== 'production'

export default function Page() {
  if (!API_KEY) return <MissingKey />
  return (
    <APIProvider apiKey={API_KEY}>
      <CampusPage />
    </APIProvider>
  )
}

function CampusPage() {
  // Outside <Map>, useMap() returns the page's single map once it has loaded.
  const map = useMap()

  const [selectedBuilding, setSelectedBuilding] = useState('PCL Library')
  const [showLayers, setShowLayers] = useState(false)
  const [search, setSearch] = useState('')
  const [accessible, setAccessible] = useState(false)

  const [showBuildings, setShowBuildings] = useState(true)
  const [satellite, setSatellite] = useState(false)
  const [showFloorPlans, setShowFloorPlans] = useState(false)
  const [plans, setPlans] = useState(floorPlans)
  const [planOpacity, setPlanOpacity] = useState(0.9)

  const [userPos, setUserPos] = useState<LatLng | null>(null)
  const [locError, setLocError] = useState<string | null>(null)

  const results = buildings.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()))

  const goTo = (b: Building) => {
    setSelectedBuilding(b.name)
    setSearch('')
    const hasPlan = plans.some((p) => p.buildingCode === b.code)
    if (hasPlan) setShowFloorPlans(true)
    map?.panTo(b.position)
    map?.setZoom(hasPlan ? 19 : 18)
  }

  const zoomBy = (d: number) => {
    if (!map) return
    map.setZoom((map.getZoom() ?? 17) + d)
  }

  const locate = () => {
    if (!navigator.geolocation) {
      setLocError('This browser can’t share its location.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const p = { lat: coords.latitude, lng: coords.longitude }
        setUserPos(p)
        setLocError(null)
        map?.panTo(p)
        map?.setZoom(18)
      },
      () => setLocError('Location is off. Allow location access for this site and try again.'),
      { enableHighAccuracy: true, timeout: 10_000 },
    )
  }

  const distanceLabel = (b: Building) => (userPos ? ` · ${milesBetween(userPos, b.position).toFixed(1)} mi` : '')

  return (
    <main className="min-h-screen bg-[#f7f8f5] text-[#17211c]">
      <header className="absolute inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b border-white/20 bg-white/85 px-5 shadow-sm backdrop-blur-md lg:px-8">
        <div className="flex items-center gap-3">
          <button className="rounded-lg p-2 hover:bg-[#eef2ed] lg:hidden" aria-label="Open menu"><Menu size={20} /></button>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#bf5700] text-white shadow-sm"><Compass size={21} strokeWidth={2.5} /></div>
          <div><p className="font-semibold tracking-tight">Longhorn Wayfinder</p><p className="hidden text-[11px] text-[#718078] sm:block">UT Austin campus navigation</p></div>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#536159]"><button className="hidden rounded-lg px-3 py-2 hover:bg-[#eef2ed] sm:block">Feedback</button><button className="flex items-center gap-2 rounded-lg border border-[#dfe5de] bg-white/90 px-3 py-2 font-medium shadow-sm"><UserRound size={16} /> <span className="hidden sm:inline">Guest</span><ChevronDown size={14} /></button></div>
      </header>

      <section className="relative h-screen min-h-[560px] overflow-hidden bg-[#dfe8da]" aria-label="Campus map">
        <Map
          className="absolute inset-0"
          mapId={MAP_ID}
          defaultCenter={CAMPUS_CENTER}
          defaultZoom={17}
          mapTypeId={satellite ? 'hybrid' : 'roadmap'}
          gestureHandling="greedy"
          disableDefaultUI
          clickableIcons={false}
        >
          {showBuildings &&
            buildings.map((b) => {
              const active = b.name === selectedBuilding
              return (
                <AdvancedMarker key={b.code} position={b.position} title={b.name} zIndex={active ? 2 : 1} onClick={() => goTo(b)}>
                  <div className={`rounded-lg border-2 px-2 py-1 text-[10px] font-bold tracking-wider shadow-md ${active ? 'border-white bg-[#bf5700] text-white' : 'border-[#c9ab91] bg-[#eadbcd] text-[#966c4d]'}`}>
                    {b.code}
                  </div>
                </AdvancedMarker>
              )
            })}

          {userPos && (
            <AdvancedMarker position={userPos} title="You are here" zIndex={3}>
              <div className="relative h-12 w-12">
                <div className="absolute inset-0 animate-pulse rounded-full bg-[#bf5700]/15" />
                <div className="absolute inset-3 flex items-center justify-center rounded-full border-[3px] border-white bg-[#bf5700] shadow-lg">
                  <Navigation className="text-white" size={12} fill="white" />
                </div>
              </div>
            </AdvancedMarker>
          )}

          {plans.map((plan) => (
            <FloorPlanOverlay key={plan.id} plan={plan} visible={showFloorPlans} opacity={planOpacity} />
          ))}
        </Map>

        <div className="absolute left-4 right-4 top-20 z-10 sm:left-6 sm:right-auto sm:w-[min(420px,calc(100%-3rem))]">
          <div className="relative rounded-2xl border border-white/80 bg-white/95 p-2 shadow-xl backdrop-blur"><Search className="absolute left-5 top-5 text-[#7b8880]" size={18} /><input value={search} onChange={(e) => setSearch(e.target.value)} className="h-12 w-full rounded-xl bg-[#f7f9f6] pl-11 pr-10 text-sm outline-none transition focus:ring-3 focus:ring-[#bf5700]/15" placeholder="Search buildings, rooms, or places" aria-label="Search campus" />{search && <button onClick={() => setSearch('')} className="absolute right-5 top-5 text-[#7b8880]" aria-label="Clear search"><X size={18} /></button>}</div>
          {search && results.length === 0 && <div className="mt-2 rounded-2xl border border-white/80 bg-white/95 px-5 py-3 text-sm text-[#718078] shadow-xl">No buildings match “{search}”.</div>}
          {results.length > 0 && <div className="mt-2 overflow-hidden rounded-2xl border border-white/80 bg-white/95 p-2 shadow-xl backdrop-blur"><p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#718078]">Suggested destinations</p>{results.map((b) => <button key={b.code} onClick={() => goTo(b)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-[#fff8f2] ${selectedBuilding === b.name ? 'bg-[#fff8f2]' : ''}`}><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eef2ed] text-[10px] font-bold text-[#52645a]">{b.code}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{b.name}</span><span className="text-xs text-[#7b8880]">{b.type}{distanceLabel(b)}</span></span></button>)}</div>}
        </div>

        <div className="absolute right-5 top-20 flex flex-col overflow-hidden rounded-xl border border-[#d5ded4] bg-white/95 shadow-lg"><button onClick={() => zoomBy(1)} className="border-b border-[#e7ebe6] p-3 hover:bg-[#f3f6f2]" aria-label="Zoom in"><Plus size={19} /></button><button onClick={() => zoomBy(-1)} className="p-3 hover:bg-[#f3f6f2]" aria-label="Zoom out"><Minus size={19} /></button></div>

        <div className="absolute bottom-6 right-5 flex flex-col items-end gap-2">
          <button className="rounded-xl border border-[#d5ded4] bg-white/95 p-3 shadow-lg hover:bg-[#f3f6f2]" onClick={() => setShowLayers(!showLayers)} aria-label="Map layers" aria-expanded={showLayers}><Layers3 size={19} /></button>
          {showLayers && (
            <div className="rounded-xl border border-[#d5ded4] bg-white p-3 text-xs shadow-lg">
              <p className="mb-2 font-semibold">Map details</p>
              <label className="flex gap-2 py-1"><input type="checkbox" checked={showBuildings} onChange={(e) => setShowBuildings(e.target.checked)} /> Buildings</label>
              <label className="flex gap-2 py-1"><input type="checkbox" checked={satellite} onChange={(e) => setSatellite(e.target.checked)} /> Satellite</label>
              <label className="flex gap-2 py-1"><input type="checkbox" checked={showFloorPlans} onChange={(e) => setShowFloorPlans(e.target.checked)} /> Floor plans</label>
            </div>
          )}
          <button className="rounded-xl border border-[#d5ded4] bg-white/95 p-3 shadow-lg hover:bg-[#f3f6f2]" onClick={locate} aria-label="Center on location"><Crosshair size={19} /></button>
        </div>

        {SHOW_ALIGN_TOOL && showFloorPlans && plans[0] && (
          <div className="absolute bottom-20 left-5 z-10">
            <AlignPanel
              plan={plans[0]}
              onChange={(p) => setPlans((ps) => ps.map((x) => (x.id === p.id ? p : x)))}
              opacity={planOpacity}
              onOpacity={setPlanOpacity}
            />
          </div>
        )}

        {locError && <div role="status" className="absolute bottom-20 right-5 max-w-64 rounded-xl border border-[#d5ded4] bg-white/95 px-3 py-2 text-xs shadow-lg">{locError}</div>}

        <div className="absolute bottom-6 left-5 flex items-center gap-2 rounded-xl border border-white/80 bg-white/95 px-3 py-2.5 shadow-lg backdrop-blur"><span className="h-2.5 w-2.5 rounded-full bg-[#bf5700]" /><span className="text-sm font-semibold">{selectedBuilding}</span><button onClick={() => setAccessible(!accessible)} className={`ml-2 rounded-lg p-1.5 ${accessible ? 'bg-[#fff1e5] text-[#bf5700]' : 'text-[#718078] hover:bg-[#f3f6f2]'}`} aria-label="Toggle accessible routes" aria-pressed={accessible}><Accessibility size={16} /></button></div>
      </section>
    </main>
  )
}

function MissingKey() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8f5] p-6 text-[#17211c]">
      <div className="max-w-md rounded-2xl border border-[#dfe5de] bg-white p-6 shadow-sm">
        <p className="font-semibold">Add your Google Maps API key</p>
        <p className="mt-2 text-sm text-[#536159]">
          Create <code className="rounded bg-[#f3f6f2] px-1">.env.local</code> in the project root with{' '}
          <code className="rounded bg-[#f3f6f2] px-1">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-key</code>, then restart the dev server.
        </p>
      </div>
    </main>
  )
}
