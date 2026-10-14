"""Soundtrack for 'What if Roblox never existed?'. Usage: python3 audio.py out.wav
Playful chiptune at first that gets erased piece by piece, cinematic finale. Each erase moment has its own sound."""
import sys, wave
import numpy as np
from scipy.signal import butter, sosfilt

SR = 48000
DUR = 72.0
N = int(SR * DUR)
rng = np.random.default_rng(21)


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


def square(t0, m, dur, g=0.05, duty=0.5):
    n = int(dur * SR); t = np.arange(n) / SR
    ph = (hz(m) * t) % 1.0
    s = np.where(ph < duty, 1.0, -1.0) * env(n, 0.004, min(0.05, dur * 0.5)) * np.exp(-t * 2.5)
    add(music, t0, lp(s, 4500), g)


def piano(t0, m, g=0.1, dec=2.4):
    n = int(dec * 2.5 * SR); t = np.arange(n) / SR; f = hz(m); s = np.zeros(n)
    for k, a in enumerate([1, 0.5, 0.28, 0.16, 0.09], 1):
        s += a * np.sin(2 * np.pi * f * k * (1 + 0.0004 * k * k) * t) * np.exp(-t * (1.0 + k * 0.9) / dec * 2)
    s *= np.minimum(1, t / 0.003)
    add(music, t0, lp(s, 5000), g)


def pad(t0, t1, ms, g=0.1, fc=900, att=1.5, rel=2.0, det=0.005):
    n = int((t1 - t0 + rel) * SR); t = np.arange(n) / SR; s = np.zeros(n)
    for m in ms:
        for d in (-det, 0, det):
            ph = rng.random() * 6.28
            for k in range(1, 6): s += np.sin(2 * np.pi * hz(m) * (1 + d) * k * t + ph * k) / k ** 1.4
    s = lp(s, fc); e = env(n, att, 0.01); cut = int((t1 - t0) * SR)
    if cut < n: e[cut:] *= np.linspace(1, 0, n - cut)
    add(music, t0, s * e / (len(ms) * 3), g)


def sub(t0, t1, m, g=0.2, att=1.0, rel=1.5):
    n = int((t1 - t0 + rel) * SR); t = np.arange(n) / SR
    add(music, t0, (np.sin(2 * np.pi * hz(m) * t) + 0.3 * np.sin(4 * np.pi * hz(m) * t)) * env(n, att, rel), g)


