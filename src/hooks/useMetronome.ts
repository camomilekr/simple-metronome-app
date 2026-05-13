import { useRef, useState, useCallback, useEffect } from 'react'

const SCHEDULE_AHEAD_TIME = 0.1
const LOOKAHEAD = 25

export interface TimeSignature {
  beats: number
  noteValue: number
}

function playClick(ctx: AudioContext, time: number, accented: boolean) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.type = 'sine'

  if (accented) {
    osc.frequency.setValueAtTime(1400, time)
    osc.frequency.exponentialRampToValueAtTime(500, time + 0.02)
    gain.gain.setValueAtTime(0, time)
    gain.gain.linearRampToValueAtTime(1.8, time + 0.001)
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08)
    osc.start(time)
    osc.stop(time + 0.08)
  } else {
    osc.frequency.setValueAtTime(880, time)
    osc.frequency.exponentialRampToValueAtTime(200, time + 0.025)
    gain.gain.setValueAtTime(0, time)
    gain.gain.linearRampToValueAtTime(1, time + 0.001)
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.06)
    osc.start(time)
    osc.stop(time + 0.06)
  }
}

export function useMetronome() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [bpm, setBpmState] = useState(120)
  const [beat, setBeat] = useState(0)
  const [currentBeat, setCurrentBeat] = useState(-1)
  const [timeSignature, setTimeSignatureState] = useState<TimeSignature>({ beats: 4, noteValue: 4 })

  const audioCtxRef = useRef<AudioContext | null>(null)
  const nextBeatTimeRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const bpmRef = useRef(bpm)
  const isPlayingRef = useRef(false)
  const beatCountRef = useRef(0)
  const timeSignatureRef = useRef(timeSignature)

  useEffect(() => { bpmRef.current = bpm }, [bpm])

  useEffect(() => {
    timeSignatureRef.current = timeSignature
    beatCountRef.current = 0
    setCurrentBeat(-1)
  }, [timeSignature])

  const schedule = useCallback(() => {
    if (!audioCtxRef.current || !isPlayingRef.current) return

    const ctx = audioCtxRef.current
    const secondsPerBeat = 60 / bpmRef.current

    while (nextBeatTimeRef.current < ctx.currentTime + SCHEDULE_AHEAD_TIME) {
      const beatInMeasure = beatCountRef.current % timeSignatureRef.current.beats
      const isAccented = beatInMeasure === 0

      playClick(ctx, nextBeatTimeRef.current, isAccented)

      const capturedBeat = beatInMeasure
      const delay = Math.max(0, (nextBeatTimeRef.current - ctx.currentTime) * 1000)
      setTimeout(() => {
        setBeat(b => b + 1)
        setCurrentBeat(capturedBeat)
      }, delay)

      beatCountRef.current += 1
      nextBeatTimeRef.current += secondsPerBeat
    }

    timerRef.current = setTimeout(schedule, LOOKAHEAD)
  }, [])

  const start = useCallback(async () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext()
    }
    if (audioCtxRef.current.state === 'suspended') {
      await audioCtxRef.current.resume()
    }
    beatCountRef.current = 0
    nextBeatTimeRef.current = audioCtxRef.current.currentTime
    isPlayingRef.current = true
    setIsPlaying(true)
    setCurrentBeat(-1)
    schedule()
  }, [schedule])

  const stop = useCallback(() => {
    isPlayingRef.current = false
    setIsPlaying(false)
    setCurrentBeat(-1)
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const toggle = useCallback(() => {
    if (isPlayingRef.current) stop()
    else start()
  }, [start, stop])

  const setBpm = useCallback((value: number | ((prev: number) => number)) => {
    setBpmState(prev => {
      const next = typeof value === 'function' ? value(prev) : value
      return Math.min(240, Math.max(40, next))
    })
  }, [])

  const setTimeSignature = useCallback((ts: TimeSignature) => {
    setTimeSignatureState(ts)
  }, [])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      audioCtxRef.current?.close()
    }
  }, [])

  return { isPlaying, bpm, setBpm, toggle, beat, currentBeat, timeSignature, setTimeSignature }
}
