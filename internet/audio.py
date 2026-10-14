"""Synthesized soundtrack for 'What if the internet shut off?'. Usage: python3 audio.py out.wav
Cinematic piano + pads that escalate; sparse, one-off sound effects tied to the shots in timeline.js."""
import sys, wave
import numpy as np
from scipy.signal import butter, sosfilt

SR = 48000
DUR = 76.0
N = int(SR * DUR)
rng = np.random.default_rng(11)
T = np.arange(N) / SR


def lp(x, fc, o=2): return sosfilt(butter(o, fc, 'low', fs=SR, output='sos'), x)
def hp(x, fc, o=2): return sosfilt(butter(o, fc, 'high', fs=SR, output='sos'), x)
def bp(x, a, b, o=2): return sosfilt(butter(o, [a, b], 'band', fs=SR, output='sos'), x)
def hz(m): return 440 * 2 ** ((m - 69) / 12)


def env(n, a, r):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    if na: e[:na] = np.linspace(0, 1, na)
    if nr: e[-nr:] *= np.linspace(1, 0, nr)
    return e


def add(buf, t0, sig, g=1.0):
    i = int(t0 * SR); j = min(len(buf), i + len(sig))
    if j > i: buf[i:j] += sig[:j - i] * g


music = np.zeros(N)
sfx = np.zeros(N)


def piano(t0, m, g=0.1, dec=2.4, bright=1.0):
    n = int(dec * 2.5 * SR); t = np.arange(n) / SR; f = hz(m)
    s = np.zeros(n)
    for k, a in enumerate([1, 0.5, 0.28, 0.16, 0.09, 0.05], 1):
        s += a * np.sin(2 * np.pi * f * k * (1 + 0.0004 * k * k) * t) * np.exp(-t * (1.0 + k * 0.9 / bright) / dec * 2)
    s *= np.minimum(1, t / 0.003)
    s += 0.15 * np.sin(2 * np.pi * f * t) * np.exp(-t / 0.05)
    add(music, t0, lp(s, 5000), g)


def pad(t0, t1, ms, g=0.1, fc=900, att=1.5, rel=2.0, det=0.005):
    n = int((t1 - t0 + rel) * SR); t = np.arange(n) / SR; s = np.zeros(n)
    for m in ms:
        f = hz(m)
        for d in (-det, 0, det):
            ph = rng.random() * 6.28
            for k in range(1, 6): s += np.sin(2 * np.pi * f * (1 + d) * k * t + ph * k) / k ** 1.4
    s = lp(s, fc)
    e = env(n, att, 0.01); cut = int((t1 - t0) * SR)
    if cut < n: e[cut:] *= np.linspace(1, 0, n - cut)
    add(music, t0, s * e / (len(ms) * 3), g)


def sub(t0, t1, m, g=0.2, att=1.0, rel=1.5):
    n = int((t1 - t0 + rel) * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * hz(m) * t) + 0.3 * np.sin(2 * np.pi * hz(m) * 2 * t)
    e = env(n, att, rel); add(music, t0, s * e, g)


# ---- Act 1: normal morning (0 - 6.5): gentle, major-ish, light piano ----
pad(0.0, 6.6, [52, 59, 64, 68], g=0.10, fc=1400, att=0.4)
for i, m in enumerate([76, 71, 68, 71, 76, 78, 76, 71, 68, 64, 68, 71]):
    piano(0.25 + i * 0.52, m, g=0.045, dec=1.6)

# ---- shut-off (6.5): everything cuts. Silence, then a low drone ----
# (music added after 6.5 starts at 7.6)

# ---- Act 2: first hours (7.6 - 27): sparse minor piano, slow pulse ----
pad(7.6, 17.0, [45, 52, 57, 60], g=0.12, fc=700, att=2.0)
pad(16.8, 27.2, [41, 48, 53, 57, 60], g=0.12, fc=800, att=1.5)
sub(7.6, 27.0, 33, g=0.08, att=3)
mel = [(8.2, 69), (9.4, 72), (10.6, 71), (12.6, 67), (13.8, 69), (15.0, 64), (17.2, 65), (18.4, 69), (19.6, 72), (21.0, 71), (22.4, 69), (23.8, 67), (25.2, 69), (26.2, 64)]
for t0, m in mel: piano(t0, m, g=0.06, dec=2.6)
for t0, m in mel[::2]: piano(t0, m - 24, g=0.05, dec=3.0)

