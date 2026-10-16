"""Soundtrack for 'What if AI took all our jobs?'. Usage: python3 audio.py out.wav
Electronic-cinematic score that builds; sound effects only where they tell the story."""
import sys, wave
import numpy as np
from scipy.signal import butter, sosfilt

SR = 48000
DUR = 64.0
N = int(SR * DUR)
rng = np.random.default_rng(31)


def lp(x, fc, o=2): return sosfilt(butter(o, fc, 'low', fs=SR, output='sos'), x)
def hp(x, fc, o=2): return sosfilt(butter(o, fc, 'high', fs=SR, output='sos'), x)
def bp(x, a, b, o=2): return sosfilt(butter(o, [a, b], 'band', fs=SR, output='sos'), x)
def hz(m): return 440 * 2 ** ((m - 69) / 12)
def noise(n): return rng.normal(0, 1, n)


def env(n, a, r):
    e = np.ones(n); na, nr = int(a * SR), int(r * SR)
    if na: e[:na] = np.linspace(0, 1, na)
    if nr: e[-nr:] *= np.linspace(1, 0, nr)
    return e


def add(buf, t0, sig, g=1.0):
    i = int(t0 * SR); j = min(len(buf), i + len(sig))
    if j > i: buf[i:j] += sig[:j - i] * g


music = np.zeros(N); sfx = np.zeros(N)


def pluck(t0, m, g=0.05, dec=0.35, fc=3000, saw=True):
    n = int(dec * 4 * SR); t = np.arange(n) / SR; f = hz(m)
    s = (2 * ((f * t) % 1.0) - 1) if saw else np.sin(2 * np.pi * f * t)
    s = s * np.exp(-t / dec) * np.minimum(1, t / 0.003)
    add(music, t0, lp(s, fc), g)


def piano(t0, m, g=0.1, dec=2.4):
    n = int(dec * 2.5 * SR); t = np.arange(n) / SR; f = hz(m); s = np.zeros(n)
    for k, a in enumerate([1, 0.5, 0.28, 0.16, 0.09], 1):
        s += a * np.sin(2 * np.pi * f * k * (1 + 0.0004 * k * k) * t) * np.exp(-t * (1.0 + k * 0.9) / dec * 2)
    add(music, t0, lp(s * np.minimum(1, t / 0.003), 5000), g)


def pad(t0, t1, ms, g=0.1, fc=900, att=1.5, rel=2.0, det=0.005):
    n = int((t1 - t0 + rel) * SR); t = np.arange(n) / SR; s = np.zeros(n)
    for m in ms:
        for d in (-det, 0, det):
            ph = rng.random() * 6.28
            for k in range(1, 6): s += np.sin(2 * np.pi * hz(m) * (1 + d) * k * t + ph * k) / k ** 1.4
    s = lp(s, fc); e = env(n, att, 0.01); cut = int((t1 - t0) * SR)
    if cut < n: e[cut:] *= np.linspace(1, 0, n - cut)
    add(music, t0, s * e / (len(ms) * 3), g)


def subbass(t0, t1, m, g=0.2, att=0.5, rel=1.0):
    n = int((t1 - t0 + rel) * SR); t = np.arange(n) / SR
    add(music, t0, (np.sin(2 * np.pi * hz(m) * t) + 0.25 * np.sin(4 * np.pi * hz(m) * t)) * env(n, att, rel), g)


def kick(t0, g=0.2):
    n = int(0.5 * SR); t = np.arange(n) / SR
    add(music, t0, np.sin(2 * np.pi * (45 + 70 * np.exp(-t / 0.035)) * t) * np.exp(-t / 0.2), g)


