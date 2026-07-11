import { defineCapsule } from '#/capsules/openui.ts'
import FlightSimulatorRuntime, {
  flightSimulatorProps,
} from '#/components/game/flight-simulator.tsx'

/** Whole-page playable flight simulator backed by the shared Three.js runtime. */
export const FlightSimulator = defineCapsule({
  name: 'FlightSimulator',
  description:
    'Whole-page playable single-player Three.js flight simulator with a third-person aircraft, open world, landmarks, drifting clouds, and flight HUD.',
  props: flightSimulatorProps,
  component: ({ props }) => <FlightSimulatorRuntime {...props} />,
})
