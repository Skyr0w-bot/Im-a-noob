"""Soundtrack for 'What if AI became smarter than us?'. Usage: python3 audio.py out.wav
Electronic-cinematic score that builds; sound effects only where they tell the story."""
import sys, wave
import numpy as np
from scipy.signal import butter, sosfilt

SR = 48000
DUR = 65.2
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
bpm = 112; b = 60 / bpm
# 0-3.2 title
pad(0, 3.4, [52, 59, 64, 68, 71], g=0.11, fc=1500, att=0.3)
for i, m in enumerate([76, 71, 68, 71, 76, 78]): piano(0.2 + i * 0.5, m, g=0.045, dec=1.6)
# 3.2-7.2 the curve rises: a tone sweeping up, impact when it crosses human level (5.45)
n = int(2.3 * SR); tt = np.arange(n) / SR; f = 110 * (880 / 110) ** (tt / 2.3); ph = 2 * np.pi * np.cumsum(f) / SR
add(music, 3.2, lp(np.sin(ph) + 0.3 * np.sin(2 * ph), 3000) * env(n, 0.3, 0.05), 0.05)
pad(3.2, 7.3, [50, 57, 62, 66], g=0.12, fc=1100, att=0.5)
kick(5.45, 0.35); subbass(5.45, 11.0, 26, g=0.12, att=0.05, rel=0.4)
pad(5.45, 11.1, [38, 50, 57, 62, 69], g=0.15, fc=1800, att=0.05)
t = 5.45; i = 0
while t < 14.9:
    sec = 0 if t < 11 else 1
    pluck(t, [74, 78, 81, 86, 81, 78][i % 6] - sec * 2, g=0.04 + 0.01 * sec, dec=0.2, fc=3000 + sec * 800)
    t += b / 2 if t < 11 else b / (2 + (t - 11) * 0.9); i += 1      # accelerates in the server hall
# 9.3 proof complete chime
for k, m in enumerate([84, 88, 91]): pluck(9.32 + k * 0.08, m, g=0.04, dec=0.6, saw=False)
# 11-15 servers: pad + hum
pad(11.0, 15.1, [43, 50, 55, 62], g=0.13, fc=1500, att=0.3)
subbass(11.0, 15.0, 31, g=0.1, att=0.3, rel=0.2)
# 15-18.8 day two: dissonant, uneasy
pad(15.0, 18.9, [37, 44, 49, 50, 56], g=0.21, fc=1000, att=0.1, det=0.012)
for k in range(10): pluck(15.2 + k * 0.36, [61, 62, 66, 67][k % 4], g=0.05, dec=0.3, fc=2000)
# 18.8-22.8 week one: wonder, hopeful
pad(18.8, 22.9, [48, 55, 60, 64, 67, 71], g=0.21, fc=2200, att=0.5)
for t0, m in [(19.2, 72), (19.9, 76), (20.6, 79), (21.3, 84), (22.0, 83)]: piano(t0, m, g=0.09, dec=2.0)
# 22.8-34.8 control grows: steady pulse with kick
pad(22.8, 26.9, [45, 52, 57, 60], g=0.13, fc=1200, att=0.4)
pad(26.8, 30.9, [41, 48, 53, 57], g=0.13, fc=1300)
pad(30.8, 34.9, [38, 45, 50, 53, 57], g=0.15, fc=1500)
subbass(22.8, 34.8, 29, g=0.1, att=0.5, rel=0.3)
t = 22.8; i = 0
while t < 34.7:
    pluck(t, [64, 67, 71, 74, 71, 67][i % 6] - (0 if t < 26.8 else 2 if t < 30.8 else 4), g=0.03, dec=0.18, fc=3200)
    if i % 4 == 0 and t > 26.8: kick(t, 0.15 + 0.06 * (t - 26.8) / 8)
    t += b / 2; i += 1
# 34.8-38.8 the off switch: low heartbeat, then a held silence as the hand pulls back
for k in range(6):
    tt0 = 34.9 + k * 0.62
    if tt0 > 37.6: break
    kick(tt0, 0.18); kick(tt0 + 0.18, 0.1)
