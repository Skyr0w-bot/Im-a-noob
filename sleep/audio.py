"""Synthesized soundtrack for the sleep video. No samples, all generated.
Usage: python3 audio.py out.wav
Timeline must match timeline.js."""
import sys
import numpy as np
from scipy.signal import butter, sosfilt

SR = 48000
DUR = 76.0
N = int(SR * DUR)
rng = np.random.default_rng(3)
t_all = np.arange(N) / SR


def sec(a, b=None):
    return slice(int(a * SR), int((b if b is not None else a) * SR))


def lp(x, fc, order=2):
    return sosfilt(butter(order, fc, 'low', fs=SR, output='sos'), x)


def hp(x, fc, order=2):
    return sosfilt(butter(order, fc, 'high', fs=SR, output='sos'), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], 'band', fs=SR, output='sos'), x)


def env_adsr(n, a, r, sustain=1.0):
    e = np.ones(n) * sustain
    na, nr = int(a * SR), int(r * SR)
    if na: e[:na] = np.linspace(0, sustain, na)
    if nr: e[-nr:] *= np.linspace(1, 0, nr)
    return e


def note(f):  # midi -> hz
    return 440 * 2 ** ((f - 69) / 12)


def add(buf, start, sig, gain=1.0):
    i = int(start * SR)
    j = min(len(buf), i + len(sig))
    if j > i:
        buf[i:j] += sig[:j - i] * gain


# ---------------- music ----------------
music = np.zeros(N)


def pad_chord(t0, t1, midis, gain=0.12, bright=900, att=1.2, rel=1.5, detune=0.004):
    n = int((t1 - t0 + rel) * SR)
    tt = np.arange(n) / SR
    s = np.zeros(n)
    for m in midis:
        f = note(m)
        for d in (-detune, 0, detune):
            ph = rng.random() * 6.28
            # soft saw: few harmonics
            for k in range(1, 6):
                s += np.sin(2 * np.pi * f * (1 + d) * k * tt + ph * k) / (k ** 1.3)
    s = lp(s, bright)
    e = env_adsr(n, att, rel)
    e[int((t1 - t0) * SR):] = np.linspace(1, 0, n - int((t1 - t0) * SR)) if n > int((t1 - t0) * SR) else 0
    add(music, t0, s * e / (len(midis) * 3), gain)


def pluck(t0, midi, gain=0.08, decay=0.7, bright=2500):
    n = int(decay * 3 * SR)
    tt = np.arange(n) / SR
    f = note(midi)
    s = (np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(2 * np.pi * 2 * f * tt) + 0.12 * np.sin(2 * np.pi * 3 * f * tt))
    s *= np.exp(-tt / decay) * np.minimum(1, tt / 0.004)
    add(music, t0, lp(s, bright), gain)


def bell(buf, t0, midi, gain=0.06, decay=1.6):
    n = int(decay * 3 * SR)
    tt = np.arange(n) / SR
    f = note(midi)
    s = np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(2 * np.pi * f * 2.76 * tt) * np.exp(-tt / 0.3) + 0.2 * np.sin(2 * np.pi * f * 5.4 * tt) * np.exp(-tt / 0.12)
    s *= np.exp(-tt / decay) * np.minimum(1, tt / 0.003)
    add(buf, t0, s, gain)


# Section 1: hook + night1 (0-10.5): dark, sparse D minor
pad_chord(0.0, 5.2, [38, 45, 50, 53], gain=0.16, bright=600, att=0.05)
pad_chord(5.0, 10.7, [34, 46, 50, 53, 58], gain=0.15, bright=650)
for i, m in enumerate([62, 65, 69, 65]):
    bell(music, 1.2 + i * 1.0, m, gain=0.025, decay=1.4)
for i, m in enumerate([62, 69, 70, 69]):
    bell(music, 5.6 + i * 1.25, m, gain=0.02, decay=1.4)

