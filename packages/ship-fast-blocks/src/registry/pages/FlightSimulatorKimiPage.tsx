import { defineComponent } from "@openuidev/react-lang"
import FlightSimulator, { flightSimulatorProps } from "#/components/game/flight-simulator.tsx"

export const FlightSimulatorKimiPage = defineComponent({
  name: "FlightSimulatorKimiPage",
  description:
    "Full-screen single-player 3D flight simulator game built with Three.js. Every visual aspect is customizable via props — aircraft model/color/scale, sky/fog/grass/water/building/robot/castle colors, world size, building count/height, tree/cloud counts, terrain amplitude, flight speed, and HUD visibility. Use for game demos, interactive 3D experiences, or flight simulation pages. Supply any subset of props; the game renders a complete experience with sensible defaults.",
  props: flightSimulatorProps,
  component: ({ props: { className, ...props } }) => {
    return (
      <div className={className}>
        <FlightSimulator
          {...props}
        />
      </div>
    )
  },
})