# ---- Act 3: days (27 - 44.5): ostinato builds, low pulses ----
bpm = 84; b = 60 / bpm
pad(27.0, 34.0, [43, 50, 55, 58, 62], g=0.13, fc=1000, att=0.6)
pad(33.9, 41.0, [41, 48, 53, 57, 60], g=0.13, fc=1100)
pad(40.9, 44.6, [38, 45, 50, 53, 57], g=0.14, fc=1200)
t = 27.0; i = 0
pat = [67, 70, 74, 70]
while t < 44.4:
    if t > 33.9: pat = [65, 69, 72, 69]
    if t > 40.9: pat = [62, 65, 69, 72]
    piano(t, pat[i % 4], g=0.028 + 0.025 * (t - 27) / 17, dec=0.9)
    t += b / 2; i += 1
t = 30.5
while t < 44.4:
    n = int(0.5 * SR); tt = np.arange(n) / SR
    k = np.sin(2 * np.pi * (42 + 50 * np.exp(-tt / 0.04)) * tt) * np.exp(-tt / 0.18)
    add(music, t, k, 0.10 + 0.08 * (t - 30.5) / 14)
    t += b * 2

# ---- Act 4: collapse (44.5 - 61.5): heavy, dissonant, big ----
pad(44.5, 52.6, [37, 44, 49, 52, 56], g=0.15, fc=900, att=0.3, det=0.009)
pad(48.4, 52.6, [61, 64, 68], g=0.06, fc=2400, att=1.5)
pad(52.5, 61.6, [33, 45, 52, 57, 60, 64], g=0.17, fc=1500, att=1.2)
sub(44.5, 61.5, 25, g=0.14, att=1.0, rel=0.6)
t = 44.5
while t < 52.3:
    n = int(0.7 * SR); tt = np.arange(n) / SR
    k = np.sin(2 * np.pi * (38 + 60 * np.exp(-tt / 0.03)) * tt) * np.exp(-tt / 0.25) + bp(rng.normal(0, 1, n), 80, 400) * np.exp(-tt / 0.06) * 0.4
    add(music, t, k, 0.2)
    t += b * 2
for t0, m in [(52.6, 57), (53.8, 60), (55.0, 64), (56.4, 62), (57.4, 57), (58.6, 55), (59.8, 52), (60.8, 57)]:
    piano(t0, m, g=0.09, dec=3.0); piano(t0, m - 12, g=0.06, dec=3.0)

# ---- Act 5: Earth (61.5 - 72): near silence, vast, cold ----
pad(61.5, 72.0, [57, 64, 71, 76], g=0.05, fc=2600, att=2.5, rel=2.5, det=0.003)
sub(61.5, 71.5, 33, g=0.08, att=2.0, rel=2.0)
for t0, m in [(62.4, 69), (65.2, 64), (68.6, 57)]:
    piano(t0, m, g=0.07, dec=4.0)
# end card: single low note
piano(72.2, 45, g=0.09, dec=4.0); piano(72.2, 57, g=0.05, dec=4.0)

# ---------------- SFX (each used once or twice) ----------------
def noise(n): return rng.normal(0, 1, n)


# city ambience (pre shut-off) - traffic hum + distant chatter
n = int(6.5 * SR); s = lp(noise(n), 500) * 0.6 + bp(noise(n), 900, 2400) * 0.15
add(sfx, 0, s * env(n, 0.8, 0.02), 0.05)
# two phone notification pings
for t0, f in [(3.7, 1568), (5.3, 1760)]:
    n = int(0.35 * SR); tt = np.arange(n) / SR
    add(sfx, t0, (np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(2 * np.pi * f * 1.5 * tt)) * np.exp(-tt / 0.08), 0.05)