# Section 2: h24 -> h48 (10.5-31): pulse enters, tension builds
bpm = 100
beat = 60 / bpm
prog = [(10.5, [41, 48, 53, 57]), (17.0, [36, 48, 52, 55]), (23.5, [38, 50, 53, 57])]
for k, (s0, ch) in enumerate(prog):
    s1 = prog[k + 1][0] if k + 1 < len(prog) else 31.0
    pad_chord(s0, s1 + 0.2, ch, gain=0.13, bright=800 + k * 250)
arp_sets = {10.5: [65, 69, 72, 69], 17.0: [64, 67, 72, 67], 23.5: [62, 65, 69, 74]}
t = 10.5
while t < 30.8:
    key = max(k for k in arp_sets if k <= t)
    pat = arp_sets[key]
    i = int(round((t - 10.5) / (beat / 2)))
    g = 0.035 + 0.03 * (t - 10.5) / 20
    pluck(t, pat[i % 4], gain=g, decay=0.35, bright=2200)
    t += beat / 2
# low pulse (soft kick-like thump on beats from 17s, not every beat early)
t = 17.0
while t < 30.8:
    n = int(0.25 * SR); tt = np.arange(n) / SR
    k = np.sin(2 * np.pi * (50 + 60 * np.exp(-tt / 0.03)) * tt) * np.exp(-tt / 0.09)
    add(music, t, k, 0.11)
    t += beat * 2

# Section 3: day3 + day6 (31-45): dissonant, unstable
pad_chord(31.0, 38.6, [37, 44, 49, 50, 56], gain=0.15, bright=700, att=0.3, detune=0.008)
pad_chord(38.5, 45.0, [36, 43, 49, 51, 54], gain=0.16, bright=900, att=0.6, detune=0.014)
# eerie high whistle (detuned sines) during day3
n = int(7.5 * SR); tt = np.arange(n) / SR
wh = np.sin(2 * np.pi * (1318 + 6 * np.sin(2 * np.pi * 0.3 * tt)) * tt) + np.sin(2 * np.pi * 1396 * tt)
add(music, 31.0, wh * env_adsr(n, 2.5, 2.0) * 0.006)
# day6: warbling arpeggio (wow/flutter)
for i in range(26):
    tt0 = 38.6 + i * beat / 2
    pluck(tt0, [60, 63, 67, 66][i % 4] + (0.3 if i % 3 == 0 else 0), gain=0.03, decay=0.4, bright=1800)

# Section 4: 1964 + record (46.6-57.5): warm, old-radio music box in F major
oldtime = np.zeros(N)
for i, m in enumerate([65, 69, 72, 77, 76, 72, 69, 67, 65, 69, 72, 74, 72, 69, 67, 65,
                       65, 69, 72, 77, 76, 72, 69, 72, 74, 72, 69, 65]):
    bell(oldtime, 46.75 + i * 0.36, m, gain=0.05, decay=0.9)
for s0, s1, ch in [(46.6, 50.2, [41, 53, 57, 60]), (50.2, 53.8, [46, 53, 58, 62]), (53.8, 57.6, [36, 52, 55, 60])]:
    n = int((s1 - s0 + 1) * SR); tt = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * note(m) * tt) for m in ch)
    add(oldtime, s0, s * env_adsr(n, 0.4, 1.0) * 0.03)
oldtime = bp(oldtime, 250, 3200, order=2)
crackle = np.zeros(N)
seg = sec(46.6, 57.5)
cn = seg.stop - seg.start
cr = (rng.random(cn) < 0.0009) * rng.normal(0, 1, cn) * 0.25 + rng.normal(0, 0.004, cn)
crackle[seg] = hp(cr, 1500)
music += oldtime + crackle

