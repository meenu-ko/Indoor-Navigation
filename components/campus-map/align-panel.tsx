'use client'

import { useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Copy, Minus, Plus } from 'lucide-react'
import { offset, type FloorPlan } from '@/lib/campus'

type Props = {
  plan: FloorPlan
  onChange: (plan: FloorPlan) => void
  opacity: number
  onOpacity: (v: number) => void
}

/**
 * Development helper for lining a floor plan up with the satellite view.
 * Nudge it into place, then copy the values into lib/campus.ts.
 */
export function AlignPanel({ plan, onChange, opacity, onOpacity }: Props) {
  const [step, setStep] = useState(1)
  const [copied, setCopied] = useState(false)

  const move = (east: number, north: number) => onChange({ ...plan, center: offset(plan.center, east * step, north * step) })
  const scale = (f: number) => onChange({ ...plan, widthM: +(plan.widthM * f).toFixed(2), heightM: +(plan.heightM * f).toFixed(2) })

  const snippet = `center: { lat: ${plan.center.lat.toFixed(6)}, lng: ${plan.center.lng.toFixed(6)} },\nwidthM: ${plan.widthM},\nheightM: ${plan.heightM},`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      console.log(snippet)
    }
  }

  const btn = 'flex h-8 w-8 items-center justify-center rounded-lg border border-[#dfe5de] bg-white hover:bg-[#f3f6f2]'

  return (
    <div className="w-56 rounded-xl border border-[#d5ded4] bg-white/95 p-3 text-xs shadow-lg backdrop-blur">
      <p className="mb-2 font-semibold">Align floor plan</p>
      <div className="flex items-center gap-3">
        <div className="grid grid-cols-3 gap-1">
          <span />
          <button className={btn} onClick={() => move(0, 1)} aria-label="Move north"><ArrowUp size={14} /></button>
          <span />
          <button className={btn} onClick={() => move(-1, 0)} aria-label="Move west"><ArrowLeft size={14} /></button>
          <span />
          <button className={btn} onClick={() => move(1, 0)} aria-label="Move east"><ArrowRight size={14} /></button>
          <span />
          <button className={btn} onClick={() => move(0, -1)} aria-label="Move south"><ArrowDown size={14} /></button>
          <span />
        </div>
        <div className="flex flex-col gap-1">
          <button className={btn} onClick={() => scale(1.01)} aria-label="Make 1% larger"><Plus size={14} /></button>
          <button className={btn} onClick={() => scale(1 / 1.01)} aria-label="Make 1% smaller"><Minus size={14} /></button>
        </div>
      </div>
      <label className="mt-3 flex items-center justify-between gap-2">
        Step
        <select value={step} onChange={(e) => setStep(+e.target.value)} className="rounded border border-[#dfe5de] px-1 py-0.5">
          <option value={0.25}>0.25 m</option>
          <option value={1}>1 m</option>
          <option value={5}>5 m</option>
        </select>
      </label>
      <label className="mt-2 flex items-center gap-2">
        Opacity
        <input type="range" min={0.2} max={1} step={0.05} value={opacity} onChange={(e) => onOpacity(+e.target.value)} className="flex-1 accent-[#bf5700]" />
      </label>
      <pre className="mt-2 overflow-x-auto rounded bg-[#f3f6f2] p-2 text-[10px] leading-snug">{snippet}</pre>
      <button onClick={copy} className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#bf5700] py-1.5 font-semibold text-white">
        <Copy size={12} /> {copied ? 'Copied' : 'Copy values'}
      </button>
    </div>
  )
}
