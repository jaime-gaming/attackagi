'use client'
import { ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
import { BUFFS, WAVES } from '@/game/constants'
import { keyLabel, useSettings, type BindableAction } from '@/game/settings'
import { useGame } from '@/game/store'
import { cn } from '@/lib/utils'
import { GlitchText, HudPanel, MONO_LABEL, uiClick } from './Hud.shared'

/** Full-screen HUD states: menu, buff select, death, victory. */

// ─── Menu ────────────────────────────────────────────────────────────────────

function controlRows(b: Record<BindableAction, string>): ReadonlyArray<readonly [string, readonly string[]]> {
  const k = (a: BindableAction) => keyLabel(b[a])
  return [
    ['MOVE', [k('forward'), k('left'), k('back'), k('right')]],
    ['LOOK', ['MOUSE']],
    ['FIRE / SWING / THROW', ['LMB']],
    ['AIM MOLOTOV', ['RMB']],
    ['SELECT WEAPON', [k('weapon1'), k('weapon2'), k('weapon3')]],
    ['RELOAD', [k('reload')]],
    ['JUMP', [k('jump')]],
    ['DODGE', [k('dodge')]],
    ['PAUSE / SETTINGS', ['ESC']],
  ]
}

/** Virtual-control legend shown instead of key rows on coarse-pointer devices. */
const TOUCH_CONTROLS: ReadonlyArray<readonly [string, string]> = [
  ['MOVE', 'LEFT STICK'],
  ['LOOK', 'DRAG RIGHT'],
  ['FIRE / SWING / THROW', 'FIRE'],
  ['AIM MOLOTOV / ADS', 'AIM'],
  ['SELECT WEAPON', 'TAP CARD'],
  ['JUMP / DODGE / RELOAD', 'BUTTONS'],
  ['PAUSE / SETTINGS', '❚❚'],
]

/** Run-structure readout under the title: rounds, enemy roster, final target. */
function MissionIntel() {
  const cells: ReadonlyArray<readonly [string, string]> = [
    ['ROUNDS', String(WAVES.length).padStart(2, '0')],
    ['HOSTILE CLASSES', '05'],
    ['FINAL TARGET', 'A.G.I.'],
  ]
  return (
    <div className="flex items-stretch gap-3 max-sm:gap-2">
      {cells.map(([label, value]) => (
        <HudPanel key={label} className="flex w-28 flex-col items-center gap-1 px-2 py-2 max-sm:w-24">
          <span className="font-mono text-[9px] tracking-[0.16em] text-muted-foreground">{label}</span>
          <span className="font-mono text-lg leading-none font-bold tracking-[0.14em] text-amber-200">{value}</span>
        </HudPanel>
      ))}
    </div>
  )
}

const BOOT_LINES: readonly string[] = [
  'OPTICS ARRAY ........ ONLINE',
  'DODGE DRIVE ......... ONLINE',
  'WEAPONS BUS ......... ONLINE',
  'PERIMETER NET ....... ONLINE',
  'TARGET: A.G.I. ...... LOCKED',
]

/** Fake terminal boot sequence: lines type in, then hold on the ready state. */
function BootLog() {
  const [shown, setShown] = useState(0)
  useEffect(() => {
    if (shown >= BOOT_LINES.length) return
    const t = setTimeout(() => setShown((n) => n + 1), shown === 0 ? 420 : 460)
    return () => clearTimeout(t)
  }, [shown])
  const done = shown >= BOOT_LINES.length
  return (
    <HudPanel accent="border-emerald-300/40" className="w-[22rem] max-w-[86vw] px-4 py-3">
      <div className="flex min-h-[6.5rem] flex-col gap-1 font-mono text-[10px] tracking-[0.18em] max-sm:min-h-[6rem] max-sm:text-[9px]">
        <span className="text-muted-foreground/70">{'/// SYSTEM CHECK'}</span>
        {BOOT_LINES.slice(0, shown).map((line) => (
          <span key={line} className="animate-in fade-in slide-in-from-left-1 text-emerald-300/85 duration-200">
            {line}
          </span>
        ))}
        {done ? (
          <span className="animate-in fade-in text-amber-300/90 duration-300">
            ALL SYSTEMS NOMINAL — AWAITING ENGAGE
          </span>
        ) : (
          <span aria-hidden className="hud-blink text-emerald-300/85">█</span>
        )}
      </div>
    </HudPanel>
  )
}

export function MenuScreen() {
  const bindings = useSettings((s) => s.bindings)
  const CONTROLS = controlRows(bindings)
  const [manualOpen, setManualOpen] = useState(false)
  const start = () => {
    uiClick()
    useGame.getState().startGame()
  }
  return (
    <div
      className="pointer-events-auto absolute inset-0 flex items-center-safe justify-center overflow-y-auto pr-[max(1rem,env(safe-area-inset-right))] pl-[max(1rem,env(safe-area-inset-left))]"
      style={{ background: 'linear-gradient(to bottom, rgba(11,14,26,0.88), rgba(11,14,26,0.4) 42%, rgba(11,14,26,0.9))' }}
    >
      {/* drifting terminal scanlines over the whole menu */}
      <div
        aria-hidden
        className="hud-scan-drift pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.95) 0 1px, transparent 1px 4px)' }}
      />
      <div className="animate-in fade-in slide-in-from-bottom-4 relative flex flex-col items-center gap-5 py-8 duration-700 max-sm:gap-4 max-sm:py-6">
        <div className="flex flex-col items-center gap-2.5">
          <span className="font-mono text-[10px] tracking-[0.5em] text-amber-300/80 max-sm:tracking-[0.26em]">{'/// PERIMETER DEFENSE TERMINAL v3.0'}</span>
          <GlitchText
            text="ATTACK AGI"
            className="font-mono text-6xl font-black tracking-[0.14em] text-foreground drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)] max-sm:text-4xl md:text-8xl"
          />
          {/* amber caution stripe marching under the logo */}
          <div
            aria-hidden
            className="hud-march h-1 w-72 max-w-[60vw] opacity-80"
            style={{ backgroundImage: 'repeating-linear-gradient(90deg, rgba(252,211,77,0.9) 0 10px, transparent 10px 20px)' }}
          />
          <span className="text-center font-mono text-xs tracking-[0.32em] text-muted-foreground max-sm:text-[9px] max-sm:tracking-[0.18em]">
            SURVIVE THE WAVES · UNPLUG THE MACHINE
          </span>
        </div>

        <MissionIntel />
        <BootLog />

        <Collapsible
          open={manualOpen}
          onOpenChange={(o) => {
            uiClick()
            setManualOpen(o)
          }}
          render={<Card className={cn('w-[22rem] max-w-[86vw] bg-background/55 backdrop-blur-md transition-[gap] duration-300', !manualOpen && 'gap-0')} />}
        >
          <CardHeader>
            <CardTitle className="font-mono text-[11px] tracking-[0.4em] text-muted-foreground">FIELD MANUAL</CardTitle>
            <CardAction>
              <CollapsibleTrigger
                aria-label={manualOpen ? 'Minimize field manual' : 'Expand field manual'}
                render={<Button variant="ghost" size="icon-sm" className="-mt-1.5 -mr-2 text-muted-foreground" />}
              >
                <ChevronDown className={cn('transition-transform duration-300', !manualOpen && '-rotate-90')} />
              </CollapsibleTrigger>
            </CardAction>
          </CardHeader>
          <CollapsibleContent className="h-[var(--collapsible-panel-height)] overflow-hidden transition-[height] duration-300 data-[ending-style]:h-0 data-[starting-style]:h-0">
            <CardContent className="flex flex-col">
              {/* keyboard rows (fine pointers) */}
              <div className="flex flex-col pointer-coarse:hidden">
                {CONTROLS.map(([label, keys]) => (
                  <div key={label} className="flex items-center justify-between border-b border-border/40 py-1.5 last:border-0">
                    <span className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">{label}</span>
                    <KbdGroup>
                      {keys.map((k) => (
                        <Kbd key={k} className="bg-muted/60 font-mono">{k}</Kbd>
                      ))}
                    </KbdGroup>
                  </div>
                ))}
              </div>
              {/* touch rows (coarse pointers) */}
              <div className="hidden flex-col pointer-coarse:flex">
                {TOUCH_CONTROLS.map(([label, control]) => (
                  <div key={label} className="flex items-center justify-between border-b border-border/40 py-1.5 last:border-0">
                    <span className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">{label}</span>
                    <Kbd className="bg-muted/60 font-mono">{control}</Kbd>
                  </div>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>

        <Button
          size="lg"
          onClick={start}
          className="hud-engage h-13 border border-red-400/40 bg-red-600 px-14 font-mono text-lg font-bold tracking-[0.4em] text-white hover:bg-red-500"
        >
          ENGAGE
        </Button>
        <span className="text-center font-mono text-[10px] tracking-[0.25em] text-muted-foreground/70 pointer-coarse:hidden">
          CLICK TO CAPTURE CURSOR · ESC RELEASES
        </span>
        <span className="hidden text-center font-mono text-[10px] tracking-[0.25em] text-muted-foreground/70 pointer-coarse:block">
          TOUCH CONTROLS READY · ROTATE TO LANDSCAPE
        </span>
      </div>
    </div>
  )
}

// ─── Buff select ─────────────────────────────────────────────────────────────

export function BuffSelect() {
  const choices = useGame((s) => s.buffChoices)
  const ownedBuffs = useGame((s) => s.ownedBuffs)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const m = /^(?:Digit|Numpad)([1-3])$/.exec(e.code)
      if (!m) return
      const cur = useGame.getState().buffChoices
      const id = cur?.[Number(m[1]) - 1]
      if (id) {
        uiClick()
        useGame.getState().chooseBuff(id)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!choices) return null
  return (
    <div className="pointer-events-auto absolute inset-0 flex flex-col items-center justify-center-safe gap-8 overflow-y-auto bg-background/70 py-6 pr-[max(1rem,env(safe-area-inset-right))] pl-[max(1rem,env(safe-area-inset-left))] backdrop-blur-md max-sm:gap-5">
      <div className="animate-in fade-in slide-in-from-top-3 flex flex-col items-center gap-1.5 duration-300">
        <span className="font-mono text-[10px] tracking-[0.5em] text-muted-foreground max-sm:tracking-[0.3em]">{'// COMBAT SUSPENDED'}</span>
        <span className="text-center font-mono text-2xl font-bold tracking-[0.3em] text-amber-300 drop-shadow-[0_0_20px_rgba(252,211,77,0.5)] max-sm:text-base max-sm:tracking-[0.15em] md:text-3xl">
          SYSTEM UPGRADE AVAILABLE
        </span>
        <span className="font-mono text-[11px] tracking-[0.3em] text-muted-foreground">SELECT ONE MODULE</span>
      </div>
      <div className="flex flex-wrap items-stretch justify-center gap-5 px-6 max-sm:gap-3 max-sm:px-2">
        {choices.map((id, i) => {
          const def = BUFFS[id]
          const owned = ownedBuffs[id] ?? 0
          return (
            <Card
              key={id}
              role="button"
              tabIndex={0}
              onClick={() => {
                uiClick()
                useGame.getState().chooseBuff(id)
              }}
              style={{ animationDelay: `${i * 90}ms` }}
              className={cn(
                'animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards w-60 duration-300',
                'cursor-pointer bg-card/80 backdrop-blur-sm transition-all duration-200',
                'hover:-translate-y-2 hover:ring-2 hover:ring-amber-300/60 hover:shadow-[0_0_50px_-10px_rgba(252,211,77,0.55)]',
                'focus-visible:ring-2 focus-visible:ring-amber-300/60 focus-visible:outline-none',
              )}
            >
              <CardHeader>
                <CardTitle className="font-mono text-xs tracking-[0.22em] text-amber-200">{def.name.toUpperCase()}</CardTitle>
                <CardAction className="pointer-coarse:hidden">
                  <Kbd className="bg-muted/60 font-mono">{i + 1}</Kbd>
                </CardAction>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-3 pb-2">
                <span className="text-5xl drop-shadow-[0_4px_14px_rgba(0,0,0,0.6)]">{def.icon}</span>
                <p className="text-center text-sm leading-snug text-muted-foreground">{def.desc}</p>
                {owned > 0 && (
                  <span className="rounded-[3px] border border-amber-300/40 px-2 py-0.5 font-mono text-[9px] tracking-[0.25em] text-amber-300/90">
                    INSTALLED ×{owned}
                  </span>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
      <span className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground/70">
        <span className="pointer-coarse:hidden">CLICK OR PRESS 1 – 3</span>
        <span className="hidden pointer-coarse:inline">TAP A MODULE</span>
      </span>
    </div>
  )
}

// ─── Death ───────────────────────────────────────────────────────────────────

function useRestartKey() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'NumpadEnter') {
        uiClick()
        useGame.getState().restart()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}

function RunStats({ waveLabel, kills }: { waveLabel: string; kills: number }) {
  return (
    <div className="flex gap-3">
      <HudPanel className="flex w-40 flex-col items-center gap-1 px-4 py-3 max-sm:w-32 max-sm:px-2">
        <span className={MONO_LABEL}>WAVE REACHED</span>
        <span className="font-mono text-3xl font-bold tabular-nums text-foreground max-sm:text-2xl">{waveLabel}</span>
      </HudPanel>
      <HudPanel className="flex w-40 flex-col items-center gap-1 px-4 py-3 max-sm:w-32 max-sm:px-2">
        <span className={MONO_LABEL}>UNITS DOWN</span>
        <span className="font-mono text-3xl font-bold tabular-nums text-amber-200 max-sm:text-2xl">{String(kills).padStart(3, '0')}</span>
      </HudPanel>
    </div>
  )
}

export function DeathScreen() {
  const wave = useGame((s) => s.wave)
  const kills = useGame((s) => s.kills)
  const inBossFight = useGame((s) => s.bossBarVisible)
  useRestartKey()
  return (
    <div
      className="pointer-events-auto absolute inset-0 flex items-center-safe justify-center overflow-y-auto pr-[max(1rem,env(safe-area-inset-right))] pl-[max(1rem,env(safe-area-inset-left))] backdrop-blur-md"
      style={{ background: 'radial-gradient(ellipse at center, rgba(64,8,12,0.55), rgba(8,4,6,0.92))' }}
    >
      <div className="animate-in fade-in zoom-in-95 flex flex-col items-center gap-7 py-6 duration-500 max-sm:gap-5">
        <div className="flex flex-col items-center gap-2">
          <span className="font-mono text-[10px] tracking-[0.5em] text-red-400/80">{'/// SIGNAL LOST'}</span>
          <GlitchText
            text="CONNECTION TERMINATED"
            className="font-mono text-4xl font-black tracking-[0.12em] text-red-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.6)] max-sm:text-[1.3rem] md:text-6xl"
            layerA="text-red-300/70"
            layerB="text-rose-800/80"
          />
          <span className="font-mono text-sm tracking-[0.4em] text-muted-foreground lowercase">you died</span>
        </div>
        <RunStats waveLabel={inBossFight ? 'A.G.I.' : `${wave} / ${WAVES.length}`} kills={kills} />
        <div className="flex flex-col items-center gap-2">
          <Button
            size="lg"
            onClick={() => {
              uiClick()
              useGame.getState().restart()
            }}
            className="h-12 border border-red-400/40 bg-red-600 px-12 font-mono text-base font-bold tracking-[0.4em] text-white shadow-lg shadow-red-900/60 hover:bg-red-500"
          >
            RETRY
          </Button>
          <span className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground/70">
            FULL RUN RESET<span className="pointer-coarse:hidden"> · [ENTER]</span>
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Victory ─────────────────────────────────────────────────────────────────

export function VictoryScreen() {
  const kills = useGame((s) => s.kills)
  useRestartKey()
  return (
    <div
      className="pointer-events-auto absolute inset-0 flex items-center-safe justify-center overflow-y-auto pr-[max(1rem,env(safe-area-inset-right))] pl-[max(1rem,env(safe-area-inset-left))] backdrop-blur-md"
      style={{ background: 'radial-gradient(ellipse at center, rgba(8,48,36,0.5), rgba(4,8,8,0.9))' }}
    >
      <div className="animate-in fade-in zoom-in-95 flex flex-col items-center gap-7 py-6 duration-500 max-sm:gap-5">
        <div className="flex flex-col items-center gap-2">
          <span className="font-mono text-[10px] tracking-[0.5em] text-emerald-300/80">{'/// CORE DUMPED :0'}</span>
          <GlitchText
            text="AGI NEUTRALIZED"
            className="font-mono text-5xl font-black tracking-[0.14em] text-emerald-300 drop-shadow-[0_0_34px_rgba(52,211,153,0.6)] max-sm:text-[1.6rem] md:text-7xl"
            layerA="text-cyan-300/70"
            layerB="text-emerald-700/80"
          />
          <span className="text-center font-mono text-xs tracking-[0.32em] text-muted-foreground max-sm:text-[9px] max-sm:tracking-[0.18em]">ALL WAVES CLEARED · MACHINE UNPLUGGED</span>
        </div>
        <RunStats waveLabel={`${WAVES.length} / ${WAVES.length}`} kills={kills} />
        <div className="flex flex-col items-center gap-2">
          <Button
            size="lg"
            onClick={() => {
              uiClick()
              useGame.getState().restart()
            }}
            className="h-12 border border-emerald-300/40 bg-emerald-600 px-12 font-mono text-base font-bold tracking-[0.4em] text-white shadow-lg shadow-emerald-900/60 hover:bg-emerald-500"
          >
            RUN IT BACK
          </Button>
          <span className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground/70">
            NEW RUN<span className="pointer-coarse:hidden"> · [ENTER]</span>
          </span>
        </div>
      </div>
    </div>
  )
}