# SHUT-OFF at 6.5: digital glitch burst + sub drop
n = int(0.32 * SR); tt = np.arange(n) / SR
gl = np.sign(np.sin(2 * np.pi * (300 + 2000 * rng.random()) * tt)) * (rng.random(n) < 0.6) * np.repeat(rng.random(n // 400 + 1), 400)[:n]
add(sfx, 6.5, bp(gl, 400, 6000) * env(n, 0.005, 0.05), 0.12)
n = int(2.5 * SR); tt = np.arange(n) / SR
add(sfx, 6.5, np.sin(2 * np.pi * (30 + 50 * np.exp(-tt / 0.15)) * tt) * np.exp(-tt / 0.8), 0.32)
# muffled city after shut-off
n = int(3.4 * SR); add(sfx, 6.6, lp(noise(n), 260) * env(n, 0.6, 0.6), 0.04)
# card terminal error beep (once)
for t0, f in [(14.0, 880), (14.18, 660)]:
    n = int(0.15 * SR); tt = np.arange(n) / SR
    add(sfx, t0, np.sign(np.sin(2 * np.pi * f * tt)) * env(n, 0.003, 0.02), 0.03)
# airport PA chime (once) + hall murmur
for t0, f in [(20.5, 784), (20.9, 622)]:
    n = int(1.2 * SR); tt = np.arange(n) / SR
    add(sfx, t0, (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * f * 2 * tt)) * np.exp(-tt / 0.5), 0.05)
n = int(3.5 * SR); add(sfx, 20.0, bp(noise(n), 300, 1500) * env(n, 0.4, 0.4), 0.03)
# hospital monitor: 3 slow beeps then a long tone that fades
for k in range(3):
    n = int(0.12 * SR); tt = np.arange(n) / SR
    add(sfx, 23.8 + k * 0.85, np.sin(2 * np.pi * 1000 * tt) * env(n, 0.005, 0.03), 0.035)
n = int(1.2 * SR); tt = np.arange(n) / SR
add(sfx, 26.0, np.sin(2 * np.pi * 1000 * tt) * env(n, 0.01, 0.6), 0.025)
# port: deep ship horn (once)
n = int(2.6 * SR); tt = np.arange(n) / SR
horn = sum(np.sin(2 * np.pi * 73 * k * tt) / k for k in range(1, 7))
add(sfx, 31.0, lp(horn, 900) * env(n, 0.25, 0.9), 0.07)
# gas: wind
n = int(3.5 * SR); add(sfx, 37.5, bp(noise(n), 200, 900) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.4 * np.arange(n) / SR)) * env(n, 0.5, 0.5), 0.05)
# chaos: one distant siren wail + fire crackle
n = int(4.0 * SR); tt = np.arange(n) / SR
fs = 650 + 250 * np.sin(2 * np.pi * 0.35 * tt - 1.5)
ph = 2 * np.pi * np.cumsum(fs) / SR
add(sfx, 44.5, lp(np.sin(ph) + 0.3 * np.sin(2 * ph), 2500) * env(n, 0.6, 0.8), 0.035)
cr = (rng.random(n) < 0.004) * noise(n) * 0.8 + lp(noise(n), 400) * 0.3
add(sfx, 44.5, hp(cr, 300) * env(n, 0.2, 0.4), 0.06)
# ration: crowd murmur
n = int(4.0 * SR); add(sfx, 48.5, bp(noise(n), 250, 1100) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.7 * np.arange(n) / SR)) * env(n, 0.5, 0.5), 0.045)
# aerial night: high wind
n = int(9.0 * SR); add(sfx, 52.5, bp(noise(n), 400, 2000) * env(n, 1.0, 1.5), 0.025)
# riser into the earth reveal
n = int(2.0 * SR); tt = np.arange(n) / SR
add(sfx, 59.5, bp(noise(n), 1000, 8000) * (tt / 2.0) ** 3, 0.05)
# soft impact at the earth reveal
n = int(3.0 * SR); tt = np.arange(n) / SR
add(sfx, 61.5, np.sin(2 * np.pi * (28 + 30 * np.exp(-tt / 0.2)) * tt) * np.exp(-tt / 1.0), 0.25)

# ---------------- mix ----------------
mix = music.copy()
# hard cut at shut-off: kill music 6.5 -> 7.6 with a 30 ms fade
a, b2 = int(6.5 * SR), int(7.6 * SR)
f = int(0.03 * SR)
mix[a:a + f] *= np.linspace(1, 0, f); mix[a + f:b2] = 0
mix += sfx
mix[-int(0.4 * SR):] *= np.linspace(1, 0, int(0.4 * SR))
L = mix
d = int(0.012 * SR)
Rr = np.concatenate([np.zeros(d), mix[:-d]]) * 0.45 + mix * 0.55
st = np.stack([L, Rr], 1)
rms = np.sqrt(np.mean(st[int(8 * SR):] ** 2))
st = st / rms * 0.12
st = np.tanh(st * 1.3) / 1.3
st *= 0.97 / max(1.0, np.max(np.abs(st)))
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((st * 32767).astype('<i2').tobytes())
print('ok')
