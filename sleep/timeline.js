// Shared timeline: used by the scene (index.html) and the audio builder (audio.py reads timeline.json).
export const DURATION = 76;

export const SCENES = [
  { id: 'hook',   t0: 0,    t1: 5 },
  { id: 'night1', t0: 5,    t1: 10.5 },
  { id: 'h24',    t0: 10.5, t1: 17 },
  { id: 'h36',    t0: 17,   t1: 23.5 },
  { id: 'h48',    t0: 23.5, t1: 31 },
  { id: 'day3',   t0: 31,   t1: 38.5 },
  { id: 'day6',   t0: 38.5, t1: 45 },
  { id: 'rewind', t0: 45,   t1: 46.6 },
  { id: 'y1964',  t0: 46.6, t1: 52 },
  { id: 'record', t0: 52,   t1: 57.5 },
  { id: 'twist',  t0: 57.5, t1: 64.5 },
  { id: 'today',  t0: 64.5, t1: 71 },
  { id: 'end',    t0: 71,   t1: 76 },
];

// **word** = yellow highlight
export const CAPTIONS = [
  { t0: 0,     t1: 4.85,  text: 'What if you never **slept** again?' },
  { t0: 5.15,  t1: 10.35, text: 'Night one. You lie down… and **nothing** happens.' },
  { t0: 10.65, t1: 16.85, text: '24 hours awake. Your brain works like you’re **drunk**.' },
  { t0: 17.15, t1: 23.35, text: 'Coffee stops helping. Your body floods with **stress hormones**.' },
  { t0: 23.65, t1: 25.9,  text: 'Hour 48. Your brain starts switching **off**.' },
  { t0: 26.2,  t1: 30.85, text: 'For seconds at a time. **Without warning.**' },
  { t0: 31.15, t1: 38.35, text: 'Day 3. You start seeing things that **aren’t there**.' },
  { t0: 38.65, t1: 44.8,  text: 'Day 6. Words disappear **mid-sentence**.' },
  { t0: 46.75, t1: 49.1,  text: 'This actually **happened**.' },
  { t0: 49.25, t1: 51.85, text: '1964. A 17-year-old stayed awake for **11 days**.' },
  { t0: 52.15, t1: 57.35, text: 'Guinness no longer accepts attempts. Too **dangerous**.' },
  { t0: 57.65, t1: 64.35, text: 'Because while you sleep, your brain **washes itself**.' },
  { t0: 64.65, t1: 70.85, text: 'Yet 1 in 3 adults don’t get **enough**.' },
  { t0: 71.3,  t1: 76,    text: 'So… why are **you** still awake?' },
];

// Sound events (sparse on purpose)
export const SFX = {
  blink: [[25.6, 26.0], [28.1, 28.9]],   // muffled blackouts in h48 (start, end)
  honk: 28.95,
  rewind: [45.0, 46.6],
  heartbeat: [31.0, 45.0],
};