pad(34.8, 37.8, [33, 40, 45], g=0.12, fc=600, att=0.2, rel=0.8)
# 38.8-42.8 warning: heavy drones
pad(38.8, 42.9, [26, 33, 38, 45, 46], g=0.17, fc=900, att=0.4, det=0.01)
subbass(38.8, 42.8, 26, g=0.16, att=0.3, rel=0.3)
# 42.8-46.8 classroom: eerie music box
for k, m in enumerate([76, 79, 83, 79, 76, 72, 74, 71, 76, 79]): pluck(43.0 + k * 0.38, m, g=0.06, dec=0.9, saw=False)
pad(42.8, 46.9, [52, 59, 64], g=0.11, fc=1200, att=0.5)
# 46.8-53.2 earth: vast
pad(46.8, 53.4, [45, 52, 57, 64, 69, 71, 76], g=0.17, fc=2400, att=1.0)
subbass(46.8, 53.2, 33, g=0.15, att=1.0, rel=0.4)
for t0, m in [(47.4, 69), (48.8, 72), (50.2, 76), (51.6, 74)]: piano(t0, m, g=0.08, dec=3.2); piano(t0, m - 12, g=0.05, dec=3.2)
# 53.2-61.2 final: human, small; one big low hit on "Not anymore." (57.9)
pad(53.2, 57.8, [52, 59, 64, 67], g=0.08, fc=1600, att=1.2, rel=0.6)
for t0, m in [(53.8, 64), (55.0, 67), (56.2, 71)]: piano(t0, m, g=0.07, dec=3.0)
kick(57.9, 0.4); subbass(57.9, 61.0, 21, g=0.2, att=0.02, rel=2.0); piano(57.9, 33, g=0.12, dec=4.5); piano(57.9, 45, g=0.08, dec=4.5)
pad(57.9, 61.3, [45, 52, 57, 64], g=0.08, fc=1400, att=0.6, rel=1.5)
piano(61.4, 45, g=0.09, dec=4.0); piano(61.4, 57, g=0.05, dec=4.0)

# ---------- SFX ----------
# lab murmur before the moment, then silence
n = int(2.2 * SR); add(sfx, 3.2, bp(noise(n), 300, 1500) * env(n, 0.3, 0.2), 0.02)
# hour one: a small cheer
n = int(1.4 * SR); tt = np.arange(n) / SR; add(sfx, 9.4, bp(noise(n), 500, 3000) * np.exp(-tt / 0.6) * env(n, 0.05, 0.3), 0.05)
# servers: fan hum rising
n = int(4.0 * SR); tt = np.arange(n) / SR
add(sfx, 11.0, (bp(noise(n), 150, 900) * 0.6 + np.sin(2 * np.pi * (180 + 120 * tt / 4) * tt) * 0.1) * env(n, 0.3, 0.2) * (0.5 + 0.5 * tt / 4), 0.05)
# day two: glitchy data chatter
n = int(3.6 * SR); r2 = np.random.default_rng(4); hold = 300
chat = np.repeat(r2.random(n // hold + 1) * 2 - 1, hold)[:n] * (r2.random(n) < 0.15)
add(sfx, 15.0, bp(chat, 1500, 7000) * env(n, 0.2, 0.3), 0.025)
# shutdown: two alarm beeps
for t0 in (35.2, 35.6):
    n = int(0.22 * SR); tt = np.arange(n) / SR
    add(sfx, t0, np.sign(np.sin(2 * np.pi * 740 * tt)) * env(n, 0.005, 0.03), 0.02)
# warning: distant city + crowd silence (wind)
n = int(4.0 * SR); add(sfx, 38.8, bp(noise(n), 250, 1100) * env(n, 0.6, 0.6), 0.035)
# earth: impact
n = int(3.0 * SR); tt = np.arange(n) / SR
add(sfx, 46.8, np.sin(2 * np.pi * (28 + 30 * np.exp(-tt / 0.2)) * tt) * np.exp(-tt / 1.0), 0.25)
# final: soft city night ambience
n = int(8.0 * SR); add(sfx, 53.2, lp(noise(n), 400) * env(n, 1.0, 1.0), 0.03)

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
