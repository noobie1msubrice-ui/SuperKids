/**
 * Lightweight UI sound effects synthesised with the Web Audio API — no audio
 * files, no licensing. Each sound is a few short oscillator tones. The browser
 * keeps the AudioContext suspended until a user gesture, so the first sound
 * always plays inside a click/tap and resumes it cleanly.
 */

let ctx: AudioContext | null = null;
let muted = false;

function audioCtx(): AudioContext | null {
  if (typeof window === 'undefined') {
    return null;
  }
  if (!ctx) {
    const Ctor: typeof AudioContext | undefined =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) {
      return null;
    }
    ctx = new Ctor();
  }
  if (ctx.state === 'suspended') {
    void ctx.resume();
  }
  return ctx;
}

/** Plays a single tone, scheduled `startAt` seconds from now. */
function tone(
  freq: number,
  startAt: number,
  duration: number,
  type: OscillatorType,
  gain: number,
): void {
  const ac = audioCtx();
  if (!ac) {
    return;
  }
  const osc = ac.createOscillator();
  const env = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t0 = ac.currentTime + startAt;
  env.gain.setValueAtTime(0.0001, t0);
  env.gain.linearRampToValueAtTime(gain, t0 + 0.015);
  env.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(env);
  env.connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.03);
}

export const sound = {
  /** Globally enable/disable all sound effects. */
  setMuted(value: boolean): void {
    muted = value;
  },

  /** A soft, quiet click for button taps. */
  click(): void {
    if (muted) return;
    tone(430, 0, 0.07, 'sine', 0.07);
  },

  /** A short upbeat blip for a completed action. */
  success(): void {
    if (muted) return;
    tone(660, 0, 0.1, 'sine', 0.13);
    tone(880, 0.08, 0.16, 'sine', 0.13);
  },

  /** A bright rising arpeggio for earning Stars or buying a reward. */
  reward(): void {
    if (muted) return;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      tone(f, i * 0.1, 0.3, 'triangle', 0.16),
    );
  },

  /** A low, soft tone for errors. */
  error(): void {
    if (muted) return;
    tone(196, 0, 0.24, 'sine', 0.12);
  },
};
