# Longhorn Wayfinder: Google Maps setup

## Files

| File | What it is |
|---|---|
| `app/page.tsx` | Replaces your page. Real Google Map; search, zoom, layers and locate are wired to it |
| `lib/campus.ts` | Building pins, floor-plan placement, and distance math |
| `components/campus-map/floorplan-overlay.tsx` | Draws a floor-plan image on the map |
| `components/campus-map/align-panel.tsx` | Dev-only panel for lining the plan up with the satellite view |
| `public/floorplans/jester-west-1.png` | Jester West floor 1, transparent background, north up |
| `.env.local.example` | The two environment variables |

`layout.tsx`, `globals.css` and `button.tsx` don't change.

## Steps

1. Install the map library:
   ```bash
   npm install @vis.gl/react-google-maps
   ```
2. In Google Cloud console: create a project, enable **Maps JavaScript API**, attach a billing
   account, and create an API key. Restrict it (HTTP referrers) to `localhost:3000/*` and your
   Vercel domain.
3. Copy `.env.local.example` to `.env.local` and paste the key. On Vercel, add the same
   variable under Project → Settings → Environment Variables.
4. `npm run dev`, then search **Jester West**. The floor plan turns on automatically.
5. Switch on **Satellite** in the layers menu and use the **Align floor plan** panel to nudge
   the plan until its walls sit on the roof outline. Click **Copy values** and paste them over
   the `center`, `widthM` and `heightM` lines in `lib/campus.ts`.
6. Fix the pins marked `approximate: true` in `lib/campus.ts`: right-click the building in
   Google Maps, click the coordinates to copy them, and paste.

## Later

- **Map ID:** `DEMO_MAP_ID` is fine for development. For production, create a Map ID in
  Google Cloud (Map Management), set `NEXT_PUBLIC_GOOGLE_MAP_ID`, and use its style editor
  to hide business pins.
- **Rotated buildings:** `GroundOverlay` only places north-aligned images. For a building
  at an angle, switch to deck.gl's `BitmapLayer`, which takes four corners.