# ---------- score ----------
# 0-3.2 title: calm, hopeful morning (major)
pad(0, 3.4, [52, 59, 64, 68, 71], g=0.11, fc=1500, att=0.3)
for i, m in enumerate([76, 71, 68, 71, 76, 78]): piano(0.2 + i * 0.5, m, g=0.045, dec=1.6)
# 3.2-18.4 offices: an arpeggio that gets colder and faster
bpm = 110; b = 60 / bpm
pad(3.2, 7.1, [50, 57, 62, 66], g=0.14, fc=1200, att=0.4)
pad(7.0, 10.9, [47, 54, 59, 62], g=0.15, fc=1000)
pad(10.8, 14.7, [45, 52, 57, 60], g=0.15, fc=1000)
pad(14.6, 18.5, [43, 50, 55, 58], g=0.16, fc=900)
t = 4.4; i = 0                         # arpeggio starts the moment the AI goes live
while t < 18.3:
    sec = 0 if t < 7 else 1 if t < 10.8 else 2 if t < 14.6 else 3
    pats = [[74, 78, 81, 78], [71, 74, 78, 74], [69, 72, 76, 72], [67, 70, 74, 79]]
    pluck(t, pats[sec][i % 4], g=0.045 + 0.006 * sec, dec=0.22, fc=2600 + sec * 400)
    t += b / 2 if sec < 3 else b / 4; i += 1
subbass(7.0, 18.4, 31, g=0.11, att=2.0, rel=0.3)
# 18.4-33.6: machines take over the physical world: pulse + kick
pad(18.4, 26.1, [40, 47, 52, 55, 59], g=0.12, fc=1300, att=0.5)
pad(26.0, 33.7, [38, 45, 50, 53, 57], g=0.13, fc=1400, att=0.5)
subbass(18.4, 33.6, 28, g=0.1, att=0.5, rel=0.3)
t = 18.4; i = 0
while t < 33.5:
    pluck(t, [64, 67, 71, 74, 71, 67][i % 6] - (0 if t < 26 else 2), g=0.026, dec=0.18, fc=3200)
    if i % 4 == 0: kick(t, 0.14 + 0.06 * (t - 18.4) / 15)
    t += b / 2; i += 1
# 33.6-45.6: unrest -> emptiness -> power: dissonant, heavy, then cold
pad(33.6, 37.7, [37, 44, 49, 52, 56], g=0.15, fc=1000, att=0.2, det=0.01)
t = 33.6
while t < 37.5: kick(t, 0.22); kick(t + b * 0.75, 0.1); t += b * 2
pad(37.6, 41.7, [45, 52, 57, 60], g=0.07, fc=700, att=0.8, det=0.002)      # empty shop: thin, cold
pad(41.6, 45.7, [33, 45, 52, 57, 63], g=0.15, fc=1800, att=0.8)
subbass(41.6, 45.6, 33, g=0.12, att=0.6, rel=0.4)
# 45.6-52: earth: vast, big
pad(45.6, 52.2, [45, 52, 57, 64, 69, 71, 76], g=0.17, fc=2400, att=1.0)
subbass(45.6, 52.0, 33, g=0.15, att=1.0, rel=0.4)
for t0, m in [(46.2, 69), (47.6, 72), (49.0, 76), (50.4, 74)]: piano(t0, m, g=0.08, dec=3.2); piano(t0, m - 12, g=0.05, dec=3.2)
# 52-60 final: quiet, human, unresolved
pad(52.0, 60.2, [52, 59, 64, 67], g=0.08, fc=1600, att=1.5, rel=1.5)
for t0, m in [(52.6, 64), (53.8, 67), (55.0, 71), (56.4, 69), (57.6, 67), (58.8, 64)]: piano(t0, m, g=0.07, dec=3.0)
piano(56.2, 40, g=0.06, dec=4)
piano(60.2, 45, g=0.09, dec=4.0); piano(60.2, 57, g=0.05, dec=4.0)

# ---------- SFX (story beats only) ----------
# office keyboards typing until the AI goes live (4.4), then silence
n = int(1.4 * SR); keys = np.zeros(n)
for k in range(int(1.4 * 22)):
    i0 = int(rng.random() * (n - 800)); m = int(0.012 * SR)
    keys[i0:i0 + m] += hp(noise(m), 2500) * np.exp(-np.arange(m) / (0.002 * SR)) * (0.5 + rng.random() * 0.5)