# Section 5: twist (57.5-64.5): open, bright, hopeful
pad_chord(57.5, 61.2, [41, 53, 57, 60, 64], gain=0.15, bright=1600, att=0.8)
pad_chord(61.0, 64.7, [36, 52, 55, 60, 67], gain=0.15, bright=1700, att=0.8)
for i, m in enumerate([72, 76, 79, 84, 79, 76, 77, 81, 84, 81, 79, 76]):
    bell(music, 57.7 + i * 0.55, m, gain=0.02, decay=1.8)

# Section 6: today (64.5-71): reflective
pad_chord(64.5, 67.8, [45, 52, 57, 60, 64], gain=0.14, bright=1100)
pad_chord(67.7, 71.3, [41, 53, 57, 60, 65], gain=0.13, bright=900, rel=1.2)
for i, m in enumerate([69, 72, 76, 72, 65, 69, 72, 69]):
    pluck(64.7 + i * 0.8, m, gain=0.03, decay=0.6)

# Section 7: end (71-76): near silence, one low note, two clock ticks leading to loop
bell(music, 71.3, 50, gain=0.05, decay=3.0)
pad_chord(71.2, 75.9, [38, 50], gain=0.08, bright=400, att=1.5, rel=1.4)

# ---------------- sfx ----------------
sfx = np.zeros(N)


def tick(t0, hi=True, gain=0.08):
    n = int(0.05 * SR); tt = np.arange(n) / SR
    s = rng.normal(0, 1, n) * np.exp(-tt / 0.004)
    s = bp(s, 2500 if hi else 1800, 6000 if hi else 4500)
    s += np.sin(2 * np.pi * (3200 if hi else 2600) * tt) * np.exp(-tt / 0.008) * 0.4
    add(sfx, t0, s, gain)


# clock: hook + night1 only, then gone
for i in range(10):
    tick(0.5 + i * 1.0, hi=i % 2 == 0, gain=0.07 if i < 5 else 0.05)
tick(74.5, True, 0.05); tick(75.5, False, 0.06)

# opening impact (sub hit) + soft hit into day3
for t0, g in [(0.0, 0.2), (31.0, 0.16)]:
    n = int(1.6 * SR); tt = np.arange(n) / SR
    s = np.sin(2 * np.pi * (38 + 40 * np.exp(-tt / 0.08)) * tt) * np.exp(-tt / 0.45)
    s += lp(rng.normal(0, 1, n), 300) * np.exp(-tt / 0.15) * 0.3
    add(sfx, t0, s, g)


def whoosh(t0, length=0.8, gain=0.12, lo=300, hi=3000, rev=False):
    n = int(length * SR); tt = np.arange(n) / SR
    s = rng.normal(0, 1, n)
    s = bp(s, lo, hi)
    e = np.sin(np.pi * tt / length) ** 2
    if rev: e = (tt / length) ** 2.5 * (tt < length)
    add(sfx, t0, s * e, gain)


whoosh(10.2, 0.6, 0.07)          # into the street
whoosh(55.8, 1.7, 0.09, 600, 6000, rev=True)  # riser into the twist

# city ambience (low traffic hum) during street scenes
for s0, s1, g in [(10.5, 17.0, 0.05), (23.5, 31.0, 0.045), (38.5, 45.0, 0.035), (64.5, 71.0, 0.025)]:
    n = int((s1 - s0) * SR)
    s = lp(rng.normal(0, 1, n), 380) + 0.4 * bp(rng.normal(0, 1, n), 800, 1600) * 0.3
    add(sfx, s0, s * env_adsr(n, 0.3, 0.3), g)
# a passing car in h24 (doppler-ish swell)
n = int(2.6 * SR); tt = np.arange(n) / SR
car = bp(rng.normal(0, 1, n), 120, 900) * np.exp(-((tt - 1.3) / 0.5) ** 2)
add(sfx, 12.4, car, 0.12)

