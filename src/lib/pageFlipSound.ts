/** Paper-flip audio for Dossier mode — prefers short WAV/MP3, falls back to Web Audio rustle. */

let sharedCtx: AudioContext | null = null
let bufferCache: AudioBuffer | null = null
let bufferTried = false

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AC) return null
  if (!sharedCtx) sharedCtx = new AC()
  return sharedCtx
}

async function loadBuffer(ctx: AudioContext): Promise<AudioBuffer | null> {
  if (bufferCache) return bufferCache
  if (bufferTried) return null
  bufferTried = true
  const candidates = ['/sounds/page-flip.mp3', '/sounds/page-flip.wav']
  for (const url of candidates) {
    try {
      const res = await fetch(url)
      if (!res.ok) continue
      const raw = await res.arrayBuffer()
      bufferCache = await ctx.decodeAudioData(raw.slice(0))
      return bufferCache
    } catch {
      /* try next */
    }
  }
  return null
}

/** Synthesize a short paper rustle when asset decode fails. */
function synthesizeRustle(ctx: AudioContext, when: number) {
  const dur = 0.16
  const sampleRate = ctx.sampleRate
  const len = Math.floor(sampleRate * dur)
  const buffer = ctx.createBuffer(1, len, sampleRate)
  const data = buffer.getChannelData(0)
  let state = (Math.random() * 1e9) | 0
  for (let i = 0; i < len; i++) {
    const t = i / sampleRate
    state = (1103515245 * state + 12345) & 0x7fffffff
    const noise = (state / 0x7fffffff) * 2 - 1
    const env = Math.exp(-t * 18) * (1 - Math.exp(-t * 120))
    const rustle = noise * env * 0.5
    const thump = Math.sin(2 * Math.PI * 90 * t) * Math.exp(-t * 35) * 0.22
    const flutter = Math.sin(2 * Math.PI * 420 * t + noise) * Math.exp(-t * 28) * 0.07
    data[i] = Math.max(-1, Math.min(1, rustle + thump + flutter))
  }
  const src = ctx.createBufferSource()
  src.buffer = buffer
  const gain = ctx.createGain()
  gain.gain.value = 0.55
  src.connect(gain)
  gain.connect(ctx.destination)
  src.start(when)
}

export async function playPageFlip(muted: boolean): Promise<void> {
  if (muted) return
  const ctx = getCtx()
  if (!ctx) return
  try {
    if (ctx.state === 'suspended') await ctx.resume()
  } catch {
    return
  }
  const when = ctx.currentTime
  const buf = await loadBuffer(ctx)
  if (buf) {
    const src = ctx.createBufferSource()
    src.buffer = buf
    const gain = ctx.createGain()
    gain.gain.value = 0.7
    src.connect(gain)
    gain.connect(ctx.destination)
    src.start(when)
    return
  }
  synthesizeRustle(ctx, when)
}

export function prefetchPageFlipSound(): void {
  const ctx = getCtx()
  if (!ctx) return
  void loadBuffer(ctx)
}
