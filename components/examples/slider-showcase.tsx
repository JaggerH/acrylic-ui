"use client"

import * as React from "react"

import { Slider } from "@/registry/acrylic/slider"

// Real-world settings: a volume control, a bipolar balance (center-biased), a
// ticked brightness scale, a two-thumb price range, plus vertical and disabled —
// each with a live value readout. Geometry matches the macOS 26 Sliders page.
export default function SliderShowcase() {
  const [volume, setVolume] = React.useState([65])
  const [balance, setBalance] = React.useState([0])
  const [brightness, setBrightness] = React.useState([60])
  const [range, setRange] = React.useState([30, 70])

  const row = "flex flex-col gap-2"
  const head = "flex items-center justify-between text-[13px]"

  return (
    <div className="flex w-full max-w-sm flex-col gap-7 text-foreground">
      <div className={row}>
        <div className={head}>
          <span className="text-muted-foreground">Volume</span>
          <span className="tabular-nums text-foreground">{volume[0]}%</span>
        </div>
        <Slider value={volume} onValueChange={setVolume} max={100} step={1} aria-label="Volume" />
      </div>

      <div className={row}>
        <div className={head}>
          <span className="text-muted-foreground">Balance</span>
          <span className="tabular-nums text-foreground">
            {balance[0] === 0 ? "Center" : `${balance[0] > 0 ? "R" : "L"} ${Math.abs(balance[0])}`}
          </span>
        </div>
        <Slider
          variant="center"
          value={balance}
          onValueChange={setBalance}
          min={-100}
          max={100}
          step={1}
          aria-label="Balance"
        />
      </div>

      <div className={row}>
        <div className={head}>
          <span className="text-muted-foreground">Brightness</span>
          <span className="tabular-nums text-foreground">{brightness[0]}</span>
        </div>
        <Slider
          value={brightness}
          onValueChange={setBrightness}
          max={100}
          step={20}
          marks
          aria-label="Brightness"
        />
      </div>

      <div className={row}>
        <div className={head}>
          <span className="text-muted-foreground">Price range</span>
          <span className="tabular-nums text-foreground">
            ${range[0]} – ${range[1]}
          </span>
        </div>
        <Slider value={range} onValueChange={setRange} max={100} step={1} aria-label="Price range" />
      </div>

      <div className="flex items-end gap-10">
        <div className="flex flex-col items-center gap-2">
          <Slider
            orientation="vertical"
            defaultValue={[40]}
            max={100}
            step={1}
            className="min-h-40"
            aria-label="Vertical"
          />
          <span className="text-[13px] text-muted-foreground">Vertical</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Slider
            orientation="vertical"
            defaultValue={[70]}
            max={100}
            step={25}
            marks
            className="min-h-40"
            aria-label="Vertical ticked"
          />
          <span className="text-[13px] text-muted-foreground">Vertical + ticks</span>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <label className="text-[13px] text-muted-foreground">Disabled</label>
          <Slider defaultValue={[45]} max={100} step={1} disabled aria-label="Disabled" />
        </div>
      </div>
    </div>
  )
}
