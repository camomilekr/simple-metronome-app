import { Play, Square } from 'lucide-react'
import { useMetronome, type TimeSignature } from './hooks/useMetronome'

const TEMPO_NAMES: [number, string][] = [
  [40,  'Grave'],
  [60,  'Largo'],
  [66,  'Larghetto'],
  [76,  'Adagio'],
  [108, 'Andante'],
  [120, 'Moderato'],
  [156, 'Allegro'],
  [176, 'Vivace'],
  [200, 'Presto'],
  [240, 'Prestissimo'],
]

const TIME_SIGNATURES: TimeSignature[] = [
  { beats: 2, noteValue: 4 },
  { beats: 3, noteValue: 4 },
  { beats: 4, noteValue: 4 },
  { beats: 5, noteValue: 4 },
  { beats: 6, noteValue: 4 },
  { beats: 7, noteValue: 4 },
  { beats: 3, noteValue: 8 },
  { beats: 6, noteValue: 8 },
  { beats: 9, noteValue: 8 },
  { beats: 12, noteValue: 8 },
]

const BPM_STEPS = [-10, -5, -1, 1, 5, 10]

function getTempoName(bpm: number) {
  for (let i = TEMPO_NAMES.length - 1; i >= 0; i--) {
    if (bpm >= TEMPO_NAMES[i][0]) return TEMPO_NAMES[i][1]
  }
  return 'Grave'
}

export default function App() {
  const { isPlaying, bpm, setBpm, toggle, beat, currentBeat, timeSignature, setTimeSignature } = useMetronome()

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-8">

        <p className="text-slate-500 text-xs uppercase tracking-[0.3em] font-medium">
          Metronome
        </p>

        {/* Beat indicator */}
        <div className="flex flex-wrap justify-center gap-2.5 max-w-xs min-h-6 items-center">
          {Array.from({ length: timeSignature.beats }, (_, i) => {
            const isActive = isPlaying && currentBeat === i
            const isAccent = i === 0
            return (
              <div
                key={isActive ? `active-${beat}` : `dot-${i}`}
                className={[
                  'rounded-full transition-colors',
                  isAccent ? 'w-4 h-4' : 'w-3 h-3',
                  isActive
                    ? isAccent
                      ? 'bg-amber-400 beat-pulse'
                      : 'bg-emerald-400 beat-pulse'
                    : 'bg-slate-700',
                ].join(' ')}
              />
            )
          })}
        </div>

        {/* Time signature selector */}
        <div className="flex flex-wrap gap-2 justify-center max-w-72">
          {TIME_SIGNATURES.map(ts => {
            const isSelected = timeSignature.beats === ts.beats && timeSignature.noteValue === ts.noteValue
            return (
              <button
                key={`${ts.beats}/${ts.noteValue}`}
                onClick={() => setTimeSignature(ts)}
                className={[
                  'px-3 py-1.5 rounded text-sm font-mono transition-colors',
                  isSelected
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700',
                ].join(' ')}
              >
                {ts.beats}/{ts.noteValue}
              </button>
            )
          })}
        </div>

        {/* BPM display */}
        <div className="text-center select-none">
          <div className="text-[7rem] font-bold tabular-nums leading-none tracking-tight">
            {bpm}
          </div>
          <div className="text-slate-500 text-sm mt-2 tracking-widest uppercase">BPM</div>
        </div>

        {/* Slider */}
        <div className="w-72 flex flex-col gap-1.5">
          <input
            type="range"
            min={40}
            max={240}
            value={bpm}
            onChange={e => setBpm(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-emerald-400 bg-slate-700"
          />
          <div className="flex justify-between text-xs text-slate-600">
            <span>40</span>
            <span>240</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-4">
          {/* BPM step buttons */}
          <div className="flex items-center gap-2">
            {BPM_STEPS.map(step => (
              <button
                key={step}
                onClick={() => setBpm(b => b + step)}
                className={[
                  'px-3 py-1.5 rounded-full text-xs font-mono transition-colors border',
                  step === -1 || step === 1
                    ? 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-300 min-w-10'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400 min-w-12',
                ].join(' ')}
              >
                {step > 0 ? `+${step}` : step}
              </button>
            ))}
          </div>

          {/* Play / Stop button */}
          <button
            onClick={toggle}
            aria-label={isPlaying ? '정지' : '재생'}
            className={[
              'w-20 h-20 rounded-full flex items-center justify-center transition-colors shadow-lg',
              isPlaying
                ? 'bg-red-500 hover:bg-red-400 shadow-red-500/20'
                : 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20',
            ].join(' ')}
          >
            {isPlaying
              ? <Square size={26} fill="white" stroke="none" />
              : <Play size={26} fill="white" stroke="none" className="translate-x-0.5" />
            }
          </button>
        </div>

        {/* Tempo name */}
        <p className="text-slate-500 text-sm tracking-wide">{getTempoName(bpm)}</p>
      </div>
    </div>
  )
}
