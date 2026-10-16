// Shots, captions, sound cues for "What if AI took all our jobs?"
export const DURATION = 64;

export const SHOTS = [
  { id: 'title',     t0: 0,    t1: 3.2 },
  { id: 'day1',      t0: 3.2,  t1: 7.0 },
  { id: 'call',      t0: 7.0,  t1: 10.8 },
  { id: 'creative',  t0: 10.8, t1: 14.6 },
  { id: 'coders',    t0: 14.6, t1: 18.4 },
  { id: 'robotaxi',  t0: 18.4, t1: 22.2 },
  { id: 'warehouse', t0: 22.2, t1: 26.0 },
  { id: 'hospital',  t0: 26.0, t1: 29.8 },
  { id: 'empty',     t0: 29.8, t1: 33.6 },
  { id: 'protest',   t0: 33.6, t1: 37.6 },
  { id: 'shop',      t0: 37.6, t1: 41.6 },
  { id: 'elite',     t0: 41.6, t1: 45.6 },
  { id: 'earth',     t0: 45.6, t1: 52.0, fadeIn: true },
  { id: 'final',     t0: 52.0, t1: 60.0, fadeIn: true },
  { id: 'end',       t0: 60.0, t1: 64.0 },
];

// **word** = accent colour
export const CAPTIONS = [
  { t0: 3.45,  t1: 6.9,   text: 'Day one. An AI that can do any computer job goes **live**.' },
  { t0: 7.25,  t1: 10.7,  text: 'Call centers go first. One AI answers millions of calls **at once**.' },
  { t0: 11.05, t1: 14.5,  text: 'Writers, translators, designers. Replaced in **weeks**.' },
  { t0: 14.85, t1: 18.3,  text: 'Then it replaces the people who **built it**.' },
  { t0: 18.65, t1: 22.1,  text: 'Driverless taxis and trucks. No breaks. No wages. **No sleep.**' },
  { t0: 22.45, t1: 25.9,  text: 'AI gets a body. Warehouses and factories go **silent**.' },
  { t0: 26.25, t1: 29.7,  text: 'Even doctors and lawyers can’t **keep up**.' },
  { t0: 30.05, t1: 33.5,  text: 'Office towers empty out. Lines form for jobs that **don’t exist**.' },
  { t0: 33.85, t1: 37.5,  text: 'Anger fills the **streets**.' },
  { t0: 37.85, t1: 41.5,  text: 'But robots don’t shop. Without wages, who **buys anything**?' },
  { t0: 41.85, t1: 45.5,  text: 'A handful of AI companies end up owning **almost everything**.' },
  { t0: 46.4,  t1: 48.9,  text: '3.5 billion people with a job…' },
  { t0: 49.1,  t1: 51.9,  text: '…and no one **needs them** anymore.' },
  { t0: 52.6,  t1: 55.9,  text: 'The question is no longer what AI can do…' },
  { t0: 56.2,  t1: 59.9,  text: '…it’s what humans are **for**.' },
];

export const SFX = { aiOn: 4.4, keyboardsStop: 4.4 };