# heartbeat day3 -> day6, accelerating, swelling
t = 31.4
while t < 44.9:
    p = (t - 31.4) / 13.5
    period = 1.05 - 0.45 * p
    for off, g in [(0, 1.0), (0.17, 0.65)]:
        n = int(0.25 * SR); tt = np.arange(n) / SR
        s = np.sin(2 * np.pi * (48 + 25 * np.exp(-tt / 0.02)) * tt) * np.exp(-tt / 0.07)
        add(sfx, t + off, s, g * (0.06 + 0.12 * p))
    t += period

# car approach + horn (once) in h48
n = int(3.0 * SR); tt = np.arange(n) / SR
appr = bp(rng.normal(0, 1, n), 90, 700) * (tt / 3.0) ** 2
add(sfx, 26.0, appr, 0.22)
n = int(0.7 * SR); tt = np.arange(n) / SR
horn = (np.sign(np.sin(2 * np.pi * 415 * tt)) + np.sign(np.sin(2 * np.pi * 523 * tt))) * 0.5
horn = lp(horn, 2400) * env_adsr(n, 0.01, 0.12)
add(sfx, 28.95, horn, 0.11)
# skid
n = int(0.6 * SR); tt = np.arange(n) / SR
add(sfx, 28.5, bp(rng.normal(0, 1, n), 1800, 4200) * env_adsr(n, 0.05, 0.3), 0.05)

# rewind: tape spin-back, pitch sweeping, plus static
seg = sec(45.0, 46.6)
n = seg.stop - seg.start; tt = np.arange(n) / SR
fsw = 200 + 1800 * (tt / tt[-1]) ** 2
ph = 2 * np.pi * np.cumsum(fsw) / SR
rw = (np.sin(ph) + 0.5 * np.sin(2.01 * ph)) * 0.5 + bp(rng.normal(0, 1, n), 2000, 8000) * 0.6
rw *= env_adsr(n, 0.05, 0.15) * (0.7 + 0.3 * np.sign(np.sin(2 * np.pi * 14 * tt)))
sfx[seg] += rw * 0.09
# tape stop at end of rewind (music drop)
# soft swell at the twist reveal
n = int(2.5 * SR); tt = np.arange(n) / SR
add(sfx, 57.5, np.sin(2 * np.pi * 110 * tt) * env_adsr(n, 0.05, 2.2) * np.exp(-tt / 1.2), 0.08)

# ---------------- music processing per section ----------------
# rewind: music pitch-warble down + stop, rebuilt by muting music during rewind
music[sec(45.0, 46.6)] *= np.linspace(1, 0, sec(45.0, 46.6).stop - sec(45.0, 46.6).start) ** 0.5

# muffled blackouts (microsleeps) in h48: lowpass + dip on music+sfx
mix = music + sfx
muff = lp(mix, 350, order=4)
w = np.zeros(N)
for a, b in [(25.6, 26.0), (28.1, 28.9)]:
    w += np.clip(np.minimum((t_all - a) / 0.08, (b - t_all) / 0.12), 0, 1)
w = np.clip(w, 0, 1)
mix = mix * (1 - w) + muff * w * 0.55

# gentle fade in/out edges
mix[:int(0.01 * SR)] *= np.linspace(0, 1, int(0.01 * SR))
mix[-int(0.3 * SR):] *= np.linspace(1, 0, int(0.3 * SR))

# stereo widen: tiny delay on right
L = mix
R = np.concatenate([np.zeros(int(0.011 * SR)), mix[:-int(0.011 * SR)]]) * 0.5 + mix * 0.5
st = np.stack([L, R], 1)
rms = np.sqrt(np.mean(st[int(1 * SR):] ** 2))
st = st / rms * 0.12          # target RMS ~ -18 dBFS before limiting
st = np.tanh(st * 1.4) / 1.4   # soft limiter
st *= 0.97 / max(1.0, np.max(np.abs(st)))
import wave
with wave.open(sys.argv[1], 'wb') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR)
    f.writeframes((st * 32767).astype('<i2').tobytes())
print('ok', sys.argv[1])