add(sfx, 3.2, keys * env(n, 0.1, 0.06), 0.35)
n = int(2.4 * SR); add(sfx, 3.2, bp(noise(n), 300, 1500) * env(n, 0.3, 0.3) * np.where(np.arange(n) / SR < 1.2, 1, 0.25), 0.02)   # room murmur
# AI power-up at 4.4
n = int(1.2 * SR); tt = np.arange(n) / SR
f = 120 * (1600 / 120) ** (tt / 1.2); ph = 2 * np.pi * np.cumsum(f) / SR
add(sfx, 4.35, np.sin(ph) * env(n, 0.02, 0.6) * 0.6 + bp(noise(n), 3000, 9000) * env(n, 0.01, 1.0) * 0.15, 0.06)
# phones ringing (call center), fading as people leave
for t0 in (7.3, 8.2):
    n = int(0.6 * SR); tt = np.arange(n) / SR
    add(sfx, t0, (np.sin(2 * np.pi * 440 * tt) + np.sin(2 * np.pi * 480 * tt)) * (np.sin(2 * np.pi * 20 * tt) > 0) * env(n, 0.01, 0.1), 0.012)
# two electric pass-bys
for t0 in (19.0, 20.9):
    n = int(1.6 * SR); tt = np.arange(n) / SR
    add(sfx, t0, bp(noise(n), 200, 1800) * np.exp(-((tt - 0.8) / 0.32) ** 2) + np.sin(2 * np.pi * (300 - 80 * (tt - 0.8)) * tt) * np.exp(-((tt - 0.8) / 0.3) ** 2) * 0.2, 0.08)
# warehouse servo whirs
for t0 in (22.6, 24.2):
    n = int(0.8 * SR); tt = np.arange(n) / SR
    add(sfx, t0, np.sin(2 * np.pi * (600 + 300 * np.sin(np.pi * tt / 0.8)) * tt) * np.sin(np.pi * tt / 0.8) ** 2, 0.012)
# hospital: two soft confirmation tones from the AI
for t0, f0 in ((26.6, 880), (26.85, 1320)):
    n = int(0.3 * SR); tt = np.arange(n) / SR
    add(sfx, t0, np.sin(2 * np.pi * f0 * tt) * np.exp(-tt / 0.1), 0.02)
# empty city: wind
n = int(3.8 * SR); add(sfx, 29.8, bp(noise(n), 250, 1200) * env(n, 0.6, 0.6), 0.035)
# protest: chant pulses + drone hum
n = int(4.0 * SR); tt = np.arange(n) / SR
chant = bp(noise(n), 300, 1400) * (0.55 + 0.45 * (np.sin(2 * np.pi * 1.6 * tt) > 0.2))
add(sfx, 33.6, chant * env(n, 0.3, 0.4), 0.06)
add(sfx, 33.6, (np.sin(2 * np.pi * 210 * tt) + 0.5 * np.sin(2 * np.pi * 420 * tt)) * env(n, 0.8, 0.8) * 0.4, 0.012)
# empty shop: fluorescent hum
n = int(4.0 * SR); tt = np.arange(n) / SR
add(sfx, 37.6, (np.sin(2 * np.pi * 120 * tt) + 0.3 * np.sin(2 * np.pi * 240 * tt)) * env(n, 0.4, 0.4), 0.01)
# earth: impact + long low sweep as work disappears
n = int(3.0 * SR); tt = np.arange(n) / SR
add(sfx, 45.6, np.sin(2 * np.pi * (28 + 30 * np.exp(-tt / 0.2)) * tt) * np.exp(-tt / 1.0), 0.25)
n = int(4.5 * SR); tt = np.arange(n) / SR; f = 900 * (50 / 900) ** (tt / 4.5); ph = 2 * np.pi * np.cumsum(f) / SR
add(sfx, 47.0, np.sin(ph) * env(n, 0.5, 1.5), 0.03)
# final: soft city ambience
n = int(8.0 * SR); add(sfx, 52.0, lp(noise(n), 400) * env(n, 1.0, 1.0), 0.03)

# ---------- mix ----------
mix = music + sfx
mix[-int(0.4 * SR):] *= np.linspace(1, 0, int(0.4 * SR))
d = int(0.012 * SR)
st = np.stack([mix, np.concatenate([np.zeros(d), mix[:-d]]) * 0.45 + mix * 0.55], 1)
rms = np.sqrt(np.mean(st[int(3 * SR):] ** 2))
st = st / rms * 0.12
st = np.tanh(st * 1.3) / 1.3
st *= 0.97 / max(1.0, np.max(np.abs(st)))
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((st * 32767).astype('<i2').tobytes())
print('ok')