# ---- 0-3.2 title: bright chiptune hook ----
bpm = 128; b = 60 / bpm
hook = [72, 76, 79, 84, 79, 76, 74, 77, 81, 79, 77, 74]
for i, m in enumerate(hook): square(0.1 + i * b / 2, m, b / 2 * 0.9, g=0.035)
for i, m in enumerate([48, 48, 55, 55, 50, 50, 55, 55]): square(0.1 + i * b / 2 * 1.5, m, b * 0.6, g=0.04, duty=0.25)
# ---- 3.2-11: chiptune continues but thinner after each erase ----
mel = [72, 74, 76, 79, 76, 74, 72, 67, 69, 72, 74, 72]
t = 3.2; i = 0
while t < 11.0:
    thin = 1.0 if t < 5.3 else (0.6 if t < 9.3 else 0.3)
    detune = 0 if t < 5.3 else (0.35 if t < 9.3 else 0.7)
    square(t, mel[i % len(mel)] - detune, b / 2 * 0.85, g=0.03 * thin)
    if i % 2 == 0: square(t, 48 + (i // 4 % 2) * 5, b * 0.8, g=0.035 * thin, duty=0.25)
    t += b / 2; i += 1
pad(3.2, 11.2, [48, 55, 60, 64], g=0.06, fc=1200, att=1.0)
# ---- 11-22.4: melancholy piano, kids alone ----
pad(11.0, 18.8, [45, 52, 57, 60], g=0.11, fc=800, att=1.5)
pad(18.6, 22.6, [41, 48, 53, 57], g=0.11, fc=700, att=1.0)
for t0, m in [(11.4, 69), (12.6, 72), (13.8, 71), (15.0, 67), (16.2, 69), (17.4, 64), (18.9, 65), (20.1, 69), (21.3, 67)]:
    piano(t0, m, g=0.06, dec=2.6); piano(t0, m - 24, g=0.04, dec=3)
# ---- 22.4-42.2: driving pulse, the big moments get erased ----
bpm2 = 96; b2 = 60 / bpm2
pad(22.4, 30.4, [43, 50, 55, 58, 62], g=0.13, fc=1100, att=0.4)
pad(30.4, 38.0, [41, 48, 53, 57, 60], g=0.13, fc=1200)
pad(38.0, 42.3, [38, 45, 50, 53, 57], g=0.14, fc=1300)
t = 22.4; i = 0
while t < 42.1:
    pat = [67, 70, 74, 70] if t < 30.4 else ([65, 69, 72, 69] if t < 38 else [62, 65, 69, 72])
    piano(t, pat[i % 4], g=0.03 + 0.02 * (t - 22.4) / 20, dec=0.8)
    t += b2 / 2; i += 1
t = 26.6
while t < 42.1:
    n = int(0.5 * SR); tt = np.arange(n) / SR
    add(music, t, np.sin(2 * np.pi * (42 + 50 * np.exp(-tt / 0.04)) * tt) * np.exp(-tt / 0.18), 0.11 + 0.06 * (t - 26.6) / 15)
    t += b2 * 2
# ---- 42.2-50.4: big swell then a hush for the kid ----
pad(42.2, 46.3, [33, 45, 52, 57, 60, 64], g=0.17, fc=1500, att=0.6)
sub(42.2, 46.2, 33, g=0.12, att=0.5, rel=0.4)
pad(46.2, 50.6, [57, 64, 69], g=0.06, fc=1200, att=1.0)
for t0, m in [(46.6, 76), (47.8, 74), (49.0, 72)]: piano(t0, m, g=0.05, dec=3)
# ---- 50.4-68: earth. vast, then everything collapses into a drone ----
pad(50.4, 57.2, [45, 52, 57, 64, 69, 71], g=0.16, fc=2200, att=1.2)
sub(50.4, 57.2, 33, g=0.13, att=1.5, rel=0.3)
for t0, m in [(51.0, 69), (52.4, 72), (53.8, 76), (55.2, 74)]: piano(t0, m, g=0.08, dec=3.2); piano(t0, m - 12, g=0.05, dec=3.2)
pad(57.0, 64.6, [45, 52, 57, 64], g=0.10, fc=1400, att=0.1, rel=1.0, det=0.012)
sub(57.0, 64.5, 28, g=0.16, att=0.2, rel=1.0)
pad(64.4, 68.2, [57, 64, 71], g=0.05, fc=2500, att=1.5, rel=1.5, det=0.003)
piano(64.8, 57, g=0.08, dec=4.0); piano(66.6, 64, g=0.05, dec=4)
# end card
piano(68.2, 45, g=0.09, dec=4.0); piano(68.2, 57, g=0.05, dec=4.0)

# ---------------- SFX: every erase sounds a bit different ----------------
def glitch(t0, length=0.35, lo=400, hi=6000, g=0.1, seed=0):
    n = int(length * SR); r = np.random.default_rng(seed)
    hold = max(80, int(SR / (400 + r.random() * 1500)))
    steps = np.repeat(r.random(n // hold + 1) * 2 - 1, hold)[:n]
    s = steps * (r.random(n) < 0.7) + 0.3 * np.sign(np.sin(2 * np.pi * (200 + r.random() * 900) * np.arange(n) / SR))
    add(sfx, t0, bp(s, lo, hi) * env(n, 0.003, length * 0.4), g)


def sweep_down(t0, length=0.9, f0=1800, f1=60, g=0.08):
    n = int(length * SR); t = np.arange(n) / SR
    f = f0 * (f1 / f0) ** (t / length); ph = 2 * np.pi * np.cumsum(f) / SR
    add(sfx, t0, np.sin(ph) * env(n, 0.005, length * 0.5), g)


glitch(5.3, 0.4, g=0.11, seed=1); sweep_down(5.35, 0.7, 1200, 80, 0.05)            # office: project erased
glitch(9.3, 0.3, 600, 7000, g=0.09, seed=2)                                        # 2006 screen
glitch(16.8, 0.25, 800, 8000, g=0.07, seed=3)                                      # 2016 screens
# concert: crowd cheer that gets cut + a big whoosh as the crowd vanishes
n = int(4.2 * SR); tt = np.arange(n) / SR
cheer = bp(noise(n), 500, 3000) * (0.7 + 0.3 * np.sin(2 * np.pi * 2.2 * tt)) * np.clip(1 - (tt - 1.7) / 0.9, 0, 1)
add(sfx, 22.4, cheer * env(n, 0.3, 0.05), 0.05)
n = int(1.6 * SR); tt = np.arange(n) / SR
add(sfx, 24.0, bp(noise(n), 300, 5000) * np.sin(np.pi * tt / 1.6) ** 2, 0.08); glitch(24.0, 0.3, g=0.07, seed=4)
glitch(32.0, 0.35, 500, 6000, g=0.08, seed=5)                                      # sign swap
# boutique: crystalline shimmer dissolve
n = int(1.8 * SR); tt = np.arange(n) / SR
shim = sum(np.sin(2 * np.pi * f * tt) * np.exp(-tt / (0.4 + 0.2 * k)) for k, f in enumerate([2093, 2637, 3136, 3951]))
add(sfx, 35.9, hp(shim + bp(noise(n), 4000, 12000) * np.exp(-tt / 0.5) * 0.5, 1500) * env(n, 0.01, 0.6), 0.03)
glitch(39.5, 0.3, 700, 7000, g=0.08, seed=6)                                       # garden
# wind outside for the lonely kid
n = int(4.2 * SR); add(sfx, 46.2, bp(noise(n), 300, 1200) * env(n, 0.8, 0.8), 0.03)
# earth reveal + the great erase
n = int(3.0 * SR); tt = np.arange(n) / SR
add(sfx, 50.4, np.sin(2 * np.pi * (28 + 30 * np.exp(-tt / 0.2)) * tt) * np.exp(-tt / 1.0), 0.25)
n = int(2.0 * SR); tt = np.arange(n) / SR
add(sfx, 55.4, bp(noise(n), 1000, 8000) * (tt / 2.0) ** 3, 0.05)
sweep_down(57.4, 4.5, 2400, 40, 0.05); glitch(57.4, 0.6, 200, 9000, g=0.09, seed=7)

# ---------------- mix ----------------
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
